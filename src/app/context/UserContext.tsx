import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Static leaderboard data for rank calculation
const STATIC_LEADERBOARD_POINTS = [3420, 3180, 2950, 2680, 2420, 2180, 1950, 1120, 980];

interface UserData {
  points: number;
  level: number;
  submissions: number;
  totalWeight: number;
  rank: number;
}

interface UserContextType extends UserData {
  addPoints: (points: number, weight: number) => void;
  deductPoints: (points: number) => boolean;
  addSubmission: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData>({
    points: 1250,
    level: 8,
    submissions: 47,
    totalWeight: 12.7,
    rank: 8,
  });

  // Calculate level and rank based on points
  useEffect(() => {
    const newLevel = Math.floor(userData.points / 500) + 1;

    // Calculate rank by comparing with other users
    const allPoints = [...STATIC_LEADERBOARD_POINTS, userData.points];
    const sortedPoints = [...new Set(allPoints)].sort((a, b) => b - a);
    const newRank = sortedPoints.indexOf(userData.points) + 1;

    if (newLevel !== userData.level || newRank !== userData.rank) {
      setUserData((prev) => ({ ...prev, level: newLevel, rank: newRank }));
    }
  }, [userData.points]);

  const addPoints = (points: number, weight: number) => {
    setUserData((prev) => ({
      ...prev,
      points: prev.points + points,
      submissions: prev.submissions + 1,
      totalWeight: prev.totalWeight + weight,
    }));
  };

  const deductPoints = (points: number): boolean => {
    if (userData.points >= points) {
      setUserData((prev) => ({
        ...prev,
        points: prev.points - points,
      }));
      return true;
    }
    return false;
  };

  const addSubmission = () => {
    setUserData((prev) => ({
      ...prev,
      submissions: prev.submissions + 1,
    }));
  };

  return (
    <UserContext.Provider
      value={{
        ...userData,
        addPoints,
        deductPoints,
        addSubmission,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
