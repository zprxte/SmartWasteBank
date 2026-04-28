import { BarChart3 } from "lucide-react";

export function AdminAnalytics() {
  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Detailed analytics coming soon</p>
      </div>
      <div className="bg-card rounded-xl p-12 border border-border flex flex-col items-center justify-center text-center">
        <BarChart3 className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-semibold text-card-foreground mb-2">Advanced Analytics</h3>
        <p className="text-muted-foreground max-w-md">
          Detailed analytics including user trends, waste patterns, seasonal breakdowns, and environmental impact reports will be available here soon.
        </p>
      </div>
    </div>
  );
}
