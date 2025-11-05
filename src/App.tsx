import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Auth } from './components/Auth';
import { HomePage } from './components/HomePage';
import { OnboardingFlow } from './components/OnboardingFlow';
import { DashboardView } from './components/DashboardView';
import { AICreator } from './components/AICreator';
import { ContentLibrary } from './components/ContentLibrary';
import { SchedulerView } from './components/SchedulerView';
import { AnalyticsView } from './components/AnalyticsView';
import { SocialAccounts } from './components/SocialAccounts';
import { SettingsView } from './components/SettingsView';
import { OAuthCallback } from './components/OAuthCallback';
import { TwitterOAuthRedirect } from './components/TwitterOAuthRedirect';
import { Button } from './components/ui/button';
import {
  LayoutDashboard,
  Sparkles,
  FileText,
  Calendar,
  BarChart3,
  Share2,
  Settings as SettingsIcon,
  LogOut,
  Loader2
} from 'lucide-react';

type View = 'dashboard' | 'ai-creator' | 'content' | 'scheduler' | 'analytics' | 'social' | 'settings';

function AppContent() {
  const { user, loading, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [showAuth, setShowAuth] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  if (window.location.pathname === '/auth/callback/twitter' || window.location.pathname === '/oauth/twitter/callback') {
    return <TwitterOAuthRedirect />;
  }

  if (window.location.pathname.startsWith('/auth/callback/')) {
    return <OAuthCallback />;
  }

  useEffect(() => {
    if (user) {
      const hasCompletedOnboarding = localStorage.getItem(`onboarding_completed_${user.id}`);
      if (!hasCompletedOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [user]);

  const handleOnboardingComplete = () => {
    if (user) {
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
      setShowOnboarding(false);
    }
  };

  console.log('AppContent render:', { user: user?.email, loading });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    if (showAuth) {
      return <Auth />;
    }
    return <HomePage onGetStarted={() => setShowAuth(true)} />;
  }

  if (showOnboarding) {
    return (
      <OnboardingFlow
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingComplete}
        userId={user?.id}
      />
    );
  }

  const navItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ai-creator' as View, label: 'AI Creator', icon: Sparkles },
    { id: 'content' as View, label: 'Content', icon: FileText },
    { id: 'scheduler' as View, label: 'Scheduler', icon: Calendar },
    { id: 'analytics' as View, label: 'Analytics', icon: BarChart3 },
    { id: 'social' as View, label: 'Social Accounts', icon: Share2 },
    { id: 'settings' as View, label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Social AI</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Automation Suite</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            className="w-full justify-start dark:text-gray-300 dark:hover:bg-gray-700"
            onClick={() => signOut()}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign out
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'ai-creator' && <AICreator />}
        {currentView === 'content' && <ContentLibrary />}
        {currentView === 'scheduler' && <SchedulerView />}
        {currentView === 'analytics' && <AnalyticsView />}
        {currentView === 'social' && <SocialAccounts />}
        {currentView === 'settings' && <SettingsView />}
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
