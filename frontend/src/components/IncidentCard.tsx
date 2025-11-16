import { motion } from 'motion/react';
import { MapPin, Clock, Target, CheckCircle, AlertTriangle, Users, Zap, Check } from 'lucide-react';
import { Incident, IncidentStatus } from '../lib/types';
import { getRelativeTime, getUrgencyColor, api } from '../lib/api';
import { incidentTypeEmojis, incidentTypeLabels } from '../lib/mockData';
import { useState } from 'react';

interface IncidentCardProps {
  incident: Incident;
  onClick?: () => void;
  selected?: boolean;
  onUpdate?: () => void;
}

export function IncidentCard({ incident, onClick, selected, onUpdate }: IncidentCardProps) {
  const urgencyColor = getUrgencyColor(incident.urgency);
  const emoji = incidentTypeEmojis[incident.type] || '⚠️';
  const label = incidentTypeLabels[incident.type] || 'Other';
  const isDark = document.documentElement.classList.contains('dark');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleResolve = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setIsUpdating(true);
    
    try {
      // Mark as resolved and verified in one go
      await api.updateStatus(incident.id, 'resolved');
      await api.verifyIncident(incident.id);
      
      console.log('✅ Incident resolved and archived:', incident.id);
      
      // Reload dashboard to remove incident
      onUpdate?.();
    } catch (error) {
      console.error('Failed to resolve incident:', error);
      alert('Failed to resolve incident. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative cursor-pointer rounded-xl overflow-hidden transition-all ${
        selected ? 'ring-2 ring-red-500' : ''
      }`}
      style={{
        background: isDark 
          ? selected 
            ? 'linear-gradient(135deg, rgba(255, 59, 48, 0.15), rgba(255, 107, 0, 0.15))' 
            : 'rgba(26, 26, 26, 0.8)'
          : selected
            ? 'linear-gradient(135deg, rgba(255, 59, 48, 0.08), rgba(255, 107, 0, 0.08))'
            : 'rgba(245, 245, 245, 0.8)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${
          selected 
            ? urgencyColor 
            : isDark ? 'rgba(255, 59, 48, 0.1)' : 'rgba(255, 59, 48, 0.2)'
        }`,
        borderLeft: `4px solid ${urgencyColor}`,
      }}
    >
      {/* Scan line effect for selected */}
      {selected && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse" />
      )}

      <div className="p-4">
        {/* Image Preview */}
        {incident.image_url && !incident.image_url.startsWith('local://') && (
          <div className="mb-3 -mx-4 -mt-4">
            <img 
              src={incident.image_url} 
              alt={incident.type}
              className="w-full h-48 object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          {/* Icon */}
          <motion.div 
            whileHover={{ rotate: 5, scale: 1.1 }}
            className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-xl"
            style={{
              background: `linear-gradient(135deg, ${urgencyColor}22, ${urgencyColor}44)`,
              border: `1px solid ${urgencyColor}66`,
            }}
          >
            {emoji}
          </motion.div>

          {/* Title and Badges */}
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold mb-2 truncate ${isDark ? 'text-white' : 'text-black'}`}>
              {label}
            </h3>
            
            <div className="flex flex-wrap gap-2">
              {/* Urgency Badge */}
              <div 
                className="px-2 py-1 rounded text-xs font-bold text-white"
                style={{
                  background: urgencyColor,
                  boxShadow: `0 0 10px ${urgencyColor}66`
                }}
              >
                {incident.urgency.toUpperCase()}
              </div>

              {/* Status Badge */}
              {incident.status && (
                <div 
                  className="px-2 py-1 rounded text-xs font-bold text-white flex items-center gap-1"
                  style={{
                    background: incident.status === 'resolved' 
                      ? 'linear-gradient(135deg, #10b981, #059669)'
                      : incident.status === 'in_progress'
                      ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                      : incident.status === 'false_alarm'
                      ? 'linear-gradient(135deg, #6b7280, #4b5563)'
                      : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    boxShadow: '0 0 8px rgba(0,0,0,0.2)'
                  }}
                >
                  {incident.status === 'resolved' && '✅'}
                  {incident.status === 'in_progress' && '🚨'}
                  {incident.status === 'false_alarm' && '❌'}
                  {incident.status === 'pending' && '⏳'}
                  {incident.status.replace('_', ' ').toUpperCase()}
                </div>
              )}

              {/* Verified Badge */}
              {incident.verified ? (
                <div 
                  className="px-2 py-1 rounded text-xs font-bold text-white flex items-center gap-1"
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    boxShadow: '0 0 10px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <CheckCircle className="w-3 h-3" />
                  VERIFIED
                </div>
              ) : (
                <div 
                  className="px-2 py-1 rounded text-xs font-bold text-white flex items-center gap-1"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    boxShadow: '0 0 10px rgba(245, 158, 11, 0.3)'
                  }}
                >
                  <AlertTriangle className="w-3 h-3" />
                  UNVERIFIED
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className={`text-sm mb-3 line-clamp-2 leading-relaxed ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {incident.description}
        </p>

        {/* Meta Information Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div 
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{
              background: isDark ? 'rgba(255, 59, 48, 0.05)' : 'rgba(255, 59, 48, 0.03)',
              border: `1px solid ${isDark ? 'rgba(255, 59, 48, 0.1)' : 'rgba(255, 59, 48, 0.15)'}`,
            }}
          >
            <MapPin className="w-4 h-4 text-red-500" />
            <span className={`text-xs truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {incident.location}
            </span>
          </div>

          <div 
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{
              background: isDark ? 'rgba(255, 59, 48, 0.05)' : 'rgba(255, 59, 48, 0.03)',
              border: `1px solid ${isDark ? 'rgba(255, 59, 48, 0.1)' : 'rgba(255, 59, 48, 0.15)'}`,
            }}
          >
            <Clock className="w-4 h-4 text-orange-500" />
            <span className={`text-xs truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {getRelativeTime(incident.timestamp)}
            </span>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex items-center justify-between">
          {/* Confidence */}
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-green-500" />
            <span className={`text-xs font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {Math.round(incident.confidence * 100)}% Confidence
            </span>
          </div>

          {/* AI Badge */}
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Zap className="w-3 h-3" />
            <span className="text-xs font-bold">AI</span>
          </div>
        </div>

        {/* People Affected */}
        {incident.people_affected && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 pt-3"
            style={{
              borderTop: `1px solid ${isDark ? 'rgba(255, 59, 48, 0.1)' : 'rgba(255, 59, 48, 0.15)'}`
            }}
          >
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30">
              <Users className="w-4 h-4 text-red-500" />
              <span className="text-xs font-bold text-red-500">
                {incident.people_affected.toLocaleString()} People Affected
              </span>
            </div>
          </motion.div>
        )}

        {/* Mark Resolved Button */}
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 pt-3"
          style={{
            borderTop: `1px solid ${isDark ? 'rgba(255, 59, 48, 0.1)' : 'rgba(255, 59, 48, 0.15)'}`
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleResolve}
            onMouseDown={(e) => e.stopPropagation()}
            disabled={isUpdating}
            className="w-full px-4 py-2 rounded-lg text-sm font-bold text-white transition-all flex items-center justify-center gap-2 hover:scale-102 active:scale-98"
            style={{
              background: isUpdating 
                ? 'linear-gradient(135deg, #666, #888)' 
                : 'linear-gradient(135deg, #10b981, #059669)',
              boxShadow: isUpdating ? 'none' : '0 0 15px rgba(16, 185, 129, 0.4)',
              cursor: isUpdating ? 'not-allowed' : 'pointer',
              opacity: isUpdating ? 0.5 : 1,
              pointerEvents: isUpdating ? 'none' : 'auto'
            }}
          >
            <Check className="w-4 h-4" />
            {isUpdating ? 'Resolving...' : 'Mark as Resolved'}
          </button>
        </motion.div>
      </div>

      {/* Animated corner accent */}
      {selected && (
        <>
          <motion.div 
            className="absolute top-0 right-0 w-16 h-16"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            style={{
              background: `radial-gradient(circle at top right, ${urgencyColor}33, transparent)`,
            }}
          />
          <motion.div 
            className="absolute bottom-0 left-0 w-16 h-16"
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            style={{
              background: `radial-gradient(circle at bottom left, ${urgencyColor}33, transparent)`,
            }}
          />
        </>
      )}
    </motion.div>
  );
}
