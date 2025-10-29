import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Download, X } from 'lucide-react';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPWA() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [, setIsInstallable] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setIsInstallable(true);
        };

        const handleAppInstalled = () => {
            setIsInstallable(false);
            setDeferredPrompt(null);
            toast.success('Water installed successfully!');
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            // Show the install prompt
            await deferredPrompt.prompt();

            // Wait for the user to respond to the prompt
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                toast.success('Installing Water...');
            }

            // Clear the deferredPrompt
            setDeferredPrompt(null);
            setIsInstallable(false);
        } else {
            // Show manual installation instructions
            setShowInstructions(true);
        }
    };

    return (
        <div className="relative">
            <Button
                onClick={handleInstallClick}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
            >
                <Download size={16} />
                Install App
            </Button>

            {showInstructions && (
                <div className="absolute top-full right-0 mt-2 p-4 bg-card border rounded-lg shadow-lg z-50 w-80">
                    <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-sm">Install Water</h4>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowInstructions(false)}
                            className="h-6 w-6 p-0"
                        >
                            <X size={14} />
                        </Button>
                    </div>

                    <div className="space-y-3 text-sm text-muted-foreground">
                        <div>
                            <p className="font-medium text-foreground mb-1">Chrome/Edge:</p>
                            <p>Click the install icon in the address bar or go to Menu → Install Water</p>
                        </div>

                        <div>
                            <p className="font-medium text-foreground mb-1">Safari (iOS):</p>
                            <p>Tap Share → Add to Home Screen</p>
                        </div>

                        <div>
                            <p className="font-medium text-foreground mb-1">Firefox:</p>
                            <p>Go to Menu → Install</p>
                        </div>

                        <div className="pt-2 border-t">
                            <p className="text-xs">
                                💡 The app works offline and sends notifications to help you stay hydrated!
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}