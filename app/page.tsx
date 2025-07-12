'use client';
import { useState, useEffect } from 'react';
import ProfileCard from './ProfileCard';
import SearchAndLeaderboard from './SearchAndLeaderboard';
import WalletConnect from './components/WalletConnect';
import { saveProfile } from './utils/profileStorage';
import { SecurityManager } from './utils/security';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "MONAD",
    title: "Currently Testnet",
    handle: "monad_xyz",
    status: "Online",
    avatarUrl: "https://docs.monad.xyz/img/monad_logo.png"
  });

  // Clear all saved data on mount - run only once
  useEffect(() => {
    const hasCleared = sessionStorage.getItem('dataCleared');
    if (!hasCleared) {
      try {
        localStorage.removeItem('profileData');
        localStorage.removeItem('profileSearchCounts');
        localStorage.removeItem('userProfiles');
        localStorage.removeItem('savedAvatars');
        localStorage.removeItem('profileSettings');
        sessionStorage.setItem('dataCleared', 'true');
      } catch (error) {
        console.warn('Failed to clear storage:', error);
      }
    }
  }, []);

  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Silently handle common rejections
      if (event.reason) {
        const reason = String(event.reason).toLowerCase();
        if (reason.includes('wallet') || 
            reason.includes('connection') || 
            reason.includes('network') ||
            reason.includes('user rejected') ||
            reason.includes('aborted') ||
            reason.includes('cancelled')) {
          event.preventDefault();
          return;
        }
      }
      // Prevent console spam
      event.preventDefault();
    };

    // Handle errors
    const handleError = (event: ErrorEvent) => {
      if (event.error && event.error.message) {
        const message = event.error.message.toLowerCase();
        if (message.includes('wallet') || 
            message.includes('network') || 
            message.includes('connection') ||
            message.includes('non-error promise rejection')) {
          event.preventDefault();
          return;
        }
      }
      event.preventDefault();
    };

    // Initialize security
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', handleUnhandledRejection);
      window.addEventListener('error', handleError);

      // Load saved profile data with error handling
      try {
        const savedProfileData = localStorage.getItem('currentProfileData');
        if (savedProfileData) {
          const parsed = JSON.parse(savedProfileData);
          setProfileData(parsed);
        }
      } catch (error) {
        console.warn('Failed to load saved profile data:', error);
      }

      // Initialize security with timeout
      setTimeout(() => {
        try {
          SecurityManager.getInstance();
        } catch (error) {
          // Silently fail if security can't initialize
        }
      }, 1000);

      return () => {
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        window.removeEventListener('error', handleError);
      };
    }
  }, []);

  const handleProfileSelect = (profile: any) => {
    setProfileData({
      name: profile.name,
      title: profile.title,
      handle: profile.handle,
      status: profile.status || "Online",
      avatarUrl: profile.avatarUrl
    });
  };

  const handleProfileUpdate = (updatedProfile: any) => {
    const newProfileData = {
      name: updatedProfile.name,
      title: updatedProfile.title,
      handle: updatedProfile.handle,
      status: updatedProfile.status || "Online",
      avatarUrl: updatedProfile.avatarUrl
    };

    setProfileData(newProfileData);

    try {
      // Get existing profiles to preserve search count
      const profiles = JSON.parse(localStorage.getItem('profiles') || '[]');
      const existingProfile = profiles.find((p: any) => p.handle === updatedProfile.handle);

      saveProfile({
        name: updatedProfile.name,
        title: updatedProfile.title,
        handle: updatedProfile.handle,
        avatarUrl: updatedProfile.avatarUrl,
        status: updatedProfile.status || "Online",
        searchCount: existingProfile ? existingProfile.searchCount : 0
      });

      // Also save the current profile data separately
      localStorage.setItem('currentProfileData', JSON.stringify(newProfileData));
    } catch (error) {
      console.warn('Failed to save profile:', error);
    }
  };

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <main className="min-h-screen w-full relative"
          style={{ 
            background: '#000000',
            minHeight: '100vh',
            padding: '2rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>

      {/* Search and Leaderboard - Fixed positioning */}
      <div className="search-leaderboard-container" style={{ 
        position: 'fixed', 
        top: '20px', 
        left: '20px', 
        zIndex: 1000 
      }}>
        <SearchAndLeaderboard onProfileSelect={handleProfileSelect} />
      </div>
       {/* WalletConnect - Fixed positioning */}
       <div className="walletconnect-container" style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 1000
            }}>
                <WalletConnect projectId="2a3cb8da4f7f897a2306f192152dfa98" />
            </div>

      {/* Content Container */}
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-4">
        {/* Floating Monad Logo - Above heading */}
        <div className="floating-monad">
          <img 
            src="https://docs.monad.xyz/img/monad_logo.png" 
            alt="Monad Logo" 
            className="monad-logo"
          />
        </div>

        {/* Main Heading */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="monad-heading text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-4 tracking-wider">
            MONAD PROFILE CARD
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-gray-300 max-w-2xl mx-auto px-4">
            Create and customize your unique Monad profile card with holographic effects
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center gap-4 md:gap-8 w-full">
          <ProfileCard
            avatarUrl={profileData.avatarUrl}
            name={profileData.name}
            title={profileData.title}
            handle={profileData.handle}
            status={profileData.status}
            onProfileUpdate={handleProfileUpdate}
            showSettings={showSettings}
            onToggleSettings={() => setShowSettings(!showSettings)}
            onContactClick={() => {
              try {
                if (profileData.handle) {
                  window.open(`https://x.com/${profileData.handle}`, '_blank');
                }
              } catch (error) {
                console.warn('Failed to open contact link:', error);
              }
            }}
          />
        </div>
      </div>
    </main>
  );
}