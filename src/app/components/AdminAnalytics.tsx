import { useState, useEffect } from "react";
import { BarChart3, Loader2, TrendingUp, TrendingDown, Leaf, Users, Gift, Recycle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { supabase } from "../../lib/supabaseClient";

const CHART_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [submissionsData, setSubmissionsData] = useState<any[]>([]);
  const [wasteTypeData, setWasteTypeData] = useState<any[]>([]);
  const [rewardsData, setRewardsData] = useState<any[]>([]);
  
  // Summary Stats
  const [totalItems, setTotalItems] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);

    try {
      // 1. Fetch Submissions
      const { data: submissions } = await supabase
        .from("waste_submissions")
        .select("created_at, items, points_earned, waste_type")
        .order("created_at", { ascending: true });

      if (submissions) {
        let itemsSum = 0;
        let pointsSum = 0;
        const typeCount: Record<string, number> = {};
        const dailySub: Record<string, { date: string; items: number; points: number }> = {};

        submissions.forEach((s: any) => {
          itemsSum += s.items || 0;
          pointsSum += s.points_earned || 0;

          // Type distribution
          const t = s.waste_type || "Other";
          typeCount[t] = (typeCount[t] || 0) + (s.items || 1);

          // Daily trends
          const dateStr = new Date(s.created_at).toISOString().split('T')[0];
          if (!dailySub[dateStr]) {
            dailySub[dateStr] = { date: dateStr, items: 0, points: 0 };
          }
          dailySub[dateStr].items += s.items || 0;
          dailySub[dateStr].points += s.points_earned || 0;
        });

        setTotalItems(itemsSum);
        setTotalPoints(pointsSum);
        
        // Format for Pie Chart
        setWasteTypeData(Object.entries(typeCount).map(([name, value]) => ({ name, value })));
        
        // Format for Line Chart
        setSubmissionsData(Object.values(dailySub).slice(-30)); // Last 30 days
      }

      // 2. Fetch Active Users (Users who have made a submission)
      const { data: usersData } = await supabase
        .from("waste_submissions")
        .select("user_id");
        
      if (usersData) {
        const uniqueUsers = new Set(usersData.map((u: any) => u.user_id));
        setActiveUsers(uniqueUsers.size);
      }

      // 3. Fetch Rewards Claimed
      const { data: rewards } = await supabase
        .from("claimed_rewards")
        .select("created_at, points_cost")
        .order("created_at", { ascending: true });

      if (rewards) {
        const dailyRewards: Record<string, { date: string; redemptions: number; cost: number }> = {};
        rewards.forEach((r: any) => {
          const dateStr = new Date(r.created_at).toISOString().split('T')[0];
          if (!dailyRewards[dateStr]) {
            dailyRewards[dateStr] = { date: dateStr, redemptions: 0, cost: 0 };
          }
          dailyRewards[dateStr].redemptions += 1;
          dailyRewards[dateStr].cost += r.points_cost || 0;
        });
        setRewardsData(Object.values(dailyRewards).slice(-30));
      }

    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Deep dive into platform usage and environmental impact</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Total Items Recycled</span>
            <Recycle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-card-foreground">{totalItems.toLocaleString()}</div>
          <p className="text-xs text-emerald-500 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> Growing impact
          </p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Active Recyclers</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-card-foreground">{activeUsers}</div>
          <p className="text-xs text-muted-foreground mt-1">Unique users engaged</p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Points Rewarded</span>
            <Leaf className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-card-foreground">{totalPoints.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">Total points issued</p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Est. CO2 Saved (kg)</span>
            <BarChart3 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-card-foreground">{(totalItems * 0.45).toFixed(1)}</div>
          <p className="text-xs text-indigo-500 flex items-center gap-1 mt-1">
            <TrendingDown className="w-3 h-3" /> Carbon reduced
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submissions Trend */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Daily Recycling Volume</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={submissionsData}>
                <defs>
                  <linearGradient id="colorItems" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9ca3af" 
                  fontSize={12} 
                  tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} 
                />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  labelFormatter={(val) => new Date(val).toLocaleDateString()}
                />
                <Area type="monotone" dataKey="items" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorItems)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Waste Type Breakdown */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Waste Category Distribution</h3>
          <div className="h-[300px]">
            {wasteTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={wasteTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {wasteTypeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    formatter={(value: number) => [`${value} items`, 'Quantity']}
                  />
                  {/* Custom Legend */}
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {wasteTypeData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                <span>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rewards Redemptions */}
        <div className="bg-card border border-border rounded-xl p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Reward Redemptions Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rewardsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9ca3af" 
                  fontSize={12}
                  tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} 
                />
                <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  labelFormatter={(val) => new Date(val).toLocaleDateString()}
                />
                <Bar yAxisId="left" dataKey="redemptions" name="Redemptions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="cost" name="Points Spent" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
