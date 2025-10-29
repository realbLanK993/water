# 💧 Water Tracker PWA

A simple Progressive Web App for tracking daily water intake with offline storage and notifications.

## Features

- **Offline Storage**: IndexedDB for persistent water logs and settings
- **PWA Ready**: Installable app with service worker
- **Smart Notifications**: Configurable water reminders with custom sounds
- **Customizable**: Adjustable glass sizes (default 250ml) and daily goals
- **Progress Tracking**: Daily streaks and visual progress indicators

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Build for production
pnpm build
```

## Tech Stack

- React 19 + TypeScript
- Vite + SWC
- Tailwind CSS
- IndexedDB
- PWA with Workbox

## Core Functions

The app provides these IndexedDB functions for frontend integration:

```typescript
// Database
await initDB()
await addWaterLog(glasses: number, customQuantity?: number)
await getDailyStats(date: string)
await getWeeklyStats(startDate: string)
await getCurrentStreak()

// Settings
await getSettings()
await updateSettings(newSettings)

// Notifications
await requestNotificationPermission()
await initializeReminders()
```

## Installation

The app can be installed as a PWA on any device. An install button is available in the settings page.
