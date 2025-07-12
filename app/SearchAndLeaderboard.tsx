
'use client';
import React, { useState, useEffect } from 'react';
import './SearchAndLeaderboard.css';
import { getProfiles, getProfileSearchCounts, updateProfileSearchCount } from './utils/profileStorage';

interface Profile {
  name: string;
  title: string;
  handle: string;
  avatarUrl: string;
  searchCount: number;
}

interface SearchAndLeaderboardProps {
  onProfileSelect: (profile: Profile) => void;
}

const SearchAndLeaderboard: React.FC<SearchAndLeaderboardProps> = ({ onProfileSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeTab, setActiveTab] = useState<'search' | 'leaderboard'>('search');

  useEffect(() => {
    loadProfiles();

    // Listen for profile updates
    const handleProfileUpdate = () => {
      loadProfiles();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const loadProfiles = () => {
    const savedProfiles = getProfiles();
    const searchCounts = getProfileSearchCounts();

    const profilesWithCounts = savedProfiles.map(profile => ({
      ...profile,
      searchCount: searchCounts[profile.handle] || profile.searchCount || 0
    }));

    setProfiles(profilesWithCounts);
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.handle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const leaderboardProfiles = [...profiles]
    .sort((a, b) => b.searchCount - a.searchCount)
    .slice(0, 10);

  const handleProfileClick = (profile: Profile) => {
    updateProfileSearchCount(profile.handle);
    onProfileSelect(profile);
    setIsOpen(false);
    loadProfiles(); // Reload to update counts
  };

  return (
    <div className="search-leaderboard-container">
      <button 
        className="search-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {isOpen && (
        <div className="search-leaderboard-panel">
          <div className="panel-header">
            <h3>Search & Leaderboard</h3>
          </div>

          <div className="tab-buttons">
            <button 
              className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
              onClick={() => setActiveTab('search')}
            >
              Search
            </button>
            <button 
              className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('leaderboard')}
            >
              Leaderboard
            </button>
          </div>

          {activeTab === 'search' && (
            <div className="search-section">
              <div style={{ position: 'relative' }}>
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search profiles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="search-results">
                {filteredProfiles.length > 0 ? (
                  filteredProfiles.map((profile, index) => (
                    <div 
                      key={index}
                      className="search-result-item"
                      onClick={() => handleProfileClick(profile)}
                    >
                      <img src={profile.avatarUrl} alt={profile.name} className="search-result-avatar" />
                      <div className="search-result-info">
                        <div className="search-result-name">{profile.name}</div>
                        <div className="search-result-handle">@{profile.handle}</div>
                        <div className="search-result-title">{profile.title}</div>
                      </div>
                      <div className="search-count">{profile.searchCount}</div>
                    </div>
                  ))
                ) : (
                  <div className="no-results">No profiles found</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="leaderboard-section">
              <div className="leaderboard-list">
                {leaderboardProfiles.length > 0 ? (
                  leaderboardProfiles.map((profile, index) => (
                    <div 
                      key={index}
                      className={`leaderboard-item ${index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : ''}`}
                      onClick={() => handleProfileClick(profile)}
                    >
                      <div className="rank-number">#{index + 1}</div>
                      <img src={profile.avatarUrl} alt={profile.name} className="leaderboard-avatar" />
                      <div className="leaderboard-info">
                        <div className="leaderboard-name">{profile.name}</div>
                        <div className="leaderboard-handle">@{profile.handle}</div>
                      </div>
                      <div className="search-count-badge">{profile.searchCount}</div>
                    </div>
                  ))
                ) : (
                  <div className="no-searches">
                    <p>🏆</p>
                    <p>No profiles in leaderboard yet</p>
                    <p>Start searching to see rankings!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAndLeaderboard;
