export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  pointsRequired?: number;
  reportsRequired?: number;
  votesRequired?: number;
}

export const ACHIEVEMENT_REGISTRY: Record<string, AchievementDefinition> = {
  first_report: {
    id: 'first_report',
    title: 'Civic Initiator',
    description: 'Submitted your very first civic issue report.',
    rarity: 'common',
    icon: 'flag',
    reportsRequired: 1,
  },
  civic_watcher: {
    id: 'civic_watcher',
    title: 'Civic Watcher',
    description: 'Submitted 10 civic issue reports.',
    rarity: 'rare',
    icon: 'visibility',
    reportsRequired: 10,
  },
  community_leader: {
    id: 'community_leader',
    title: 'Community Leader',
    description: 'Submitted 50 civic issue reports.',
    rarity: 'epic',
    icon: 'social_leaderboard',
    reportsRequired: 50,
  },
  helpful_citizen: {
    id: 'helpful_citizen',
    title: 'Helpful Citizen',
    description: 'Received 10 upvotes on your reports.',
    rarity: 'rare',
    icon: 'thumb_up',
    votesRequired: 10,
  },
  local_legend: {
    id: 'local_legend',
    title: 'Local Legend',
    description: 'Reached 1000 Community Points.',
    rarity: 'legendary',
    icon: 'stars',
    pointsRequired: 1000,
  },
};
