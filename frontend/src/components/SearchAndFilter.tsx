import { Search, Filter, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface SearchAndFilterProps {
  onSearch: (query: string) => void;
  onFilter: (filters: FilterState) => void;
}

export interface FilterState {
  type?: string;
  urgency?: string;
  verified?: boolean | null;
}

export function SearchAndFilter({ onSearch, onFilter }: SearchAndFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>({});

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const toggleFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...activeFilters };
    if (newFilters[key] === value) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    setActiveFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    setActiveFilters({});
    onFilter({});
  };

  const filterCount = Object.keys(activeFilters).length;

  const incidentTypes = [
    { value: 'fire', label: 'Fire', emoji: '🔥', color: 'from-red-500 to-orange-500' },
    { value: 'flood', label: 'Flood', emoji: '🌊', color: 'from-blue-500 to-cyan-500' },
    { value: 'medical', label: 'Medical', emoji: '🚑', color: 'from-green-500 to-emerald-500' },
    { value: 'earthquake', label: 'Earthquake', emoji: '🌍', color: 'from-purple-500 to-pink-500' },
  ];

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
          <Input
            type="text"
            placeholder="Search incidents by description, location..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-12 pr-4 py-6 bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 rounded-xl backdrop-blur-xl transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg transition-all"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>

        {/* Filter Button */}
        <Button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-6 py-6 bg-white/5 hover:bg-white/10 text-white border rounded-xl backdrop-blur-xl transition-all ${
            filterCount > 0 
              ? 'border-purple-500/50 bg-gradient-to-r from-purple-500/10 to-pink-500/10' 
              : 'border-white/10 hover:border-white/20'
          }`}
        >
          <Filter className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline">Filters</span>
          {filterCount > 0 && (
            <Badge className="ml-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 text-xs shadow-lg">
              {filterCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-6 relative overflow-hidden group">
              {/* Background Glow */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-1000" />
              
              <div className="relative z-10 space-y-6">
                {/* Type Filter */}
                <div>
                  <label className="flex items-center gap-2 text-sm text-slate-300 mb-3">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Incident Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {incidentTypes.map((type) => (
                      <motion.button
                        key={type.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleFilter('type', type.value)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          activeFilters.type === type.value
                            ? `bg-gradient-to-br ${type.color} border-transparent text-white shadow-lg`
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="text-2xl mb-2">{type.emoji}</div>
                        <div className="text-sm">{type.label}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Urgency Filter */}
                <div>
                  <label className="flex items-center gap-2 text-sm text-slate-300 mb-3">
                    <Sparkles className="w-4 h-4 text-red-400" />
                    Urgency Level
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { value: 'high', label: 'High', color: 'from-red-500 to-orange-500', bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400' },
                      { value: 'medium', label: 'Medium', color: 'from-orange-500 to-amber-500', bg: 'bg-orange-500/20', border: 'border-orange-500/30', text: 'text-orange-400' },
                      { value: 'low', label: 'Low', color: 'from-green-500 to-emerald-500', bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'text-green-400' },
                    ].map((urgency) => (
                      <motion.button
                        key={urgency.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleFilter('urgency', urgency.value)}
                        className={`px-6 py-3 rounded-xl border-2 transition-all ${
                          activeFilters.urgency === urgency.value
                            ? `bg-gradient-to-r ${urgency.color} border-transparent text-white shadow-lg`
                            : `${urgency.bg} ${urgency.border} ${urgency.text} hover:scale-105`
                        }`}
                      >
                        {urgency.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Verified Filter */}
                <div>
                  <label className="flex items-center gap-2 text-sm text-slate-300 mb-3">
                    <Sparkles className="w-4 h-4 text-green-400" />
                    Verification Status
                  </label>
                  <div className="flex flex-wrap gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleFilter('verified', true)}
                      className={`px-6 py-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                        activeFilters.verified === true
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-transparent text-white shadow-lg'
                          : 'bg-green-500/10 border-green-500/30 text-green-400 hover:scale-105'
                      }`}
                    >
                      <span className="text-lg">✓</span>
                      Verified
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleFilter('verified', false)}
                      className={`px-6 py-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                        activeFilters.verified === false
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 border-transparent text-white shadow-lg'
                          : 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:scale-105'
                      }`}
                    >
                      <span className="text-lg">⚠</span>
                      Unverified
                    </motion.button>
                  </div>
                </div>

                {/* Clear Button */}
                {filterCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Button
                      onClick={clearFilters}
                      className="w-full py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 rounded-xl backdrop-blur-xl transition-all"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear All Filters ({filterCount})
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
