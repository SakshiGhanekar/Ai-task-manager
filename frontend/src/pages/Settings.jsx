import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Bell, Shield, Paintbrush, Smartphone, Check, Sun, Moon, Camera, 
  Mail, FileText, Trash2, Loader2, Briefcase, MapPin, Clock, Globe, 
  Code, Layout, Palette, Monitor, Laptop, Activity, Plug,
  MessageSquare, Users, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user, updateProfile, updateAvatar } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile State
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(localStorage.getItem('bio') || '');
  const [jobTitle, setJobTitle] = useState(localStorage.getItem('jobTitle') || '');
  const [location, setLocation] = useState(localStorage.getItem('location') || '');
  const [timezone, setTimezone] = useState(localStorage.getItem('timezone') || 'UTC');
  const [website, setWebsite] = useState(localStorage.getItem('website') || '');
  const [github, setGithub] = useState(localStorage.getItem('github') || '');
  const [linkedin, setLinkedin] = useState(localStorage.getItem('linkedin') || '');

  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const hasChanges = name !== (user?.name || '') || 
                     bio !== (localStorage.getItem('bio') || '') ||
                     jobTitle !== (localStorage.getItem('jobTitle') || '') ||
                     location !== (localStorage.getItem('location') || '') ||
                     timezone !== (localStorage.getItem('timezone') || 'UTC') ||
                     website !== (localStorage.getItem('website') || '') ||
                     github !== (localStorage.getItem('github') || '') ||
                     linkedin !== (localStorage.getItem('linkedin') || '');

  // Notifications State
  const [notifState, setNotifState] = useState({
    taskAssigned: true,
    deadlineReminder: true,
    aiInsights: false,
    mentions: true,
    weeklyDigest: false
  });

  const [twoFactor, setTwoFactor] = useState(false);

  // Integrations State
  const [integrations, setIntegrations] = useState({
    github: true,
    slack: false,
    jira: false
  });

  const toggleIntegration = (app) => {
    setIntegrations(prev => ({ ...prev, [app]: !prev[app] }));
  };
  
  // Appearance State
  const [themePreference, setThemePreference] = useState(() => {
    return localStorage.getItem('theme') || 'system';
  });
  const [density, setDensity] = useState(() => {
    return localStorage.getItem('density') || 'comfortable';
  });
  const [primaryColor, setPrimaryColor] = useState(() => {
    return localStorage.getItem('primaryColor') || 'blue';
  });

  const handleDensityChange = (d) => {
    setDensity(d);
    localStorage.setItem('density', d);
    document.documentElement.dataset.density = d;
  };

  const handlePrimaryColorChange = (c) => {
    setPrimaryColor(c);
    localStorage.setItem('primaryColor', c);
    document.documentElement.dataset.theme = c;
  };

  const handleThemeChange = (theme) => {
    setThemePreference(theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.removeItem('theme');
    }
    window.dispatchEvent(new Event('themeChange'));
  };

  const Toggle = ({ enabled, onChange }) => (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`${
        enabled ? 'bg-primary-500' : 'bg-slate-200 dark:bg-white/10'
      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
    >
      <span
        className={`${
          enabled ? 'translate-x-5' : 'translate-x-0'
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  );

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      updateProfile(name);
      localStorage.setItem('bio', bio);
      localStorage.setItem('jobTitle', jobTitle);
      localStorage.setItem('location', location);
      localStorage.setItem('timezone', timezone);
      localStorage.setItem('website', website);
      localStorage.setItem('github', github);
      localStorage.setItem('linkedin', linkedin);
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }, 800);
  };

  const handleAvatarClick = () => {
    document.getElementById('avatar-upload').click();
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 800 * 1024) {
        alert("File size exceeds 800KB. Please choose a smaller image.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: <User size={18} /> },
    { id: 'appearance', label: 'Appearance', icon: <Paintbrush size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    { id: 'integrations', label: 'Connected Apps', icon: <Plug size={18} /> },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-brandText tracking-tight mb-1">Settings</h1>
        <p className="text-slate-500 dark:text-brandMuted text-sm">Manage your account preferences and application settings.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 flex-1">
        {/* Settings Navigation */}
        <div className="w-full md:w-64 shrink-0">
          <div className="glass-panel rounded-2xl p-2 flex flex-col gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-left ${
                  activeTab === tab.id
                    ? 'bg-primary text-white dark:text-brandBg shadow-lg'
                    : 'text-slate-600 dark:text-brandMuted hover:bg-slate-100 dark:hover:bg-brandSidebar'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 max-w-3xl">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="glass-card p-6 md:p-8"
          >
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-8 pb-8 border-b border-slate-200 dark:border-white/5">
                  <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center text-4xl font-bold text-white shadow-2xl overflow-hidden ring-4 ring-white dark:ring-brandCard transition-transform duration-300 group-hover:scale-105">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        user?.name?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                      <Camera className="text-white" size={24} />
                    </div>
                    <input type="file" id="avatar-upload" onChange={handleAvatarUpload} className="hidden" accept="image/png, image/jpeg, image/gif" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-brandText mb-1">Profile Picture</h3>
                    <p className="text-sm text-slate-500 dark:text-brandMuted mb-4">Upload a high-res image (JPG, PNG, GIF). Max size: 800KB.</p>
                    <div className="flex gap-3">
                      <button onClick={handleAvatarClick} className="btn-secondary text-sm">Upload Image</button>
                      {user?.avatar && (
                        <button onClick={() => updateAvatar(null)} className="p-2 text-danger hover:bg-danger/10 rounded-xl transition-colors border border-transparent hover:border-danger/20">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-brandText">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="text-slate-400" size={18} />
                      </div>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="premium-input pl-11" placeholder="John Doe" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-brandText">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="text-slate-400" size={18} />
                      </div>
                      <input type="email" defaultValue={user?.email} disabled className="premium-input pl-11 opacity-60 cursor-not-allowed bg-slate-50 dark:bg-black/20" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-brandMuted ml-1">Email cannot be changed.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-brandText">Job Title</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Briefcase className="text-slate-400" size={18} />
                      </div>
                      <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="premium-input pl-11" placeholder="e.g. Product Manager" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-brandText">Location</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MapPin className="text-slate-400" size={18} />
                      </div>
                      <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="premium-input pl-11" placeholder="San Francisco, CA" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-brandText">Timezone</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Clock className="text-slate-400" size={18} />
                      </div>
                      <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="premium-input pl-11 appearance-none">
                        <option value="UTC">UTC (Universal Time)</option>
                        <option value="EST">Eastern Time (EST)</option>
                        <option value="CST">Central Time (CST)</option>
                        <option value="MST">Mountain Time (MST)</option>
                        <option value="PST">Pacific Time (PST)</option>
                        <option value="GMT">Greenwich Mean Time (GMT)</option>
                        <option value="CET">Central European Time (CET)</option>
                        <option value="IST">Indian Standard Time (IST)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-brandText flex items-center justify-between">
                    <span>Short Bio</span>
                    <span className="text-xs font-normal text-slate-400">{bio.length}/150</span>
                  </label>
                  <div className="relative">
                    <div className="absolute top-4 left-4 pointer-events-none">
                      <FileText className="text-slate-400" size={18} />
                    </div>
                    <textarea 
                      rows="3" maxLength={150} placeholder="Write a few sentences about yourself and your role..." 
                      value={bio} onChange={(e) => setBio(e.target.value)} className="premium-input pl-11 py-4 resize-none"
                    ></textarea>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-white/5">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-brandText mb-4">Social & Links</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-brandText">Website / Portfolio</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Globe className="text-slate-400" size={18} />
                        </div>
                        <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className="premium-input pl-11" placeholder="https://" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-brandText">GitHub</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Code className="text-slate-400" size={18} />
                        </div>
                        <input type="text" value={github} onChange={(e) => setGithub(e.target.value)} className="premium-input pl-11" placeholder="username" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-brandText">LinkedIn</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Users className="text-slate-400" size={18} />
                        </div>
                        <input type="text" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="premium-input pl-11" placeholder="username" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-white/5 flex flex-col-reverse md:flex-row justify-end items-center gap-4">
                  {isSaved && (
                    <motion.span 
                      initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} 
                      className="text-success text-sm font-bold flex items-center gap-2"
                    >
                      <Check size={16} /> Changes successfully saved!
                    </motion.span>
                  )}
                  <button 
                    onClick={handleSave} 
                    disabled={!hasChanges || isSaving}
                    className={`btn-primary flex items-center gap-2 transition-all ${!hasChanges ? 'opacity-50 cursor-not-allowed saturate-0' : ''}`}
                  >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : null}
                    <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-brandText mb-1">Theme</h3>
                  <p className="text-sm text-slate-500 dark:text-brandMuted mb-4">Customize how the application looks on your device.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div onClick={() => handleThemeChange('light')} className={`border-2 rounded-xl p-4 cursor-pointer relative overflow-hidden transition-all ${themePreference === 'light' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-brandSidebar hover:border-primary-500/50'}`}>
                    {themePreference === 'light' && <div className="absolute top-4 right-4 text-primary-500"><Check size={20} /></div>}
                    <div className="flex items-center gap-3 mb-2">
                      <Sun className="text-slate-700 dark:text-brandText" />
                      <span className="font-bold text-slate-900 dark:text-brandText">Light Mode</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-brandMuted">Clean and bright</p>
                  </div>
                  
                  <div onClick={() => handleThemeChange('dark')} className={`border-2 rounded-xl p-4 cursor-pointer relative overflow-hidden transition-all ${themePreference === 'dark' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-brandSidebar hover:border-primary-500/50'}`}>
                    {themePreference === 'dark' && <div className="absolute top-4 right-4 text-primary-500"><Check size={20} /></div>}
                    <div className="flex items-center gap-3 mb-2">
                      <Moon className="text-slate-700 dark:text-brandText" />
                      <span className="font-bold text-slate-900 dark:text-brandText">Dark Mode</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-brandMuted">Easy on the eyes</p>
                  </div>

                  <div onClick={() => handleThemeChange('system')} className={`border-2 rounded-xl p-4 cursor-pointer relative overflow-hidden transition-all ${themePreference === 'system' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-brandSidebar hover:border-primary-500/50'}`}>
                    {themePreference === 'system' && <div className="absolute top-4 right-4 text-primary-500"><Check size={20} /></div>}
                    <div className="flex items-center gap-3 mb-2">
                      <Smartphone className="text-slate-700 dark:text-brandText" />
                      <span className="font-bold text-slate-900 dark:text-brandText">System</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-brandMuted">Matches your OS</p>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-200 dark:border-white/5">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-brandText mb-1">Layout Density</h3>
                  <p className="text-sm text-slate-500 dark:text-brandMuted mb-4">Choose how compact or spacious you want the UI elements.</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['compact', 'comfortable', 'spacious'].map(d => (
                      <div key={d} onClick={() => handleDensityChange(d)} className={`border-2 rounded-xl p-4 cursor-pointer relative transition-all ${density === d ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-brandSidebar hover:border-primary-500/50'}`}>
                        {density === d && <div className="absolute top-4 right-4 text-primary-500"><Check size={20} /></div>}
                        <div className="flex items-center gap-3 mb-2">
                          <Layout className="text-slate-700 dark:text-brandText" />
                          <span className="font-bold text-slate-900 dark:text-brandText capitalize">{d}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-200 dark:border-white/5">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-brandText mb-1">Primary Color</h3>
                  <p className="text-sm text-slate-500 dark:text-brandMuted mb-4">Select the accent color for buttons, toggles, and highlights.</p>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { id: 'blue', color: 'bg-blue-500' },
                      { id: 'indigo', color: 'bg-indigo-500' },
                      { id: 'purple', color: 'bg-purple-500' },
                      { id: 'pink', color: 'bg-pink-500' },
                      { id: 'emerald', color: 'bg-emerald-500' },
                      { id: 'orange', color: 'bg-orange-500' },
                    ].map(c => (
                      <div key={c.id} onClick={() => handlePrimaryColorChange(c.id)} className={`w-12 h-12 rounded-full cursor-pointer flex items-center justify-center transition-transform ${c.color} ${primaryColor === c.id ? 'ring-4 ring-offset-2 dark:ring-offset-black ring-primary-500 scale-110' : 'hover:scale-105'}`}>
                        {primaryColor === c.id && <Check size={20} className="text-white" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-brandText mb-1">Notification Preferences</h3>
                  <p className="text-slate-500 dark:text-brandMuted text-sm mb-6">Choose what updates you want to receive and how you want to receive them.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-brandSidebar rounded-xl border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg"><Bell size={20} /></div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-brandText">Task Assigned to Me</h4>
                        <p className="text-sm text-slate-500 dark:text-brandMuted">Get notified when someone assigns a task to you.</p>
                      </div>
                    </div>
                    <Toggle enabled={notifState.taskAssigned} onChange={(v) => setNotifState(s => ({...s, taskAssigned: v}))} />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-brandSidebar rounded-xl border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-warning/10 text-warning rounded-lg"><AlertCircle size={20} /></div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-brandText">Deadline Reminders</h4>
                        <p className="text-sm text-slate-500 dark:text-brandMuted">Get alerts when a task is approaching its deadline.</p>
                      </div>
                    </div>
                    <Toggle enabled={notifState.deadlineReminder} onChange={(v) => setNotifState(s => ({...s, deadlineReminder: v}))} />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-brandSidebar rounded-xl border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-accent/10 text-accent rounded-lg"><Activity size={20} /></div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-brandText">AI Insights Generated</h4>
                        <p className="text-sm text-slate-500 dark:text-brandMuted">Notify me when the AI generates new recommendations.</p>
                      </div>
                    </div>
                    <Toggle enabled={notifState.aiInsights} onChange={(v) => setNotifState(s => ({...s, aiInsights: v}))} />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-brandSidebar rounded-xl border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-success/10 text-success rounded-lg"><Users size={20} /></div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-brandText">Mentions</h4>
                        <p className="text-sm text-slate-500 dark:text-brandMuted">Get notified when someone mentions you in a comment.</p>
                      </div>
                    </div>
                    <Toggle enabled={notifState.mentions} onChange={(v) => setNotifState(s => ({...s, mentions: v}))} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-brandText mb-1">Security Settings</h3>
                  <p className="text-slate-500 dark:text-brandMuted text-sm mb-6">Manage your password and secure your account.</p>
                </div>

                <div className="space-y-4 border-b border-slate-200 dark:border-white/5 pb-8">
                  <h4 className="font-semibold text-slate-900 dark:text-brandText">Change Password</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="password" placeholder="Current password" className="premium-input" />
                    <input type="password" placeholder="New password" className="premium-input" />
                  </div>
                  <button className="btn-secondary mt-2">Update Password</button>
                </div>

                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-8">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-brandText">Two-Factor Authentication</h4>
                    <p className="text-sm text-slate-500 dark:text-brandMuted">Add an extra layer of security to your account.</p>
                  </div>
                  <Toggle enabled={twoFactor} onChange={setTwoFactor} />
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-brandText mb-4">Active Sessions</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-brandSidebar rounded-xl border border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-4">
                        <Monitor className="text-primary-500" />
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-brandText">Windows • Chrome</p>
                          <p className="text-xs text-slate-500 dark:text-brandMuted">Current session • IP: 192.168.1.1</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-success px-2 py-1 bg-success/10 rounded-md">Active Now</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-brandSidebar rounded-xl border border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-4">
                        <Smartphone className="text-slate-400" />
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-brandText">iPhone 14 • Safari</p>
                          <p className="text-xs text-slate-500 dark:text-brandMuted">Last active: 2 hours ago • IP: 104.28.1.1</p>
                        </div>
                      </div>
                      <button className="text-xs font-medium text-danger hover:underline">Revoke</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-brandText mb-1">Connected Apps</h3>
                  <p className="text-slate-500 dark:text-brandMuted text-sm mb-6">Integrate with your favorite tools to streamline your workflow.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 border-2 border-slate-200 dark:border-white/5 rounded-2xl bg-white dark:bg-brandSidebar flex flex-col gap-4 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-900 dark:text-white">
                        <Code size={24} />
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-md transition-colors ${integrations.github ? 'text-success bg-success/10' : 'text-slate-500 dark:text-brandMuted bg-slate-100 dark:bg-white/5'}`}>
                        {integrations.github ? 'Connected' : 'Not Connected'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-brandText">GitHub</h4>
                      <p className="text-sm text-slate-500 dark:text-brandMuted">Sync your commits and PRs directly into tasks.</p>
                    </div>
                    <button onClick={() => toggleIntegration('github')} className={integrations.github ? 'btn-secondary w-full text-danger hover:border-danger hover:text-danger' : 'btn-primary w-full'}>
                      {integrations.github ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>

                  <div className="p-5 border-2 border-slate-200 dark:border-white/5 rounded-2xl bg-white dark:bg-brandSidebar flex flex-col gap-4 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 bg-[#4A154B]/10 rounded-xl flex items-center justify-center text-[#4A154B] dark:text-[#E01E5A]">
                        <MessageSquare size={24} />
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-md transition-colors ${integrations.slack ? 'text-success bg-success/10' : 'text-slate-500 dark:text-brandMuted bg-slate-100 dark:bg-white/5'}`}>
                        {integrations.slack ? 'Connected' : 'Not Connected'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-brandText">Slack</h4>
                      <p className="text-sm text-slate-500 dark:text-brandMuted">Receive task notifications directly in Slack channels.</p>
                    </div>
                    <button onClick={() => toggleIntegration('slack')} className={integrations.slack ? 'btn-secondary w-full text-danger hover:border-danger hover:text-danger' : 'btn-primary w-full'}>
                      {integrations.slack ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>

                  <div className="p-5 border-2 border-slate-200 dark:border-white/5 rounded-2xl bg-white dark:bg-brandSidebar flex flex-col gap-4 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                        <Layout size={24} />
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-md transition-colors ${integrations.jira ? 'text-success bg-success/10' : 'text-slate-500 dark:text-brandMuted bg-slate-100 dark:bg-white/5'}`}>
                        {integrations.jira ? 'Connected' : 'Not Connected'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-brandText">Jira</h4>
                      <p className="text-sm text-slate-500 dark:text-brandMuted">Import Jira epics and issues automatically.</p>
                    </div>
                    <button onClick={() => toggleIntegration('jira')} className={integrations.jira ? 'btn-secondary w-full text-danger hover:border-danger hover:text-danger' : 'btn-primary w-full'}>
                      {integrations.jira ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
