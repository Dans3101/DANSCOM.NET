import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

export const InstallAppPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as EventListener);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] bg-bg-card border border-border-custom p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-accent/10 p-3 rounded-xl">
        <Download className="text-accent" size={24} />
      </div>
      <div>
        <h4 className="font-bold text-sm text-text-p">Install DANSCOM.NET</h4>
        <p className="text-[10px] text-text-s mt-0.5">Install our app for faster access.</p>
      </div>
      <button onClick={handleInstall} className="bg-accent text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-accent/80 transition">
        Install
      </button>
      <button onClick={() => setIsVisible(false)} className="text-text-s hover:text-text-p">
        <X size={16} />
      </button>
    </div>
  );
};
