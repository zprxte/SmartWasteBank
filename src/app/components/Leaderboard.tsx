import { Trophy, Medal, Crown, TrendingUp } from "lucide-react";
import { useUser } from "../context/UserContext";

const otherUsers = [
  { id: 1, rank: 1, name: "Sarah Chen", points: 3420, submissions: 142, trend: "up" },
  { id: 2, rank: 2, name: "Marcus Johnson", points: 3180, submissions: 128, trend: "up" },
  { id: 3, rank: 3, name: "Emily Rodriguez", points: 2950, submissions: 115, trend: "same" },
  { id: 4, rank: 4, name: "David Kim", points: 2680, submissions: 98, trend: "down" },
  { id: 5, rank: 5, name: "Lisa Anderson", points: 2420, submissions: 89, trend: "up" },
  { id: 6, rank: 6, name: "James Wilson", points: 2180, submissions: 82, trend: "up" },
  { id: 7, rank: 7, name: "Maria Garcia", points: 1950, submissions: 74, trend: "same" },
  { id: 9, rank: 9, name: "Sophie Brown", points: 1120, submissions: 41, trend: "down" },
  { id: 10, rank: 10, name: "Ryan Martinez", points: 980, submissions: 36, trend: "up" },
];

export function Leaderboard() {
  const { points, submissions, rank } = useUser();

  // Insert current user into leaderboard
  const currentUser = {
    id: 8,
    rank: 8,
    name: "IceKung",
    points,
    submissions,
    trend: "up" as const,
    isCurrentUser: true,
  };

  // Combine all users and sort by points
  const allUsers = [...otherUsers, currentUser];
  const sortedData = allUsers.sort((a, b) => b.points - a.points);

  // Update ranks based on sorted position
  sortedData.forEach((user, index) => {
    user.rank = index + 1;
  });

  const getRankOrdinal = (rank: number) => {
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
      <div className="bg-gradient-to-br from-primary/5 to-accent/10 rounded-2xl p-6 border border-primary/20">
        <div className="grid grid-cols-3 gap-4 items-end max-w-2xl mx-auto">
          {/* 2nd Place */}
          <div className="text-center">
            <div className="bg-card rounded-xl p-4 border-2 border-gray-400 mb-2">
              <Medal className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
              <div className="text-sm text-card-foreground mb-1">
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

          {/* 1st Place */}
          <div className="text-center">
            <div className="bg-card rounded-xl p-4 border-2 border-yellow-500 mb-2 shadow-lg">
              <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="w-12 h-12 bg-yellow-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
              <div className="text-sm text-card-foreground mb-1">
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

          {/* 3rd Place */}
          <div className="text-center">
            <div className="bg-card rounded-xl p-4 border-2 border-amber-600 mb-2">
              <Medal className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <div className="w-12 h-12 bg-amber-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
              <div className="text-sm text-card-foreground mb-1">
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
        </div>
      </div>

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
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">👤</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-card-foreground">
                      {user.name}
                      {user.isCurrentUser && (
                        <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
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
              <div className="text-right">
                <div className="text-primary">{user.points.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">points</div>
              </div>
            </div>
          ))}
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
            <div className="text-2xl text-primary mb-1">+2</div>
            <div className="text-sm text-muted-foreground">This Week</div>
          </div>
          <div className="text-center p-4 bg-secondary rounded-lg">
            <div className="text-2xl text-primary mb-1">
              {currentUser.rank > 1
                ? (sortedData[currentUser.rank - 2].points - currentUser.points).toLocaleString()
                : 0}
            </div>
            <div className="text-sm text-muted-foreground">To Next Rank</div>
          </div>
          <div className="text-center p-4 bg-secondary rounded-lg">
            <div className="text-2xl text-primary mb-1">Top {Math.round((currentUser.rank / sortedData.length) * 100)}%</div>
            <div className="text-sm text-muted-foreground">Percentile</div>
          </div>
        </div>
      </div>
    </div>
  );
}
