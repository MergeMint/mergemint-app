'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent } from '@kit/ui/card';
import { MagicCard } from '@kit/ui/magicui';
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
import { cn } from '@kit/ui/utils';

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


export function OnboardingClient({
  orgs,
  githubAppSlug,
  connectedOrgs = {},
}: {
  orgs: { org_id: string; organizations: { name: string; slug: string } | null }[];
  githubAppSlug?: string;
  connectedOrgs?: Record<string, number>; // orgId -> installationId
}) {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [repos, setRepos] = useState<RepoOption[]>([]);
  const [components, setComponents] = useState<ComponentOption[]>([]);
  const [orgOptions] = useState(orgs ?? []);
  const [orgId, setOrgId] = useState(orgs[0]?.org_id ?? '');
  const [orgSlug, setOrgSlug] = useState(orgs[0]?.organizations?.slug ?? '');
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [saving, setSaving] = useState(false);

  // Only fetch repos if GitHub is already connected for this org
  const isConnected = !!connectedOrgs[orgId];

  useEffect(() => {
    if (orgId && isConnected) {
      fetchRepos(orgId, orgSlug ?? '', setRepos, setLoadingRepos);
    }
  }, [orgId, orgSlug, isConnected]);

  // Load existing components when entering step 2
  useEffect(() => {
    if (currentStep === 2 && orgId && components.length === 0) {
      loadComponents(orgId, setComponents);
    }
  }, [currentStep, orgId, components.length]);

  // If no orgs, redirect to home to complete welcome onboarding
  if (!orgOptions.length) {
    if (typeof window !== 'undefined') {
      window.location.href = '/home';
    }
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Redirecting to setup...</p>
      </div>
    );
  }

  // Check if current step is complete
  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return isConnected;
      case 1:
        return repos.some((r) => r.selected);
      case 2:
        return components.filter((c) => c.repo_full_name && c.name).length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (!canProceed()) {
      const messages: Record<number, string> = {
        0: 'Please connect your GitHub account first',
        1: 'Select at least one repository to continue',
        2: 'Add at least one component to continue',
      };
      toast.error(messages[currentStep] || 'Please complete this step first');
      return;
    }

    // Save repos when moving from step 1 to step 2
    if (currentStep === 1) {
      const selectedRepos = repos.filter((r) => r.selected);
      if (selectedRepos.length) {
        setSaving(true);
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
        } catch (err) {
          toast.error('Failed to save repositories', {
            description: (err as Error).message,
          });
          setSaving(false);
          return;
        }
        setSaving(false);
      }
    }

    if (currentStep === steps.length - 1) {
      await persistSelections(orgId, repos, components, setSaving);
    } else {
      setCurrentStep((s) => Math.min(steps.length - 1, s + 1));
    }
  };

  return (
    <div className="space-y-6">
      {/* Stepper header */}
      <MagicCard
        gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
        gradientFrom="#8B5CF6"
        gradientTo="#EC4899"
        gradientOpacity={0.15}
      >
        <div className="relative px-6 py-6 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-purple-600/5 to-pink-600/10" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-500/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
                <Github className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">
                  Connect Your Repositories
                </h2>
                <p className="text-sm text-muted-foreground">
                  {getStepDescription(currentStep)}
                </p>
              </div>
            </div>

            {/* Step indicators */}
            <div className="flex items-center gap-2 mt-6">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isActive = currentStep === idx;
                const isComplete = currentStep > idx;

                return (
                  <div key={step.label} className="flex items-center gap-2 flex-1">
                    <div
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300',
                        isActive && 'bg-violet-500/10 dark:bg-violet-500/20',
                        isComplete && 'bg-green-500/10 dark:bg-green-500/20',
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-all duration-300',
                          isActive && 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25',
                          isComplete && 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25',
                          !isActive && !isComplete && 'bg-muted text-muted-foreground'
                        )}
                      >
                        {isComplete ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                      </div>
                      <span className={cn(
                        'text-sm font-medium hidden sm:inline transition-colors duration-300',
                        isActive ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {step.label}
                      </span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={cn(
                        'h-0.5 flex-1 rounded-full transition-colors duration-300',
                        isComplete ? 'bg-green-500/50' : 'bg-border'
                      )} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </MagicCard>

      {/* Content area */}
      <Card>
        <CardContent className="pt-6 min-h-[300px]">
          {currentStep === 0 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <AuthStep
                orgId={orgId}
                orgSlug={orgSlug}
                githubAppSlug={githubAppSlug}
                isConnected={isConnected}
                installationId={connectedOrgs[orgId]}
              />
            </div>
          )}
          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <RepoStep
                repos={repos}
                onToggle={toggleRepo(setRepos)}
                loading={loadingRepos}
                onReload={() => fetchRepos(orgId, orgSlug, setRepos, setLoadingRepos)}
                orgs={orgOptions}
                currentOrg={orgId}
                onOrgChange={(id, slug) => {
                  setOrgId(id);
                  setOrgSlug(slug ?? '');
                  fetchRepos(id, slug ?? '', setRepos, setLoadingRepos);
                }}
              />
            </div>
          )}
          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
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
            </div>
          )}
          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <ReviewStep repos={repos} components={components} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Spacer for fixed footer */}
      <div className="h-24" />

      {/* Fixed footer navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Button
            variant="ghost"
            disabled={currentStep === 0 || saving}
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            className="gap-2 rounded-xl"
          >
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed() || saving}
            className="gap-2 min-w-[140px] rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              'Saving...'
            ) : currentStep === steps.length - 1 ? (
              <>
                Finish
                <Sparkles className="h-4 w-4" />
              </>
            ) : (
              'Next'
            )}
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
  isConnected,
  installationId,
}: {
  orgId?: string;
  orgSlug?: string;
  githubAppSlug?: string;
  isConnected?: boolean;
  installationId?: number;
}) {
  const { theme } = useTheme();
  const appSlug = githubAppSlug ?? process.env.NEXT_PUBLIC_GITHUB_APP_SLUG;
  const [installUrl, setInstallUrl] = useState<string | null>(null);

  // Compute install URL on client only (after mount)
  useEffect(() => {
    if (!orgId) return;
    const url = new URL('/api/github/app/start', window.location.origin);
    url.searchParams.set('orgId', orgId);
    if (orgSlug) url.searchParams.set('orgSlug', orgSlug);
    url.searchParams.set('returnTo', '/home/onboarding');
    setInstallUrl(url.toString());
  }, [orgId, orgSlug]);

  if (isConnected) {
    return (
      <div className={'space-y-4'}>
        <MagicCard
          gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
          gradientFrom="#10B981"
          gradientTo="#059669"
          gradientOpacity={0.2}
        >
          <div className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
              <Github className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-green-700 dark:text-green-400">GitHub Connected</p>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground">
                Installation ID: {installationId}
              </p>
            </div>
          </div>
        </MagicCard>
        <div className="flex items-center justify-between">
          <p className={'text-sm text-muted-foreground'}>
            You&apos;re all set! Click Next to select repositories.
          </p>
          <Button
            size={'sm'}
            variant={'ghost'}
            className={'gap-2'}
            onClick={() => {
              if (installUrl) {
                window.location.href = installUrl;
              }
            }}
          >
            <Github className={'h-4 w-4'} />
            Reconnect
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={'space-y-4'}>
      <MagicCard
        gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
        gradientFrom="#8B5CF6"
        gradientTo="#EC4899"
        gradientOpacity={0.15}
      >
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 mb-4">
            <Github className="h-8 w-8" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Connect your GitHub account</h3>
          <p className={'text-sm text-muted-foreground mb-6 max-w-sm'}>
            Authorize MergeMint to access your repositories and start tracking your team&apos;s contributions.
          </p>
          <Button
            size={'lg'}
            className={'gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/25'}
            disabled={!installUrl || !appSlug}
            onClick={() => {
              if (installUrl) {
                window.location.href = installUrl;
              }
            }}
          >
            <Github className={'h-5 w-5'} />
            Authorize with GitHub
          </Button>
        </div>
      </MagicCard>
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
  const { theme } = useTheme();

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
        <div
          key={repo.name}
          role="button"
          tabIndex={0}
          className="cursor-pointer transition-all"
          onClick={() => onToggle(repo.name)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onToggle(repo.name);
            }
          }}
        >
          <MagicCard
            gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
            gradientFrom={repo.selected ? "#10B981" : "#8B5CF6"}
            gradientTo={repo.selected ? "#059669" : "#EC4899"}
            gradientOpacity={repo.selected ? 0.2 : 0.1}
          >
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Github className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <h3 className="font-medium truncate">{repo.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {repo.description || 'No description'}
                  </p>
                  {repo.pushed_at && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Last commit: {formatRelativeTime(repo.pushed_at)}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 ml-4">
                  {repo.selected ? (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm font-medium">Selected</span>
                    </div>
                  ) : (
                    <Badge variant="outline" className="rounded-xl">
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </MagicCard>
        </div>
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
  onChangeImportance: _onChangeImportance,
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
  const { theme } = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedRepoForDialog, setSelectedRepoForDialog] = useState<string | null>(null);
  const [editingComponent, setEditingComponent] = useState<{
    repoFullName: string;
    idx: number;
    component: ComponentOption;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
    importance: 'normal' as ComponentOption['importance'],
    multiplier: getMultiplierForImportance('normal'),
  });

  const resetForm = () => {
    setFormData({
      name: '',
      key: '',
      description: '',
      importance: 'normal',
      multiplier: getMultiplierForImportance('normal'),
    });
    setEditingComponent(null);
    setSelectedRepoForDialog(null);
  };

  const handleOpenDialog = (repo: RepoOption) => {
    resetForm();
    setSelectedRepoForDialog(repo.full_name ?? repo.name);
    setDialogOpen(true);
  };

  const handleEditComponent = (repoFullName: string, idx: number, component: ComponentOption) => {
    setEditingComponent({ repoFullName, idx, component });
    setSelectedRepoForDialog(repoFullName);
    setFormData({
      name: component.name,
      key: component.key,
      description: component.description,
      importance: component.importance,
      multiplier: component.multiplier ?? 1,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedRepoForDialog) return;

    setSaving(true);
    try {
      const componentData = {
        repo_full_name: selectedRepoForDialog,
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
        const repo = repos.find(r => (r.full_name ?? r.name) === selectedRepoForDialog);
        if (repo) {
          onAddComponent(repo);
          const newIdx = components.filter(c => c.repo_full_name === selectedRepoForDialog).length;
          setTimeout(() => {
            onUpdateComponent(selectedRepoForDialog, newIdx, {
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
      toast.success(editingComponent ? 'Component updated' : 'Component added');
    } catch (err) {
      console.error('Failed to save component:', err);
      toast.error('Failed to save component', {
        description: (err as Error).message,
      });
    } finally {
      setSaving(false);
    }
  };

  if (repos.length === 0) {
    return (
      <MagicCard
        gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
        gradientFrom="#F59E0B"
        gradientTo="#EF4444"
        gradientOpacity={0.1}
      >
        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 mb-4">
            <AlertTriangle className="h-7 w-7 text-amber-500" />
          </div>
          <p className="font-medium mb-1">No repositories selected</p>
          <p className="text-sm text-muted-foreground">
            Go back and select at least one repository to add components.
          </p>
        </div>
      </MagicCard>
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

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Define the key components for each repository to track which parts of your codebase are affected by PRs.
        </p>
        <p className="text-xs text-muted-foreground/80">
          Assign importance levels to weight contribution scores — changes to critical components like auth, payments, or core APIs will earn higher points than routine updates.
        </p>
      </div>

      {/* Repo cards with components */}
      {repos.map((repo) => {
        const repoName = repo.full_name ?? repo.name;
        const repoComponents = componentsByRepo[repoName] || [];

        return (
          <MagicCard
            key={repoName}
            gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
            gradientFrom={repoComponents.length > 0 ? "#10B981" : "#8B5CF6"}
            gradientTo={repoComponents.length > 0 ? "#059669" : "#EC4899"}
            gradientOpacity={0.1}
          >
            <div className="p-4">
              {/* Repo header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Github className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium">{repoName.split('/')[1] || repoName}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {repoComponents.length} component{repoComponents.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl h-8"
                  onClick={() => handleOpenDialog(repo)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>

              {/* Components list */}
              {repoComponents.length > 0 ? (
                <div className="space-y-2">
                  {repoComponents.map((component, localIdx) => (
                    <div
                      key={`${component.key}-${localIdx}`}
                      className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 px-3 py-2"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <ImportanceBadge level={component.importance} />
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{component.name}</p>
                          {component.description && (
                            <p className="text-xs text-muted-foreground truncate">{component.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <span className="text-xs font-mono text-muted-foreground">
                          {component.multiplier ?? 1}x
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditComponent(repoName, localIdx, component)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => onDeleteComponent(repoName, localIdx)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-6 text-center border border-dashed border-border/50 rounded-lg">
                  <div>
                    <Sparkles className="h-5 w-5 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No components yet</p>
                    <Button
                      size="sm"
                      variant="link"
                      className="text-xs h-auto p-0 mt-1"
                      onClick={() => handleOpenDialog(repo)}
                    >
                      Add your first component
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </MagicCard>
        );
      })}

      {/* Add/Edit Component Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-[500px] overflow-hidden p-0 border-0 bg-transparent shadow-none">
          <MagicCard
            gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
            gradientFrom="#8B5CF6"
            gradientTo="#EC4899"
            gradientOpacity={0.15}
            className="overflow-hidden"
          >
            <DialogHeader className="px-6 pt-6 pb-2">
              <DialogTitle className="text-lg font-semibold">
                {editingComponent ? 'Edit Component' : 'Add Component'}
              </DialogTitle>
              <DialogDescription>
                {selectedRepoForDialog && (
                  <span className="flex items-center gap-1 mt-1">
                    <Github className="h-3 w-3" />
                    {selectedRepoForDialog.split('/')[1] || selectedRepoForDialog}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 px-6 py-4">
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
                  className="rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
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
                  className="rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors resize-none"
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
                  <SelectTrigger className="rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="critical" className="rounded-lg">
                      <div className="flex items-center justify-between gap-4 w-full">
                        <div className="flex items-center gap-2">
                          <Flame className="h-4 w-4 text-red-500" />
                          Critical
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">2.0x</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="high" className="rounded-lg">
                      <div className="flex items-center justify-between gap-4 w-full">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          High
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">1.5x</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="normal" className="rounded-lg">
                      <div className="flex items-center justify-between gap-4 w-full">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-blue-500" />
                          Normal
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">1.0x</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="low" className="rounded-lg">
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
                <div className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Score multiplier</span>
                    <span className="text-xs font-mono font-medium">{formData.multiplier}x</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    PRs touching higher-importance components earn more contribution points.
                    Mark core business logic, security-sensitive code, or frequently-used services as
                    <span className="font-medium text-foreground"> Critical</span> or
                    <span className="font-medium text-foreground"> High</span> to reward impactful work.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-border/50 bg-muted/20 px-6 py-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving} className="rounded-xl">
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={!formData.name || !selectedRepoForDialog || saving}
                className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/25"
              >
                {saving ? 'Saving...' : editingComponent ? 'Save Changes' : 'Add Component'}
              </Button>
            </DialogFooter>
          </MagicCard>
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
  const { theme } = useTheme();
  const selectedRepos = repos.filter((r) => r.selected);

  return (
    <div className={'space-y-4'}>
      <MagicCard
        gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
        gradientFrom="#10B981"
        gradientTo="#059669"
        gradientOpacity={0.1}
      >
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <GitBranch className="h-4 w-4 text-green-600" />
            <h3 className="font-medium">Repositories</h3>
            <Badge variant="secondary" className="ml-auto">{selectedRepos.length}</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedRepos.length ? (
              selectedRepos.map((repo) => (
                <Badge key={repo.name} variant="outline" className="gap-1">
                  <Github className="h-3 w-3" />
                  {repo.name}
                </Badge>
              ))
            ) : (
              <p className={'text-sm text-muted-foreground'}>
                No repositories selected yet.
              </p>
            )}
          </div>
        </div>
      </MagicCard>

      <MagicCard
        gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
        gradientFrom="#8B5CF6"
        gradientTo="#EC4899"
        gradientOpacity={0.1}
      >
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-violet-600" />
            <h3 className="font-medium">Components</h3>
            <Badge variant="secondary" className="ml-auto">{components.length}</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {components.length ? (
              components.map((component) => (
                <Badge key={component.key} variant="outline" className="gap-1">
                  <ImportanceLabel level={component.importance} />
                  {component.name}
                </Badge>
              ))
            ) : (
              <p className={'text-sm text-muted-foreground'}>
                No components defined yet.
              </p>
            )}
          </div>
        </div>
      </MagicCard>

      <MagicCard
        gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
        gradientFrom="#3B82F6"
        gradientTo="#06B6D4"
        gradientOpacity={0.1}
      >
        <div className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 flex-shrink-0">
            <GitPullRequest className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="font-medium text-sm">Ready to sync</p>
            <p className={'text-sm text-muted-foreground'}>
              Click Finish to save and start syncing your PRs.
            </p>
          </div>
        </div>
      </MagicCard>
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
) {
  setLoading(true);
  try {
    const res = await fetch(`/api/github/repos?orgId=${orgId}&orgSlug=${orgSlug}`);
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  } catch (err) {
    toast.error('Could not load repos from GitHub', {
      description: (err as Error).message,
    });
    setRepos([]);
  } finally {
    setLoading(false);
  }
}

async function loadComponents(
  orgId: string,
  setComponents: (components: ComponentOption[]) => void,
) {
  try {
    const res = await fetch(`/api/github/load-components?orgId=${orgId}`);
    if (!res.ok) return; // Silently fail, user can add components manually
    const json = await res.json();
    if (json.components?.length > 0) {
      setComponents(json.components);
    }
  } catch (err) {
    console.error('Failed to load components:', err);
  }
}

async function persistSelections(
  orgId: string,
  repos: RepoOption[],
  components: ComponentOption[],
  setSaving: (saving: boolean) => void,
) {
  setSaving(true);
  try {
    const selectedRepos = repos.filter((r) => r.selected);
    if (selectedRepos.length) {
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
      const res = await fetch('/api/github/save-components', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId, components: componentPayload }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save components');
      }
    }

    toast.success('Setup complete!', {
      description: 'Redirecting to PR processing...',
    });

    // Redirect to processing page
    window.location.href = `/home/processing?orgId=${orgId}`;
  } catch (err) {
    toast.error('Failed to save selections', {
      description: (err as Error).message,
    });
    setSaving(false);
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
