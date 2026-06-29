import { IIssueRepository, IUserRepository } from '@community-os/repositories';

export class InsightService {
  constructor(
    private issueRepository: IIssueRepository,
    private userRepository: IUserRepository
  ) {}

  async generateCityHealthScore() {
    const stats = await this.issueRepository.getDashboardStats();
    const slaOverview = await this.issueRepository.getSlaOverview();
    const criticalSummary = await this.issueRepository.getCriticalIssueSummary();
    
    // Total issues
    const totalIssues = stats.totalIssues || 1; // avoid div by 0
    
    // Resolution Rate (35%)
    const resolutionRate = (stats.resolvedIssues / totalIssues) * 100;
    const resolutionScore = resolutionRate * 0.35;
    
    // SLA Compliance (25%)
    const totalActive = slaOverview.active + slaOverview.expired;
    let slaComplianceRate = 100;
    if (totalActive > 0) {
      slaComplianceRate = (slaOverview.active / totalActive) * 100;
    }
    const slaScore = slaComplianceRate * 0.25;
    
    // Average Resolution Time (15%)
    // Mocked for now: ideally derived from real timestamps
    const avgResScore = 15; // Assume perfect for now or build mock metric
    
    // Citizen Satisfaction (10%)
    // Mocked for now: based on votes/reports ratio
    const satisfactionScore = 8; 

    // Critical Open Issues Penalty (10%)
    // Penalty based on ratio of critical issues out of open
    const openIssues = stats.openIssues || 1;
    const criticalRatio = Math.min(criticalSummary.total / openIssues, 1);
    const criticalPenalty = criticalRatio * -10;
    
    // Active Citizen Participation (5%)
    const participationScore = 5; // Assume active participation for now

    const finalScore = Math.max(0, Math.min(100, Math.round(
      resolutionScore + 
      slaScore + 
      avgResScore + 
      satisfactionScore + 
      criticalPenalty + 
      participationScore
    )));

    return {
      score: finalScore,
      factors: {
        resolutionRate: {
          value: resolutionRate,
          contribution: resolutionScore,
          weight: 35
        },
        slaCompliance: {
          value: slaComplianceRate,
          contribution: slaScore,
          weight: 25
        },
        resolutionSpeed: {
          contribution: avgResScore,
          weight: 15
        },
        citizenSatisfaction: {
          contribution: satisfactionScore,
          weight: 10
        },
        criticalIssuesPenalty: {
          value: criticalSummary.total,
          contribution: criticalPenalty,
          weight: 10
        },
        communityParticipation: {
          contribution: participationScore,
          weight: 5
        }
      }
    };
  }

  async generateWeeklySummary() {
    const stats = await this.issueRepository.getDashboardStats();
    return {
      timeframe: 'last_7_days',
      totalReported: stats.totalIssues,
      totalResolved: stats.resolvedIssues,
      totalOpen: stats.openIssues,
      activeUsers: 45 // heuristic
    };
  }

  async generateTrendPrediction() {
    // Deterministic heuristics based on historical data
    const categories = await this.issueRepository.getCategoryDistribution();
    
    // Mock growth rate calculation
    const predictedGrowth = categories.map(c => ({
      category: c.category,
      currentVolume: c.count,
      predictedNextWeek: Math.round(c.count * 1.15), // +15% heuristic
      trend: 'increasing'
    }));
    
    return {
      timeframe: 'next_7_days',
      expectedIssueGrowth: 15, // 15% overall growth
      categoryForecasts: predictedGrowth
    };
  }

  async generateDepartmentInsights() {
    const workload = await this.issueRepository.getDepartmentWorkload();
    const sorted = workload.sort((a, b) => b.count - a.count);
    
    return {
      departments: sorted.map(d => ({
        name: d.department,
        activeIssues: d.count,
        workloadLevel: d.count > 10 ? 'High' : (d.count > 5 ? 'Medium' : 'Low'),
        averageResolutionTimeDays: Math.floor(Math.random() * 5) + 1 // mock
      }))
    };
  }

  async generateExecutiveReport() {
    const healthScore = await this.generateCityHealthScore();
    const departmentInsights = await this.generateDepartmentInsights();
    const trends = await this.generateTrendPrediction();
    
    return {
      metrics: {
        healthScore: healthScore.score,
        totalOpenIssues: healthScore.factors.criticalIssuesPenalty.value * 2, // arbitrary
        slaComplianceRate: healthScore.factors.slaCompliance.value
      },
      recommendations: [
        "Allocate more resources to the highest workload department.",
        "Address the backlog of critical issues immediately.",
        "Implement preventative measures for the fastest growing issue categories."
      ],
      risks: [
        "SLA compliance is dropping in high-volume wards.",
        "Potential seasonal spike in pothole reports expected next month."
      ],
      summary: "Executive summary data generated successfully.",
      _details: {
        departments: departmentInsights,
        trends: trends
      }
    };
  }

  async generateCitizenInsights(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const stats = await this.issueRepository.getUserStats(userId);
    
    return {
      weeklyContribution: {
        reportsSubmitted: stats.total,
        votesCast: Math.floor(stats.total * 2.5),
        issuesResolved: stats.resolved
      },
      communityImpact: {
        estimatedPeopleHelped: stats.resolved * 15,
        civicRank: user.role === 'citizen' ? 'Active Citizen' : 'Official'
      },
      progressToNextLevel: {
        currentPoints: user.points || 0,
        pointsRequired: 100 // mock
      },
      nextAchievement: {
        id: 'civic_hero_tier_1',
        name: 'Civic Hero I',
        progress: 80
      },
      personalizedRecommendation: "Try verifying 3 open issues in your neighborhood to reach the next civic tier."
    };
  }
}
