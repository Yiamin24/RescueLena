import { motion } from 'motion/react';
import { Target, Zap, Shield, Globe, Mail, Github, Twitter } from 'lucide-react';
import { Button } from './ui/button';

interface AboutPageProps {
  onNavigate: (page: string) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  const mission = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To revolutionize disaster response by harnessing the power of AI, satellite imagery, and real-time social media data to save lives and minimize damage.',
      gradient: 'from-red-500 to-orange-500',
    },
    {
      icon: Zap,
      title: 'Our Vision',
      description: 'A world where disasters are detected instantly, emergency services respond faster, and communities are protected through intelligent, data-driven coordination.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Shield,
      title: 'Our Values',
      description: 'Accuracy, speed, and reliability in emergency response. We prioritize verified information and transparent AI-driven decision-making.',
      gradient: 'from-blue-500 to-cyan-500',
    },
  ];

  const techStack = [
    { name: 'React 18', category: 'Frontend', color: 'text-cyan-400' },
    { name: 'TypeScript', category: 'Language', color: 'text-blue-400' },
    { name: 'TailwindCSS', category: 'Styling', color: 'text-teal-400' },
    { name: 'Motion', category: 'Animations', color: 'text-purple-400' },
    { name: 'Google Gemini', category: 'AI Analysis', color: 'text-red-400' },
    { name: 'Google Earth Engine', category: 'Satellite', color: 'text-green-400' },
    { name: 'Twitter/X API', category: 'Social Media', color: 'text-blue-400' },
    { name: 'Qdrant', category: 'Vector DB', color: 'text-orange-400' },
    { name: 'MapLibre GL JS', category: 'Mapping', color: 'text-indigo-400' },
  ];

  const stats = [
    { label: 'Countries Served', value: '50+', icon: Globe },
    { label: 'Response Rate', value: '98%', icon: Zap },
    { label: 'Incidents Detected', value: '10K+', icon: Target },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl sm:text-6xl mb-6">
            <span className="block bg-gradient-to-r from-red-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              About RescueLena
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            AI-powered disaster response system that combines cutting-edge technology
            with humanitarian mission to protect communities worldwide.
          </p>
        </motion.div>

        {/* Mission Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {mission.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${item.gradient} p-4 mb-6`}>
                <item.icon className="w-full h-full text-white" />
              </div>
              <h3 className="text-2xl text-white mb-4">{item.title}</h3>
              <p className="text-slate-300 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="p-6 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 text-center"
            >
              <stat.icon className="w-10 h-10 mx-auto mb-3 text-red-400" />
              <div className="text-4xl bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-slate-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Technology Stack */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl text-white text-center mb-8">
            Built with Modern Technology
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {techStack.map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
              >
                <div className={`${tech.color} mb-1`}>{tech.name}</div>
                <div className="text-xs text-slate-500">{tech.category}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl text-white text-center mb-8">
            How RescueLena Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Detect', desc: 'AI analyzes images, social media, and satellite data' },
              { step: '2', title: 'Classify', desc: 'Incidents are categorized by type and urgency' },
              { step: '3', title: 'Verify', desc: 'Multiple sources confirm incident authenticity' },
              { step: '4', title: 'Respond', desc: 'Emergency services are notified instantly' },
            ].map((item, index) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white text-2xl flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center p-12 rounded-3xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20"
        >
          <h2 className="text-3xl text-white mb-4">Get In Touch</h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Interested in implementing RescueLena in your region? Have questions or feedback?
            We'd love to hear from you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
              <Mail className="w-4 h-4 mr-2" />
              Email Us
            </Button>
            <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>
            <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
              <Twitter className="w-4 h-4 mr-2" />
              Twitter
            </Button>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <Button
            onClick={() => onNavigate('dashboard')}
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-6 text-lg"
          >
            Launch Dashboard
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
