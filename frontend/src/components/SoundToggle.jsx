import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isMuted, playPop, setMuted } from "@/lib/soundEffects";

export const SoundToggle = () => {
  const [muted, setState] = useState(isMuted());
  const toggle = () => {
    setMuted(!muted);
    setState(!muted);
    if (muted) setTimeout(playPop, 0);
  };
  return (
    <button
      data-testid="sound-toggle-button"
      aria-label={muted ? "Unmute sounds" : "Mute sounds"}
      aria-pressed={!muted}
      onClick={toggle}
      className="glass-panel fixed right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition-colors hover:text-white sm:right-5 sm:top-5"
    >
      {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
    </button>
  );
};
