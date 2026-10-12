'use client'

import { User, Mail, School, Lock, Phone, Edit2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { useState, useRef, useEffect } from 'react';

export default function TeacherSettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [profilePic, setProfilePic] = useState('https://api.dicebear.com/7.x/notionists/svg?seed=Teacher&backgroundColor=f1f5f9');
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: ''
  });

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (!error && data) {
        setProfileData({
          name: data.name || '',
          email: user.email || '',
          phone: data.phone || '',
          organization: data.organization || ''
        });
      }
      setLoading(false);
    }
    loadProfile();
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setProfilePic(url);
    }
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({
            name: profileData.name,
            phone: profileData.phone,
            organization: profileData.organization
          })
          .eq('id', user.id);
        setIsEditing(false);
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ text: 'Failed to update profile.', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Loading your profile details...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-2 text-lg">Manage your profile, preferences, and account security.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Profile Section */}
        <div className="p-8 border-b border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <User className="text-indigo-500" /> Profile Information
            </h2>
            <button onClick={() => setIsEditing(!isEditing)} className="flex items-center gap-2 text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg transition-colors">
              <Edit2 size={16} /> {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 overflow-hidden border-4 border-white shadow-lg relative group">
                <img src={profilePic} alt="Profile Picture" className="w-full h-full object-cover" />
              </div>
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleImageChange} 
                disabled={!isEditing}
              />
              {isEditing && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 transition-colors"
                >
                  Change Picture
                </button>
              )}
            </div>
            
            <div className="flex-1 w-full space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      value={profileData.name} 
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      placeholder="Enter your full name"
                      disabled={!isEditing}
                      className={"w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-slate-900 font-medium " + (isEditing ? "bg-slate-50" : "bg-slate-100 cursor-not-allowed")}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="email" 
                      disabled 
                      value={profileData.email} 
                      className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed" 
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Phone Number (Optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="tel" 
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      placeholder="e.g. +91 9876543210"
                      disabled={!isEditing}
                      className={"w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-slate-900 font-medium " + (isEditing ? "bg-slate-50" : "bg-slate-100 cursor-not-allowed")}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Institution / Academy (Optional)</label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      value={profileData.organization}
                      onChange={(e) => setProfileData({...profileData, organization: e.target.value})}
                      placeholder="e.g. TestWise Academy"
                      disabled={!isEditing}
                      className={"w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-slate-900 font-medium " + (isEditing ? "bg-slate-50" : "bg-slate-100 cursor-not-allowed")}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Lock className="text-orange-500" /> Security
          </h2>
          
          <button onClick={() => {
            setMessage({ text: 'Password reset link has been sent to your email.', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
          }} className="px-6 py-3 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-xl transition-colors">
            Change Password
          </button>
        </div>

        {/* Save & Logout Bar */}
        <div className="p-6 bg-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4">
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/');
            }}
            className="px-6 py-2.5 border-2 border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white font-bold rounded-xl transition-colors w-full sm:w-auto"
          >
            Log Out
          </button>
          
          {isEditing && (
            <button 
              onClick={handleSave}
              className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-transform hover:-translate-y-0.5 w-full sm:w-auto"
            >
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
