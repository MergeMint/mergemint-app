'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  Bug,
  Calendar,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { BlurFade } from '@kit/ui/magicui';
import { cn } from '@kit/ui/utils';

type Category = 'new_feature' | 'improvement' | 'bug_fix' | 'breaking_change';

interface ChangelogEntry {
  id: string;
  title: string;
  description: string;
  category: Category;
  published_at: string | null;
  created_at: string;
}

const CATEGORY_CONFIG: Record<Category, {
  label: string;
  icon: typeof Sparkles;
  color: string;
  gradient: string;
  dotColor: string;
}> = {
  new_feature: {
    label: 'New Feature',
    icon: Sparkles,
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50 dark:text-emerald-400 dark:border-emerald-800/50',
    gradient: 'from-emerald-500 to-teal-500',
    dotColor: 'bg-emerald-500',
  },
  improvement: {
    label: 'Improvement',
    icon: TrendingUp,
    color: 'bg-blue-500/10 text-blue-600 border-blue-200/50 dark:text-blue-400 dark:border-blue-800/50',
    gradient: 'from-blue-500 to-cyan-500',
    dotColor: 'bg-blue-500',
  },
  bug_fix: {
    label: 'Bug Fix',
    icon: Bug,
    color: 'bg-amber-500/10 text-amber-600 border-amber-200/50 dark:text-amber-400 dark:border-amber-800/50',
    gradient: 'from-amber-500 to-orange-500',
    dotColor: 'bg-amber-500',
  },
  breaking_change: {
    label: 'Breaking Change',
    icon: AlertTriangle,
    color: 'bg-rose-500/10 text-rose-600 border-rose-200/50 dark:text-rose-400 dark:border-rose-800/50',
    gradient: 'from-rose-500 to-pink-500',
    dotColor: 'bg-rose-500',
  },
};

