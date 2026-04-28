import { useState, useEffect } from "react";
import { Trophy, Medal, Crown, TrendingUp, Loader2 } from "lucide-react";
import { useUser } from "../context/UserContext";
import { supabase } from "../../lib/supabaseClient";

interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  points: number;
  submissions: number;
  trend: string;
  isCurrentUser: boolean;
  avatar_url?: string;
}

export function Leaderboard() {
  const { id: currentUserId, points: currentUserPoints } = useUser();
  const [sortedData, setSortedData] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, username, points, submissions, avatar_url")
        .order("points", { ascending: false })
        .limit(50);

      if (data) {
        const users = data.map((u, index) => ({
          id: u.id,
          rank: index + 1,
          name: `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.username || "Anonymous",
          points: u.points || 0,
          submissions: u.submissions || 0,
          trend: "same", // Mocking trend for now
          isCurrentUser: u.id === currentUserId,
          avatar_url: u.avatar_url
        }));
        
        // If current user is not in top 50, fetch them specifically and add to the bottom
        if (currentUserId && !users.some(u => u.id === currentUserId)) {
          const { data: currentUserData } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, username, points, submissions, avatar_url")
            .eq("id", currentUserId)
            .single();
            
          if (currentUserData) {
            // Count how many people have more points to determine rank
            const { count } = await supabase
              .from("profiles")
              .select("*", { count: "exact", head: true })
              .gt("points", currentUserData.points || 0);
              
            users.push({
              id: currentUserData.id,
              rank: (count || 0) + 1,
              name: `${currentUserData.first_name || ""} ${currentUserData.last_name || ""}`.trim() || currentUserData.username || "Anonymous",
              points: currentUserData.points || 0,
              submissions: currentUserData.submissions || 0,
              trend: "same",
              isCurrentUser: true,
              avatar_url: currentUserData.avatar_url
            });
          }
        }
        
        setSortedData(users);
      }
      setIsLoading(false);
    };

    fetchLeaderboard();
  }, [currentUserId, currentUserPoints]);

  const currentUser = sortedData.find((u) => u.isCurrentUser) || {
    rank: 0, points: 0, submissions: 0
  };

  const getRankOrdinal = (rank: number) => {
    if (rank === 0) return "-";
    const suffix = ["th", "st", "nd", "rd"];
    const value = rank % 100;
    return rank + (suffix[(value - 20) % 10] || suffix[value] || suffix[0]);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-muted-foreground">#{rank}</span>;
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "up") {
      return <TrendingUp className="w-4 h-4 text-primary rotate-0" />;
    } else if (trend === "down") {
      return <TrendingUp className="w-4 h-4 text-destructive rotate-180" />;
    }
    return <div className="w-4 h-4" />;
  };

  const renderAvatar = (user: LeaderboardUser) => {
    if (user.avatar_url) {
      return <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover rounded-full" />;
    }
    return <span className="text-xl">👤</span>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-foreground mb-2">Leaderboard</h1>
        <p className="text-muted-foreground">
          Compete with others and climb to the top!
        </p>
      </div>

      {/* Top 3 Podium */}
      {sortedData.length >= 3 && (
        <div className="bg-gradient-to-br from-primary/5 to-accent/10 rounded-2xl p-6 border border-primary/20">
          <div className="grid grid-cols-3 gap-4 items-end max-w-2xl mx-auto">
            {/* 2nd Place */}
            {sortedData[1] && (
              <div className="text-center">
                <div className="bg-card rounded-xl p-4 border-2 border-gray-400 mb-2">
                  <Medal className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center overflow-hidden">
                    {renderAvatar(sortedData[1])}
                  </div>
                  <div className="text-sm text-card-foreground mb-1 truncate px-1">
                    {sortedData[1].name.split(" ")[0]}
                  </div>
                  <div className="text-xs text-primary">
                    {sortedData[1].points.toLocaleString()} pts
                  </div>
                </div>
                <div className="h-16 bg-gray-300 rounded-t-lg flex items-center justify-center">
                  <span className="text-2xl">🥈</span>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {sortedData[0] && (
              <div className="text-center">
                <div className="bg-card rounded-xl p-4 border-2 border-yellow-500 mb-2 shadow-lg">
                  <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <div className="w-12 h-12 bg-yellow-100 rounded-full mx-auto mb-2 flex items-center justify-center overflow-hidden">
                    {renderAvatar(sortedData[0])}
                  </div>
                  <div className="text-sm text-card-foreground mb-1 truncate px-1">
                    {sortedData[0].name.split(" ")[0]}
                  </div>
                  <div className="text-xs text-primary">
                    {sortedData[0].points.toLocaleString()} pts
                  </div>
                </div>
                <div className="h-24 bg-yellow-400 rounded-t-lg flex items-center justify-center">
                  <span className="text-2xl">🥇</span>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {sortedData[2] && (
              <div className="text-center">
                <div className="bg-card rounded-xl p-4 border-2 border-amber-600 mb-2">
                  <Medal className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <div className="w-12 h-12 bg-amber-100 rounded-full mx-auto mb-2 flex items-center justify-center overflow-hidden">
                    {renderAvatar(sortedData[2])}
                  </div>
                  <div className="text-sm text-card-foreground mb-1 truncate px-1">
                    {sortedData[2].name.split(" ")[0]}
                  </div>
                  <div className="text-xs text-primary">
                    {sortedData[2].points.toLocaleString()} pts
                  </div>
                </div>
                <div className="h-12 bg-amber-500 rounded-t-lg flex items-center justify-center">
                  <span className="text-2xl">🥉</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 bg-secondary border-b border-border">
          <h3 className="text-card-foreground">All Rankings</h3>
        </div>
        <div className="divide-y divide-border">
          {sortedData.map((user) => (
            <div
              key={user.id}
              className={`p-4 flex items-center justify-between transition-colors ${
                user.isCurrentUser
                  ? "bg-primary/5 border-l-4 border-primary"
                  : "hover:bg-secondary"
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 text-center flex items-center justify-center">
                  {getRankIcon(user.rank)}
                </div>
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {renderAvatar(user)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-card-foreground truncate">
                      {user.name}
                      {user.isCurrentUser && (
                        <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full whitespace-nowrap">
                          You
                        </span>
                      )}
                    </div>
                    {getTrendIcon(user.trend)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {user.submissions} submissions
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0 pl-4">
                <div className="text-primary font-medium">{user.points.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">points</div>
              </div>
            </div>
          ))}
          {sortedData.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No users found. Be the first to earn points!
            </div>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-card-foreground mb-4">Your Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-secondary rounded-lg">
            <div className="text-2xl text-primary mb-1">{getRankOrdinal(currentUser.rank)}</div>
            <div className="text-sm text-muted-foreground">Current Rank</div>
          </div>
          <div className="text-center p-4 bg-secondary rounded-lg">
            <div className="text-2xl text-primary mb-1">+{currentUser.submissions}</div>
            <div className="text-sm text-muted-foreground">Total Submissions</div>
          </div>
          <div className="text-center p-4 bg-secondary rounded-lg">
            <div className="text-2xl text-primary mb-1">
              {currentUser.rank > 1 && sortedData[currentUser.rank - 2]
                ? (sortedData[currentUser.rank - 2].points - currentUser.points).toLocaleString()
                : 0}
            </div>
            <div className="text-sm text-muted-foreground">To Next Rank</div>
          </div>
          <div className="text-center p-4 bg-secondary rounded-lg">
            <div className="text-2xl text-primary mb-1">Top {sortedData.length > 0 ? Math.max(1, Math.round((currentUser.rank / sortedData.length) * 100)) : 100}%</div>
            <div className="text-sm text-muted-foreground">Percentile</div>
          </div>
        </div>
      </div>
    </div>
  );
}
