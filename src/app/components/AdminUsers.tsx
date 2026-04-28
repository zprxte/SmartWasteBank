import { useState, useEffect } from "react";
import { Loader2, Search, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("points", { ascending: false });
    if (data) setUsers(data);
    setLoading(false);
  };

  const filtered = users.filter(
    (u) =>
      (u.first_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.last_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.username || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">{users.length} registered users</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search users by name or username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-foreground"
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary">
              <tr>
                <th className="px-6 py-3 text-sm font-medium text-muted-foreground">#</th>
                <th className="px-6 py-3 text-sm font-medium text-muted-foreground">User</th>
                <th className="px-6 py-3 text-sm font-medium text-muted-foreground">Points</th>
                <th className="px-6 py-3 text-sm font-medium text-muted-foreground">Level</th>
                <th className="px-6 py-3 text-sm font-medium text-muted-foreground">Submissions</th>
                <th className="px-6 py-3 text-sm font-medium text-muted-foreground">Items</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, idx) => (
                <tr key={user.id} className="border-t border-border hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-muted-foreground">{idx + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center overflow-hidden">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm text-emerald-600 font-medium">
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
                  <td className="px-6 py-4 font-medium text-card-foreground">{(user.points || 0).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="bg-emerald-500/10 text-emerald-600 px-2.5 py-1 rounded-lg text-xs font-medium">
                      Lv. {user.level || 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-card-foreground">{user.submissions || 0}</td>
                  <td className="px-6 py-4 text-card-foreground">{user.items_recycled || 0}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No users found
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
