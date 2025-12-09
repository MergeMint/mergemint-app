/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowUpRight, Sparkles } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import { PublicChangelogContent } from './changelog-public.client';

export default async function PublicChangelogPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const admin = getSupabaseServerAdminClient<any>();

  // Get organization
  const { data: org, error: orgError } = await admin
    .from('organizations')
    .select('id, name, slug')
    .eq('slug', orgSlug)
    .maybeSingle();

  if (orgError || !org) {
    notFound();
  }

  // Get product info
  const { data: productInfo } = await admin
    .from('product_info')
    .select('product_name')
    .eq('org_id', org.id)
    .maybeSingle();

  // Get changelog settings
  const { data: settings } = await admin
    .from('changelog_settings')
    .select('*')
    .eq('org_id', org.id)
    .maybeSingle();

  // Fetch published entries
  const { data: entries } = await admin
    .from('changelog_entries')
    .select('*')
    .eq('org_id', org.id)
    .eq('is_draft', false)
    .eq('is_hidden', false)
    .order('published_at', { ascending: false });

  const productName = productInfo?.product_name || org.name;
  const showDates = settings?.show_dates ?? true;

  return (
    <div className="min-h-screen bg-background">
      {/* Header with gradient */}
      <header className="relative overflow-hidden border-b border-border/40">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-indigo-500/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-500/10 via-transparent to-transparent" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative container max-w-3xl mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 text-sm font-medium mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                Product Updates
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
                {productName}
              </h1>
              <p className="text-lg text-muted-foreground mt-2 max-w-md">
                Stay up to date with the latest features, improvements, and fixes.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="self-start md:self-center bg-background/50 backdrop-blur-sm hover:bg-background/80 border-border/50"
            >
              <Link href="/">
                Visit Site
                <ArrowUpRight className="h-4 w-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-3xl mx-auto px-4 py-12 md:py-16">
        <PublicChangelogContent
          entries={entries || []}
          showDates={showDates}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-16 bg-gradient-to-b from-transparent to-muted/20">
        <div className="container max-w-3xl mx-auto px-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by{' '}
            <a
              href="https://mergemint.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              MergeMint
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
