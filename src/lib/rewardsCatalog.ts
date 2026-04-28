// Shared reward catalog — both Admin Settings and User Rewards read from here.
// Admin edits are saved to localStorage; users read from the same source.

export interface RewardItem {
  id: number;
  name: string;
  points: number;
  category: string;
  image: string;
  popular: boolean;
  description: string;
  couponPrefix: string;
  validDays: number;
  terms: string[];
}

const DEFAULT_REWARDS: RewardItem[] = [
  {
    id: 1, name: "$5 Shopping Voucher", points: 500, category: "voucher",
    image: "https://images.unsplash.com/photo-1563223827-817bf3d83907?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaG9wcGluZyUyMHZvdWNoZXIlMjBkaXNjb3VudHxlbnwxfHx8fDE3NzM3NDI2MDN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    popular: true,
    description: "Get $5 off on your next purchase at any participating retail store. Valid for both online and in-store shopping.",
    couponPrefix: "SHOP5", validDays: 30,
    terms: ["Minimum purchase of $15 required", "Cannot be combined with other offers", "Valid at participating stores only"],
  },
  {
    id: 2, name: "Free Coffee Drink", points: 200, category: "food",
    image: "https://images.unsplash.com/photo-1556742400-b5b7c5121f99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBzaG9wJTIwY2FyZHxlbnwxfHx8fDE3NzM3NTUwOTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    popular: false,
    description: "Enjoy a free coffee drink of any size (up to Grande) at participating cafés. Choose from espresso, latte, cappuccino, or iced coffee.",
    couponPrefix: "COFFEE", validDays: 14,
    terms: ["One drink per coupon", "Up to Grande size only", "Available at participating cafés", "Cannot add premium toppings"],
  },
  {
    id: 3, name: "$10 Gift Card", points: 1000, category: "voucher",
    image: "https://images.unsplash.com/photo-1647221598272-9aa015392c81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnaWZ0JTIwY2FyZCUyMHJld2FyZHN8ZW58MXx8fHwxNzczNzU1MDk4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    popular: true,
    description: "A versatile $10 digital gift card that can be used at major online retailers. Perfect for treating yourself or gifting to a friend.",
    couponPrefix: "GIFT10", validDays: 60,
    terms: ["Redeemable at participating online stores", "No cash value", "Non-transferable after activation"],
  },
  {
    id: 4, name: "Eco-Friendly Product Bundle", points: 800, category: "product",
    image: "https://images.unsplash.com/photo-1582615908486-aa0a3958e60e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY28lMjBwcm9kdWN0cyUyMHN1c3RhaW5hYmxlfGVufDF8fHx8MTc3Mzc1NTA5OHww&ixlib=rb-4.1.0&q=80&w=1080",
    popular: false,
    description: "Receive a curated bundle of eco-friendly products including reusable bags, bamboo straws, and organic soap. Shipped directly to your address.",
    couponPrefix: "ECOBUN", validDays: 30,
    terms: ["Delivery within 7-14 business days", "Products may vary based on availability", "Free shipping included"],
  },
  {
    id: 5, name: "Restaurant Discount 20%", points: 350, category: "food",
    image: "https://images.unsplash.com/photo-1556742400-b5b7c5121f99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBzaG9wJTIwY2FyZHxlbnwxfHx8fDE3NzM3NTUwOTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    popular: false,
    description: "Get 20% off your total bill at any partner restaurant. Enjoy a delicious meal while saving money and the planet!",
    couponPrefix: "DINE20", validDays: 21,
    terms: ["Maximum discount of $25", "Dine-in only", "Not valid on public holidays", "Excludes alcoholic beverages"],
  },
  {
    id: 6, name: "Cinema Ticket", points: 600, category: "entertainment",
    image: "https://images.unsplash.com/photo-1647221598272-9aa015392c81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnaWZ0JTIwY2FyZCUyMHJld2FyZHN8ZW58MXx8fHwxNzczNzU1MDk4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    popular: false,
    description: "One free standard movie ticket at any participating cinema. Enjoy the latest blockbusters on us!",
    couponPrefix: "MOVIE", validDays: 45,
    terms: ["Standard 2D screenings only", "Subject to seat availability", "Not valid for premieres or special events", "One ticket per coupon"],
  },
];

const STORAGE_KEY = "admin_rewards_config";

export function getRewardsCatalog(): RewardItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with defaults to ensure image/terms exist for items that admin edited
      return parsed.map((r: any) => {
        const defaultMatch = DEFAULT_REWARDS.find((d) => d.id === r.id);
        return {
          ...defaultMatch,
          ...r,
          image: r.image || defaultMatch?.image || "",
          terms: r.terms || defaultMatch?.terms || [],
          popular: r.popular ?? defaultMatch?.popular ?? false,
        };
      });
    }
  } catch (e) {
    console.error("Error reading rewards config:", e);
  }
  return DEFAULT_REWARDS;
}

export function saveRewardsCatalog(rewards: RewardItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rewards));
}

export function getDefaultRewards(): RewardItem[] {
  return DEFAULT_REWARDS;
}
