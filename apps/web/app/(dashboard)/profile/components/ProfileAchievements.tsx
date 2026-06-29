import { ACHIEVEMENT_REGISTRY } from '@community-os/types';
import { Eye, Flag, Lock,Star, ThumbsUp, Trophy } from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  flag: Flag,
  visibility: Eye,
  social_leaderboard: Trophy,
  thumb_up: ThumbsUp,
  stars: Star,
};

const RARITY_COLORS: Record<string, string> = {
  common: 'text-gray-400 border-gray-400/20 bg-gray-400/10',
  rare: 'text-blue-400 border-blue-400/20 bg-blue-400/10',
  epic: 'text-purple-400 border-purple-400/20 bg-purple-400/10',
  legendary: 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10',
};

export function ProfileAchievements({ profile }: { profile: any }) {
  const userAchievements = profile.achievements || [];
  
  const allAchievements = Object.values(ACHIEVEMENT_REGISTRY).map(definition => {
    const unlocked = userAchievements.find((a: any) => a.id === definition.id);
    return {
      ...definition,
      unlockedAt: unlocked ? unlocked.unlockedAt : null,
      progress: unlocked ? unlocked.progress : null,
    };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {allAchievements.map(achievement => {
        const isUnlocked = !!achievement.unlockedAt;
        const Icon = ICON_MAP[achievement.icon] || Trophy;
        const rarityStyle = isUnlocked ? RARITY_COLORS[achievement.rarity] : 'text-gray-600 border-white/5 bg-white/5';
        
        return (
          <div key={achievement.id} className={`card p-5 border transition-all ${rarityStyle}`}>
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-xl bg-white/5 backdrop-blur-md">
                {isUnlocked ? <Icon className="w-6 h-6" /> : <Lock className="w-6 h-6 opacity-50" />}
              </div>
              <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-1 rounded-full bg-white/10">
                {achievement.rarity}
              </span>
            </div>
            
            <div className="mt-4">
              <h4 className={`text-lg font-display font-semibold ${isUnlocked ? 'text-white' : 'text-text-secondary'}`}>
                {achievement.title}
              </h4>
              <p className="text-sm mt-1 text-text-tertiary">
                {achievement.description}
              </p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/10 text-xs font-medium text-text-secondary">
              {isUnlocked ? (
                <span className="text-success flex items-center gap-1">
                  ✓ Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Locked
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
