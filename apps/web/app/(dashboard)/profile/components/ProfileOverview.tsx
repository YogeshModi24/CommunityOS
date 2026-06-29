import { Activity, CheckCircle2, Flame, MapPin, Target } from 'lucide-react';

import { StatCard } from '@/components/ui/primitives';

export function ProfileOverview({ profile, insights }: { profile: any, insights?: any }) {
  const { points = 0, issues_reported = 0, resolved_reports = 0, reputation } = profile;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Reports"
          value={issues_reported}
          icon={<Target className="w-5 h-5" />}
          color="#3B82F6"
        />
        <StatCard
          label="Resolved Reports"
          value={resolved_reports}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="#10B981"
        />
        <StatCard
          label="Community Points"
          value={points}
          icon={<Flame className="w-5 h-5" />}
          color="#F59E0B"
        />
        <StatCard
          label="Civic Level"
          value={reputation?.level || 1}
          icon={<MapPin className="w-5 h-5" />}
          color="#7C3AED"
        />
      </div>

      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6 border border-primary/20 bg-primary/5">
            <h3 className="text-lg font-display font-semibold text-primary-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" /> Weekly Contribution
            </h3>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li className="flex justify-between items-center border-b border-white/5 pb-2">
                <span>Reports Submitted</span>
                <span className="text-white font-mono">{insights.weeklyContribution.reportsSubmitted}</span>
              </li>
              <li className="flex justify-between items-center border-b border-white/5 pb-2">
                <span>Votes Cast</span>
                <span className="text-white font-mono">{insights.weeklyContribution.votesCast}</span>
              </li>
              <li className="flex justify-between items-center pb-2">
                <span>Issues Resolved</span>
                <span className="text-white font-mono">{insights.weeklyContribution.issuesResolved}</span>
              </li>
            </ul>
          </div>

          <div className="card p-6 border border-accent/20 bg-accent/5 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-display font-semibold text-accent-300 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" /> AI Insight
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed italic border-l-2 border-accent/50 pl-4 py-1">
                "{insights.personalizedRecommendation}"
              </p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex justify-between text-xs text-text-tertiary mb-2">
                <span>Next: {insights.nextAchievement.name}</span>
                <span>{insights.nextAchievement.progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-surface-hover rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent rounded-full" 
                  style={{ width: `${insights.nextAchievement.progress}%` }} 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Placeholder for Recent Activity timeline if needed */}
      <div className="card p-6">
        <h3 className="text-lg font-display font-semibold text-white mb-4">Contribution Impact</h3>
        <p className="text-text-secondary text-sm max-w-2xl leading-relaxed">
          Your active participation helps maintain and improve the community infrastructure. 
          Keep reporting issues and supporting valid concerns to increase your civic ranking.
          {insights && (
            <span className="block mt-2 font-medium text-primary-200">
              You've estimated to have helped {insights.communityImpact.estimatedPeopleHelped} people in your community!
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
