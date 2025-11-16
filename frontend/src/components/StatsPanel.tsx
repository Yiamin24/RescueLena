import { motion } from 'motion/react';
import { Flame, AlertTriangle, Users, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { DashboardStats } from '../lib/types';

interface StatsPanelProps {
  stats: DashboardStats;
}

export function StatsPanel({ stats }: StatsPanelProps) {
  const isDark = document.documentElement.classList.contains('dark');

  const statCards = [
    {
      icon: Flame,
      label: 'Total Incidents',
      value: stats.total_incidents,
      color: '#FF3B30',
      trend: '+12%',
      trendUp: true,
    },
    {
      icon: AlertTriangle,
      label: 'High Urgency',
      value: stats.high_urgency,
      color: '#FF6B00',
      trend: '-8%',
      trendUp: false,
    },
    {
      icon: Users,
      label: 'Active Responders',
      value: stats.active_responders,
      color: '#FF3B30',
      trend: '+24%',
      trendUp: true,
    },
    {
      icon: Clock,
      label: 'Avg Response',
      value: `${stats.avg_response_time}m`,
      color: '#FF6B00',
      trend: '-15%',
      trendUp: true,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {statCards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="relative group"
        >
          {/* Card */}
          <div 
            className="relative p-6 rounded-xl overflow-hidden transition-all"
            style={{
              background: isDark 
                ? 'linear-gradient(135deg, rgba(26, 26, 26, 0.8), rgba(10, 10, 10, 0.8))' 
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(245, 245, 245, 0.9))',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${isDark ? 'rgba(255, 59, 48, 0.2)' : 'rgba(255, 59, 48, 0.3)'}`,
              boxShadow: `0 4px 20px ${card.color}22`,
            }}
          >
            {/* Glow effect on hover */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: `radial-gradient(circle at top right, ${card.color}22, transparent)`,
              }}
            />

            {/* Top gradient line */}
            <div 
              className="absolute top-0 left-0 right-0 h-1"
              style={{
                background: `linear-gradient(90deg, ${card.color}, transparent)`,
              }}
            />

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                {/* Icon */}
                <div 
                  className="p-3 rounded-lg transition-transform group-hover:scale-110"
                  style={{
                    background: `${card.color}22`,
                    border: `1px solid ${card.color}44`,
                    boxShadow: `0 0 20px ${card.color}33`,
                  }}
                >
                  <card.icon className="w-6 h-6" style={{ color: card.color }} />
                </div>
                
                {/* Trend */}
                <div 
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                    card.trendUp 
                      ? 'bg-green-500/20 text-green-500' 
                      : 'bg-red-500/20 text-red-500'
                  }`}
                >
                  {card.trendUp ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {card.trend}
                </div>
              </div>

              {/* Value */}
              <div 
                className="text-4xl font-bold mb-2 transition-all group-hover:scale-105"
                style={{ color: card.color }}
              >
                {card.value}
              </div>

              {/* Label */}
              <div className={`text-sm font-medium ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              } group-hover:text-gray-500 transition-colors`}>
                {card.label}
              </div>
            </div>

            {/* Corner decoration */}
            <div 
              className="absolute bottom-0 right-0 w-24 h-24 opacity-20"
              style={{
                background: `radial-gradient(circle at bottom right, ${card.color}, transparent 70%)`,
              }}
            />

            {/* Animated shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <div 
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(90deg, transparent, ${card.color}22, transparent)`,
                  animation: 'shimmer 2s infinite',
                }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
