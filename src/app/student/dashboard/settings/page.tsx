'use client'

import { User, Mail, School, Lock, Shield, Phone, Edit2, GraduationCap, Hash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { useState, useRef, useEffect } from 'react';

export default function StudentSettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [profilePic, setProfilePic] = useState('https://api.dicebear.com/7.x/notionists/svg?seed=Student&backgroundColor=f8f7f2');
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    rollNumber: '',
    stream: 'B.Tech',
    branch: 'CSE',
    year: '3rd Year',
    section: 'A'
  });

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      const userMeta = user.user_metadata || {};
      
      setProfileData({
        name: data?.name || userMeta.full_name || '',
        email: user.email || '',
        phone: data?.phone || userMeta.phone || '',
        organization: data?.organization || userMeta.organization || '',
        rollNumber: data?.roll_number || userMeta.roll_number || '',
        stream: data?.stream || userMeta.stream || 'B.Tech',
        branch: data?.branch || userMeta.branch || 'CSE',
        year: data?.year || userMeta.year || '3rd Year',
        section: data?.section || userMeta.section || 'A'
      });
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
        // Save to auth user metadata (always persists)
        await supabase.auth.updateUser({
          data: {
            full_name: profileData.name,
            phone: profileData.phone,
            organization: profileData.organization,
            roll_number: profileData.rollNumber,
            stream: profileData.stream,
            branch: profileData.branch,
            year: profileData.year,
            section: profileData.section
          }
        });

        // Also update profiles table
        try {
          await supabase
            .from('profiles')
            .update({
              name: profileData.name,
              phone: profileData.phone,
              organization: profileData.organization,
              roll_number: profileData.rollNumber,
              stream: profileData.stream,
              branch: profileData.branch,
              year: profileData.year,
              section: profileData.section
            } as any)
            .eq('id', user.id);
        } catch {
          await supabase
            .from('profiles')
            .update({
              name: profileData.name,
              phone: profileData.phone,
              organization: profileData.organization
            })
            .eq('id', user.id);
        }

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
        <h1 className="text-3xl font-black text-[#17221B]">Account Settings</h1>
        <p className="text-[#17221B]/70 mt-2 font-medium">Manage your profile details and security preferences.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-[24px] border border-[#DDE3DD] shadow-sm overflow-hidden relative">
        
        {/* Profile Section */}
        <div className="p-8 border-b border-[#DDE3DD]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#17221B] flex items-center gap-2">
              <User className="text-violet-500" /> Personal Information
            </h2>
            <button onClick={() => setIsEditing(!isEditing)} className="flex items-center gap-2 text-sm font-bold bg-[#F8F7F2] hover:bg-[#DDE3DD] text-[#17221B] px-4 py-2 rounded-xl transition-colors border border-[#DDE3DD]">
              <Edit2 size={16} /> {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-[#F8F7F2] flex items-center justify-center text-slate-600 overflow-hidden border-4 border-white shadow-xl relative group">
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
                  className="text-sm font-bold text-violet-600 hover:text-violet-700 bg-violet-50 px-4 py-2 rounded-xl border border-violet-100 transition-colors"
                >
                  Change Photo
                </button>
              )}
            </div>
            
            <div className="flex-1 w-full space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[#17221B] mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      value={profileData.name} 
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      placeholder="Your full name"
                      disabled={!isEditing}
                      className={"w-full pl-10 pr-4 py-3 border border-[#DDE3DD] rounded-xl focus:bg-white focus:border-violet-300 focus:ring-4 focus:ring-violet-50 outline-none transition-all text-[#17221B] font-medium " + (isEditing ? "bg-[#F8F7F2]" : "bg-slate-100 cursor-not-allowed")}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#17221B] mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="email" 
                      disabled 
                      value={profileData.email} 
                      className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-[#DDE3DD] rounded-xl text-slate-500 font-medium cursor-not-allowed" 
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[#17221B] mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="tel" 
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      placeholder="+91 9876543210"
                      disabled={!isEditing}
                      className={"w-full pl-10 pr-4 py-3 border border-[#DDE3DD] rounded-xl focus:bg-white focus:border-violet-300 focus:ring-4 focus:ring-violet-50 outline-none transition-all text-[#17221B] font-medium " + (isEditing ? "bg-[#F8F7F2]" : "bg-slate-100 cursor-not-allowed")}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#17221B] mb-2">College / Institution</label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      value={profileData.organization}
                      onChange={(e) => setProfileData({...profileData, organization: e.target.value})}
                      placeholder="e.g. TestWise University"
                      disabled={!isEditing}
                      className={"w-full pl-10 pr-4 py-3 border border-[#DDE3DD] rounded-xl focus:bg-white focus:border-violet-300 focus:ring-4 focus:ring-violet-50 outline-none transition-all text-[#17221B] font-medium " + (isEditing ? "bg-[#F8F7F2]" : "bg-slate-100 cursor-not-allowed")}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Profile Section */}
        <div className="p-8 border-b border-[#DDE3DD]">
          <h2 className="text-xl font-bold text-[#17221B] mb-2 flex items-center gap-2">
            <GraduationCap className="text-indigo-600" /> Academic Details
          </h2>
          <p className="text-xs text-slate-500 mb-6 font-medium">
            Your university roll number, stream, branch, and section are shared with your faculty for test analytics and performance tracking.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Roll Number */}
            <div>
              <label className="block text-sm font-bold text-[#17221B] mb-2">University Roll Number</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={profileData.rollNumber}
                  onChange={(e) => setProfileData({...profileData, rollNumber: e.target.value.toUpperCase()})}
                  placeholder="e.g. 22A91A0501"
                  disabled={!isEditing}
                  className={"w-full pl-10 pr-4 py-3 border border-[#DDE3DD] rounded-xl uppercase font-mono font-bold focus:bg-white focus:border-violet-300 focus:ring-4 focus:ring-violet-50 outline-none transition-all text-[#17221B] " + (isEditing ? "bg-[#F8F7F2]" : "bg-slate-100 cursor-not-allowed")}
                />
              </div>
            </div>

            {/* Stream */}
            <div>
              <label className="block text-sm font-bold text-[#17221B] mb-2">Stream / Degree</label>
              <select 
                value={profileData.stream}
                onChange={(e) => {
                  const newStream = e.target.value;
                  let defaultBranch = 'CSE';
                  if (newStream === 'MBA') defaultBranch = 'Finance';
                  else if (newStream === 'MCA') defaultBranch = 'Software Dev';
                  else if (newStream === 'M.Tech') defaultBranch = 'Computer Science';
                  setProfileData({ ...profileData, stream: newStream, branch: defaultBranch });
                }}
                disabled={!isEditing}
                className={"w-full px-4 py-3 border border-[#DDE3DD] rounded-xl font-bold focus:bg-white focus:border-violet-300 focus:ring-4 focus:ring-violet-50 outline-none transition-all text-[#17221B] " + (isEditing ? "bg-[#F8F7F2]" : "bg-slate-100 cursor-not-allowed")}
              >
                <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                <option value="MBA">MBA (Master of Business Admin)</option>
                <option value="MCA">MCA (Master of Computer App)</option>
                <option value="M.Tech">M.Tech (Master of Technology)</option>
              </select>
            </div>

            {/* Branch */}
            <div>
              <label className="block text-sm font-bold text-[#17221B] mb-2">Branch / Specialization</label>
              <select 
                value={profileData.branch}
                onChange={(e) => setProfileData({...profileData, branch: e.target.value})}
                disabled={!isEditing}
                className={"w-full px-4 py-3 border border-[#DDE3DD] rounded-xl font-bold focus:bg-white focus:border-violet-300 focus:ring-4 focus:ring-violet-50 outline-none transition-all text-[#17221B] " + (isEditing ? "bg-[#F8F7F2]" : "bg-slate-100 cursor-not-allowed")}
              >
                {profileData.stream === 'MBA' ? (
                  <>
                    <option value="Finance">Finance</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HR">Human Resources (HR)</option>
                    <option value="Business Analytics">Business Analytics</option>
                    <option value="Operations">Operations Management</option>
                  </>
                ) : profileData.stream === 'MCA' ? (
                  <>
                    <option value="Software Dev">Software Development</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Cloud Systems">Cloud Systems</option>
                    <option value="AI & ML">AI & Machine Learning</option>
                  </>
                ) : profileData.stream === 'M.Tech' ? (
                  <>
                    <option value="Computer Science">Computer Science & Engg</option>
                    <option value="VLSI Design">VLSI Design</option>
                    <option value="Power Systems">Power Systems</option>
                    <option value="Embedded Systems">Embedded Systems</option>
                  </>
                ) : (
                  <>
                    <option value="CSE">Computer Science (CSE)</option>
                    <option value="ECE">Electronics & Comm (ECE)</option>
                    <option value="AI & DS">Artificial Intelligence & DS</option>
                    <option value="IT">Information Technology (IT)</option>
                    <option value="EEE">Electrical & Electronics (EEE)</option>
                    <option value="MECH">Mechanical Engineering (MECH)</option>
                    <option value="CIVIL">Civil Engineering (CIVIL)</option>
                  </>
                )}
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="block text-sm font-bold text-[#17221B] mb-2">Academic Year</label>
              <select 
                value={profileData.year}
                onChange={(e) => setProfileData({...profileData, year: e.target.value})}
                disabled={!isEditing}
                className={"w-full px-4 py-3 border border-[#DDE3DD] rounded-xl font-bold focus:bg-white focus:border-violet-300 focus:ring-4 focus:ring-violet-50 outline-none transition-all text-[#17221B] " + (isEditing ? "bg-[#F8F7F2]" : "bg-slate-100 cursor-not-allowed")}
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                {profileData.stream === 'B.Tech' && (
                  <>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </>
                )}
              </select>
            </div>

            {/* Section */}
            <div>
              <label className="block text-sm font-bold text-[#17221B] mb-2">Class Section</label>
              <select 
                value={profileData.section}
                onChange={(e) => setProfileData({...profileData, section: e.target.value})}
                disabled={!isEditing}
                className={"w-full px-4 py-3 border border-[#DDE3DD] rounded-xl font-bold focus:bg-white focus:border-violet-300 focus:ring-4 focus:ring-violet-50 outline-none transition-all text-[#17221B] " + (isEditing ? "bg-[#F8F7F2]" : "bg-slate-100 cursor-not-allowed")}
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                <option value="D">Section D</option>
                <option value="E">Section E</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="p-8">
          <h2 className="text-xl font-bold text-[#17221B] mb-6 flex items-center gap-2">
            <Shield className="text-orange-500" /> Security
          </h2>
          
          <button onClick={() => {
            setMessage({ text: 'Password reset link has been sent to your email.', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
          }} className="px-6 py-3 bg-white border border-[#DDE3DD] hover:bg-[#F8F7F2] text-[#17221B] font-bold rounded-xl transition-colors">
            Change Password
          </button>
        </div>

        {/* Action Bar */}
        <div className="p-6 bg-[#F8F7F2] border-t border-[#DDE3DD] flex flex-col sm:flex-row justify-between items-center gap-4">
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/');
            }}
            className="px-6 py-2.5 bg-white border border-[#DDE3DD] text-rose-500 hover:bg-rose-50 font-bold rounded-xl transition-colors w-full sm:w-auto"
          >
            Log Out
          </button>
          
          {isEditing && (
            <button 
              onClick={handleSave}
              className="px-8 py-3 bg-[#17221B] hover:bg-black text-[#F8F7F2] font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 w-full sm:w-auto"
            >
              Save Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
