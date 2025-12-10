'use client';

import { useEffect, useRef } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useAuthChangeListener } from '@kit/supabase/hooks/use-auth-change-listener';

import pathsConfig from '~/config/paths.config';

export function AuthProvider(props: React.PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasHandledHash = useRef(false);

  // Get the 'next' parameter from URL (for redirect after auth)
  const nextUrl = searchParams.get('next');

  useAuthChangeListener({
    appHomePath: pathsConfig.app.home,
    onEvent: (event, session) => {
      // Handle successful sign-in from magic link (token in URL hash)
      // Only redirect if there's actually an access token in the hash (magic link sign-in)
      const hasAccessToken = typeof window !== 'undefined' && window.location.hash.includes('access_token');

      if (event === 'SIGNED_IN' && session && !hasHandledHash.current && hasAccessToken) {
        // Check if we're on a public route (marketing pages, root, etc.)
        const isPublicRoute =
          pathname === '/' ||
          pathname.startsWith('/auth') ||
          pathname.startsWith('/features') ||
          pathname.startsWith('/pricing') ||
          pathname.startsWith('/how-it-works') ||
          pathname.startsWith('/faq') ||
          pathname.startsWith('/contact');

        if (isPublicRoute) {
          hasHandledHash.current = true;

          // Clear the hash from URL to prevent re-processing
          if (window.location.hash) {
            // Use replaceState to clean the URL without triggering navigation
            window.history.replaceState(null, '', window.location.pathname);
          }

          // Redirect to 'next' URL if present (e.g., invite link), otherwise home
          const redirectTo = nextUrl || pathsConfig.app.home;
          router.replace(redirectTo);
        }
      }
    },
  });

  // Also handle direct hash detection on mount (in case auth state was already set)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token') && !hasHandledHash.current) {
      hasHandledHash.current = true;
      
      // Small delay to let Supabase process the token first
      const timeout = setTimeout(() => {
        window.history.replaceState(null, '', window.location.pathname);
        // Redirect to 'next' URL if present, otherwise home
        const redirectTo = nextUrl || pathsConfig.app.home;
        router.replace(redirectTo);
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [router, nextUrl]);

  return props.children;
}
