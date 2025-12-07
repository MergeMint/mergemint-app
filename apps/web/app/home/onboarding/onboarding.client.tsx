'use client';

import { useEffect, useMemo, useState } from 'react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { Textarea } from '@kit/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@kit/ui/accordion';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  Flame,
  GitBranch,
  GitPullRequest,
  Github,
  MoreHorizontal,
  Pencil,
  Plus,
  Shield,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';

type RepoOption = {
  id?: number | string;
  name: string;
  full_name?: string;
  description: string;
  selected: boolean;
  default_branch?: string | null;
  pushed_at?: string | null;
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
  connectedOrgs = {},
}: {
  orgs: { org_id: string; organizations: { name: string; slug: string } | null }[];
  githubAppSlug?: string;
  connectedOrgs?: Record<string, number>; // orgId -> installationId
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [repos, setRepos] = useState<RepoOption[]>([]);
  const [components, setComponents] = useState<ComponentOption[]>([]);
  const [orgOptions, setOrgOptions] = useState(orgs ?? []);
  const [orgId, setOrgId] = useState(orgs[0]?.org_id ?? '');
  const [orgSlug, setOrgSlug] = useState(orgs[0]?.organizations?.slug ?? '');
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [loadingComponents, setLoadingComponents] = useState(false);
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

  // Load existing components when entering step 2
  useEffect(() => {
    if (currentStep === 2 && orgId && components.length === 0) {
      loadComponents(orgId, setComponents, setLoadingComponents);
    }
  }, [currentStep, orgId, components.length]);

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
            <AuthStep 
              orgId={orgId} 
              orgSlug={orgSlug} 
              githubAppSlug={githubAppSlug}
              isConnected={!!connectedOrgs[orgId]}
              installationId={connectedOrgs[orgId]}
            />
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
              orgId={orgId}
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

      {/* Spacer for fixed footer */}
      <div className="h-24" />

      {/* Fixed footer navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <Button
          variant={'ghost'}
          disabled={currentStep === 0}
          onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
        >
          Back
        </Button>
          
          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 w-2 rounded-full transition-colors ${
                  idx === currentStep
                    ? 'bg-primary'
                    : idx < currentStep
                      ? 'bg-primary/50'
                      : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>

        <div className={'flex gap-2'}>
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
              
              // Save repos when moving from step 1 to step 2
              if (currentStep === 1) {
                const selectedRepos = repos.filter((r) => r.selected);
                if (selectedRepos.length) {
                  setStatus('Saving repositories...');
                  try {
                    const res = await fetch('/api/github/save-repos', {
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
                    if (!res.ok) {
                      const err = await res.json();
                      throw new Error(err.error || 'Failed to save repos');
                    }
                    setStatus(null);
                  } catch (err) {
                    setStatus((err as Error).message);
                    return;
                  }
                }
              }
              
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
  isConnected,
  installationId,
}: {
  orgId?: string;
  orgSlug?: string;
  githubAppSlug?: string;
  isConnected?: boolean;
  installationId?: number;
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

  if (isConnected) {
    return (
      <div className={'space-y-3'}>
        <div className="flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
            <Github className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-green-700 dark:text-green-400">GitHub Connected</p>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground">
              Installation ID: {installationId}
            </p>
          </div>
        </div>
        <Button
          size={'sm'}
          variant={'outline'}
          className={'gap-2'}
          onClick={() => {
            if (installUrl) {
              window.location.href = installUrl;
            }
          }}
        >
          <Github className={'h-4 w-4'} />
          Reconnect GitHub
        </Button>
        <p className={'text-sm text-muted-foreground'}>
          You're all set! Click Next to select repositories.
        </p>
      </div>
    );
  }

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
        <Github className={'h-4 w-4'} />
        Authorize with GitHub
      </Button>
      <p className={'text-sm text-muted-foreground'}>
        Opens GitHub to grant access. Return here to pick repos.
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
                {repo.description || 'No description'}
              </CardDescription>
              {repo.pushed_at && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Last commit: {formatRelativeTime(repo.pushed_at)}
                </p>
              )}
            </div>
            <Badge variant={repo.selected ? 'default' : 'outline'}>
              {repo.selected ? 'Selected' : 'Not selected'}
            </Badge>
          </CardHeader>
          <CardContent>
            <Button
              size={'sm'}
              variant={repo.selected ? 'outline' : 'default'}
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

function generateKey(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 20);
}

function getMultiplierForImportance(importance: ComponentOption['importance']): number {
  switch (importance) {
    case 'critical': return 2.0;
    case 'high': return 1.5;
    case 'normal': return 1.0;
    case 'low': return 0.5;
    default: return 1.0;
  }
}

function ComponentStep({
  orgId,
  components,
  onChangeImportance,
  repos,
  onAddComponent,
  onUpdateComponent,
  onDeleteComponent,
}: {
  orgId: string;
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingComponent, setEditingComponent] = useState<{
    repoFullName: string;
    idx: number;
    component: ComponentOption;
  } | null>(null);
  const [formData, setFormData] = useState({
    repo_full_name: repos[0]?.full_name ?? repos[0]?.name ?? '',
    name: '',
    key: '',
    description: '',
    importance: 'normal' as ComponentOption['importance'],
    multiplier: getMultiplierForImportance('normal'),
  });

  // Auto-open dialog when no components and repos are selected
  useEffect(() => {
    if (components.length === 0 && repos.length > 0) {
      setDialogOpen(true);
    }
  }, [components.length, repos.length]);

  const resetForm = () => {
    setFormData({
      repo_full_name: repos[0]?.full_name ?? repos[0]?.name ?? '',
      name: '',
      key: '',
      description: '',
      importance: 'normal',
      multiplier: getMultiplierForImportance('normal'),
    });
    setEditingComponent(null);
  };

  const handleOpenDialog = (repo?: RepoOption) => {
    resetForm();
    if (repo) {
      setFormData(prev => ({ ...prev, repo_full_name: repo.full_name ?? repo.name }));
    }
    setDialogOpen(true);
  };

  const handleEditComponent = (repoFullName: string, idx: number, component: ComponentOption) => {
    setEditingComponent({ repoFullName, idx, component });
    setFormData({
      repo_full_name: component.repo_full_name ?? repoFullName,
      name: component.name,
      key: component.key,
      description: component.description,
      importance: component.importance,
      multiplier: component.multiplier ?? 1,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const componentData = {
        repo_full_name: formData.repo_full_name,
        key: formData.key || generateKey(formData.name),
        name: formData.name,
        description: formData.description,
        importance: formData.importance,
        multiplier: formData.multiplier,
      };

      // Save to backend
      const res = await fetch('/api/github/save-components', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId,
          components: [componentData],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save component');
      }

      // Update local state
      if (editingComponent) {
        onUpdateComponent(editingComponent.repoFullName, editingComponent.idx, {
          name: formData.name,
          key: formData.key || generateKey(formData.name),
          description: formData.description,
          importance: formData.importance,
          multiplier: formData.multiplier,
        });
      } else {
        const repo = repos.find(r => (r.full_name ?? r.name) === formData.repo_full_name);
        if (repo) {
          onAddComponent(repo);
          const newIdx = components.filter(c => c.repo_full_name === formData.repo_full_name).length;
          setTimeout(() => {
            onUpdateComponent(formData.repo_full_name, newIdx, {
              name: formData.name || 'New component',
              key: formData.key || generateKey(formData.name),
              description: formData.description,
              importance: formData.importance,
              multiplier: formData.multiplier,
            });
          }, 0);
        }
      }

      setDialogOpen(false);
      resetForm();
    } catch (err) {
      console.error('Failed to save component:', err);
      alert((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (repos.length === 0) {
  return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Activity className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">
          Select at least one repository to add components.
        </p>
      </div>
    );
  }

  // Group components by repo for display
  const componentsByRepo = repos.reduce((acc, repo) => {
    const repoName = repo.full_name ?? repo.name;
    acc[repoName] = components
      .map((c, idx) => ({ ...c, globalIdx: idx }))
      .filter(c => c.repo_full_name === repoName);
    return acc;
  }, {} as Record<string, (ComponentOption & { globalIdx: number })[]>);

  const allComponents = Object.entries(componentsByRepo).flatMap(([repoName, comps]) =>
    comps.map((c, localIdx) => ({ ...c, repoName, localIdx }))
        );

        return (
    <div className="space-y-4">
      {/* Header with Add button */}
      <div className="flex items-center justify-between">
              <div>
          <p className="text-sm text-muted-foreground">
            Define the key components in your codebase and their importance for PR scoring.
          </p>
              </div>
        <Button onClick={() => handleOpenDialog()} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Component
              </Button>
      </div>

      {/* Components Table */}
      {allComponents.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Component</TableHead>
                <TableHead>Repository</TableHead>
                <TableHead>Importance</TableHead>
                <TableHead className="text-right">Multiplier</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allComponents.map((component) => (
                <TableRow key={`${component.repo_full_name}-${component.key}-${component.localIdx}`}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{component.name}</p>
                      <p className="text-xs text-muted-foreground">{component.key}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {component.repo_full_name?.split('/')[1] || component.repo_full_name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <ImportanceBadge level={component.importance} />
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {component.multiplier ?? 1}x
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEditComponent(
                            component.repo_full_name ?? component.repoName,
                            component.localIdx,
                            component
                          )}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => onDeleteComponent(
                            component.repo_full_name ?? component.repoName,
                            component.localIdx
                          )}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
          <Sparkles className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium">No components defined yet</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Add components to track important parts of your codebase
          </p>
          <Button onClick={() => handleOpenDialog()} variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add your first component
          </Button>
        </div>
      )}

      {/* Add/Edit Component Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingComponent ? 'Edit Component' : 'Add Component'}
            </DialogTitle>
            <DialogDescription>
              Components help track which parts of your codebase are affected by PRs.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="repo">Repository</Label>
              <Select
                value={formData.repo_full_name}
                onValueChange={(value) => setFormData(prev => ({ ...prev, repo_full_name: value }))}
                disabled={!!editingComponent}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a repository" />
                </SelectTrigger>
                <SelectContent>
                  {repos.map((repo) => (
                    <SelectItem key={repo.full_name ?? repo.name} value={repo.full_name ?? repo.name}>
                      {repo.full_name ?? repo.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., Authentication Service"
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setFormData(prev => ({ 
                    ...prev, 
                    name,
                    key: generateKey(name)
                  }));
                }}
                        />
                      </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What does this component do?"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={2}
                      />
                    </div>

            <div className="grid gap-2">
              <Label>Importance</Label>
              <Select
                value={formData.importance}
                onValueChange={(value: ComponentOption['importance']) => 
                  setFormData(prev => ({ 
                    ...prev, 
                    importance: value,
                    multiplier: getMultiplierForImportance(value)
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">
                    <div className="flex items-center justify-between gap-4 w-full">
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-red-500" />
                        Critical
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">2.0x</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center justify-between gap-4 w-full">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        High
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">1.5x</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="normal">
                    <div className="flex items-center justify-between gap-4 w-full">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        Normal
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">1.0x</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="low">
                    <div className="flex items-center justify-between gap-4 w-full">
                      <div className="flex items-center gap-2">
                        <CircleDot className="h-4 w-4 text-gray-500" />
                        Low
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">0.5x</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Score multiplier: <span className="font-mono font-medium">{formData.multiplier}x</span>
              </p>
            </div>
                    </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
                      </Button>
            <Button onClick={handleSave} disabled={!formData.name || !formData.repo_full_name || saving}>
              {saving ? 'Saving...' : editingComponent ? 'Save Changes' : 'Add Component'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
      pushed_at: r.pushed_at,
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

async function loadComponents(
  orgId: string,
  setComponents: (components: ComponentOption[]) => void,
  setLoading: (loading: boolean) => void,
) {
  setLoading(true);
  try {
    const res = await fetch(`/api/github/load-components?orgId=${orgId}`);
    if (!res.ok) return; // Silently fail, user can add components manually
    const json = await res.json();
    if (json.components?.length > 0) {
      setComponents(json.components);
    }
  } catch (err) {
    console.error('Failed to load components:', err);
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

    setStatus('Saved! Redirecting to PR processing...');
    
    // Redirect to processing page
    window.location.href = `/home/processing?orgId=${orgId}`;
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

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return date.toLocaleDateString();
}
