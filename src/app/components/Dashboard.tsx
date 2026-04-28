import { useState, useEffect } from "react";
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
  Sparkles,
  Loader2
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useUser } from "../context/UserContext";
import { supabase } from "../../lib/supabaseClient";
import { getPointsForLevel } from "../../lib/levelUtils";

interface ChartData {
  month: string;
  points: number;
}

interface RecentActivity {
  id: string;
  type: string;
  items: string;
  points: number;
  date: string;
}

export function Dashboard() {
  const { id: userId, points: userPoints, level: userLevel, submissions: totalSubmissions, items, totalEarned } = useUser();
  const [userName, setUserName] = useState("User");
  const [isLoading, setIsLoading] = useState(true);
  const [pointsData, setPointsData] = useState<ChartData[]>([
    { month: "Jan", points: 0 }, { month: "Feb", points: 0 }, { month: "Mar", points: 0 },
    { month: "Apr", points: 0 }, { month: "May", points: 0 }, { month: "Jun", points: 0 }
  ]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  // Dynamically compute badges based on real user stats
  const badges = [
    { id: 1, name: "First Step", icon: "🌱", description: "First waste submission", unlocked: totalSubmissions >= 1 },
    { id: 2, name: "Eco Warrior", icon: "⚔️", description: "10 submissions", unlocked: totalSubmissions >= 10 },
    { id: 3, name: "Green Champion", icon: "🏆", description: "50 submissions", unlocked: totalSubmissions >= 50 },
    { id: 4, name: "Planet Saver", icon: "🌍", description: "100 submissions", unlocked: totalSubmissions >= 100 },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userId) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const meta = user.user_metadata || {};
        const name = meta.first_name || meta.username || "User";
        setUserName(name);
      }

      // Fetch recent submissions
      const { data } = await supabase
        .from('waste_submissions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      const submissionsData: any[] = data || [];

      if (submissionsData.length > 0) {
        // Format recent activity
        const recent = submissionsData.slice(0, 5).map(sub => {
          const d = new Date(sub.created_at);
          return {
            id: sub.id,
            type: sub.waste_type,
            items: `${sub.items} items`,
            points: sub.points_earned,
            date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
          };
        });
        setRecentActivity(recent);

        // Group points by month for chart
        const monthlyPoints: Record<string, number> = {};
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        submissionsData.forEach(sub => {
          const d = new Date(sub.created_at);
          const m = months[d.getMonth()];
          monthlyPoints[m] = (monthlyPoints[m] || 0) + sub.points_earned;
        });

        // Ensure we show at least the last 6 months including current
        const currentMonthIndex = new Date().getMonth();
        const newChartData: ChartData[] = [];
        for (let i = 5; i >= 0; i--) {
          let idx = currentMonthIndex - i;
          if (idx < 0) idx += 12;
          const monthName = months[idx];
          newChartData.push({
            month: monthName,
            points: monthlyPoints[monthName] || 0
          });
        }
        setPointsData(newChartData);
      }
      setIsLoading(false);
    };
    fetchDashboardData();
  }, [userId, userPoints]); // Re-run when points change

  const currentLevelBasePoints = getPointsForLevel(userLevel);
  const nextLevelPoints = getPointsForLevel(userLevel + 1);
  const pointsNeededForThisLevel = nextLevelPoints - currentLevelBasePoints;
  const currentLevelProgressPoints = totalEarned - currentLevelBasePoints;
  const levelProgress = Math.min(100, Math.max(0, (currentLevelProgressPoints / pointsNeededForThisLevel) * 100));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[#1e5f3d] p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="mb-2">Welcome back, {userName}! 👋</h2>
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
            Your current balance
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Current Level</span>
            <Award className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl text-card-foreground">Level {userLevel}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {Math.max(0, nextLevelPoints - totalEarned)} pts to next level
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Submissions</span>
            <Recycle className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl text-card-foreground">{totalSubmissions}</div>
          <div className="text-sm text-primary mt-1 flex items-center gap-1">
             <Trophy className="w-4 h-4" /> Keep it up!
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Total Items</span>
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl text-card-foreground">{items} items</div>
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
          <span className="text-muted-foreground">{totalEarned} pts</span>
          <span className="text-muted-foreground">{nextLevelPoints} pts</span>
        </div>
      </div>

      {/* Charts and Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Points Chart */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="mb-4 text-card-foreground">Points Earned Over Time</h3>
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
                className={`p-4 rounded-lg border transition-all ${badge.unlocked
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
          {recentActivity.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground bg-secondary rounded-lg">
              No recent activity. Start submitting waste to earn points!
            </div>
          ) : (
            recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 bg-secondary rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Recycle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-card-foreground font-medium">{activity.type}</div>
                    <div className="text-sm text-muted-foreground">{activity.items} • {activity.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-primary font-medium">
                  <Coins className="w-4 h-4" />
                  <span>+{activity.points}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
