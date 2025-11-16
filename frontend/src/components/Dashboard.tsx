import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Activity, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { StatsPanel } from './StatsPanel';
import { SearchAndFilter, FilterState } from './SearchAndFilter';
import { MapLibreMap } from './MapLibreMap';
import { IncidentCard } from './IncidentCard';
import { UploadZone } from './UploadZone';
import { FloatingChatbot } from './FloatingChatbot';
import { Incident, DashboardStats } from '../lib/types';
import { api } from '../lib/api';
import { wsService } from '../lib/websocket';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_incidents: 0,
    high_urgency: 0,
    active_responders: 0,
    avg_response_time: 0,
  });
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({});

  useEffect(() => {
    loadDashboard();

    // Listen for upload events
    const handleUpload = () => {
      loadDashboard();
    };
    window.addEventListener('incident-uploaded', handleUpload);

    // Listen for real-time updates
    const handleNewIncident = (incident: Incident) => {
      setIncidents(prev => {
        const updated = [incident, ...prev];
        updateStats(updated);
        return updated;
      });
      setFilteredIncidents(prev => [incident, ...prev]);
    };

    const handleIncidentUpdated = (incident: any) => {
      // If incident is archived, remove it from the list
      if (incident.archived) {
        setIncidents(prev => prev.filter(i => i.id !== incident.id));
        setFilteredIncidents(prev => prev.filter(i => i.id !== incident.id));
      } else {
        setIncidents(prev => prev.map(i => i.id === incident.id ? incident : i));
        setFilteredIncidents(prev => prev.map(i => i.id === incident.id ? incident : i));
      }
    };

    const handleIncidentVerified = (data: { id: string }) => {
      setIncidents(prev => prev.map(i => 
        i.id === data.id ? { ...i, verified: true } : i
      ));
      setFilteredIncidents(prev => prev.map(i => 
        i.id === data.id ? { ...i, verified: true } : i
      ));
    };

    wsService.on('new_incident', handleNewIncident);
    wsService.on('incident_updated', handleIncidentUpdated);
    wsService.on('incident_verified', handleIncidentVerified);

    return () => {
      window.removeEventListener('incident-uploaded', handleUpload);
      wsService.off('new_incident', handleNewIncident);
      wsService.off('incident_updated', handleIncidentUpdated);
      wsService.off('incident_verified', handleIncidentVerified);
    };
  }, []); // Remove incidents dependency to prevent infinite loop

  const updateStats = (incidentList: Incident[]) => {
    setStats({
      total_incidents: incidentList.length,
      high_urgency: incidentList.filter(i => i.urgency === 'high').length,
      active_responders: Math.floor(incidentList.length * 0.3),
      avg_response_time: 12,
    });
  };

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboard();
      setIncidents(data.incidents);
      setFilteredIncidents(data.incidents);
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(query, filters);
  };

  const handleFilter = (newFilters: FilterState) => {
    setFilters(newFilters);
    applyFilters(searchQuery, newFilters);
  };

  const applyFilters = (query: string, activeFilters: FilterState) => {
    let filtered = [...incidents];

    if (query.trim()) {
      filtered = filtered.filter(incident =>
        incident.description.toLowerCase().includes(query.toLowerCase()) ||
        incident.location.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (activeFilters.type) {
      filtered = filtered.filter(incident => incident.type === activeFilters.type);
    }

    if (activeFilters.urgency) {
      filtered = filtered.filter(incident => incident.urgency === activeFilters.urgency);
    }

    if (activeFilters.verified !== undefined && activeFilters.verified !== null) {
      filtered = filtered.filter(incident => incident.verified === activeFilters.verified);
    }

    setFilteredIncidents(filtered);
  };

  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className={`min-h-screen pt-16 ${isDark ? 'bg-black' : 'bg-white'} tech-grid`}>
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
        >
          <div>
            <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
              <span className="text-gradient-red">Emergency</span> Command Center
            </h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-ping absolute" />
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                </div>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Live Monitoring Active
                </span>
              </div>
              <div className="h-4 w-px bg-red-500/30" />
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-red-500" />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {filteredIncidents.length} Active Incidents
                </span>
              </div>
            </div>
          </div>
          
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`${
              isDark ? 'bg-white/5 hover:bg-white/10 border-white/10' : 'bg-black/5 hover:bg-black/10 border-black/10'
            } border px-6 py-3 rounded-lg font-medium transition-all`}
            style={{ color: isDark ? 'white' : 'black' }}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </motion.div>

        {/* Stats Panel */}
        <StatsPanel stats={stats} />

        {/* Search and Filter */}
        <SearchAndFilter onSearch={handleSearch} onFilter={handleFilter} />

        {/* Main Content: Map + Incidents Side by Side */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Map - 70% width on large screens */}
          <div className="lg:col-span-8 order-2 lg:order-1">
            <div className="h-[500px] lg:h-[800px] rounded-xl overflow-hidden border scan-line" style={{
              borderColor: isDark ? 'rgba(255, 59, 48, 0.2)' : 'rgba(255, 59, 48, 0.3)',
              backgroundColor: isDark ? '#0a0a0a' : '#f5f5f5'
            }}>
              <MapLibreMap
                incidents={filteredIncidents}
                onIncidentClick={setSelectedIncident}
              />
            </div>
          </div>

          {/* Incidents Feed - 30% width on large screens */}
          <div className="lg:col-span-4 order-1 lg:order-2">
            <div className={`h-[500px] lg:h-[800px] rounded-xl border overflow-hidden glass-effect`}
              style={{
                borderColor: isDark ? 'rgba(255, 59, 48, 0.2)' : 'rgba(255, 59, 48, 0.3)',
              }}
            >
              {/* Header */}
              <div className={`p-6 border-b`} style={{
                borderColor: isDark ? 'rgba(255, 59, 48, 0.1)' : 'rgba(255, 59, 48, 0.2)',
              }}>
                <div className="flex items-center justify-between mb-2">
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                    Live Incidents
                  </h2>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-red-500 to-orange-500">
                    <TrendingUp className="w-3 h-3 text-white" />
                    <span className="text-xs font-bold text-white">{filteredIncidents.length}</span>
                  </div>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Real-time emergency reports
                </p>
              </div>

              {/* Incidents List */}
              <div className="h-[calc(100%-100px)] overflow-y-auto p-4 space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <RefreshCw className="w-8 h-8 text-red-500 animate-spin mx-auto mb-2" />
                      <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading incidents...</p>
                    </div>
                  </div>
                ) : filteredIncidents.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                      <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No incidents found</p>
                    </div>
                  </div>
                ) : (
                  filteredIncidents.map((incident, index) => (
                    <motion.div
                      key={incident.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <IncidentCard
                        incident={incident}
                        onClick={() => setSelectedIncident(incident)}
                        selected={selectedIncident?.id === incident.id}
                        onUpdate={loadDashboard}
                      />
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Upload Zone */}
        <UploadZone />

        {/* Advanced Features Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => onNavigate('advanced')}
          className={`w-full p-8 rounded-xl border-2 transition-all relative overflow-hidden group`}
          style={{
            borderColor: isDark ? 'rgba(255, 59, 48, 0.3)' : 'rgba(255, 59, 48, 0.4)',
            background: isDark 
              ? 'linear-gradient(135deg, rgba(255, 59, 48, 0.1), rgba(255, 107, 0, 0.1))' 
              : 'linear-gradient(135deg, rgba(255, 59, 48, 0.05), rgba(255, 107, 0, 0.05))'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          <div className="relative flex items-center justify-center gap-4">
            <Activity className="w-6 h-6 text-red-500" />
            <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
              Access Advanced Features: AI Analysis & Satellite Monitoring
            </span>
            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold">
              PRO
            </div>
          </div>
        </motion.button>

        <FloatingChatbot />
      </div>
    </div>
  );
}