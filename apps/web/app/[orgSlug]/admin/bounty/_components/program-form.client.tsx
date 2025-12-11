'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Textarea } from '@kit/ui/textarea';
import { Switch } from '@kit/ui/switch';

import { createBountyProgramAction } from '~/lib/server/bounty-actions';
import {
  formatDateForInput,
  getNextPeriod,
} from '~/lib/utils/date-periods';

import type { ProgramType, PeriodType } from '~/lib/types/bounty.types';

interface RankingReward {
  rank: number;
  amount: number;
  currency: string;
}

interface TierReward {
  tier_name: string;
  min_score: number;
  max_score?: number;
  amount: number;
  currency: string;
  sort_order: number;
}

export function ProgramForm({
  orgId,
  orgSlug,
}: {
  orgId: string;
  orgSlug: string;
}) {
  const router = useRouter();
  const [programType, setProgramType] = useState<ProgramType>('ranking');
  const [periodType, setPeriodType] = useState<PeriodType>('monthly');
  const [autoNotify, setAutoNotify] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ranking rewards state
  const [rankingRewards, setRankingRewards] = useState<RankingReward[]>([
    { rank: 1, amount: 500, currency: 'USD' },
    { rank: 2, amount: 300, currency: 'USD' },
    { rank: 3, amount: 100, currency: 'USD' },
  ]);

  // Tier rewards state
  const [tierRewards, setTierRewards] = useState<TierReward[]>([
    {
      tier_name: 'Gold',
      min_score: 500,
      max_score: undefined,
      amount: 400,
      currency: 'USD',
      sort_order: 0,
    },
    {
      tier_name: 'Silver',
      min_score: 200,
      max_score: 499,
      amount: 200,
      currency: 'USD',
      sort_order: 1,
    },
  ]);

  // Auto-calculate dates when period type changes
  const getDefaultDates = () => {
    if (periodType === 'custom') {
      const now = new Date();
      const endDate = new Date(now);
      endDate.setMonth(endDate.getMonth() + 1);
      return {
        start: formatDateForInput(now),
        end: formatDateForInput(endDate),
      };
    }

    const { start, end } = getNextPeriod(periodType as 'weekly' | 'monthly' | 'quarterly');
    return {
      start: formatDateForInput(start),
      end: formatDateForInput(end),
    };
  };

  const [dates, setDates] = useState(getDefaultDates());

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      formData.append('orgId', orgId);
      formData.append('slug', orgSlug);
      formData.append('program_type', programType);
      formData.append('period_type', periodType);
      formData.append('auto_notify', autoNotify.toString());

      // Add rewards based on program type
      if (programType === 'ranking') {
        formData.append('ranking_rewards', JSON.stringify(rankingRewards));
      } else {
        formData.append('tier_rewards', JSON.stringify(tierRewards));
      }

      const result = await createBountyProgramAction(formData);

      if (result.success) {
        router.push(`/${orgSlug}/admin/bounty/${result.programId}`);
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to create program:', error);
      alert('Failed to create program. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addRankingReward = () => {
    const nextRank =
      rankingRewards.length > 0
        ? Math.max(...rankingRewards.map((r) => r.rank)) + 1
        : 1;
    setRankingRewards([
      ...rankingRewards,
      { rank: nextRank, amount: 50, currency: 'USD' },
    ]);
  };

  const removeRankingReward = (index: number) => {
    setRankingRewards(rankingRewards.filter((_, i) => i !== index));
  };

  const updateRankingReward = (
    index: number,
    field: keyof RankingReward,
    value: any,
  ) => {
    const updated = [...rankingRewards];
    updated[index] = { ...updated[index], [field]: value };
    setRankingRewards(updated);
  };

  const addTierReward = () => {
    setTierRewards([
      ...tierRewards,
      {
        tier_name: 'New Tier',
        min_score: 100,
        max_score: undefined,
        amount: 100,
        currency: 'USD',
        sort_order: tierRewards.length,
      },
    ]);
  };

  const removeTierReward = (index: number) => {
    setTierRewards(tierRewards.filter((_, i) => i !== index));
  };

  const updateTierReward = (
    index: number,
    field: keyof TierReward,
    value: any,
  ) => {
    const updated = [...tierRewards];
    updated[index] = { ...updated[index], [field]: value };
    setTierRewards(updated);
  };

  return (
    <form onSubmit={handleSubmit} className={'space-y-6'}>
      <Card>
        <CardHeader>
          <CardTitle>Program Details</CardTitle>
          <CardDescription>
            Basic information about the bounty program
          </CardDescription>
        </CardHeader>
        <CardContent className={'space-y-4'}>
          <div className={'space-y-2'}>
            <Label htmlFor="name">Program Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Q1 2025 Bug Bounty"
              required
            />
          </div>

          <div className={'space-y-2'}>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Reward top contributors for bug fixes in Q1"
              rows={3}
            />
          </div>

          <div className={'grid gap-4 md:grid-cols-2'}>
            <div className={'space-y-2'}>
              <Label htmlFor="program_type">Program Type</Label>
              <Select
                value={programType}
                onValueChange={(value) => setProgramType(value as ProgramType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ranking">Ranking (Top N)</SelectItem>
                  <SelectItem value="tier">Tier (Score Thresholds)</SelectItem>
                </SelectContent>
              </Select>
              <p className={'text-sm text-muted-foreground'}>
                {programType === 'ranking'
                  ? 'Reward top performers by rank (e.g., top 3)'
                  : 'Reward developers who reach score thresholds'}
              </p>
            </div>

            <div className={'space-y-2'}>
              <Label htmlFor="period_type">Time Period</Label>
              <Select
                value={periodType}
                onValueChange={(value) => {
                  setPeriodType(value as PeriodType);
                  // Auto-update dates when period changes
                  setTimeout(() => setDates(getDefaultDates()), 0);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className={'grid gap-4 md:grid-cols-2'}>
            <div className={'space-y-2'}>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                value={dates.start}
                onChange={(e) =>
                  setDates({ ...dates, start: e.target.value })
                }
                required
              />
            </div>

            <div className={'space-y-2'}>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                value={dates.end}
                onChange={(e) => setDates({ ...dates, end: e.target.value })}
                required
              />
            </div>
          </div>

          <div className={'flex items-center space-x-2'}>
            <Switch
              id="auto_notify"
              checked={autoNotify}
              onCheckedChange={setAutoNotify}
            />
            <Label htmlFor="auto_notify">
              Send email notifications when rewards are calculated
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Rewards Configuration */}
      {programType === 'ranking' && (
        <Card>
          <CardHeader>
            <CardTitle>Ranking Rewards</CardTitle>
            <CardDescription>
              Configure rewards for top-performing developers
            </CardDescription>
          </CardHeader>
          <CardContent className={'space-y-4'}>
            {rankingRewards.map((reward, index) => (
              <div
                key={index}
                className={'flex gap-3 items-end border-b pb-3 last:border-0'}
              >
                <div className={'flex-1 space-y-2'}>
                  <Label>Rank #{reward.rank}</Label>
                  <Input
                    type="number"
                    value={reward.rank}
                    onChange={(e) =>
                      updateRankingReward(
                        index,
                        'rank',
                        parseInt(e.target.value),
                      )
                    }
                    min={1}
                  />
                </div>
                <div className={'flex-1 space-y-2'}>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={reward.amount}
                    onChange={(e) =>
                      updateRankingReward(
                        index,
                        'amount',
                        parseFloat(e.target.value),
                      )
                    }
                    min={0}
                    step={0.01}
                  />
                </div>
                <div className={'w-24 space-y-2'}>
                  <Label>Currency</Label>
                  <Input
                    value={reward.currency}
                    onChange={(e) =>
                      updateRankingReward(index, 'currency', e.target.value)
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant={'ghost'}
                  onClick={() => removeRankingReward(index)}
                  disabled={rankingRewards.length === 1}
                >
                  Remove
                </Button>
              </div>
            ))}

            <Button type="button" variant={'outline'} onClick={addRankingReward}>
              Add Position
            </Button>
          </CardContent>
        </Card>
      )}

      {programType === 'tier' && (
        <Card>
          <CardHeader>
            <CardTitle>Tier Rewards</CardTitle>
            <CardDescription>
              Configure rewards based on score thresholds
            </CardDescription>
          </CardHeader>
          <CardContent className={'space-y-4'}>
            {tierRewards.map((tier, index) => (
              <div
                key={index}
                className={'space-y-3 border-b pb-4 last:border-0'}
              >
                <div className={'grid gap-3 md:grid-cols-2'}>
                  <div className={'space-y-2'}>
                    <Label>Tier Name</Label>
                    <Input
                      value={tier.tier_name}
                      onChange={(e) =>
                        updateTierReward(index, 'tier_name', e.target.value)
                      }
                    />
                  </div>
                  <div className={'space-y-2'}>
                    <Label>Reward Amount</Label>
                    <div className={'flex gap-2'}>
                      <Input
                        type="number"
                        value={tier.amount}
                        onChange={(e) =>
                          updateTierReward(
                            index,
                            'amount',
                            parseFloat(e.target.value),
                          )
                        }
                        min={0}
                        step={0.01}
                        className={'flex-1'}
                      />
                      <Input
                        value={tier.currency}
                        onChange={(e) =>
                          updateTierReward(index, 'currency', e.target.value)
                        }
                        className={'w-20'}
                      />
                    </div>
                  </div>
                </div>

                <div className={'grid gap-3 md:grid-cols-2'}>
                  <div className={'space-y-2'}>
                    <Label>Minimum Score</Label>
                    <Input
                      type="number"
                      value={tier.min_score}
                      onChange={(e) =>
                        updateTierReward(
                          index,
                          'min_score',
                          parseFloat(e.target.value),
                        )
                      }
                      min={0}
                      step={0.01}
                    />
                  </div>
                  <div className={'space-y-2'}>
                    <Label>Maximum Score (Optional)</Label>
                    <Input
                      type="number"
                      value={tier.max_score || ''}
                      onChange={(e) =>
                        updateTierReward(
                          index,
                          'max_score',
                          e.target.value ? parseFloat(e.target.value) : undefined,
                        )
                      }
                      min={tier.min_score}
                      step={0.01}
                      placeholder="No limit"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  variant={'ghost'}
                  size={'sm'}
                  onClick={() => removeTierReward(index)}
                  disabled={tierRewards.length === 1}
                >
                  Remove Tier
                </Button>
              </div>
            ))}

            <Button type="button" variant={'outline'} onClick={addTierReward}>
              Add Tier
            </Button>
          </CardContent>
        </Card>
      )}

      <div className={'flex justify-end gap-3'}>
        <Button
          type="button"
          variant={'outline'}
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Program'}
        </Button>
      </div>
    </form>
  );
}
