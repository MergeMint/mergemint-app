import { Badge } from '@kit/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';

export function MyRewards({ rewards }: { rewards: any[] }) {
  const getStatusBadge = (status: string) => {
    const variantMap: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      pending: 'secondary',
      approved: 'default',
      paid: 'outline',
      rejected: 'destructive',
    };

    return (
      <Badge variant={variantMap[status] || 'secondary'} className={'capitalize'}>
        {status}
      </Badge>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Calculate totals
  const totalEarned = rewards
    .filter((r) => r.payout_status !== 'rejected')
    .reduce((sum, r) => sum + (r.reward_amount || 0), 0);

  const totalPaid = rewards
    .filter((r) => r.payout_status === 'paid')
    .reduce((sum, r) => sum + (r.reward_amount || 0), 0);

  const totalPending = rewards
    .filter((r) => ['pending', 'approved'].includes(r.payout_status))
    .reduce((sum, r) => sum + (r.reward_amount || 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Rewards ({rewards.length})</CardTitle>
        <CardDescription>
          Track your bug bounty earnings and payout status
        </CardDescription>
      </CardHeader>
      <CardContent className={'space-y-4'}>
        {/* Summary */}
        <div className={'grid gap-4 md:grid-cols-3 p-4 bg-muted rounded-md'}>
          <div>
            <p className={'text-sm text-muted-foreground'}>Total Earned</p>
            <p className={'text-2xl font-bold'}>${totalEarned.toFixed(2)}</p>
          </div>
          <div>
            <p className={'text-sm text-muted-foreground'}>Paid Out</p>
            <p className={'text-2xl font-bold text-green-600'}>
              ${totalPaid.toFixed(2)}
            </p>
          </div>
          <div>
            <p className={'text-sm text-muted-foreground'}>Pending</p>
            <p className={'text-2xl font-bold text-yellow-600'}>
              ${totalPending.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Rewards Table */}
        <div className={'border rounded-md'}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program</TableHead>
                <TableHead className={'text-right'}>Score</TableHead>
                <TableHead className={'text-right'}>Rank/Tier</TableHead>
                <TableHead className={'text-right'}>Reward</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rewards.map((reward) => (
                <TableRow key={reward.id}>
                  <TableCell className={'font-medium'}>
                    {(reward as any).bounty_programs?.name || 'Unknown Program'}
                  </TableCell>
                  <TableCell className={'text-right'}>
                    {reward.final_score?.toFixed(2) || 0}
                  </TableCell>
                  <TableCell className={'text-right'}>
                    {reward.rank_position ? (
                      <Badge>#{reward.rank_position}</Badge>
                    ) : reward.tier_name ? (
                      <Badge variant={'outline'}>{reward.tier_name}</Badge>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className={'text-right font-semibold'}>
                    {reward.reward_currency} {reward.reward_amount}
                  </TableCell>
                  <TableCell>{getStatusBadge(reward.payout_status)}</TableCell>
                  <TableCell className={'text-sm text-muted-foreground'}>
                    {reward.payout_date
                      ? formatDate(reward.payout_date)
                      : formatDate(reward.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
