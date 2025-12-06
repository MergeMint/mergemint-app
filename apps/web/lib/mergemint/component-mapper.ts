import { SupabaseClient } from '@supabase/supabase-js';

import { ComponentRecord, ComponentRule } from './types';

type MapResult = {
  component_id: string;
  score_lines_changed: number;
  is_primary: boolean;
};

function matchesRule(path: string, rule: ComponentRule) {
  switch (rule.match_type) {
    case 'prefix':
      return path.startsWith(rule.pattern);
    case 'suffix':
      return path.endsWith(rule.pattern);
    case 'regex':
      try {
        return new RegExp(rule.pattern).test(path);
      } catch {
        return false;
      }
    case 'glob': {
      const regex = globToRegExp(rule.pattern);
      return regex.test(path);
    }
    default:
      return false;
  }
}

function globToRegExp(glob: string) {
  const escaped = glob.replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`);
}

function getLines(additions?: number | null, deletions?: number | null) {
  return (additions ?? 0) + (deletions ?? 0);
}

function pickPrimary(matches: Map<string, { lines: number; priority: number }>) {
  return Array.from(matches.entries()).sort((a, b) => {
    if (b[1].priority === a[1].priority) {
      return (b[1].lines ?? 0) - (a[1].lines ?? 0);
    }
    return b[1].priority - a[1].priority;
  })[0]?.[0];
}

async function loadComponents(
  client: SupabaseClient<any>,
  orgId: string,
) {
  const { data, error } = await client
    .from('product_components')
    .select('*')
    .eq('org_id', orgId);

  if (error) throw error;

  const map = new Map<string, ComponentRecord>();
  data?.forEach((c) => map.set(c.id, c));

  return map;
}

async function loadRules(
  client: SupabaseClient<any>,
  componentIds: string[],
) {
  if (!componentIds.length) return [] as ComponentRule[];

  const { data, error } = await client
    .from('component_file_rules')
    .select('*')
    .in('component_id', componentIds);

  if (error) throw error;

  return (
    data?.map((rule) => ({
      ...rule,
      component: { id: rule.component_id } as ComponentRecord,
    })) ?? []
  );
}

export async function mapComponentsForPullRequest(
  client: SupabaseClient<any>,
  orgId: string,
  prId: string,
) {
  const componentMap = await loadComponents(client, orgId);
  if (!componentMap.size) return [];
  const otherComponent = Array.from(componentMap.values()).find(
    (c) => c.key === 'OTHER',
  );

  const rules = await loadRules(client, Array.from(componentMap.keys()));
  const { data: files, error: fileError } = await client
    .from('pr_files')
    .select('id, filename, additions, deletions')
    .eq('pr_id', prId);

  if (fileError) throw fileError;

  const matches = new Map<string, { lines: number; priority: number }>();

  files?.forEach((file) => {
    rules.forEach((rule) => {
      if (matchesRule(file.filename, rule)) {
        const entry = matches.get(rule.component_id) ?? {
          lines: 0,
          priority: rule.priority ?? 0,
        };
        entry.lines += getLines(file.additions, file.deletions);
        entry.priority = Math.max(entry.priority, rule.priority ?? 0);
        matches.set(rule.component_id, entry);
      }
    });
  });

  if (!matches.size) {
    if (!otherComponent) return [];
    matches.set(otherComponent.id, { lines: 0, priority: 0 });
  }

  const primary = pickPrimary(matches) ?? otherComponent?.id;

  const payload: MapResult[] = Array.from(matches.entries()).map(
    ([componentId, meta]) => ({
      component_id: componentId,
      score_lines_changed: meta.lines,
      is_primary: componentId === primary,
    }),
  );

  if (!payload.length) {
    return [];
  }

  if (!payload.some((p) => p.is_primary) && otherComponent) {
    payload.push({
      component_id: otherComponent.id,
      score_lines_changed: 0,
      is_primary: true,
    });
  }

  await client
    .from('pr_components')
    .upsert(
      payload.map((item) => ({
        pr_id: prId,
        component_id: item.component_id,
        score_lines_changed: item.score_lines_changed,
        is_primary: item.is_primary,
      })),
      { onConflict: 'pr_id,component_id' },
    );

  return payload;
}
