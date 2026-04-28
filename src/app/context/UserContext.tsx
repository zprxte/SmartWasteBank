import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../../lib/supabaseClient";
import { getLevelFromPoints } from "../../lib/levelUtils";

// Static leaderboard data for rank calculation
const STATIC_LEADERBOARD_POINTS = [3420, 3180, 2950, 2680, 2420, 2180, 1950, 1120, 980];

interface UserData {
  id?: string;
  points: number;
  level: number;
  submissions: number;
  items: number;
  rank: number;
  totalEarned: number;
}

interface UserContextType extends UserData {
  addPoints: (points: number, items: number, wasteType?: string) => Promise<void>;
  deductPoints: (points: number, rewardName?: string) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData>({
    points: 0,
    level: 1,
    submissions: 0,
    items: 0,
    rank: 0,
    totalEarned: 0,
  });

  const refreshProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      // 1. First try to get profile from database
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      // Calculate total earned points from submissions
      const { data: submissions } = await supabase.from('waste_submissions').select('points_earned').eq('user_id', session.user.id);
      const totalEarned = submissions ? submissions.reduce((sum: number, s: any) => sum + s.points_earned, 0) : 0;
      
      if (profile) {
        setUserData(prev => ({
          ...prev,
          id: session.user.id,
          points: profile.points || 0,
          level: profile.level || 1,
          submissions: profile.submissions || 0,
          items: profile.items_recycled || 0,
          totalEarned: Math.max(profile.points || 0, totalEarned),
        }));
      } else {
        const meta = session.user.user_metadata || {};
        // Attempt to insert missing profile (might fail if RLS blocks it, but worth a try)
        await supabase.from('profiles').insert({
          id: session.user.id,
          first_name: meta.first_name,
          last_name: meta.last_name,
          username: meta.username,
          points: meta.points || 0,
          level: meta.level || 1,
          submissions: meta.submissions || 0,
          items_recycled: meta.items || 0
        });

        setUserData(prev => ({
          ...prev,
          id: session.user.id,
          points: meta.points || 0,
          level: meta.level || 1,
          submissions: meta.submissions || 0,
          items: meta.items || 0,
          totalEarned: Math.max(meta.points || 0, totalEarned),
        }));
      }
    }
  };

  useEffect(() => {
    refreshProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange((event: any) => {
      if (event === 'SIGNED_IN') {
        refreshProfile();
      } else if (event === 'SIGNED_OUT') {
        setUserData({
          points: 0,
          level: 1,
          submissions: 0,
          items: 0,
          rank: 0,
          totalEarned: 0,
        });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Calculate rank dynamically based on points (Level never drops)
  useEffect(() => {
    // We only recalculate rank here. Level is only updated when points are added to prevent dropping.
    const newRank = [...new Set([...STATIC_LEADERBOARD_POINTS, userData.points])].sort((a, b) => b - a).indexOf(userData.points) + 1;
    if (newRank !== userData.rank) setUserData(prev => ({ ...prev, rank: newRank }));

  }, [userData.points]);

  const addPoints = async (pointsToAdd: number, itemsToAdd: number, wasteType: string = 'General') => {
    if (!userData.id) return;

    const newPoints = userData.points + pointsToAdd;
    const newTotalEarned = userData.totalEarned + pointsToAdd;
    const newSubmissions = userData.submissions + 1;
    const newItems = userData.items + itemsToAdd;
    const newLevel = Math.max(userData.level || 1, getLevelFromPoints(newTotalEarned));
    
    // Optimistic UI Update
    setUserData(prev => ({
      ...prev,
      points: newPoints,
      totalEarned: newTotalEarned,
      submissions: newSubmissions,
      items: newItems,
      level: newLevel
    }));

    // Update real database
    await supabase.from('profiles').update({
      points: newPoints,
      submissions: newSubmissions,
      items_recycled: newItems,
      level: newLevel
    }).eq('id', userData.id);

    // Keep metadata in sync for legacy code
    await supabase.auth.updateUser({
      data: { points: newPoints, level: newLevel, submissions: newSubmissions, items: newItems }
    });

    // Record submission history
    await supabase.from('waste_submissions').insert({
      user_id: userData.id,
      waste_type: wasteType,
      items: itemsToAdd,
      points_earned: pointsToAdd
    });
  };

  const deductPoints = async (pointsToDeduct: number, rewardName: string = 'Reward'): Promise<boolean> => {
    if (!userData.id || userData.points < pointsToDeduct) return false;

    const newPoints = userData.points - pointsToDeduct;
    const newLevel = userData.level; // Level never decreases when spending points
    
    // Optimistic UI Update
    setUserData(prev => ({
      ...prev,
      points: newPoints,
      level: newLevel
    }));

    // Update real database
    await supabase.from('profiles').update({
      points: newPoints,
      level: newLevel
    }).eq('id', userData.id);

    // Keep metadata in sync
    await supabase.auth.updateUser({
      data: { points: newPoints, level: newLevel }
    });

    // Record reward history
    await supabase.from('claimed_rewards').insert({
      user_id: userData.id,
      reward_name: rewardName,
      points_cost: pointsToDeduct
    });

    return true;
  };

  return (
    <UserContext.Provider
      value={{
        ...userData,
        addPoints,
        deductPoints,
        refreshProfile,
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
