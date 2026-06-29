'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Award, Bell, LayoutDashboard, MapPin, Shield } from 'lucide-react';
import React, { useState } from 'react';

import { Avatar, ProgressRing } from '@/components/ui/primitives';
import { useCitizen } from '@/providers/CitizenProvider';

import { ProfileAchievements } from './components/ProfileAchievements';
import { ProfileLocations } from './components/ProfileLocations';
import { ProfileNotifications } from './components/ProfileNotifications';
// Placeholder sub-components, to be implemented.
import { ProfileOverview } from './components/ProfileOverview';
import { ProfileReports } from './components/ProfileReports';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'reports', label: 'Report History', icon: Activity },
  { id: 'achievements', label: 'Achievements', icon: Award },
  { id: 'locations', label: 'Saved Locations', icon: MapPin },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export default function ProfilePage() {
  const { state: { profile, insights, loading, error } } = useCitizen();
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse text-primary font-mono tracking-widest">LOADING_PROFILE...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex h-full items-center justify-center text-danger">
        Error loading profile: {error || 'User not found'}
      </div>
    );
  }

  const { reputation, name, email, role, createdAt } = profile;

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-body">
      {/* 1. Hero & Civic Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 md:col-span-2 flex items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl" />
          <Avatar name={name} size={96} className="ring-4 ring-primary/20" />
          <div className="z-10">
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">{name}</h1>
            <p className="text-text-secondary mt-1 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> {role.toUpperCase()}
            </p>
            <p className="text-sm text-text-tertiary mt-2">
              Joined {new Date(createdAt).toLocaleDateString()} • {email}
            </p>
          </div>
        </div>

        <div className="card p-6 flex flex-col justify-center relative overflow-hidden">
           <div className="absolute bottom-0 right-0 p-24 bg-accent/5 rounded-full blur-2xl" />
           <div className="flex items-center gap-6 z-10">
             <ProgressRing value={reputation?.xpProgress ? reputation.xpProgress * 100 : 0} size={80} color="#7C3AED" stroke={6}>
               <span className="text-xl font-bold text-white">{reputation?.level || 1}</span>
             </ProgressRing>
             <div>
               <p className="text-sm text-text-secondary font-mono tracking-widest uppercase">Civic Level</p>
               <p className="text-xl font-display font-bold text-accent-300 mt-1">{reputation?.rankTitle || 'Citizen'}</p>
               <p className="text-xs text-text-tertiary mt-1">
                 {reputation?.points || 0} / {reputation?.nextLevelPoints || 10} XP
               </p>
             </div>
           </div>
        </div>
      </div>

      {/* 2. Tabs */}
      <div className="border-b border-white/10 flex gap-6 overflow-x-auto custom-scrollbar pb-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-colors relative whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded
              ${activeTab === tab.id ? 'text-primary-300' : 'text-text-secondary hover:text-white'}`}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTabProfile"
                className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-primary"
              />
            )}
          </button>
        ))}
      </div>

      {/* 3. Tab Content */}
      <div className="pb-12 min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && <ProfileOverview profile={profile} insights={insights} />}
            {activeTab === 'reports' && <ProfileReports profile={profile} />}
            {activeTab === 'achievements' && <ProfileAchievements profile={profile} />}
            {activeTab === 'locations' && <ProfileLocations profile={profile} />}
            {activeTab === 'notifications' && <ProfileNotifications profile={profile} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
