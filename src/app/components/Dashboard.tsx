import { Link } from "react-router";
import {
  Coins,
  TrendingUp,
  Award,
  Recycle,
  Target,
  Zap,
  Trophy,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useUser } from "../context/UserContext";

// Mock data
const pointsData = [
  { month: "Jan", points: 240 },
  { month: "Feb", points: 380 },
  { month: "Mar", points: 520 },
  { month: "Apr", points: 680 },
  { month: "May", points: 850 },
  { month: "Jun", points: 1250 },
];

const badges = [
  { id: 1, name: "First Step", icon: "🌱", description: "First waste submission", unlocked: true },
  { id: 2, name: "Eco Warrior", icon: "⚔️", description: "10 submissions", unlocked: true },
  { id: 3, name: "Green Champion", icon: "🏆", description: "50 submissions", unlocked: true },
  { id: 4, name: "Planet Saver", icon: "🌍", description: "100 submissions", unlocked: false },
];

const recentActivity = [
  { id: 1, type: "Plastic Bottles", weight: "2.5 kg", points: 125, date: "2 hours ago" },
  { id: 2, type: "Paper/Cardboard", weight: "5.0 kg", points: 200, date: "1 day ago" },
  { id: 3, type: "Metal Cans", weight: "1.2 kg", points: 80, date: "2 days ago" },
];

export function Dashboard() {
  const { points: userPoints, level: userLevel, submissions: totalSubmissions, totalWeight } = useUser();
  const nextLevelPoints = (userLevel) * 500;

  const levelProgress = ((userPoints % 500) / 500) * 100;

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[#1e5f3d] p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="mb-2">Welcome back, IceKung! 👋</h2>
              <p className="text-white/90 max-w-md">
                You're making a real difference! Keep up the great work protecting our planet.
              </p>
            </div>
            <Sparkles className="w-8 h-8 text-accent" />
          </div>
          <div className="mt-6 flex items-center gap-4">
            <Link
              to="/submit"
              className="bg-white text-primary px-6 py-3 rounded-lg hover:bg-white/90 transition-colors inline-flex items-center gap-2"
            >
              Submit Waste
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mb-24" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Total Points</span>
            <Coins className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl text-card-foreground">{userPoints.toLocaleString()}</div>
          <div className="text-sm text-primary mt-1 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            +150 this week
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Current Level</span>
            <Award className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl text-card-foreground">Level {userLevel}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {nextLevelPoints - userPoints} pts to next level
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Submissions</span>
            <Recycle className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl text-card-foreground">{totalSubmissions}</div>
          <div className="text-sm text-primary mt-1">53 to next badge</div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">This Month</span>
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl text-card-foreground">{totalWeight.toFixed(1)} kg</div>
          <div className="text-sm text-muted-foreground mt-1">Waste recycled</div>
        </div>
      </div>

      {/* Level Progress */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-card-foreground">Level Progress</h3>
            <p className="text-sm text-muted-foreground">Level {userLevel} → Level {userLevel + 1}</p>
          </div>
          <Zap className="w-6 h-6 text-primary" />
        </div>
        <div className="relative w-full h-3 bg-secondary rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-[#52b788] rounded-full transition-all duration-500"
            style={{ width: `${levelProgress}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-sm">
          <span className="text-muted-foreground">{userPoints} pts</span>
          <span className="text-muted-foreground">{nextLevelPoints} pts</span>
        </div>
      </div>

      {/* Charts and Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Points Chart */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="mb-4 text-card-foreground">Points Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={pointsData}>
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
              <Line
                type="monotone"
                dataKey="points"
                stroke="#2d7a4f"
                strokeWidth={3}
                dot={{ fill: "#2d7a4f", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Badges */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-card-foreground">Achievements</h3>
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 rounded-lg border transition-all ${
                  badge.unlocked
                    ? "bg-secondary border-primary/30 shadow-sm"
                    : "bg-muted/50 border-border opacity-50"
                }`}
              >
                <div className="text-3xl mb-2">{badge.icon}</div>
                <div className="text-sm text-card-foreground">{badge.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{badge.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="mb-4 text-card-foreground">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4 bg-secondary rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Recycle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-card-foreground">{activity.type}</div>
                  <div className="text-sm text-muted-foreground">{activity.weight} • {activity.date}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-primary">
                <Coins className="w-4 h-4" />
                <span>+{activity.points}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
