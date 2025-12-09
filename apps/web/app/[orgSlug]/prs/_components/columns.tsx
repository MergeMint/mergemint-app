'use client';

import Link from 'next/link';

import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, ExternalLink } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';

export type PREvaluation = {
  id: string;
  pr_id: string;
  final_score: number | null;
  is_eligible: boolean | null;
  impact_summary: string | null;
  created_at: string;
  merged_at: string | null;
  pr_number: number;
  pr_title: string;
  pr_url: string | null;
  component_key: string | null;
  severity_key: string | null;
  org_slug: string;
};

export const columns: ColumnDef<PREvaluation>[] = [
  {
    accessorKey: 'pr_number',
    header: 'PR',
    cell: ({ row }) => {
      const { pr_number, pr_title, pr_id, org_slug } = row.original;
      return (
        <div className="max-w-[300px]">
          <Link
            href={`/${org_slug}/prs/${pr_id}`}
            className="font-medium hover:underline"
          >
            #{pr_number} · {pr_title}
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: 'component_key',
    header: 'Component',
    cell: ({ row }) => {
      const component = row.getValue('component_key') as string | null;
      return (
        <Badge variant="secondary" className="font-mono text-xs">
          {component ?? 'N/A'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'severity_key',
    header: 'Severity',
    cell: ({ row }) => {
      const severity = row.getValue('severity_key') as string | null;
      return (
        <Badge className="font-mono text-xs">{severity ?? 'N/A'}</Badge>
      );
    },
  },
  {
    accessorKey: 'merged_at',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="-ml-4"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Merged
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const mergedAt = row.getValue('merged_at') as string | null;
      if (!mergedAt) return <span className="text-muted-foreground">—</span>;

      const date = new Date(mergedAt);
      return (
        <span className="text-muted-foreground text-sm">
          {date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      );
    },
    sortingFn: (rowA, rowB) => {
      const a = rowA.getValue('merged_at') as string | null;
      const b = rowB.getValue('merged_at') as string | null;
      if (!a && !b) return 0;
      if (!a) return 1;
      if (!b) return -1;
      return new Date(a).getTime() - new Date(b).getTime();
    },
  },
  {
    accessorKey: 'final_score',
    header: () => <div className="text-right">Score</div>,
    cell: ({ row }) => {
      const score = row.getValue('final_score') as number | null;
      const isEligible = row.original.is_eligible;

      return (
        <div className="text-right">
          <Badge variant={isEligible ? 'default' : 'outline'}>
            {score ?? 0} pts
          </Badge>
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const { pr_url } = row.original;
      if (!pr_url) return null;

      return (
        <a
          href={pr_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      );
    },
  },
];
