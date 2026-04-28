import { useState, useEffect } from "react";
import { Users, Recycle, Gift, TrendingUp, Coins, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { supabase } from "../../lib/supabaseClient";

interface UserProfile {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  points: number;
  level: number;
  submissions: number;
  items_recycled: number;
  avatar_url: string;
}

const CHART_COLORS = ["#2d7a4f", "#52b788", "#95d5b2", "#b7e4c7", "#d8f3dc"];

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [totalRewards, setTotalRewards] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [wasteTypeData, setWasteTypeData] = useState<any[]>([]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    // Fetch all users
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .order("points", { ascending: false });

    if (profiles) {
      setUsers(profiles);
      setTotalPoints(profiles.reduce((sum: number, u: any) => sum + (u.points || 0), 0));
    }

    // Fetch all submissions
    const { data: submissions } = await supabase
      .from("waste_submissions")
      .select("*")
      .order("created_at", { ascending: true });

    if (submissions) {
      setTotalSubmissions(submissions.length);

      // Group by month
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const grouped: Record<string, { submissions: number; points: number }> = {};
      submissions.forEach((s: any) => {
        const d = new Date(s.created_at);
        const m = months[d.getMonth()];
        if (!grouped[m]) grouped[m] = { submissions: 0, points: 0 };
        grouped[m].submissions++;
        grouped[m].points += s.points_earned || 0;
      });

      const currentMonthIndex = new Date().getMonth();
      const chartData = [];
      for (let i = 5; i >= 0; i--) {
        let idx = currentMonthIndex - i;
        if (idx < 0) idx += 12;
        const monthName = months[idx];
        chartData.push({
          month: monthName,
          submissions: grouped[monthName]?.submissions || 0,
          points: grouped[monthName]?.points || 0,
        });
      }
      setMonthlyData(chartData);

      // Group by waste type
      const typeCount: Record<string, number> = {};
      submissions.forEach((s: any) => {
        const t = s.waste_type || "Other";
        typeCount[t] = (typeCount[t] || 0) + 1;
      });
      setWasteTypeData(
        Object.entries(typeCount).map(([name, value]) => ({ name, value }))
      );
    }

    // Fetch rewards claimed
    const { data: rewards } = await supabase.from("claimed_rewards").select("id");
    if (rewards) setTotalRewards(rewards.length);

    setLoading(false);
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
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of all system activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Total Users</span>
            <Users className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-card-foreground">{users.length}</div>
          <div className="flex items-center gap-1 text-sm text-emerald-500 mt-1">
            <ArrowUpRight className="w-4 h-4" /> Active accounts
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Total Submissions</span>
            <Recycle className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-card-foreground">{totalSubmissions}</div>
          <div className="flex items-center gap-1 text-sm text-emerald-500 mt-1">
            <ArrowUpRight className="w-4 h-4" /> Waste deposits
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Rewards Claimed</span>
            <Gift className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-card-foreground">{totalRewards}</div>
          <div className="flex items-center gap-1 text-sm text-emerald-500 mt-1">
            <ArrowUpRight className="w-4 h-4" /> Redeemed
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Total Points</span>
            <Coins className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-card-foreground">{totalPoints.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-sm text-emerald-500 mt-1">
            <TrendingUp className="w-4 h-4" /> In circulation
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submissions Over Time */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-card-foreground font-semibold mb-4">Submissions Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6f4ed" />
              <XAxis dataKey="month" stroke="#5a7c6d" />
              <YAxis stroke="#5a7c6d" />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e6f4ed", borderRadius: "8px" }} />
              <Bar dataKey="submissions" fill="#2d7a4f" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Waste Type Distribution */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-card-foreground font-semibold mb-4">Waste Type Distribution</h3>
          {wasteTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={wasteTypeData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {wasteTypeData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">No data yet</div>
          )}
        </div>
      </div>

      {/* Points Trend */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-card-foreground font-semibold mb-4">Points Distributed Over Time</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6f4ed" />
            <XAxis dataKey="month" stroke="#5a7c6d" />
            <YAxis stroke="#5a7c6d" />
            <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e6f4ed", borderRadius: "8px" }} />
            <Line type="monotone" dataKey="points" stroke="#2d7a4f" strokeWidth={3} dot={{ fill: "#2d7a4f", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* User Table */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-card-foreground font-semibold mb-4">All Users ({users.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-sm font-medium text-muted-foreground">#</th>
                <th className="pb-3 text-sm font-medium text-muted-foreground">User</th>
                <th className="pb-3 text-sm font-medium text-muted-foreground">Points</th>
                <th className="pb-3 text-sm font-medium text-muted-foreground">Level</th>
                <th className="pb-3 text-sm font-medium text-muted-foreground">Submissions</th>
                <th className="pb-3 text-sm font-medium text-muted-foreground">Items</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {users.map((user, idx) => (
                <tr key={user.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                  <td className="py-3 text-muted-foreground">{idx + 1}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center overflow-hidden">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm text-emerald-600">
                            {(user.first_name || user.username || "?")[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-card-foreground">
                          {`${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username || "Anonymous"}
                        </div>
                        <div className="text-xs text-muted-foreground">@{user.username || "user"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-card-foreground font-medium">{(user.points || 0).toLocaleString()}</td>
                  <td className="py-3"><span className="bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded-md text-xs font-medium">Lv. {user.level || 1}</span></td>
                  <td className="py-3 text-card-foreground">{user.submissions || 0}</td>
                  <td className="py-3 text-card-foreground">{user.items_recycled || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
