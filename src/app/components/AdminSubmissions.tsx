import { useState, useEffect } from "react";
import { Loader2, Recycle } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export function AdminSubmissions() {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    const { data } = await supabase
      .from("waste_submissions")
      .select("*, profiles(first_name, last_name, username)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (data) setSubmissions(data);
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
        <h1 className="text-2xl font-bold text-foreground">All Submissions</h1>
        <p className="text-muted-foreground">Recent waste submissions from all users</p>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary">
              <tr>
                <th className="px-6 py-3 text-sm font-medium text-muted-foreground">#</th>
                <th className="px-6 py-3 text-sm font-medium text-muted-foreground">User</th>
                <th className="px-6 py-3 text-sm font-medium text-muted-foreground">Waste Type</th>
                <th className="px-6 py-3 text-sm font-medium text-muted-foreground">Items</th>
                <th className="px-6 py-3 text-sm font-medium text-muted-foreground">Points</th>
                <th className="px-6 py-3 text-sm font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub, idx) => {
                const profile: any = sub.profiles;
                const userName = profile
                  ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || profile.username || "Anonymous"
                  : "Unknown";
                return (
                  <tr key={sub.id} className="border-t border-border hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-muted-foreground">{idx + 1}</td>
                    <td className="px-6 py-4 font-medium text-card-foreground">{userName}</td>
                    <td className="px-6 py-4">
                      <span className="bg-emerald-500/10 text-emerald-600 px-2.5 py-1 rounded-lg text-xs font-medium">
                        {sub.waste_type || "General"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-card-foreground">{sub.items}</td>
                    <td className="px-6 py-4 text-emerald-600 font-medium">+{sub.points_earned}</td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">
                      {new Date(sub.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                );
              })}
              {submissions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No submissions yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
