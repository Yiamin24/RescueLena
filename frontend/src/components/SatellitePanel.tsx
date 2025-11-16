import { useState } from 'react';
import { motion } from 'motion/react';
import { Satellite, MapPin, Loader2, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { api } from '../lib/api';
import { SatelliteAnalysis } from '../lib/types';

export function SatellitePanel() {
  const [latitude, setLatitude] = useState('25.2048');
  const [longitude, setLongitude] = useState('55.2708');
  const [radius, setRadius] = useState(10);
  const [analysisType, setAnalysisType] = useState('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SatelliteAnalysis | null>(null);

  const presetLocations = [
    { name: 'Dubai Downtown', lat: '25.2048', lng: '55.2708' },
    { name: 'Abu Dhabi', lat: '24.4539', lng: '54.3773' },
    { name: 'Sharjah', lat: '25.3463', lng: '55.4209' },
  ];

  const analysisTypes = [
    { value: 'all', label: 'All (Fire, Flood, Damage)' },
    { value: 'fire', label: 'Fire Detection' },
    { value: 'flood', label: 'Flood Detection' },
    { value: 'damage', label: 'Building Damage' },
  ];

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setResult(null);

    try {
      const analysis = await api.analyzeSatellite(
        parseFloat(latitude),
        parseFloat(longitude),
        radius,
        analysisType
      );
      setResult(analysis);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-2.5 flex items-center justify-center">
          <Satellite className="w-full h-full text-white" />
        </div>
        <div>
          <h2 className="text-xl text-white">Satellite Analysis</h2>
          <p className="text-sm text-slate-400">Analyze areas using Google Earth Engine</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
        <div className="flex items-start gap-3">
          <Satellite className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-purple-300">
              Powered by Google Earth Engine. Analyzes satellite imagery for fires, floods, and structural damage.
            </p>
          </div>
        </div>
      </div>

      {/* Preset Locations */}
      <div>
        <label className="text-sm text-slate-400 mb-2 block">Quick locations:</label>
        <div className="flex flex-wrap gap-2">
          {presetLocations.map((location) => (
            <Badge
              key={location.name}
              onClick={() => {
                setLatitude(location.lat);
                setLongitude(location.lng);
              }}
              className="cursor-pointer bg-white/5 hover:bg-white/10 text-slate-300 px-3 py-2 text-xs border border-white/10"
            >
              <MapPin className="w-3 h-3 mr-1" />
              {location.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Coordinates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-slate-400 mb-2 block">Latitude</label>
          <Input
            type="number"
            step="0.0001"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="25.2048"
            className="bg-white/5 border-white/10 text-white"
          />
        </div>
        <div>
          <label className="text-sm text-slate-400 mb-2 block">Longitude</label>
          <Input
            type="number"
            step="0.0001"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="55.2708"
            className="bg-white/5 border-white/10 text-white"
          />
        </div>
      </div>

      {/* Radius Slider */}
      <div>
        <label className="text-sm text-slate-400 mb-2 block">
          Analysis Radius: {radius} km
        </label>
        <input
          type="range"
          min="1"
          max="50"
          value={radius}
          onChange={(e) => setRadius(parseInt(e.target.value))}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #9333EA ${(radius / 50) * 100}%, rgba(255,255,255,0.1) ${(radius / 50) * 100}%)`,
          }}
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>1 km</span>
          <span>50 km</span>
        </div>
      </div>

      {/* Analysis Type */}
      <div>
        <label className="text-sm text-slate-400 mb-2 block">Analysis Type</label>
        <div className="grid grid-cols-2 gap-2">
          {analysisTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setAnalysisType(type.value)}
              className={`p-3 rounded-lg text-sm transition-all ${
                analysisType === type.value
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border-2 border-purple-500'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border-2 border-transparent'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Analyze Button */}
      <Button
        onClick={handleAnalyze}
        disabled={isAnalyzing}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analyzing Satellite Data...
          </>
        ) : (
          <>
            <Satellite className="w-4 h-4 mr-2" />
            Analyze Area
          </>
        )}
      </Button>

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 space-y-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg text-white">Analysis Complete</h3>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-2">Analysis Date</label>
            <div className="text-white">
              {result.analysis_date ? new Date(result.analysis_date).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short'
              }) : 'Just now'}
            </div>
          </div>

          {result.detected_changes && result.detected_changes.length > 0 && (
            <div>
              <label className="text-xs text-slate-400 block mb-2">Detected Changes</label>
              <div className="space-y-2">
                {result.detected_changes.map((change, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-white">
                    <span className="text-purple-400">•</span>
                    <span>{change}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-xs text-slate-400 block mb-2">Risk Assessment</label>
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30">
              <p className="text-sm text-red-300">{result.risk_assessment}</p>
            </div>
          </div>

          {result.sources && result.sources.length > 0 && (
            <div>
              <label className="text-xs text-slate-400 block mb-2">Data Sources</label>
              <div className="flex flex-wrap gap-2">
                {result.sources.map((source) => (
                  <Badge key={source} className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    {source}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
