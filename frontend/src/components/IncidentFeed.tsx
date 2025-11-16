import { motion } from 'motion/react';
import { Incident } from '../lib/types';
import { IncidentCard } from './IncidentCard';
import { Loader2 } from 'lucide-react';

interface IncidentFeedProps {
  incidents: Incident[];
  selectedIncident?: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  loading?: boolean;
}

export function IncidentFeed({ incidents, selectedIncident, onSelectIncident, loading }: IncidentFeedProps) {
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto mb-3" />
          <p className="text-slate-400">Loading incidents...</p>
        </div>
      </div>
    );
  }

  if (incidents.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl text-white mb-2">No Incidents Found</h3>
          <p className="text-slate-400">
            No incidents match your search criteria.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto space-y-3 pr-2">
      {incidents.map((incident, index) => (
        <motion.div
          key={incident.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <IncidentCard
            incident={incident}
            selected={selectedIncident?.id === incident.id}
            onClick={() => onSelectIncident(incident)}
          />
        </motion.div>
      ))}
    </div>
  );
}