function CategoryBadge({ category }: { category: Category }) {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.improvement;
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={cn('gap-1.5 font-medium', config.color)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

function groupEntriesByMonth(entries: ChangelogEntry[]): Record<string, ChangelogEntry[]> {
  const groups: Record<string, ChangelogEntry[]> = {};

  for (const entry of entries) {
    const date = new Date(entry.published_at || entry.created_at);
    const key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(entry);
  }

  return groups;
}

export function PublicChangelogContent({
  entries,
  showDates,
}: {
  entries: ChangelogEntry[];
  showDates: boolean;
}) {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');

  // Filter entries by category
  const filteredEntries = selectedCategory === 'all'
    ? entries
    : entries.filter(entry => entry.category === selectedCategory);

  const groupedEntries = groupEntriesByMonth(filteredEntries);

  // Get counts for each category
  const categoryCounts = {
    all: entries.length,
    new_feature: entries.filter(e => e.category === 'new_feature').length,
    improvement: entries.filter(e => e.category === 'improvement').length,
    bug_fix: entries.filter(e => e.category === 'bug_fix').length,
    breaking_change: entries.filter(e => e.category === 'breaking_change').length,
  };

  // Track animation index for staggered animations
  let animationIndex = 0;

  return (
    <>
      {/* Category Filters */}
      {entries.length > 0 && (
        <BlurFade delay={0.1} inView>
          <div className="flex flex-wrap gap-2 mb-10">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCategory('all')}
              className={cn(
                'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25'
                  : 'bg-muted/50 hover:bg-muted text-muted-foreground border border-border/50'
              )}
            >
              All Updates
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded-full',
                selectedCategory === 'all' ? 'bg-white/20' : 'bg-muted-foreground/10'
              )}>
                {categoryCounts.all}
              </span>
            </motion.button>

            {categoryCounts.new_feature > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory('new_feature')}
                className={cn(
                  'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                  selectedCategory === 'new_feature'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                    : 'bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/10'
                )}
              >
                <Sparkles className="h-3.5 w-3.5" />
                New Features
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full',
                  selectedCategory === 'new_feature' ? 'bg-white/20' : 'bg-emerald-500/10'
                )}>
                  {categoryCounts.new_feature}
                </span>
              </motion.button>
            )}

            {categoryCounts.improvement > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory('improvement')}
                className={cn(
                  'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                  selectedCategory === 'improvement'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-blue-500/5 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/10'
                )}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                Improvements
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full',
                  selectedCategory === 'improvement' ? 'bg-white/20' : 'bg-blue-500/10'
                )}>
                  {categoryCounts.improvement}
                </span>
              </motion.button>
            )}

            {categoryCounts.bug_fix > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory('bug_fix')}
                className={cn(
                  'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                  selectedCategory === 'bug_fix'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25'
                    : 'bg-amber-500/5 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/10'
                )}
              >
                <Bug className="h-3.5 w-3.5" />
                Bug Fixes
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full',
                  selectedCategory === 'bug_fix' ? 'bg-white/20' : 'bg-amber-500/10'
                )}>
                  {categoryCounts.bug_fix}
                </span>
              </motion.button>
            )}

            {categoryCounts.breaking_change > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory('breaking_change')}
                className={cn(
                  'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                  selectedCategory === 'breaking_change'
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/25'
                    : 'bg-rose-500/5 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/10'
                )}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Breaking Changes
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full',
                  selectedCategory === 'breaking_change' ? 'bg-white/20' : 'bg-rose-500/10'
                )}>
                  {categoryCounts.breaking_change}
                </span>
              </motion.button>
            )}
          </div>
        </BlurFade>
      )}

      {/* Entries */}
      {Object.keys(groupedEntries).length === 0 ? (
        <BlurFade delay={0.2} inView>
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/10 to-indigo-500/10 mb-6">
              <Sparkles className="h-8 w-8 text-violet-500" />
            </div>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {selectedCategory === 'all' ? 'No updates yet' : 'No entries in this category'}
            </h2>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
              {selectedCategory === 'all'
                ? 'Check back soon for product updates and new features.'
                : 'Try selecting a different filter to see more updates.'}
            </p>
          </div>
        </BlurFade>
      ) : (
        <div className="space-y-16">
          {Object.entries(groupedEntries).map(([month, monthEntries], monthIndex) => (
            <section key={month}>
              <BlurFade delay={0.1 + monthIndex * 0.05} inView>
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-muted/80 to-muted/40 border border-border/50">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold text-foreground">
                      {month}
                    </h2>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
                </div>
              </BlurFade>

              {/* Timeline */}
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[7px] top-3 bottom-3 w-px bg-gradient-to-b from-border via-border to-transparent" />

                <div className="space-y-6">
                  {monthEntries.map((entry) => {
                    const config = CATEGORY_CONFIG[entry.category] || CATEGORY_CONFIG.improvement;
                    const currentIndex = animationIndex++;

                    return (
                      <BlurFade key={entry.id} delay={0.15 + currentIndex * 0.05} inView>
                        <motion.article
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="group relative pl-8"
                        >
                          {/* Timeline dot */}
                          <div className={cn(
                            'absolute left-0 top-2 w-[15px] h-[15px] rounded-full border-2 border-background',
                            'transition-transform duration-200 group-hover:scale-110',
                            config.dotColor
                          )} />

                          {/* Card */}
                          <motion.div
                            whileHover={{ x: 4 }}
                            transition={{ duration: 0.2 }}
                            className={cn(
                              'relative p-5 rounded-xl border border-border/50',
                              'bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm',
                              'hover:border-border hover:shadow-lg hover:shadow-black/5',
                              'transition-all duration-300'
                            )}
                          >
                            {/* Subtle gradient overlay on hover */}
                            <div className={cn(
                              'absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                              'bg-gradient-to-br',
                              config.gradient,
                              'pointer-events-none'
                            )} style={{ opacity: 0.02 }} />

                            <div className="relative">
                              <div className="flex items-center gap-3 mb-3">
                                <CategoryBadge category={entry.category} />
                                {showDates && entry.published_at && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    {new Date(entry.published_at).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })}
                                  </span>
                                )}
                              </div>
                              <h3 className="text-lg font-semibold text-foreground group-hover:text-foreground/90 transition-colors">
                                {entry.title}
                              </h3>
                              <p className="text-muted-foreground mt-2 leading-relaxed">
                                {entry.description}
                              </p>
                            </div>
                          </motion.div>
                        </motion.article>
                      </BlurFade>
                    );
                  })}
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
