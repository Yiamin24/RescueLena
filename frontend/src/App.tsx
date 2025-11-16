import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { AdvancedFeatures } from './components/AdvancedFeatures';
import { AboutPage } from './components/AboutPage';
import { wsService } from './lib/websocket';
import { api } from './lib/api';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [backendConnected, setBackendConnected] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  // Initialize WebSocket and check backend connection
  useEffect(() => {
    const checkBackend = async () => {
      const isHealthy = await api.healthCheck();
      setBackendConnected(isHealthy);
      
      if (isHealthy) {
        console.log('✅ Connected to RescueLena backend');
        
        // Try to connect WebSocket (optional - won't block if fails)
        try {
          wsService.connect();
        } catch (error) {
          console.warn('⚠️ WebSocket connection failed (non-critical):', error);
        }
      } else {
        console.warn('⚠️ Backend not available. Using offline mode.');
      }
    };

    checkBackend();

    return () => {
      try {
        wsService.disconnect();
      } catch (error) {
        // Ignore disconnect errors
      }
    };
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={setCurrentPage} />;
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'advanced':
        return <AdvancedFeatures onNavigate={setCurrentPage} />;
      case 'about':
        return <AboutPage onNavigate={setCurrentPage} />;
      default:
        return <LandingPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-black' : 'bg-white'} transition-colors duration-300`}>
      <Navbar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
        theme={theme}
        onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      />
      {renderPage()}
    </div>
  );
}

export default App;
