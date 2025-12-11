import { Badge } from '@kit/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';

interface UserStanding {
  score: number;
  rank?: number;
  tier?: string;
  potentialReward?: number;
}

export function ProgramCard({
  program,
  userStanding,
}: {
  program: any;
  userStanding?: UserStanding;
}) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days} day${days !== 1 ? 's' : ''} remaining`;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours} hour${hours !== 1 ? 's' : ''} remaining`;
  };

  const isActive = program.status === 'active';
  const timeInfo = isActive ? getTimeRemaining(program.end_date) : 'Completed';

  return (
    <Card>
      <CardHeader>
        <div className={'flex justify-between items-start'}>
          <div className={'flex-1'}>
            <CardTitle className={'flex items-center gap-2'}>
              {program.name}
              <Badge variant={isActive ? 'default' : 'outline'}>
                {program.status}
              </Badge>
            </CardTitle>
            <CardDescription>{program.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className={'space-y-4'}>
        {/* Date range and time remaining */}
        <div className={'text-sm text-muted-foreground'}>
          {formatDate(program.start_date)} - {formatDate(program.end_date)}
          {isActive && <span> • {timeInfo}</span>}
        </div>

        {/* Reward structure */}
        <div>
          {program.program_type === 'ranking' && (
            <div className={'space-y-2'}>
              <p className={'text-sm font-medium'}>Ranking Rewards:</p>
              <div className={'flex flex-wrap gap-2'}>
                {(program.ranking_rewards as any[])?.map((reward: any) => (
                  <Badge key={reward.rank} variant={'secondary'}>
                    #{reward.rank}: {reward.currency} {reward.amount}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {program.program_type === 'tier' && (
            <div className={'space-y-2'}>
              <p className={'text-sm font-medium'}>Tier Rewards:</p>
              <div className={'flex flex-wrap gap-2'}>
                {(program.tier_rewards as any[])?.map((tier: any) => (
                  <Badge key={tier.tier} variant={'secondary'}>
                    {tier.tier}: {tier.currency} {tier.amount} ({tier.min_score}
                    {tier.max_score ? `-${tier.max_score}` : '+'} pts)
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User's current standing */}
        {userStanding && userStanding.score > 0 && (
          <div className={'mt-4 p-4 bg-muted rounded-md'}>
            <div className={'flex justify-between items-start'}>
              <div className={'space-y-1'}>
                <p className={'font-medium'}>Your Current Standing</p>
                <div className={'flex gap-4 text-sm'}>
                  <span>
                    Score: <strong>{userStanding.score.toFixed(2)}</strong>
                  </span>
                  {program.program_type === 'ranking' && userStanding.rank && (
                    <span>
                      Rank: <strong>#{userStanding.rank}</strong>
                    </span>
                  )}
                  {program.program_type === 'tier' && userStanding.tier && (
                    <span>
                      Tier: <strong>{userStanding.tier}</strong>
                    </span>
                  )}
                </div>
              </div>
              {userStanding.potentialReward && (
                <div className={'text-right'}>
                  <p className={'text-sm text-muted-foreground'}>
                    Potential Reward
                  </p>
                  <p className={'text-lg font-bold text-primary'}>
                    ${userStanding.potentialReward.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {userStanding && userStanding.score === 0 && isActive && (
          <div className={'mt-4 p-4 bg-muted/50 rounded-md'}>
            <p className={'text-sm text-muted-foreground'}>
              You haven't earned any points in this program yet. Complete
              eligible bug fixes to participate!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
