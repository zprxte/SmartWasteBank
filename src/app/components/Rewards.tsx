import { useState, useEffect } from "react";
import { Coins, Gift, ShoppingBag, Coffee, Ticket, Star, Check, Loader2, Clock, X, Copy, CheckCircle } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useUser } from "../context/UserContext";
import { supabase } from "../../lib/supabaseClient";
import { getRewardsCatalog, type RewardItem } from "../../lib/rewardsCatalog";

const categories = [
  { id: "all", name: "All Rewards", icon: Gift },
  { id: "voucher", name: "Vouchers", icon: Ticket },
  { id: "food", name: "Food & Drink", icon: Coffee },
  { id: "product", name: "Products", icon: ShoppingBag },
  { id: "my-rewards", name: "My Claimed Rewards", icon: Check },
];

interface ClaimedReward {
  id: string;
  reward_name: string;
  points_cost: number;
  created_at: string;
  coupon_code?: string;
}

// Generate a unique coupon code
function generateCouponCode(prefix: string): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${suffix}`;
}

export function Rewards() {
  const { points: userPoints, deductPoints, id: userId } = useUser();
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [claimedRewards, setClaimedRewards] = useState<ClaimedReward[]>([]);
  const [isLoadingClaimed, setIsLoadingClaimed] = useState(false);
  const [redeemingId, setRedeemingId] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastRedeemedReward, setLastRedeemedReward] = useState<string>("");
  const [viewingReward, setViewingReward] = useState<ClaimedReward | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Load rewards from shared catalog (synced with admin settings)
  useEffect(() => {
    setRewards(getRewardsCatalog());
  }, []);

  useEffect(() => {
    if (userId) {
      fetchClaimedRewards();
    }
  }, [userId]);

  const fetchClaimedRewards = async () => {
    setIsLoadingClaimed(true);
    const { data } = await supabase
      .from('claimed_rewards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (data) {
      setClaimedRewards(data);
    }
    setIsLoadingClaimed(false);
  };

  const handleRedeem = async (reward: RewardItem) => {
    if (userPoints >= reward.points) {
      setRedeemingId(reward.id);
      try {
        const couponCode = generateCouponCode(reward.couponPrefix);
        const success = await deductPoints(reward.points, reward.name);
        if (success) {
          // Save coupon code to database
          await supabase.from('claimed_rewards')
            .update({ coupon_code: couponCode })
            .eq('user_id', userId)
            .eq('reward_name', reward.name)
            .order('created_at', { ascending: false })
            .limit(1);
          
          setLastRedeemedReward(reward.name);
          setShowSuccess(true);
          await fetchClaimedRewards();
          setTimeout(() => setShowSuccess(false), 3000);
        }
      } catch (e) {
        alert("Failed to redeem reward");
      } finally {
        setRedeemingId(null);
      }
    }
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Find the reward details for a claimed reward
  const getRewardDetails = (rewardName: string): RewardItem | undefined => {
    return rewards.find(r => r.name === rewardName);
  };

  const filteredRewards =
    selectedCategory === "all"
      ? rewards
      : selectedCategory === "my-rewards"
      ? []
      : rewards.filter((r) => r.category === selectedCategory);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground mb-2">Rewards Catalog</h1>
          <p className="text-muted-foreground">Redeem your points for amazing rewards</p>
        </div>
        <div className="bg-primary text-primary-foreground px-6 py-3 rounded-xl flex items-center gap-2">
          <Coins className="w-5 h-5" />
          <span>{userPoints.toLocaleString()} pts</span>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 flex items-center gap-3">
          <Check className="w-5 h-5 text-primary" />
          <div>
            <span className="text-foreground block">
              {lastRedeemedReward} redeemed successfully! 🎉
            </span>
            <span className="text-sm text-muted-foreground">
              Check "My Claimed Rewards" to view your coupon.
            </span>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-accent"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* My Rewards Section */}
      {selectedCategory === "my-rewards" ? (
        <div className="bg-card rounded-xl p-6 border border-border">
          <h2 className="text-xl font-semibold mb-4 text-card-foreground">My Claimed Rewards</h2>
          {isLoadingClaimed ? (
            <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : claimedRewards.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              You haven't claimed any rewards yet. Start recycling to earn points!
            </div>
          ) : (
            <div className="space-y-4">
              {claimedRewards.map((reward) => {
                const details = getRewardDetails(reward.reward_name);
                return (
                  <div
                    key={reward.id}
                    className="flex items-center justify-between p-4 bg-secondary rounded-lg border border-border/50 hover:border-primary/30 transition-colors cursor-pointer"
                    onClick={() => setViewingReward(reward)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <Gift className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="text-foreground font-medium">{reward.reward_name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {new Date(reward.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                        {details && (
                          <div className="text-xs text-muted-foreground mt-1 max-w-xs truncate">
                            {details.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-muted-foreground">-{reward.points_cost} pts</div>
                      <div className="text-primary text-sm font-medium flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg">
                        View Details →
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Rewards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRewards.map((reward) => {
            const canRedeem = userPoints >= reward.points;
            const isRedeeming = redeemingId === reward.id;

            return (
              <div
                key={reward.id}
                className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                <div className="relative h-48 bg-secondary">
                  <ImageWithFallback
                    src={reward.image}
                    alt={reward.name}
                    className="w-full h-full object-cover"
                  />
                  {reward.popular && (
                    <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      Popular
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-card-foreground mb-1">{reward.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{reward.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-primary">
                      <Coins className="w-4 h-4" />
                      <span>{reward.points.toLocaleString()} pts</span>
                    </div>
                    {canRedeem ? (
                      <span className="text-sm text-primary">Available</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Need {(reward.points - userPoints).toLocaleString()} more
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleRedeem(reward)}
                    disabled={!canRedeem || isRedeeming}
                    className={`w-full py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                      canRedeem
                        ? "bg-primary text-primary-foreground hover:opacity-90"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    }`}
                  >
                    {isRedeeming ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Redeeming...</>
                    ) : (
                      "Redeem Now"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Coupon Detail Modal */}
      {viewingReward && (() => {
        const details = getRewardDetails(viewingReward.reward_name);
        const claimedDate = new Date(viewingReward.created_at);
        const expiryDate = new Date(claimedDate);
        expiryDate.setDate(expiryDate.getDate() + (details?.validDays || 30));
        const isExpired = new Date() > expiryDate;
        const couponCode = viewingReward.coupon_code || generateCouponCode(details?.couponPrefix || "SWB");

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewingReward(null)}>
            <div className="bg-card rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-border" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header Image */}
              {details && (
                <div className="relative h-40 bg-secondary">
                  <ImageWithFallback src={details.image} alt={details.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold">{viewingReward.reward_name}</h3>
                    <p className="text-white/80 text-sm">{viewingReward.points_cost} points redeemed</p>
                  </div>
                </div>
              )}

              <div className="p-6 space-y-5">
                {/* Coupon Code */}
                <div className={`rounded-xl p-4 text-center border-2 border-dashed ${isExpired ? 'border-red-300 bg-red-50' : 'border-primary/40 bg-primary/5'}`}>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Your Coupon Code</div>
                  <div className="flex items-center justify-center gap-3">
                    <span className={`text-2xl font-mono font-bold tracking-widest ${isExpired ? 'text-red-400 line-through' : 'text-primary'}`}>
                      {couponCode}
                    </span>
                    {!isExpired && (
                      <button
                        onClick={() => handleCopyCoupon(couponCode)}
                        className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                        title="Copy coupon code"
                      >
                        {copiedCode ? <CheckCircle className="w-5 h-5 text-primary" /> : <Copy className="w-5 h-5 text-primary" />}
                      </button>
                    )}
                  </div>
                  {copiedCode && <div className="text-xs text-primary mt-2">Copied to clipboard!</div>}
                  {isExpired && <div className="text-xs text-red-500 mt-2 font-medium">This coupon has expired</div>}
                </div>

                {/* Description */}
                {details && (
                  <div>
                    <h4 className="text-card-foreground font-medium mb-1">Description</h4>
                    <p className="text-sm text-muted-foreground">{details.description}</p>
                  </div>
                )}

                {/* Validity */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-secondary rounded-lg p-3">
                    <div className="text-xs text-muted-foreground">Claimed on</div>
                    <div className="text-sm text-card-foreground font-medium">
                      {claimedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="bg-secondary rounded-lg p-3">
                    <div className="text-xs text-muted-foreground">Expires on</div>
                    <div className={`text-sm font-medium ${isExpired ? 'text-red-500' : 'text-card-foreground'}`}>
                      {expiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                {/* Terms */}
                {details && details.terms.length > 0 && (
                  <div>
                    <h4 className="text-card-foreground font-medium mb-2">Terms & Conditions</h4>
                    <ul className="space-y-1.5">
                      {details.terms.map((term, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          {term}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Close button */}
                <button
                  onClick={() => setViewingReward(null)}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-medium"
                >
                  Close
                </button>
              </div>

              {/* Close X */}
              <button onClick={() => setViewingReward(null)} className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
