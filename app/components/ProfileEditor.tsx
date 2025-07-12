
'use client';
import React, { useState } from 'react';
import { SearchResult, saveProfile } from '../utils/profileStorage';

interface ProfileEditorProps {
  profile: SearchResult;
  onProfileUpdated: (profile: SearchResult) => void;
}

export default function ProfileEditor({ profile, onProfileUpdated }: ProfileEditorProps) {
  const [name, setName] = useState(profile.name);
  const [title, setTitle] = useState(profile.title);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [handle, setHandle] = useState(profile.handle);

  function handleSave() {
    const updatedProfile: SearchResult = { 
      ...profile, 
      name, 
      title, 
      avatarUrl, 
      handle,
      searchCount: profile.searchCount || 0 
    };
    
    saveProfile(updatedProfile);
    onProfileUpdated(updatedProfile);
  }

  return (
    <div className="profile-editor">
      <div className="form-group">
        <label htmlFor="name">Name:</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="form-input"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="title">Title:</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="form-input"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="handle">Handle:</label>
        <input
          id="handle"
          type="text"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          className="form-input"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="avatarUrl">Avatar URL:</label>
        <input
          id="avatarUrl"
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          className="form-input"
        />
      </div>
      
      <button onClick={handleSave} className="save-button">
        Save Profile
      </button>
    </div>
  );
}
