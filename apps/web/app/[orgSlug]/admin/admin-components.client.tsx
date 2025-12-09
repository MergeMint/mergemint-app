'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

import {
  RepoComponentsEditor,
  type ComponentOption,
  type RepoOption,
} from '~/components/repo-components-editor';

export function AdminComponentsEditor({
  orgId,
  initialComponents,
}: {
  orgId: string;
  initialComponents: ComponentOption[];
}) {
  const [repos, setRepos] = useState<RepoOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch repos from the organization
  useEffect(() => {
    async function fetchRepos() {
      try {
        const res = await fetch(`/api/github/repos?orgId=${orgId}`);
        if (res.ok) {
          const data = await res.json();
          // Convert to RepoOption format
          const repoOptions: RepoOption[] = (data.repos || []).map((r: any) => ({
            id: r.id,
            name: r.name || r.full_name,
            full_name: r.full_name,
            description: r.description || '',
          }));
          setRepos(repoOptions);
        }
      } catch (err) {
        console.error('Failed to fetch repos:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRepos();
  }, [orgId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Extract unique repos from components if repos API didn't return them
  const reposFromComponents = [...new Set(initialComponents.map(c => c.repo_full_name).filter(Boolean))];
  const effectiveRepos = repos.length > 0
    ? repos
    : reposFromComponents.map(fullName => ({
        name: fullName!.split('/')[1] || fullName!,
        full_name: fullName!,
      }));

  if (effectiveRepos.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No repositories connected.</p>
        <p className="text-sm mt-1">
          Go to{' '}
          <a href="/home/onboarding" className="text-primary underline">
            Setup Wizard
          </a>{' '}
          to connect repositories.
        </p>
      </div>
    );
  }

  return (
    <RepoComponentsEditor
      orgId={orgId}
      repos={effectiveRepos}
      initialComponents={initialComponents}
      showEmptyState={false}
    />
  );
}
