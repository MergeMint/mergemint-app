'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { 
  User, 
  Building2, 
  Users, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  Mail,
  Trash2,
  Plus,
  Briefcase
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
} from '@kit/ui/dialog';
import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Badge } from '@kit/ui/badge';
import { cn } from '@kit/ui/utils';
import { MagicCard } from '@kit/ui/magicui';

type InviteEntry = {
  email: string;
  role: 'admin' | 'pm' | 'developer' | 'viewer';
};

type OnboardingData = {
  displayName: string;
  occupation: string;
  orgName: string;
  teamSize: string;
  invites: InviteEntry[];
};

const TEAM_SIZE_OPTIONS = [
  { value: 'just_me', label: 'Just me' },
  { value: '2-5', label: '2-5 people' },
  { value: '6-10', label: '6-10 people' },
  { value: '11-25', label: '11-25 people' },
  { value: '26-50', label: '26-50 people' },
  { value: '51-100', label: '51-100 people' },
  { value: '100+', label: '100+ people' },
];

const OCCUPATION_OPTIONS = [
  { value: 'engineering_manager', label: 'Engineering Manager' },
  { value: 'tech_lead', label: 'Tech Lead' },
  { value: 'software_engineer', label: 'Software Engineer' },
  { value: 'product_manager', label: 'Product Manager' },
  { value: 'cto', label: 'CTO / VP Engineering' },
  { value: 'founder', label: 'Founder / CEO' },
  { value: 'devops', label: 'DevOps / SRE' },
  { value: 'other', label: 'Other' },
];

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin', description: 'Full access to everything' },
  { value: 'pm', label: 'Product Manager', description: 'Can edit components and priorities' },
  { value: 'developer', label: 'Developer', description: 'View all team PRs and own profile' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only dashboard access' },
];

const steps = [
  { id: 'profile', label: 'About You', icon: User },
  { id: 'organization', label: 'Your Team', icon: Building2 },
  { id: 'invite', label: 'Invite Members', icon: Users },
];

