'use client';

import { useEffect, useMemo, useState } from 'react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@kit/ui/accordion';
import {
  Activity,
  AlertTriangle,
  CircleDot,
  Flame,
  GitBranch,
  GitPullRequest,
  Shield,
  Sparkles,
} from 'lucide-react';

type RepoOption = {
  id?: number | string;
  name: string;
  full_name?: string;
  description: string;
  selected: boolean;
  default_branch?: string | null;
};

type ComponentOption = {
  repo_full_name?: string;
  key: string;
  name: string;
  importance: 'critical' | 'high' | 'normal' | 'low';
  description: string;
  multiplier?: number;
};

const steps = [
  { label: 'Authorize', icon: Shield },
  { label: 'Repos', icon: GitBranch },
  { label: 'Components', icon: Activity },
  { label: 'Review', icon: GitPullRequest },
];

const demoRepos: RepoOption[] = [
  {
    name: 'acme/chat-platform',
    description: 'Main product API and web app',
    selected: true,
  },
  {
    name: 'acme/knowledge-bases',
    description: 'Docs ingestion + embeddings pipeline',
    selected: false,
  },
  {
    name: 'acme/agents-runtime',
    description: 'Automation agents and tool runners',
    selected: false,
  },
];

export function OnboardingClient({
  orgs,
  githubAppSlug,
}: {
  orgs: { org_id: string; organizations: { name: string; slug: string } | null }[];
  githubAppSlug?: string;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [repos, setRepos] = useState<RepoOption[]>([]);
  const [components, setComponents] = useState<ComponentOption[]>([]);
  const [orgOptions, setOrgOptions] = useState(orgs ?? []);
  const [orgId, setOrgId] = useState(orgs[0]?.org_id ?? '');
  const [orgSlug, setOrgSlug] = useState(orgs[0]?.organizations?.slug ?? '');
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [creatingOrg, setCreatingOrg] = useState(false);

  useEffect(() => {
    if (orgId) {
      fetchRepos(orgId, orgSlug ?? '', setRepos, setLoadingRepos, setStatus);
    } else {
      // No orgs yet; keep sample data visible.
      setRepos(demoRepos);
    }
  }, [orgId, orgSlug]);

  if (!orgOptions.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create an organization to continue</CardTitle>
          <CardDescription>
            GitHub authorization and repo selection require an organization.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={async () => {
              setCreatingOrg(true);
              try {
                const res = await fetch('/api/mergemint/orgs', { method: 'POST' });
                if (!res.ok) throw new Error(await res.text());
                const json = await res.json();
                const nextOrgs = [json];
                setOrgOptions(nextOrgs);
                setOrgId(json.org_id);
                setOrgSlug(json.organizations?.slug ?? '');
                setStatus(null);
              } catch (err) {
                setStatus('Failed to create organization. Please retry.');
              } finally {
                setCreatingOrg(false);
              }
            }}
            disabled={creatingOrg}
          >
            {creatingOrg ? 'Creating...' : 'Create org and continue'}
          </Button>
          {status ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {status}
            </div>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={'space-y-6'}>
      <div className="inline-flex flex-wrap gap-2 rounded-lg border bg-muted/50 p-1">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const active = currentStep === index;
          return (
            <Button
              key={step.label}
              variant={active ? 'default' : 'ghost'}
              size="sm"
              className="gap-2"
              onClick={() => setCurrentStep(index)}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm">{step.label}</span>
            </Button>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {(() => {
              const activeStep = steps[currentStep] ?? steps[0];
              if (!activeStep) return null;
              const Icon = activeStep.icon;
              return <Icon className="h-4 w-4" />;
            })()}
            {(steps[currentStep] ?? steps[0])?.label ?? ''}
          </CardTitle>
          <CardDescription>{getStepDescription(currentStep)}</CardDescription>
        </CardHeader>
        <CardContent className={'space-y-4'}>
          {status ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {status}
            </div>
          ) : null}
          {currentStep === 0 ? (
            <AuthStep orgId={orgId} orgSlug={orgSlug} githubAppSlug={githubAppSlug} />
          ) : null}
          {currentStep === 1 ? (
            <RepoStep
              repos={repos}
              onToggle={toggleRepo(setRepos)}
              loading={loadingRepos}
              onReload={() => fetchRepos(orgId, orgSlug, setRepos, setLoadingRepos, setStatus)}
              orgs={orgOptions}
              currentOrg={orgId}
              onOrgChange={(id, slug) => {
                setOrgId(id);
                setOrgSlug(slug ?? '');
                fetchRepos(id, slug ?? '', setRepos, setLoadingRepos, setStatus);
              }}
            />
          ) : null}
          {currentStep === 2 ? (
            <ComponentStep
              components={components}
              onChangeImportance={changeImportance(setComponents)}
              repos={repos.filter((r) => r.selected)}
              onAddComponent={(repoName) => addComponent(setComponents, repoName)}
              onUpdateComponent={(repoName, idx, patch) =>
                updateComponent(setComponents, repoName, idx, patch)
              }
              onDeleteComponent={(repoName, idx) =>
                deleteComponent(setComponents, repoName, idx)
              }
            />
          ) : null}
          {currentStep === 3 ? (
            <ReviewStep repos={repos} components={components} />
          ) : null}
        </CardContent>
      </Card>

      <div className={'flex justify-between'}>
        <Button
          variant={'ghost'}
          disabled={currentStep === 0}
          onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
        >
          Back
        </Button>
        <div className={'flex gap-2'}>
          <Button
            variant={'secondary'}
            onClick={() => {
              setRepos([]);
              setComponents([]);
              setCurrentStep(0);
            }}
          >
            Reset demo
          </Button>
          <Button
            onClick={async () => {
              if (currentStep === 1 && !repos.some((r) => r.selected)) {
                setStatus('Select at least one repository to continue.');
                return;
              }
              if (
                currentStep === 2 &&
                components.filter((c) => c.repo_full_name && c.name).length === 0
              ) {
                setStatus('Add at least one component.');
                return;
              }
              setStatus(null);
              if (currentStep === steps.length - 1) {
                await persistSelections(orgId, repos, components, setStatus);
              } else {
                setCurrentStep((s) => Math.min(steps.length - 1, s + 1));
              }
            }}
          >
            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function getStepDescription(step: number) {
  switch (step) {
    case 0:
      return 'Authorize MergeMint to read your org repos.';
    case 1:
      return 'Pick repositories to track.';
    case 2:
      return 'Mark which components matter most.';
    case 3:
      return 'Review before starting sync and evals.';
    default:
      return '';
  }
}

function AuthStep({
  orgId,
  orgSlug,
  githubAppSlug,
}: {
  orgId?: string;
  orgSlug?: string;
  githubAppSlug?: string;
}) {
  const appSlug = githubAppSlug ?? process.env.NEXT_PUBLIC_GITHUB_APP_SLUG;
  const installUrl = useMemo(() => {
    if (typeof window === 'undefined') return null;
    if (!orgId) return null;
    const url = new URL('/api/github/app/start', window.location.origin);
    url.searchParams.set('orgId', orgId);
    if (orgSlug) url.searchParams.set('orgSlug', orgSlug);
    url.searchParams.set('returnTo', '/home/onboarding');
    return url.toString();
  }, [orgId, orgSlug]);

  return (
    <div className={'space-y-3'}>
      <Button
        size={'lg'}
        className={'gap-2'}
        disabled={!installUrl || !appSlug}
        onClick={() => {
          if (installUrl) {
            window.location.href = installUrl;
          }
        }}
      >
        <Shield className={'h-4 w-4'} />
        Authorize with GitHub
      </Button>
      <p className={'text-sm text-muted-foreground'}>
        Opens GitHub in a new tab to grant access. Return here to pick repos.
      </p>
      {!appSlug ? (
        <p className="text-sm text-destructive">
          GitHub App not configured. Set NEXT_PUBLIC_GITHUB_APP_SLUG to enable auth, or provide
          GITHUB_TOKEN for local testing.
        </p>
      ) : null}
    </div>
  );
}

function RepoStep({
  repos,
  onToggle,
  loading,
  onReload,
  orgs,
  currentOrg,
  onOrgChange,
}: {
  repos: RepoOption[];
  onToggle: (name: string) => void;
  loading: boolean;
  onReload: () => void;
  orgs: { org_id: string; organizations: { name: string; slug: string } | null }[];
  currentOrg: string;
  onOrgChange: (orgId: string, slug?: string | null) => void;
}) {
  return (
    <div className={'grid gap-3'}>
      <div className="flex items-center justify-between">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              Org: {orgs.find((o) => o.org_id === currentOrg)?.organizations?.name ?? 'Select'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-60">
            <Accordion type="single" collapsible defaultValue="orgs">
              <AccordionItem value="orgs">
                <AccordionTrigger className="px-4 py-2 text-sm">
                  Choose organization
                </AccordionTrigger>
                <AccordionContent className="space-y-1 px-4 pb-3">
                  {orgs.map((org) => (
                    <Button
                      key={org.org_id}
                      variant={org.org_id === currentOrg ? 'default' : 'ghost'}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => onOrgChange(org.org_id, org.organizations?.slug ?? '')}
                    >
                      {org.organizations?.name ?? org.org_id}
                    </Button>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </PopoverContent>
        </Popover>
        <Button size="sm" variant="ghost" onClick={onReload} disabled={loading}>
          Reload {loading ? '...' : ''}
        </Button>
      </div>

      {repos.map((repo) => (
        <Card
          key={repo.name}
          className={'border-muted hover:border-primary'}
        >
          <CardHeader className={'flex flex-row items-center justify-between space-y-0'}>
            <div>
              <CardTitle className={'text-base'}>{repo.name}</CardTitle>
              <CardDescription className="line-clamp-2">
                {repo.description}
              </CardDescription>
            </div>
            <Badge variant={repo.selected ? 'default' : 'outline'}>
              {repo.selected ? 'Selected' : 'Not selected'}
            </Badge>
          </CardHeader>
          <CardContent>
            <Button
              size={'sm'}
              variant={repo.selected ? 'secondary' : 'outline'}
              onClick={() => onToggle(repo.name)}
            >
              {repo.selected ? 'Remove' : 'Add to project'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ComponentStep({
  components,
  onChangeImportance,
  repos,
  onAddComponent,
  onUpdateComponent,
  onDeleteComponent,
}: {
  components: ComponentOption[];
  onChangeImportance: (
    repoFullName: string,
    key: string,
    importance: ComponentOption['importance'],
  ) => void;
  repos: RepoOption[];
  onAddComponent: (repo: RepoOption) => void;
  onUpdateComponent: (
    repoFullName: string,
    idx: number,
    patch: Partial<ComponentOption>,
  ) => void;
  onDeleteComponent: (repoFullName: string, idx: number) => void;
}) {
  return (
    <div className="space-y-4">
      {repos.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Select at least one repository to add components.
        </p>
      ) : null}

      {repos.map((repo) => {
        const repoComponents = components.filter(
          (c) => c.repo_full_name === (repo.full_name ?? repo.name),
        );

        return (
          <Card key={repo.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">
                  {repo.full_name}
                </CardTitle>
                <CardDescription>
                  Add the components for this repository.
                </CardDescription>
              </div>
              <Button size="sm" onClick={() => onAddComponent(repo)}>
                <Sparkles className="mr-2 h-4 w-4" />
                Add component
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {repoComponents.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No components yet for this repo.
                </p>
              ) : null}
              {repoComponents.map((component, idx) => (
                <Card
                  key={`${component.repo_full_name}-${component.key}-${idx}`}
                  className="border-muted"
                >
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div className="space-y-1">
                      <input
                        className="w-full rounded-md border bg-background px-2 py-1 text-sm font-semibold"
                        value={component.name}
                        onChange={(e) =>
                          onUpdateComponent(repo.full_name ?? repo.name, idx, {
                            name: e.target.value,
                          })
                        }
                        placeholder="Component name"
                      />
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <input
                          className="w-28 rounded-md border bg-background px-2 py-1"
                          value={component.key}
                          onChange={(e) =>
                            onUpdateComponent(repo.full_name ?? repo.name, idx, {
                              key: e.target.value,
                            })
                          }
                          placeholder="KEY"
                        />
                        <input
                          className="w-20 rounded-md border bg-background px-2 py-1"
                          value={component.multiplier ?? 1}
                          onChange={(e) =>
                            onUpdateComponent(repo.full_name ?? repo.name, idx, {
                              multiplier: Number(e.target.value || 1),
                            })
                          }
                          type="number"
                          step="0.1"
                        />
                      </div>
                      <textarea
                        className="w-full rounded-md border bg-background px-2 py-1 text-sm"
                        value={component.description}
                        onChange={(e) =>
                          onUpdateComponent(repo.full_name ?? repo.name, idx, {
                            description: e.target.value,
                          })
                        }
                        placeholder="Description"
                        rows={2}
                      />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <ImportanceBadge level={component.importance} />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteComponent(repo.full_name ?? repo.name, idx)}
                      >
                        Remove
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {(['critical', 'high', 'normal', 'low'] as const).map((level) => (
                      <Button
                        key={level}
                        size={'sm'}
                        variant={component.importance === level ? 'default' : 'outline'}
                        onClick={() =>
                          onChangeImportance(repo.full_name ?? repo.name, component.key, level)
                        }
                      >
                        <ImportanceLabel level={level} />
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function ReviewStep({
  repos,
  components,
}: {
  repos: RepoOption[];
  components: ComponentOption[];
}) {
  const selectedRepos = repos.filter((r) => r.selected);

  return (
    <div className={'space-y-4'}>
      <Card>
        <CardHeader>
          <CardTitle className={'text-base'}>Repositories</CardTitle>
        </CardHeader>
        <CardContent className={'flex flex-wrap gap-2'}>
          {selectedRepos.length ? (
            selectedRepos.map((repo) => (
              <Badge key={repo.name} variant={'secondary'}>
                {repo.name}
              </Badge>
            ))
          ) : (
            <p className={'text-sm text-muted-foreground'}>
              No repositories selected yet.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className={'text-base'}>Component importance</CardTitle>
        </CardHeader>
        <CardContent className={'flex flex-wrap gap-2'}>
          {components.map((component) => (
            <Badge key={component.key} variant={'secondary'}>
              {component.name}: <ImportanceLabel level={component.importance} />
            </Badge>
          ))}
        </CardContent>
      </Card>

      <p className={'text-sm text-muted-foreground'}>
        Next: we’ll store these selections, kick off the first GitHub sync, and evaluate merged PRs.
      </p>
    </div>
  );
}

function toggleRepo(
  setRepos: React.Dispatch<React.SetStateAction<RepoOption[]>>,
) {
  return (name: string) =>
    setRepos((items) =>
      items.map((repo) =>
        repo.name === name ? { ...repo, selected: !repo.selected } : repo,
      ),
    );
}

function changeImportance(
  setComponents: React.Dispatch<React.SetStateAction<ComponentOption[]>>,
) {
  return (repoFullName: string, key: string, importance: ComponentOption['importance']) =>
    setComponents((items) =>
      items.map((component) =>
        component.key === key && component.repo_full_name === repoFullName
          ? { ...component, importance }
          : component,
      ),
    );
}

function addComponent(
  setComponents: React.Dispatch<React.SetStateAction<ComponentOption[]>>,
  repo: RepoOption,
) {
  setComponents((items) => {
    const repoFullName = repo.full_name ?? repo.name;
    const nextIndex = items.filter((c) => c.repo_full_name === repoFullName).length + 1;
    return [
      ...items,
      {
        repo_full_name: repoFullName,
        key: `COMP_${nextIndex}`,
        name: 'New component',
        description: '',
        multiplier: 1,
        importance: 'normal',
      },
    ];
  });
}

function updateComponent(
  setComponents: React.Dispatch<React.SetStateAction<ComponentOption[]>>,
  repoFullName: string,
  idx: number,
  patch: Partial<ComponentOption>,
) {
  setComponents((items) => {
    let counter = -1;
    return items.map((c) => {
      if (c.repo_full_name !== repoFullName) return c;
      counter += 1;
      if (counter === idx) {
        return { ...c, ...patch };
      }
      return c;
    });
  });
}

function deleteComponent(
  setComponents: React.Dispatch<React.SetStateAction<ComponentOption[]>>,
  repoFullName: string,
  idx: number,
) {
  setComponents((items) => {
    let counter = -1;
    return items.filter((c) => {
      if (c.repo_full_name !== repoFullName) return true;
      counter += 1;
      return counter !== idx;
    });
  });
}

async function fetchRepos(
  orgId: string,
  orgSlug: string,
  setRepos: (repos: RepoOption[]) => void,
  setLoading: (loading: boolean) => void,
  setStatus: (status: string | null) => void,
) {
  setLoading(true);
  try {
    const res = await fetch(`/api/github/repos?orgId=${orgId}&orgSlug=${orgSlug}`);
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    const repos: RepoOption[] = (json.repos ?? []).map((r: any) => ({
      id: r.id,
      name: r.full_name,
      full_name: r.full_name,
      default_branch: r.default_branch,
      selected: false,
      description: r.description ?? '',
    }));
    setRepos(repos);
    setStatus(null);
  } catch (err) {
    setStatus('Could not load repos from GitHub. Falling back to sample data.');
    setRepos(demoRepos);
  } finally {
    setLoading(false);
  }
}

async function persistSelections(
  orgId: string,
  repos: RepoOption[],
  components: ComponentOption[],
  setStatus: (status: string | null) => void,
) {
  try {
    setStatus('Saving selections...');
    const selectedRepos = repos.filter((r) => r.selected);
    if (selectedRepos.length) {
      await fetch('/api/github/save-repos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId,
          repos: selectedRepos.map((r) => ({
            github_repo_id: r.id ?? null,
            name: r.name,
            full_name: r.full_name ?? r.name,
            default_branch: r.default_branch,
            is_active: true,
          })),
        }),
      });
    }

    const componentPayload = components
      .filter((c) => c.repo_full_name)
      .map((c) => ({
        repo_full_name: c.repo_full_name,
        key: c.key,
        name: c.name,
        description: c.description,
        multiplier: c.multiplier ?? 1,
        importance: c.importance,
      }));

    if (componentPayload.length) {
      await fetch('/api/github/save-components', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId, components: componentPayload }),
      });
    }

    setStatus('Saved! You can now start syncing PRs.');
  } catch (err) {
    setStatus('Failed to save selections. Please retry.');
  }
}

function ImportanceLabel({ level }: { level: ComponentOption['importance'] }) {
  const Icon =
    level === 'critical'
      ? Flame
      : level === 'high'
        ? AlertTriangle
        : level === 'normal'
          ? Activity
          : CircleDot;

  const labelMap = {
    critical: 'Critical',
    high: 'High',
    normal: 'Normal',
    low: 'Low',
  } as const;

  return (
    <span className="flex items-center gap-1 capitalize">
      <Icon className="h-3.5 w-3.5" />
      {labelMap[level]}
    </span>
  );
}

function ImportanceBadge({ level }: { level: ComponentOption['importance'] }) {
  const variant =
    level === 'critical'
      ? 'destructive'
      : level === 'high'
        ? 'default'
        : level === 'normal'
          ? 'secondary'
          : 'outline';

  return (
    <Badge variant={variant}>
      <ImportanceLabel level={level} />
    </Badge>
  );
}
