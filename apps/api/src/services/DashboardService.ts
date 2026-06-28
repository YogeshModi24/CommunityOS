import { RepositoryFactory } from '@community-os/repositories';

export class DashboardService {
  private get repo() {
    return RepositoryFactory.createIssueRepository({ engine: 'mongo' });
  }

  async getDashboardStats() {
    return this.repo.getDashboardStats();
  }

  async getDepartmentWorkload() {
    return this.repo.getDepartmentWorkload();
  }

  async getSlaOverview() {
    return this.repo.getSlaOverview();
  }

  async getCategoryDistribution() {
    return this.repo.getCategoryDistribution();
  }

  async getCriticalIssueSummary() {
    return this.repo.getCriticalIssueSummary();
  }
}
