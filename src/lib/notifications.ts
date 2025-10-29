
// Request notification permission and update settings
export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission === 'denied') {
        return false;
    }

    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';

    // If user grants permission, enable notifications in settings
    if (granted) {
        try {
            const { getSettings, updateSettings } = await import('./db');
            const currentSettings = await getSettings();
            await updateSettings({
                ...currentSettings,
                notificationsEnabled: true
            });
        } catch (error) {
            console.error('Failed to update notification settings:', error);
        }
    }

    return granted;
};

// Play notification sound
const playNotificationSound = (): void => {
    try {
        const audio = new Audio('/notification-sound.mp3');
        audio.volume = 0.5;
        audio.play().catch(error => {
            console.warn('Could not play notification sound:', error);
        });
    } catch (error) {
        console.warn('Could not create audio element:', error);
    }
};

// Show notification with sound
export const showNotification = async (
    title: string,
    body: string,
    options: {
        icon?: string;
        tag?: string;
        requireInteraction?: boolean;
    } = {}
): Promise<void> => {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return;

    // Play notification sound
    playNotificationSound();

    // Show notification
    const notification = new Notification(title, {
        body,
        icon: options.icon || '/logo.png',
        tag: options.tag || 'water-reminder',
        requireInteraction: options.requireInteraction || false,
        ...options
    });

    // Auto-close after 5 seconds if not requiring interaction
    if (!options.requireInteraction) {
        setTimeout(() => {
            notification.close();
        }, 5000);
    }

    // Handle notification click
    notification.onclick = () => {
        window.focus();
        notification.close();
    };
};

// Water tracker notification
export const showWaterReminder = async (): Promise<void> => {
    await showNotification(
        '💧 Time to Hydrate!',
        'Don\'t forget to drink some water and stay healthy!',
        {
            tag: 'water-reminder'
        }
    );
};

// Goal completion notification
export const showGoalCompletionNotification = async (): Promise<void> => {
    await showNotification(
        '🎉 Daily Goal Achieved!',
        'Congratulations! You\'ve reached your daily water intake goal.',
        {
            tag: 'goal-complete'
        }
    );
};

// Streak notification
export const showStreakNotification = async (streakDays: number): Promise<void> => {
    await showNotification(
        `🔥 ${streakDays} Day Streak!`,
        `Amazing! You've maintained your hydration goal for ${streakDays} consecutive days.`,
        {
            tag: 'streak'
        }
    );
};

// Test notification
export const testNotification = async (): Promise<void> => {
    await showNotification(
        '🧪 Test Notification',
        'This is how your water reminders will look and sound!',
        {
            tag: 'test'
        }
    );
};

// Schedule water reminder notifications
let reminderInterval: number | null = null;

export const startWaterReminders = (intervalMinutes: number = 20): void => {
    // Clear existing reminders
    stopWaterReminders();

    // In development mode, use seconds instead of minutes for testing
    const isDev = import.meta.env.DEV;
    const intervalMs = isDev ? intervalMinutes * 1000 : intervalMinutes * 60 * 1000;

    // Set up recurring reminders
    reminderInterval = window.setInterval(async () => {
        await showWaterReminder();
    }, intervalMs);
};

export const stopWaterReminders = (): void => {
    if (reminderInterval) {
        clearInterval(reminderInterval);
        reminderInterval = null;
    }
};

// Initialize reminders based on user settings
export const initializeReminders = async (): Promise<void> => {
    try {
        // Import here to avoid circular dependency
        const { getSettings } = await import('./db');
        const settings = await getSettings();

        if (settings.notificationsEnabled) {
            // In dev mode, use 2 seconds for testing
            const interval = import.meta.env.DEV ? 2 : settings.reminderInterval;
            startWaterReminders(interval);
        }
    } catch (error) {
        console.error('Failed to initialize reminders:', error);
        // Fallback to default settings - 2 seconds in dev, 20 minutes in prod
        const fallbackInterval = import.meta.env.DEV ? 2 : 20;
        startWaterReminders(fallbackInterval);
    }
};