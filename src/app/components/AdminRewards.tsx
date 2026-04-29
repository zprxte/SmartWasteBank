import { useState, useEffect, useRef } from "react";
import { Loader2, Gift, Pencil, Trash2, X, Check, Search, Bell } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { toast } from "sonner";

interface ClaimedRewardRow {
  id: string;
  user_id: string;
  reward_name: string;
  points_cost: number;
  coupon_code: string | null;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    username: string;
  };
}

export function AdminRewards() {
  const [loading, setLoading] = useState(true);
  const [claimed, setClaimed] = useState<ClaimedRewardRow[]>([]);
  const [search, setSearch] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ reward_name: "", points_cost: 0, coupon_code: "" });

  // Delete confirm
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Notification state
  const [newClaimCount, setNewClaimCount] = useState(0);
  const initialLoadDone = useRef(false);

  useEffect(() => {
    fetchClaimed();

    // Subscribe to Supabase Realtime for new claimed_rewards
    const channel = supabase
      .channel('admin-rewards-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'claimed_rewards' },
        async (payload: any) => {
          if (!initialLoadDone.current) return;

          const newReward = payload.new;

          // Try to get user info for the toast
          let userName = 'A user';
          if (newReward.user_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('first_name, last_name, username')
              .eq('id', newReward.user_id)
              .single();
            if (profile) {
              userName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username || 'A user';
            }
          }

          // Show toast notification
          toast.success(`🎁 New Reward Claimed!`, {
            description: `${userName} claimed "${newReward.reward_name}" for ${newReward.points_cost} points`,
            duration: 8000,
          });

          // Update badge count
          setNewClaimCount((prev) => prev + 1);

          // Play notification sound
          try {
            const audio = new Audio('data:audio/wav;base64,UklGRl4FAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToFAABkAGgAbABwAHQAeAB8AIAAhACIAIwAkACUAJgAnACgAKQAqACsALAAtAC4ALwAwADEAMgAzADQANQA0ADQANAA0ADQANAA0ADMANAA0ADMAMgAxADAALwAuACsAKgApACgAJwAmACUAJAAjACIAIQAgAB8AHgAdAB0AHAAcABsAGgAaABkAGQAYABgAGAAXABcAFgAWABUAFQAUABQAFAAUABMAEwATABMAEgASABIAEQARABEAEQAQABAAEAAQABAADwAPAA8ADwAPAA4ADgAOAA4ADgAOAA0ADQANAA0ADQANAA0ADAAMAAwADAAMAAwADAAMAAsACwALAAsACwALAAsACgAKAAoACgAKAAoACgAKAAoACQAJAAkACQAJAAkACQAJAAkACQAIAAgACAAIAAgACAAIAAgACAAIAAgABwAHAAcABwAHAAcABwAHAAcABwAHAAcABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwACwALAAsACwALAAsACwALAAsACwALAAsACwALAAsACwALAAsACwAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAA==');
            audio.volume = 0.3;
            audio.play().catch(() => {});
          } catch (_) {}

          // Refresh the list
          await fetchClaimed();
        }
      )
      .subscribe();

    // Mark initial load complete after a short delay
    setTimeout(() => { initialLoadDone.current = true; }, 2000);

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchClaimed = async () => {
    const { data } = await supabase
      .from("claimed_rewards")
      .select("*, profiles(first_name, last_name, username)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (data) setClaimed(data as ClaimedRewardRow[]);
    setLoading(false);
  };

  const startEdit = (reward: ClaimedRewardRow) => {
    setEditingId(reward.id);
    setEditForm({
      reward_name: reward.reward_name,
      points_cost: reward.points_cost,
      coupon_code: reward.coupon_code || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: string) => {
    const { error } = await supabase
      .from("claimed_rewards")
      .update({
        reward_name: editForm.reward_name,
        points_cost: editForm.points_cost,
        coupon_code: editForm.coupon_code || null,
      })
      .eq("id", id);

    if (error) {
      alert("Failed to update: " + error.message);
    } else {
      setEditingId(null);
      await fetchClaimed();
    }
  };

  const confirmDelete = async (id: string) => {
    const { error } = await supabase.from("claimed_rewards").delete().eq("id", id);
    if (error) {
      alert("Failed to delete: " + error.message);
    } else {
      setDeletingId(null);
      await fetchClaimed();
    }
  };

  const filtered = claimed.filter((r) => {
    const profile: any = r.profiles;
    const userName = profile
      ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || profile.username || ""
      : "";
    return (
      r.reward_name.toLowerCase().includes(search.toLowerCase()) ||
      userName.toLowerCase().includes(search.toLowerCase()) ||
      (r.coupon_code || "").toLowerCase().includes(search.toLowerCase())
    );
  });

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
          <h1 className="text-2xl font-bold text-foreground">Claimed Rewards</h1>
          <p className="text-muted-foreground">Manage all rewards claimed by users</p>
        </div>
        <button
          onClick={() => setNewClaimCount(0)}
          className="relative p-3 rounded-xl bg-card border border-border hover:bg-secondary transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5 text-card-foreground" />
          {newClaimCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {newClaimCount > 9 ? '9+' : newClaimCount}
            </span>
          )}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by reward name, user, or coupon code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-foreground"
        />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary">
              <tr>
                <th className="px-6 py-3 text-sm font-medium text-muted-foreground">#</th>
                <th className="px-6 py-3 text-sm font-medium text-muted-foreground">User</th>
                <th className="px-6 py-3 text-sm font-medium text-muted-foreground">Reward</th>
                <th className="px-6 py-3 text-sm font-medium text-muted-foreground">Points</th>
                <th className="px-6 py-3 text-sm font-medium text-muted-foreground">Coupon</th>
                <th className="px-6 py-3 text-sm font-medium text-muted-foreground">Date</th>
                <th className="px-6 py-3 text-sm font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => {
                const profile: any = r.profiles;
                const userName = profile
                  ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || profile.username || "Anonymous"
                  : "Unknown";
                const isEditing = editingId === r.id;
                const isDeleting = deletingId === r.id;

                return (
                  <tr key={r.id} className="border-t border-border hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-muted-foreground">{idx + 1}</td>
                    <td className="px-6 py-4 font-medium text-card-foreground">{userName}</td>

                    {/* Reward Name */}
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.reward_name}
                          onChange={(e) => setEditForm({ ...editForm, reward_name: e.target.value })}
                          className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <Gift className="w-4 h-4 text-emerald-500" />
                          <span className="text-card-foreground">{r.reward_name}</span>
                        </div>
                      )}
                    </td>

                    {/* Points Cost */}
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.points_cost}
                          onChange={(e) => setEditForm({ ...editForm, points_cost: parseInt(e.target.value) || 0 })}
                          className="w-24 px-3 py-1.5 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      ) : (
                        <span className="text-red-500 font-medium">-{r.points_cost}</span>
                      )}
                    </td>

                    {/* Coupon Code */}
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.coupon_code}
                          onChange={(e) => setEditForm({ ...editForm, coupon_code: e.target.value })}
                          className="w-36 px-3 py-1.5 bg-background border border-border rounded-lg text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      ) : (
                        <span className="font-mono text-xs bg-secondary px-2 py-1 rounded text-muted-foreground">
                          {r.coupon_code || "N/A"}
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-muted-foreground text-sm">
                      {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => saveEdit(r.id)}
                              className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                              title="Save"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-2 rounded-lg bg-gray-500/10 text-gray-500 hover:bg-gray-500/20 transition-colors"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : isDeleting ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-red-500">Delete?</span>
                            <button
                              onClick={() => confirmDelete(r.id)}
                              className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                              title="Confirm delete"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingId(null)}
                              className="p-2 rounded-lg bg-gray-500/10 text-gray-500 hover:bg-gray-500/20 transition-colors"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(r)}
                              className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingId(r.id)}
                              className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    {search ? "No matching rewards found" : "No rewards claimed yet"}
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
