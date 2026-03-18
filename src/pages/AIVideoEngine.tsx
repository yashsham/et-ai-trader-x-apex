import { AppLayout } from "@/components/AppLayout";
import { Play, Video, Clock, Sparkles } from "lucide-react";

const videos = [
  { id: 1, title: "Nifty 50 Daily Wrap — March 18, 2026", duration: "3:24", status: "ready" },
  { id: 2, title: "Top 5 Breakout Stocks This Week", duration: "4:12", status: "ready" },
  { id: 3, title: "Sector Rotation Analysis — Banking vs IT", duration: "2:58", status: "generating" },
];

const AIVideoEngine = () => {
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">AI Video Engine</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Auto-generated market analysis videos with AI narration
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-crimson-gold text-foreground text-xs font-semibold glow-crimson hover:opacity-90 transition-opacity">
            <Sparkles className="w-3.5 h-3.5" />
            Generate Today's Video
          </button>
        </div>

        {/* Featured Video */}
        <div className="ai-card p-0 overflow-hidden">
          <div className="aspect-video bg-muted relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            <div className="text-center relative z-10">
              <div className="w-16 h-16 rounded-full gradient-crimson-gold flex items-center justify-center mx-auto mb-4 glow-crimson cursor-pointer hover:scale-105 transition-transform">
                <Play className="w-6 h-6 text-foreground ml-1" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Nifty 50 Daily Wrap</h3>
              <p className="text-sm text-muted-foreground">March 18, 2026 — AI Generated</p>
            </div>
          </div>
        </div>

        {/* Video List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {videos.map((video) => (
            <div key={video.id} className="ai-card p-4 group cursor-pointer">
              <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                {video.status === "generating" ? (
                  <div className="signal-shimmer absolute inset-0" />
                ) : null}
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center group-hover:bg-crimson/20 transition-colors">
                  {video.status === "generating" ? (
                    <Clock className="w-4 h-4 text-gold animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 text-foreground ml-0.5" />
                  )}
                </div>
              </div>
              <h4 className="text-sm font-medium text-foreground mb-1">{video.title}</h4>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Video className="w-3 h-3" />
                <span>{video.duration}</span>
                {video.status === "generating" && (
                  <span className="text-gold">Generating...</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default AIVideoEngine;
