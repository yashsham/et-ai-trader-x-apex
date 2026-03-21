import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Mail, Lock, LogIn, Chrome, Loader2, ArrowRight, Brain, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleManualAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Check your email for confirmation!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back to the Alpha!");
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + window.location.pathname,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Google login failed");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Abstract Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-crimson/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md space-y-8 relative z-10 animate-fade-in">
        {/* Logo Section */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-black/40 border border-white/10 mb-4 shadow-[0_0_30px_-5px_var(--crimson)] overflow-hidden p-1">
            <img src="logo.png" alt="Logo" className="w-full h-full object-cover rounded-xl" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            ET <span className="text-gold">AI</span> Trader <span className="text-crimson text-sm">X</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            {isSignUp ? t('join_elite') : t('access_terminal')}
          </p>
        </div>

        {/* Auth Card */}
        <div className="ai-card p-8 border border-white/[0.08] backdrop-blur-xl bg-black/40">
          <form onSubmit={handleManualAuth} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest ml-1">{t('email_label')}</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-muted-foreground group-focus-within:text-gold transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-black/40 border border-white/[0.1] rounded-xl text-sm placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-gold/30 focus:border-gold/30 transition-all text-foreground"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest ml-1">{t('password_label')}</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-muted-foreground group-focus-within:text-gold transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-black/40 border border-white/[0.1] rounded-xl text-sm placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-gold/30 focus:border-gold/30 transition-all text-foreground"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl gradient-crimson-gold text-foreground font-bold text-sm shadow-[0_4px_20px_-10px_var(--crimson)] hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-foreground" />
              ) : (
                <>
                  {isSignUp ? t('initialize_protocol') : t('authorize_access')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest flex-shrink-0">{t('or_secure_login')}</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <button
            onClick={signInWithGoogle}
            className="w-full py-3 px-4 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-foreground text-sm font-semibold transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <Chrome className="w-4 h-4" />
            {t('signin_google')}
          </button>
        </div>

        {/* Footer Toggle */}
        <p className="text-center text-xs text-muted-foreground">
          {isSignUp ? t('already_network') : t('new_intelligence')}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-gold font-bold hover:underline ml-1"
          >
            {isSignUp ? t('access_terminal_btn') : t('request_access_btn')}
          </button>
        </p>

        {/* Trust Badge */}
        <div className="flex items-center justify-center gap-4 opacity-30 grayscale hover:grayscale-0 transition-all">
          <div className="flex items-center gap-1.5 grayscale">
            <Shield className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold tracking-widest uppercase">AES-256 SECURED</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-white/20" />
          <div className="flex items-center gap-1.5 grayscale">
            <Brain className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold tracking-widest uppercase">CREW-AI DRIVEN</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
