import { useState } from "react";
import { Coins, Gift, ShoppingBag, Coffee, Ticket, Star, Check } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useUser } from "../context/UserContext";

const rewards = [
  {
    id: 1,
    name: "$5 Shopping Voucher",
    points: 500,
    category: "voucher",
    image: "https://images.unsplash.com/photo-1563223827-817bf3d83907?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaG9wcGluZyUyMHZvdWNoZXIlMjBkaXNjb3VudHxlbnwxfHx8fDE3NzM3NDI2MDN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    popular: true,
  },
  {
    id: 2,
    name: "Free Coffee Drink",
    points: 200,
    category: "food",
    image: "https://images.unsplash.com/photo-1556742400-b5b7c5121f99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBzaG9wJTIwY2FyZHxlbnwxfHx8fDE3NzM3NTUwOTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    popular: false,
  },
  {
    id: 3,
    name: "$10 Gift Card",
    points: 1000,
    category: "voucher",
    image: "https://images.unsplash.com/photo-1647221598272-9aa015392c81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnaWZ0JTIwY2FyZCUyMHJld2FyZHN8ZW58MXx8fHwxNzczNzU1MDk4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    popular: true,
  },
  {
    id: 4,
    name: "Eco-Friendly Product Bundle",
    points: 800,
    category: "product",
    image: "https://images.unsplash.com/photo-1582615908486-aa0a3958e60e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY28lMjBwcm9kdWN0cyUyMHN1c3RhaW5hYmxlfGVufDF8fHx8MTc3Mzc1NTA5OHww&ixlib=rb-4.1.0&q=80&w=1080",
    popular: false,
  },
  {
    id: 5,
    name: "Restaurant Discount 20%",
    points: 350,
    category: "food",
    image: "https://images.unsplash.com/photo-1556742400-b5b7c5121f99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBzaG9wJTIwY2FyZHxlbnwxfHx8fDE3NzM3NTUwOTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    popular: false,
  },
  {
    id: 6,
    name: "Cinema Ticket",
    points: 600,
    category: "entertainment",
    image: "https://images.unsplash.com/photo-1647221598272-9aa015392c81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnaWZ0JTIwY2FyZCUyMHJld2FyZHN8ZW58MXx8fHwxNzczNzU1MDk4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    popular: false,
  },
];

const categories = [
  { id: "all", name: "All Rewards", icon: Gift },
  { id: "voucher", name: "Vouchers", icon: Ticket },
  { id: "food", name: "Food & Drink", icon: Coffee },
  { id: "product", name: "Products", icon: ShoppingBag },
];

export function Rewards() {
  const { points: userPoints, deductPoints } = useUser();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [redeemedRewards, setRedeemedRewards] = useState<number[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastRedeemedReward, setLastRedeemedReward] = useState<string>("");

  const filteredRewards =
    selectedCategory === "all"
      ? rewards
      : rewards.filter((r) => r.category === selectedCategory);

  const handleRedeem = (reward: typeof rewards[0]) => {
    if (userPoints >= reward.points) {
      const success = deductPoints(reward.points);
      if (success) {
        setRedeemedRewards([...redeemedRewards, reward.id]);
        setLastRedeemedReward(reward.name);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    }
  };

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
              Check your email for details.
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
                    : "bg-secondary text-foreground hover:bg-accent"
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRewards.map((reward) => {
          const canRedeem = userPoints >= reward.points;
          const isRedeemed = redeemedRewards.includes(reward.id);

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
                {isRedeemed && (
                  <div className="absolute inset-0 bg-primary/90 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Check className="w-12 h-12 mx-auto mb-2" />
                      <span>Redeemed!</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-card-foreground mb-2">{reward.name}</h3>
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
                  disabled={!canRedeem || isRedeemed}
                  className={`w-full py-2 rounded-lg transition-all ${
                    canRedeem && !isRedeemed
                      ? "bg-primary text-primary-foreground hover:opacity-90"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  {isRedeemed ? "Redeemed" : "Redeem Now"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
