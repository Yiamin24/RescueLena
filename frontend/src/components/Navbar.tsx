import { Moon, Sun, AlertCircle, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
}

export function Navbar({ currentPage, onNavigate, theme, onThemeToggle }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'landing', label: 'Home' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'advanced', label: 'Advanced' },
    { id: 'about', label: 'About' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 border-b ${
        theme === 'dark' 
          ? 'bg-black/80 border-red-500/10' 
          : 'bg-white/80 border-red-500/20'
      } backdrop-blur-2xl`}
      style={{
        boxShadow: theme === 'dark' 
          ? '0 4px 30px rgba(255, 59, 48, 0.1)' 
          : '0 4px 30px rgba(0, 0, 0, 0.05)'
      }}
    >
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-3 group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity rounded-full" />
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 p-2 flex items-center justify-center">
                <AlertCircle className="w-full h-full text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div className="hidden sm:block">
              <div className={`text-xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>
                RescueLena
              </div>
            </div>
          </motion.button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate(item.id)}
                className={`relative px-6 py-2 rounded-lg font-medium transition-all ${
                  currentPage === item.id
                    ? 'text-white'
                    : theme === 'dark'
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {currentPage === item.id && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={onThemeToggle}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                theme === 'dark'
                  ? 'bg-white/5 hover:bg-white/10 border border-white/10'
                  : 'bg-black/5 hover:bg-black/10 border border-black/10'
              }`}
            >
              <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 180, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Sun className="w-5 h-5 text-orange-400" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -180, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Moon className="w-5 h-5 text-gray-600" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden w-10 h-10 rounded-lg flex items-center justify-center ${
                theme === 'dark'
                  ? 'bg-white/5 hover:bg-white/10 border border-white/10'
                  : 'bg-black/5 hover:bg-black/10 border border-black/10'
              }`}
            >
              {mobileMenuOpen ? (
                <X className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
              ) : (
                <Menu className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden pb-4"
            >
              <div className="space-y-2 pt-2">
                {navItems.map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full px-4 py-3 rounded-lg text-left font-medium transition-all ${
                      currentPage === item.id
                        ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                        : theme === 'dark'
                        ? 'text-gray-400 hover:bg-white/5'
                        : 'text-gray-600 hover:bg-black/5'
                    }`}
                  >
                    {item.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
