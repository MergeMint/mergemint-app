'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, 
  CheckCircle, 
  Clock, 
  Loader2, 
  UserPlus, 
  XCircle 
} from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';

type InvitationDetails = {
  email: string;
  role: string;
  org: { name: string; slug: string };
  expiresAt: string;
};

type Status = 'loading' | 'ready' | 'accepting' | 'success' | 'error';

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  pm: 'Product Manager',
  developer: 'Developer',
  viewer: 'Viewer',
};

const roleDescriptions: Record<string, string> = {
  admin: 'Full access to everything',
  pm: 'Can edit components and priorities',
  developer: 'View all team PRs and own profile',
  viewer: 'Read-only dashboard access',
};

export default function InviteAcceptPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  
  const [status, setStatus] = useState<Status>('loading');
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInvitation() {
      try {
        const res = await fetch(`/api/invitations/accept?token=${token}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Invalid invitation');
        }
        const data = await res.json();
        setInvitation(data);
        setStatus('ready');
      } catch (err) {
        setError((err as Error).message);
        setStatus('error');
      }
    }

    if (token) {
      fetchInvitation();
    }
  }, [token]);

  const handleAccept = async () => {
    setStatus('accepting');
    setError(null);

    try {
      const res = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to accept invitation');
      }

      setStatus('success');
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/home');
      }, 2000);
    } catch (err) {
      setError((err as Error).message);
      setStatus('error');
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error' && !invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Invalid Invitation</h2>
            <p className="text-muted-foreground text-center mb-6">{error}</p>
            <Button asChild>
              <Link href="/auth/sign-in">Go to Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Welcome to the team!</h2>
            <p className="text-muted-foreground text-center mb-2">
              You&apos;ve successfully joined <strong>{invitation?.org?.name}</strong>
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Redirecting to dashboard...
            </p>
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">You&apos;ve been invited!</CardTitle>
          <CardDescription>
            Join your team on MergeMint
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Organization info */}
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{invitation?.org?.name}</p>
                <p className="text-sm text-muted-foreground">Organization</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Your role:</span>
                <span className="font-medium">{roleLabels[invitation?.role || ''] || invitation?.role}</span>
              </div>
              {invitation?.role && roleDescriptions[invitation.role] && (
                <p className="text-xs text-muted-foreground text-right">
                  {roleDescriptions[invitation.role]}
                </p>
              )}
            </div>
          </div>

          {/* Expiry notice */}
          {invitation?.expiresAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                Expires{' '}
                {new Date(invitation.expiresAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}

          {/* Error message */}
          {error && status === 'error' && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleAccept} 
              disabled={status === 'accepting'}
              className="w-full"
              size="lg"
            >
              {status === 'accepting' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                'Accept Invitation'
              )}
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/">Decline</Link>
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            By accepting, you agree to join this organization and collaborate with its members.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

