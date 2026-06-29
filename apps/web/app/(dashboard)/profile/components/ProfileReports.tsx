import { Filter, Search } from 'lucide-react';
import Link from 'next/link';

import { CategoryBadge,StatusBadge } from '@/components/ui/primitives';

export function ProfileReports({ profile }: { profile: any }) {
  // Real implementation would fetch paginated history using a custom hook or api call
  // For now we assume profile.recentActivity or an empty array
  const reports = profile.recentActivity || [];

  return (
    <div className="card p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-xl font-display font-semibold text-white">Report History</h3>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input 
              type="text" 
              placeholder="Search reports..." 
              className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <button className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
            <Filter className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="py-12 text-center text-text-tertiary">
          <p>No reports found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-white/10 text-text-secondary">
                <th className="pb-3 font-medium">Issue</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {reports.map((report: any) => (
                <tr key={report.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 font-medium text-white max-w-[200px] truncate">
                    <Link href={`/issue/${report.id}`} className="hover:text-primary transition-colors">
                      {report.title}
                    </Link>
                  </td>
                  <td className="py-4">
                    <CategoryBadge category={report.category} />
                  </td>
                  <td className="py-4">
                    <StatusBadge status={report.status} />
                  </td>
                  <td className="py-4 text-text-secondary">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
