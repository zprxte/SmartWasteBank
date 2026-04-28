import { Settings } from "lucide-react";

export function AdminSettings() {
  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">System configuration</p>
      </div>
      <div className="bg-card rounded-xl p-12 border border-border flex flex-col items-center justify-center text-center">
        <Settings className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-semibold text-card-foreground mb-2">System Settings</h3>
        <p className="text-muted-foreground max-w-md">
          Configure reward point values, waste categories, notification preferences, and other system settings here.
        </p>
      </div>
    </div>
  );
}
