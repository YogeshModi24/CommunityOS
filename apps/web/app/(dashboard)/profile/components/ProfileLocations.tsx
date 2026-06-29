import { Briefcase, GraduationCap, Home, MapPin, Plus } from 'lucide-react';

const TYPE_ICONS: Record<string, any> = {
  home: Home,
  office: Briefcase,
  university: GraduationCap,
  custom: MapPin,
};

export function ProfileLocations({ profile }: { profile: any }) {
  const locations = profile.savedLocations || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-display font-semibold text-white">Saved Locations</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary hover:bg-primary/30 transition-colors rounded-lg font-medium text-sm">
          <Plus className="w-4 h-4" /> Add Location
        </button>
      </div>

      {locations.length === 0 ? (
        <div className="card p-12 text-center text-text-tertiary">
          <MapPin className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No saved locations yet.</p>
          <p className="text-sm mt-1">Add locations to quickly report issues in your frequent areas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {locations.map((loc: any, idx: number) => {
            const Icon = TYPE_ICONS[loc.type] || MapPin;
            return (
              <div key={idx} className="card p-5 hover:bg-white/[0.02] transition-colors border-l-4 border-l-primary flex items-start justify-between group">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium capitalize">{loc.type}</h4>
                    <p className="text-sm text-text-secondary mt-1">{loc.address}</p>
                  </div>
                </div>
                <button className="text-text-tertiary hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity">
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
