import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Settings, User, Bell, Save, Loader2 } from "lucide-react";
import { getSettings, updateSettings, UserSettings } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const SettingsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<UserSettings>>({
    full_name: "",
    email: "",
    timezone: "UTC",
    notifications: true
  });

  useEffect(() => {
    async function fetchSettings() {
      if (!user) return;
      
      const data = await getSettings(user.id);
      if (data) {
        setFormData(data);
      } else {
        // Pre-fill with Auth info if no DB record yet
        setFormData(prev => ({
          ...prev,
          email: user.email || "",
          full_name: user.user_metadata?.full_name || ""
        }));
      }
      setLoading(false);
    }
    
    if (!authLoading) {
      fetchSettings();
    }
  }, [user, authLoading]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    const result = await updateSettings(formData, user.id);
    if (result) {
      toast.success("Settings saved successfully.");
      setFormData(result);
    } else {
      toast.error("Failed to save settings. Check DB connection.");
    }
    setSaving(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-10 animate-fade-in">
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl gradient-crimson-gold flex items-center justify-center shadow-lg shadow-crimson/20">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-4xl font-black text-white font-display uppercase italic tracking-tight">User Profile</h1>
          </div>
          <p className="text-muted-foreground font-medium opacity-80">
            Manage your personal profile, regional settings, and notifications.
          </p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-gold animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-8">
            
            {/* Profile Section */}
            <div className="ai-card p-6 border-gold/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
              
              <div className="flex items-start gap-4 mb-6 relative z-10">
                <div className="p-3 rounded-lg bg-gold/10 text-gold">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Personal Information</h3>
                  <p className="text-sm text-muted-foreground">Update your account details and contact info.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name || ""}
                    onChange={handleChange}
                    placeholder="ex. Admin User"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    placeholder="ex. user@domain.com"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Application Preferences Section */}
            <div className="ai-card p-6 border-white/5 relative overflow-hidden">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-lg bg-white/5 text-muted-foreground">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Preferences & Notifications</h3>
                  <p className="text-sm text-muted-foreground">Manage your regional settings and email alerts.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Regional Timezone</label>
                  <select
                    name="timezone"
                    value={formData.timezone || "UTC"}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors"
                  >
                    <option value="UTC">UTC (Global)</option>
                    <option value="EST">Eastern Time (US/Canada)</option>
                    <option value="IST">Indian Standard Time (IST)</option>
                    <option value="GMT">Greenwich Mean Time (GMT)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium text-white">Email Notifications</label>
                    <p className="text-xs text-muted-foreground">Receive daily digest alerts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="notifications"
                      checked={formData.notifications || false}
                      onChange={handleChange}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex justify-end pt-4">
              <button 
                type="submit"
                disabled={saving}
                className="group relative px-8 py-3 rounded-xl gradient-crimson-gold text-white font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span>{saving ? 'Saving...' : 'Save Profile'}</span>
                {!saving && <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />}
              </button>
            </div>

          </form>
        )}
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
