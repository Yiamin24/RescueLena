import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Twitter, Satellite, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { SocialMediaPanel } from './SocialMediaPanel';
import { SatellitePanel } from './SatellitePanel';

interface AdvancedFeaturesProps {
  onNavigate: (page: string) => void;
}

export function AdvancedFeatures({ onNavigate }: AdvancedFeaturesProps) {
  const [activeTab, setActiveTab] = useState<'social' | 'satellite'>('social');

  const features = [
    {
      title: 'Social Media Capabilities',
      icon: Twitter,
      items: [
        'Real-time Twitter/X monitoring',
        'Auto-detect disaster mentions',
        'Extract location from posts',
        'Urgency classification',
        'Confidence scoring',
      ],
    },
    {
      title: 'Satellite Capabilities',
      icon: Satellite,
      items: [
        'Fire detection (thermal imaging)',
        'Flood monitoring (water extent)',
        'Building damage assessment',
        'Vegetation loss tracking',
        'Multi-source data fusion',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            onClick={() => onNavigate('dashboard')}
            className="mb-4 bg-white/5 hover:bg-white/10 text-white border border-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl mb-2">
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Advanced Features
                </span>
              </h1>
              <p className="text-slate-400">
                Social media monitoring and satellite analysis powered by AI
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-300">System Active</span>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/10 inline-flex">
            <button
              onClick={() => setActiveTab('social')}
              className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all ${
                activeTab === 'social'
                  ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white border border-blue-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Twitter className="w-4 h-4" />
              Social Media Monitor
            </button>
            <button
              onClick={() => setActiveTab('satellite')}
              className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all ${
                activeTab === 'satellite'
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Satellite className="w-4 h-4" />
              Satellite Analysis
            </button>
          </div>
        </motion.div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              {activeTab === 'social' ? <SocialMediaPanel /> : <SatellitePanel />}
            </div>
          </motion.div>

          {/* Feature Info Cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="p-5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg ${
                    index === 0 
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
                      : 'bg-gradient-to-br from-purple-500 to-pink-500'
                    } p-2 flex items-center justify-center`}>
                    <feature.icon className="w-full h-full text-white" />
                  </div>
                  <h3 className="text-white">{feature.title}</h3>
                </div>
                <ul className="space-y-2">
                  {feature.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Tech Stack */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30">
              <h3 className="text-white mb-3">Powered By</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <div>🤖 Google Gemini AI</div>
                <div>🛰️ Google Earth Engine</div>
                <div>🐦 Twitter/X API</div>
                <div>🔍 Qdrant Vector DB</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
