import { useState } from "react";
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
  Leaf
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useUser } from "../context/UserContext";

const monthlyData = [
  { month: "Jan", waste: 8.5 },
  { month: "Feb", waste: 12.2 },
  { month: "Mar", waste: 15.8 },
  { month: "Apr", waste: 18.5 },
  { month: "May", waste: 22.3 },
  { month: "Jun", waste: 12.7 },
];

const achievements = [
  { id: 1, name: "First Step", description: "Complete first submission", date: "Jan 15, 2026", icon: "🌱" },
  { id: 2, name: "Eco Warrior", description: "10 waste submissions", date: "Feb 3, 2026", icon: "⚔️" },
  { id: 3, name: "Green Champion", description: "50 waste submissions", date: "Mar 12, 2026", icon: "🏆" },
  { id: 4, name: "Recycling Master", description: "25kg total waste", date: "Mar 10, 2026", icon: "♻️" },
];

const impactStats = [
  { label: "CO2 Saved", value: "152 kg", icon: Leaf, color: "text-primary" },
  { label: "Trees Saved", value: "12", icon: Target, color: "text-primary" },
  { label: "Energy Saved", value: "340 kWh", icon: TrendingUp, color: "text-primary" },
  { label: "Water Saved", value: "890 L", icon: Recycle, color: "text-primary" },
];

export function Profile() {
  const { points, level, submissions, totalWeight, rank } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: "IceKung",
    email: "icekung@email.com",
    location: "San Francisco, CA",
    joinDate: "January 15, 2026",
  });

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-primary to-[#1e5f3d] rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-4 border-white/30">
              <span className="text-5xl">👤</span>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl text-white mb-2">{userData.name}</h1>
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
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <span className="text-sm">Level {level}</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <span className="text-sm">{points.toLocaleString()} Points</span>
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
            <span className="text-muted-foreground">Total Waste</span>
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl text-card-foreground mb-1">{totalWeight.toFixed(1)} kg</div>
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
        <h3 className="text-card-foreground mb-4">Monthly Waste Recycled</h3>
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
          {achievements.map((achievement) => (
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
          ))}
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-card-foreground mb-4">Account Settings</h3>
        <div className="space-y-3">
          <button className="w-full text-left px-4 py-3 bg-secondary rounded-lg hover:bg-accent transition-colors">
            <div className="text-card-foreground mb-1">Notification Preferences</div>
            <div className="text-sm text-muted-foreground">Manage email and push notifications</div>
          </button>
          <button className="w-full text-left px-4 py-3 bg-secondary rounded-lg hover:bg-accent transition-colors">
            <div className="text-card-foreground mb-1">Privacy Settings</div>
            <div className="text-sm text-muted-foreground">Control your data and visibility</div>
          </button>
          <button className="w-full text-left px-4 py-3 bg-secondary rounded-lg hover:bg-accent transition-colors">
            <div className="text-card-foreground mb-1">Connected Accounts</div>
            <div className="text-sm text-muted-foreground">Link social media and payment methods</div>
          </button>
        </div>
      </div>
    </div>
  );
}
