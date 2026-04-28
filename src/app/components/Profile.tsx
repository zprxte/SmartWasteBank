import { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Edit2,
  Award,
  Recycle,
  TrendingUp,
  Target,
  Leaf,
  Check,
  X,
  Camera,
  Loader2
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useUser } from "../context/UserContext";
import { supabase } from "../../lib/supabaseClient";

export function Profile() {
  const { id: userId, points, level, submissions, items, rank } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [userData, setUserData] = useState({
    name: "Loading...",
    email: "Loading...",
    location: "Loading...",
    joinDate: "Loading...",
    avatar_url: ""
  });

  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    location: "",
  });

  const [monthlyData, setMonthlyData] = useState<{month: string, waste: number}[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const meta = user.user_metadata || {};
        
        // Fetch from profiles to get avatar_url
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', userId)
          .single();

        setUserData({
          name: `${meta.first_name || ''} ${meta.last_name || ''}`.trim() || meta.username || 'No Name Set',
          email: user.email || '',
          location: meta.location || 'Not specified',
          joinDate: new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          avatar_url: profile?.avatar_url || meta.avatar_url || ""
        });
        
        setEditForm({
          firstName: meta.first_name || '',
          lastName: meta.last_name || '',
          location: meta.location || '',
        });
      }

      // Fetch submissions for monthly chart and achievements
      const { data } = await supabase
        .from('waste_submissions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true }); // chronological

      const submissionsData: any[] = data || [];

      if (submissionsData.length > 0) {
        // Group points by month for chart (we'll count items here)
        const monthlyItems: Record<string, number> = {};
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        submissionsData.forEach(sub => {
          const d = new Date(sub.created_at);
          const m = months[d.getMonth()];
          monthlyItems[m] = (monthlyItems[m] || 0) + sub.items;
        });

        const currentMonthIndex = new Date().getMonth();
        const newChartData = [];
        for (let i = 5; i >= 0; i--) {
          let idx = currentMonthIndex - i;
          if (idx < 0) idx += 12;
          const monthName = months[idx];
          newChartData.push({
            month: monthName,
            waste: monthlyItems[monthName] || 0
          });
        }
        setMonthlyData(newChartData);

        // Generate dynamic achievements based on real data
        const dynamicAchievements = [];
        if (submissionsData.length >= 1) {
          dynamicAchievements.push({ id: 1, name: "First Step", description: "Complete first submission", date: new Date(submissionsData[0].created_at).toLocaleDateString(), icon: "🌱" });
        }
        if (submissionsData.length >= 10) {
          dynamicAchievements.push({ id: 2, name: "Eco Warrior", description: "10 waste submissions", date: new Date(submissionsData[9].created_at).toLocaleDateString(), icon: "⚔️" });
        }
        if (submissionsData.length >= 50) {
          dynamicAchievements.push({ id: 3, name: "Green Champion", description: "50 waste submissions", date: new Date(submissionsData[49].created_at).toLocaleDateString(), icon: "🏆" });
        }
        
        // Items recycled achievement
        let totalItemsCount = 0;
        let itemsAchievementDate = null;
        for (let sub of submissionsData) {
          totalItemsCount += sub.items;
          if (totalItemsCount >= 25 && !itemsAchievementDate) {
            itemsAchievementDate = new Date(sub.created_at).toLocaleDateString();
          }
        }
        if (itemsAchievementDate) {
          dynamicAchievements.push({ id: 4, name: "Recycling Master", description: "25 items recycled", date: itemsAchievementDate, icon: "♻️" });
        }
        
        setAchievements(dynamicAchievements.reverse()); // latest first
      }

      setLoading(false);
    };
    fetchUserData();
  }, [userId, items]);

  const handleSave = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.updateUser({
      data: {
        first_name: editForm.firstName,
        last_name: editForm.lastName,
        location: editForm.location,
      }
    });

    if (!error && data.user) {
      // Also update profiles table
      await supabase.from('profiles').update({
        first_name: editForm.firstName,
        last_name: editForm.lastName,
      }).eq('id', userId);

      const meta = data.user.user_metadata;
      setUserData({
        ...userData,
        name: `${meta.first_name || ''} ${meta.last_name || ''}`.trim() || 'No Name Set',
        location: meta.location || 'Not specified',
      });
      setIsEditing(false);
    } else {
      alert("Error updating profile: " + (error?.message || "Unknown error"));
    }
    setLoading(false);
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Save to profiles table
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId);
      
      // Fallback: Save to auth metadata so it persists even if DB insert failed
      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      setUserData(prev => ({ ...prev, avatar_url: publicUrl }));
      
    } catch (error: any) {
      alert('Error uploading avatar: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Environmental impact multipliers
  const impactStats = [
    { label: "CO2 Saved", value: `${(items * 1.5).toFixed(1)} kg`, icon: Leaf, color: "text-primary" },
    { label: "Trees Saved", value: Math.floor(items * 0.1).toString(), icon: Target, color: "text-primary" },
    { label: "Energy Saved", value: `${(items * 3.2).toFixed(1)} kWh`, icon: TrendingUp, color: "text-primary" },
    { label: "Water Saved", value: `${(items * 8.5).toFixed(1)} L`, icon: Recycle, color: "text-primary" },
  ];

  if (loading && !userData.email) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-primary to-[#1e5f3d] rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            
            {/* Avatar Section */}
            <div className="relative group">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-4 border-white/30 overflow-hidden">
                {userData.avatar_url ? (
                  <img src={userData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl">👤</span>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
              >
                {uploading ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : <Camera className="w-6 h-6 text-white" />}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={uploadAvatar} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="w-full">
                  {isEditing ? (
                    <div className="space-y-3 max-w-sm">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="First Name"
                          value={editForm.firstName}
                          onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                          className="w-full px-3 py-1.5 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                        />
                        <input
                          type="text"
                          placeholder="Last Name"
                          value={editForm.lastName}
                          onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                          className="w-full px-3 py-1.5 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Location"
                        value={editForm.location}
                        onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                        className="w-full px-3 py-1.5 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                      />
                    </div>
                  ) : (
                    <>
                      <h1 className="text-2xl font-bold text-white mb-2">{userData.name}</h1>
                      <div className="space-y-1 text-white/90">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span className="text-sm">{userData.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{userData.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">Joined {userData.joinDate}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-green-500/80 hover:bg-green-500 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        {loading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        disabled={loading}
                        className="bg-red-500/80 hover:bg-red-500 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <span className="text-sm font-medium">Level {level}</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <span className="text-sm font-medium">{points.toLocaleString()} Points</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Total Submissions</span>
            <Recycle className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl text-card-foreground mb-1">{submissions}</div>
          <div className="text-sm text-muted-foreground">Waste deposits</div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Total Items</span>
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl text-card-foreground mb-1">{items} items</div>
          <div className="text-sm text-muted-foreground">Recycled materials</div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Rank</span>
            <Award className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl text-card-foreground mb-1">#{rank}</div>
          <div className="text-sm text-muted-foreground">In leaderboard</div>
        </div>
      </div>

      {/* Environmental Impact */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-card-foreground mb-4">Your Environmental Impact 🌍</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {impactStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center p-4 bg-secondary rounded-lg">
                <Icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                <div className="text-xl text-card-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Activity Chart */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-card-foreground mb-4">Monthly Waste Recycled (Items)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6f4ed" />
            <XAxis dataKey="month" stroke="#5a7c6d" />
            <YAxis stroke="#5a7c6d" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e6f4ed",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="waste" fill="#2d7a4f" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Achievements */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-card-foreground">Recent Achievements</h3>
          <Award className="w-5 h-5 text-primary" />
        </div>
        <div className="space-y-3">
          {achievements.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground bg-secondary rounded-lg">
              No achievements yet. Keep recycling to unlock them!
            </div>
          ) : (
            achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center gap-4 p-4 bg-secondary rounded-lg"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className="text-card-foreground mb-1">{achievement.name}</div>
                  <div className="text-sm text-muted-foreground">{achievement.description}</div>
                </div>
                <div className="text-sm text-muted-foreground">{achievement.date}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
