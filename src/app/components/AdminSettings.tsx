import { useState } from "react";
import { Settings, Gift, Pencil, Check, X, Plus, Trash2, Coins } from "lucide-react";
import { getRewardsCatalog, saveRewardsCatalog, getDefaultRewards, type RewardItem } from "../../lib/rewardsCatalog";

const categoryOptions = ["voucher", "food", "product", "entertainment"];

export function AdminSettings() {
  const [rewards, setRewards] = useState<RewardItem[]>(() => getRewardsCatalog());

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<RewardItem | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [newForm, setNewForm] = useState<RewardItem>({
    id: 0, name: "", points: 0, category: "voucher", description: "", couponPrefix: "", validDays: 30, image: "", popular: false, terms: [],
  });
  const [saved, setSaved] = useState(false);

  const saveToStorage = (updated: RewardItem[]) => {
    saveRewardsCatalog(updated);
    setRewards(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const startEdit = (reward: RewardItem) => {
    setEditingId(reward.id);
    setEditForm({ ...reward });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = () => {
    if (!editForm) return;
    const updated = rewards.map((r) => (r.id === editForm.id ? editForm : r));
    saveToStorage(updated);
    setEditingId(null);
    setEditForm(null);
  };

  const deleteReward = (id: number) => {
    const updated = rewards.filter((r) => r.id !== id);
    saveToStorage(updated);
  };

  const addReward = () => {
    const maxId = rewards.length > 0 ? Math.max(...rewards.map((r) => r.id)) : 0;
    const updated = [...rewards, { ...newForm, id: maxId + 1 }];
    saveToStorage(updated);
    setAddingNew(false);
    setNewForm({ id: 0, name: "", points: 0, category: "voucher", description: "", couponPrefix: "", validDays: 30, image: "", popular: false, terms: [] });
  };

  const resetToDefaults = () => {
    saveToStorage(getDefaultRewards());
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Edit Reward Catalog</h1>
        <p className="text-muted-foreground">Edit available rewards, points, and details</p>
      </div>

      {/* Save confirmation */}
      {saved && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3">
          <Check className="w-5 h-5 text-emerald-500" />
          <span className="text-foreground">Changes saved successfully!</span>
        </div>
      )}

      {/* Reward Catalog Editor */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gift className="w-5 h-5 text-emerald-500" />
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">Reward Catalog</h3>
              <p className="text-sm text-muted-foreground">Edit available rewards, points, and details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetToDefaults}
              className="px-4 py-2 text-sm text-muted-foreground bg-secondary hover:bg-accent rounded-lg transition-colors"
            >
              Reset Defaults
            </button>
            <button
              onClick={() => setAddingNew(true)}
              className="px-4 py-2 text-sm text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Reward
            </button>
          </div>
        </div>

        {/* Add New Reward Form */}
        {addingNew && (
          <div className="p-6 bg-emerald-500/5 border-b border-border">
            <h4 className="font-medium text-card-foreground mb-4">Add New Reward</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Name</label>
                <input
                  type="text" value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Free Smoothie"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Points</label>
                <input
                  type="number" value={newForm.points}
                  onChange={(e) => setNewForm({ ...newForm, points: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Category</label>
                <select
                  value={newForm.category}
                  onChange={(e) => setNewForm({ ...newForm, category: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Coupon Prefix</label>
                <input
                  type="text" value={newForm.couponPrefix}
                  onChange={(e) => setNewForm({ ...newForm, couponPrefix: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. SMOOTH"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Valid Days</label>
                <input
                  type="number" value={newForm.validDays}
                  onChange={(e) => setNewForm({ ...newForm, validDays: parseInt(e.target.value) || 30 })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-xs text-muted-foreground mb-1">Description</label>
                <input
                  type="text" value={newForm.description}
                  onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Short description..."
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={addReward} disabled={!newForm.name || !newForm.points}
                className="px-4 py-2 text-sm text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <Check className="w-4 h-4" /> Add
              </button>
              <button onClick={() => setAddingNew(false)}
                className="px-4 py-2 text-sm text-muted-foreground bg-secondary hover:bg-accent rounded-lg transition-colors flex items-center gap-2">
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </div>
        )}

        {/* Reward List */}
        <div className="divide-y divide-border">
          {rewards.map((reward) => {
            const isEditing = editingId === reward.id;

            return (
              <div key={reward.id} className={`p-5 transition-colors ${isEditing ? "bg-blue-500/5" : "hover:bg-secondary/50"}`}>
                {isEditing && editForm ? (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Name</label>
                        <input type="text" value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Points</label>
                        <input type="number" value={editForm.points}
                          onChange={(e) => setEditForm({ ...editForm, points: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Category</label>
                        <select value={editForm.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                          {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Coupon Prefix</label>
                        <input type="text" value={editForm.couponPrefix}
                          onChange={(e) => setEditForm({ ...editForm, couponPrefix: e.target.value.toUpperCase() })}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Valid Days</label>
                        <input type="number" value={editForm.validDays}
                          onChange={(e) => setEditForm({ ...editForm, validDays: parseInt(e.target.value) || 30 })}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <div className="md:col-span-2 lg:col-span-1">
                        <label className="block text-xs text-muted-foreground mb-1">Description</label>
                        <input type="text" value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={saveEdit}
                        className="px-4 py-2 text-sm text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors flex items-center gap-2">
                        <Check className="w-4 h-4" /> Save
                      </button>
                      <button onClick={cancelEdit}
                        className="px-4 py-2 text-sm text-muted-foreground bg-secondary hover:bg-accent rounded-lg transition-colors flex items-center gap-2">
                        <X className="w-4 h-4" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Gift className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-medium text-card-foreground">{reward.name}</span>
                          <span className="text-xs bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-md">{reward.category}</span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-0.5 truncate">{reward.description}</div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Coins className="w-3 h-3" />{reward.points} pts</span>
                          <span>Prefix: <code className="font-mono bg-secondary px-1 rounded">{reward.couponPrefix}</code></span>
                          <span>{reward.validDays} days valid</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      <button onClick={() => startEdit(reward)}
                        className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteReward(reward.id)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {rewards.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No rewards configured. Click "Add Reward" to create one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
