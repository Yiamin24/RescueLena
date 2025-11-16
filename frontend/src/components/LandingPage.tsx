import { motion, useScroll, useTransform } from 'motion/react';
import { Rocket, Satellite, Smartphone, Brain, Zap, Globe, ArrowRight, Sparkles, Shield, TrendingUp, Users, Clock } from 'lucide-react';
import { Button } from './ui/button';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Detection',
      description: 'Advanced Google Gemini AI analyzes images, text, and patterns to detect disasters instantly',
      gradient: 'from-red-500 via-orange-500 to-red-600',
      delay: 0,
    },
    {
      icon: Satellite,
      title: 'Satellite Monitoring',
      description: 'Real-time Earth observation through Google Earth Engine for comprehensive coverage',
      gradient: 'from-purple-500 via-pink-500 to-purple-600',
      delay: 0.1,
    },
    {
      icon: Smartphone,
      title: 'Social Intelligence',
      description: 'Monitor Twitter/X and social platforms for real-time disaster reports and alerts',
      gradient: 'from-blue-500 via-cyan-500 to-blue-600',
      delay: 0.2,
    },
    {
      icon: Zap,
      title: 'Instant Response',
      description: 'Lightning-fast coordination with emergency services and automated notifications',
      gradient: 'from-green-500 via-emerald-500 to-green-600',
      delay: 0.3,
    },
  ];

  const stats = [
    { value: '10K+', label: 'Incidents Detected', icon: Globe, color: 'from-red-500 to-orange-500' },
    { value: '98%', label: 'Response Rate', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
    { value: '50+', label: 'Countries Served', icon: Users, color: 'from-blue-500 to-cyan-500' },
    { value: '<3m', label: 'Avg Response Time', icon: Clock, color: 'from-purple-500 to-pink-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden pt-20">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -right-1/2 w-[1000px] h-[1000px] bg-gradient-to-br from-red-500/10 via-orange-500/10 to-transparent rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -left-1/2 w-[1000px] h-[1000px] bg-gradient-to-tr from-purple-500/10 via-pink-500/10 to-transparent rounded-full blur-3xl"
        />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ y, opacity }}
            className="space-y-8"
          >
            {/* Floating Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-red-500/10 via-orange-500/10 to-red-500/10 border border-red-500/20 backdrop-blur-xl"
            >
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-red-300">Next-Gen Emergency Response Platform</span>
              <Sparkles className="w-4 h-4 text-red-400" />
            </motion.div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-6xl sm:text-7xl lg:text-8xl leading-tight">
                <motion.span 
                  className="block bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Save Lives with
                </motion.span>
                <motion.span 
                  className="block mt-2 bg-gradient-to-r from-red-400 via-orange-400 to-red-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-[shimmer_3s_linear_infinite]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  AI Intelligence
                </motion.span>
              </h1>

              <motion.p 
                className="text-xl sm:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                Harness cutting-edge AI, satellite imagery, and social media intelligence to detect disasters faster and coordinate emergency responses better
              </motion.p>
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
            >
              <Button
                onClick={() => onNavigate('dashboard')}
                className="group relative px-8 py-6 text-lg overflow-hidden bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-2xl shadow-2xl shadow-red-500/30 hover:shadow-red-500/50 transition-all hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Launch Dashboard
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
              
              <Button
                onClick={() => onNavigate('about')}
                className="px-8 py-6 text-lg bg-white/5 hover:bg-white/10 text-white rounded-2xl backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all hover:scale-105"
              >
                Learn More
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="flex flex-wrap justify-center gap-6 pt-12"
            >
              {[
                { icon: Shield, text: 'Enterprise Grade' },
                { icon: Zap, text: 'Real-Time Processing' },
                { icon: Users, text: 'Trusted Globally' },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-slate-400">
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm">{item.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl sm:text-6xl mb-6">
              <span className="bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent">
                Powered by Innovation
              </span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Advanced technology stack working together to revolutionize disaster response
            </p>
          </motion.div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: feature.delay }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="group relative"
              >
                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500 rounded-3xl`} />
                
                {/* Card */}
                <div className="relative p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 group-hover:border-white/20 transition-all h-full">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} p-4 mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-full h-full text-white" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-2xl text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text" style={{
                    backgroundImage: `linear-gradient(135deg, ${feature.gradient.split(' ').slice(1).join(' ')})`
                  }}>
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Corner Accent */}
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${feature.gradient} opacity-10 blur-2xl rounded-full`} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group relative"
              >
                {/* Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-30 blur-2xl transition-all duration-500`} />
                
                {/* Card */}
                <div className="relative p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 group-hover:border-white/20 transition-all text-center">
                  <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${stat.color} p-3 shadow-lg`}>
                    <stat.icon className="w-full h-full text-white" />
                  </div>
                  <div className={`text-5xl mb-3 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                  <div className="text-slate-400">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden"
          >
            {/* Animated Background */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-500/20 blur-3xl animate-pulse" />
            </div>

            {/* Content */}
            <div className="relative p-12 sm:p-16 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-red-500/20 text-center space-y-6">
              <h2 className="text-4xl sm:text-5xl text-white">
                Ready to Save Lives?
              </h2>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Join emergency responders and disaster management agencies worldwide using RescueLena for faster, smarter disaster response
              </p>
              <Button
                onClick={() => onNavigate('dashboard')}
                className="group px-10 py-6 text-lg bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-2xl shadow-2xl shadow-red-500/30 hover:shadow-red-500/50 transition-all hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  Get Started Now
                  <Rocket className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </span>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
