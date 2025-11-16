import { useState } from 'react';
import { motion } from 'motion/react';
import { Twitter, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { api } from '../lib/api';
import { SocialMediaAnalysis } from '../lib/types';

export function SocialMediaPanel() {
  const [postText, setPostText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SocialMediaAnalysis | null>(null);

  const examplePosts = [
    '🔥 URGENT: Massive fire at downtown shopping mall, people are evacuating! #Emergency',
    '🌊 Severe flooding in the residential area, water levels rising fast! Need help!',
    '⚠️ Building collapse on Main Street! Emergency services on scene #Disaster',
  ];

  const handleAnalyze = async () => {
    if (!postText.trim()) return;

    setIsAnalyzing(true);
    setResult(null);

    try {
      const analysis = await api.analyzeSocialMedia(postText);
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
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5 flex items-center justify-center">
          <Twitter className="w-full h-full text-white" />
        </div>
        <div>
          <h2 className="text-xl text-white">Social Media Monitor</h2>
          <p className="text-sm text-slate-400">Analyze disaster-related posts from Twitter/X</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-300">
              Real-time monitoring is active. The system automatically scans Twitter/X for disaster-related posts.
            </p>
          </div>
        </div>
      </div>

      {/* Example Posts */}
      <div>
        <label className="text-sm text-slate-400 mb-2 block">Try an example:</label>
        <div className="flex flex-wrap gap-2">
          {examplePosts.map((example, index) => (
            <Badge
              key={index}
              onClick={() => setPostText(example)}
              className="cursor-pointer bg-white/5 hover:bg-white/10 text-slate-300 px-3 py-2 text-xs border border-white/10"
            >
              Example {index + 1}
            </Badge>
          ))}
        </div>
      </div>

      {/* Input */}
      <div>
        <label className="text-sm text-slate-400 mb-2 block">Paste a disaster-related post:</label>
        <Textarea
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          placeholder="Example: 🔥 Major fire at downtown building! Emergency services needed..."
          rows={6}
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-400 resize-none"
        />
      </div>

      {/* Analyze Button */}
      <Button
        onClick={handleAnalyze}
        disabled={!postText.trim() || isAnalyzing}
        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
      >
        {isAnalyzing ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="mr-2"
            >
              <Send className="w-4 h-4" />
            </motion.div>
            Analyzing...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Analyze Post
          </>
        )}
      </Button>

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 space-y-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <h3 className="text-lg text-white">Incident Created Successfully!</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Incident Type</label>
              <div className="text-white capitalize">{result.incident_type.replace('_', ' ')}</div>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Urgency Level</label>
              <Badge
                className={`${
                  result.urgency === 'high'
                    ? 'bg-red-500/20 text-red-400 border-red-500/30'
                    : result.urgency === 'medium'
                    ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                    : 'bg-green-500/20 text-green-400 border-green-500/30'
                } capitalize`}
              >
                {result.urgency}
              </Badge>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Location</label>
              <div className="text-white">{result.location}</div>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Confidence</label>
              <div className="text-white">{Math.round(result.confidence * 100)}%</div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <p className="text-sm text-green-300">
              ✓ Incident has been added to the dashboard and emergency services have been notified.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