export function WelcomeOnboardingDialog({
  open,
  userName,
}: {
  open: boolean;
  userName?: string;
}) {
  const router = useRouter();
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [data, setData] = useState<OnboardingData>({
    displayName: userName || '',
    occupation: '',
    orgName: '',
    teamSize: '',
    invites: [],
  });

  const [newInviteEmail, setNewInviteEmail] = useState('');
  const [newInviteRole, setNewInviteRole] = useState<InviteEntry['role']>('developer');

  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  }, []);

  const addInvite = useCallback(() => {
    if (!newInviteEmail || !newInviteEmail.includes('@')) return;
    if (data.invites.some(inv => inv.email === newInviteEmail)) return;
    
    updateData({
      invites: [...data.invites, { email: newInviteEmail, role: newInviteRole }],
    });
    setNewInviteEmail('');
    setNewInviteRole('developer');
  }, [newInviteEmail, newInviteRole, data.invites, updateData]);

  const removeInvite = useCallback((email: string) => {
    updateData({
      invites: data.invites.filter(inv => inv.email !== email),
    });
  }, [data.invites, updateData]);

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 0:
        return data.displayName.trim().length > 0 && data.occupation.length > 0;
      case 1:
        return data.orgName.trim().length > 0 && data.teamSize.length > 0;
      case 2:
        return true; // Invites are optional
      default:
        return false;
    }
  }, [currentStep, data]);

  const handleNext = useCallback(async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Final step - save everything
      setLoading(true);
      setError(null);
      
      try {
        const res = await fetch('/api/onboarding/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to complete onboarding');
        }
        
        // Refresh and redirect to main onboarding (GitHub setup)
        router.refresh();
        router.push('/home/onboarding');
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
  }, [currentStep, data, router]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  return (
    <Dialog open={open} modal={true}>
        <DialogContent 
        className="sm:max-w-[640px] overflow-hidden p-0 border-0 bg-transparent shadow-none"
        hideCloseButton
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <MagicCard
          gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
          gradientFrom="#8B5CF6"
          gradientTo="#EC4899"
          gradientOpacity={0.15}
          className="overflow-hidden"
        >
          {/* Header */}
          <div className="relative px-6 py-8 overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-purple-600/5 to-pink-600/10" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-500/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">
                    Welcome to MergeMint! 🎉
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Let&apos;s set up your workspace in just a few steps
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
                    <div key={step.id} className="flex items-center gap-2 flex-1">
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
                          {isComplete ? '✓' : <Icon className="h-4 w-4" />}
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

          {/* Content area */}
          <div className="px-6 py-6 min-h-[280px]">
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Step 1: Profile */}
            {currentStep === 0 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-sm font-medium">
                    What should we call you?
                  </Label>
                  <Input
                    id="displayName"
                    placeholder="Your name"
                    value={data.displayName}
                    onChange={(e) => updateData({ displayName: e.target.value })}
                    className="h-12 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="occupation" className="text-sm font-medium">
                    What&apos;s your role?
                  </Label>
                  <Select
                    value={data.occupation}
                    onValueChange={(value) => updateData({ occupation: value })}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {OCCUPATION_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="rounded-lg">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            {opt.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <p className="text-sm text-muted-foreground pt-2">
                  This helps us personalize your experience and show you the most relevant features.
                </p>
              </div>
            )}

            {/* Step 2: Organization */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="orgName" className="text-sm font-medium">
                    Organization name
                  </Label>
                  <Input
                    id="orgName"
                    placeholder="e.g., Acme Inc."
                    value={data.orgName}
                    onChange={(e) => updateData({ orgName: e.target.value })}
                    className="h-12 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
                  />
                  <p className="text-xs text-muted-foreground">
                    This is your team or company name
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="teamSize" className="text-sm font-medium">
                    How big is your engineering team?
                  </Label>
                  <Select
                    value={data.teamSize}
                    onValueChange={(value) => updateData({ teamSize: value })}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors">
                      <SelectValue placeholder="Select team size" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {TEAM_SIZE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="rounded-lg">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {opt.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 3: Invite Members */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Invite your teammates to collaborate. They&apos;ll receive an email invitation.
                  </p>
                  
                  {/* Add invite form */}
                  <div className="flex gap-2 mb-4">
                    <div className="flex-1">
                      <Input
                        type="email"
                        placeholder="colleague@company.com"
                        value={newInviteEmail}
                        onChange={(e) => setNewInviteEmail(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addInvite();
                          }
                        }}
                        className="h-11 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
                      />
                    </div>
                    <Select
                      value={newInviteRole}
                      onValueChange={(v) => setNewInviteRole(v as InviteEntry['role'])}
                    >
                      <SelectTrigger className="w-[140px] h-11 rounded-xl border-border/50 bg-muted/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {ROLE_OPTIONS.map((role) => (
                          <SelectItem key={role.value} value={role.value} className="rounded-lg">
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      size="icon"
                      onClick={addInvite}
                      disabled={!newInviteEmail || !newInviteEmail.includes('@')}
                      className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/25"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Invite list */}
                  {data.invites.length > 0 ? (
                    <div className="space-y-2 max-h-[160px] overflow-y-auto">
                      {data.invites.map((invite) => (
                        <div
                          key={invite.email}
                          className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/30 px-3 py-2.5"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20">
                              <Mail className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{invite.email}</p>
                              <p className="text-xs text-muted-foreground">
                                {ROLE_OPTIONS.find(r => r.value === invite.role)?.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs rounded-lg">
                              {ROLE_OPTIONS.find(r => r.value === invite.role)?.label}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg"
                              onClick={() => removeInvite(invite.email)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 py-8 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 mb-3">
                        <Users className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm font-medium">No invites yet</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Add team members or skip this step
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border/50 bg-muted/20 px-6 py-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0 || loading}
              className="gap-2 rounded-xl"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            
            <div className="flex items-center gap-2">
              {currentStep === 2 && data.invites.length === 0 && (
                <Button
                  variant="ghost"
                  onClick={handleNext}
                  disabled={loading}
                  className="rounded-xl"
                >
                  Skip for now
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={!canProceed() || loading}
                className="gap-2 min-w-[140px] rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/25 transition-all duration-300"
              >
                {loading ? (
                  'Saving...'
                ) : currentStep === steps.length - 1 ? (
                  <>
                    Get Started
                    <Sparkles className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </MagicCard>
      </DialogContent>
    </Dialog>
  );
}
