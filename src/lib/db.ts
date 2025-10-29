// IndexedDB for Water Tracking App
// Database schema and utility functions

export interface WaterLog {
    id?: number;
    date: string; // YYYY-MM-DD format
    timestamp: number; // Unix timestamp
    quantity: number; // Amount in ml
    glasses: number; // Number of glasses consumed
}

export interface Settings {
    id?: number;
    glassSize: number; // ml per glass (default 250ml)
    dailyGoal: number; // ml per day
    monthlyGoal: number; // ml per month
    notificationsEnabled: boolean; // enable/disable notifications
    reminderInterval: number; // reminder interval in minutes (default 20)
}

export interface DailyStats {
    date: string;
    progress: number;
    totalQuantity: number;
    totalGlasses: number;
    goalAchieved: boolean;
}

const DB_NAME = 'WaterTrackerDB';
const DB_VERSION = 1;
const WATER_LOGS_STORE = 'waterLogs';
const SETTINGS_STORE = 'settings';

let db: IDBDatabase | null = null;

/**
 * Initialize IndexedDB database
 * Creates object stores for water logs and settings
 */
export const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            reject(new Error('Failed to open database'));
        };

        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = (event.target as IDBOpenDBRequest).result;

            // Create water logs store
            if (!database.objectStoreNames.contains(WATER_LOGS_STORE)) {
                const waterLogsStore = database.createObjectStore(WATER_LOGS_STORE, {
                    keyPath: 'id',
                    autoIncrement: true,
                });
                waterLogsStore.createIndex('date', 'date', { unique: false });
                waterLogsStore.createIndex('timestamp', 'timestamp', { unique: false });
            }

            // Create settings store
            if (!database.objectStoreNames.contains(SETTINGS_STORE)) {
                database.createObjectStore(SETTINGS_STORE, {
                    keyPath: 'id',
                    autoIncrement: true,
                });
            }
        };
    });
};

/**
 * Add a new water log entry
 * @param glasses - Number of glasses consumed
 * @param customQuantity - Optional custom quantity per glass (uses setting if not provided)
 */
export const addWaterLog = async (glasses: number, customQuantity?: number): Promise<number> => {
    const database = await initDB();
    const settings = await getSettings();
    const quantity = customQuantity || settings.glassSize;
    const totalQuantity = glasses * quantity;

    const waterLog: WaterLog = {
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        timestamp: Date.now(),
        quantity: totalQuantity,
        glasses: glasses,
    };

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([WATER_LOGS_STORE], 'readwrite');
        const store = transaction.objectStore(WATER_LOGS_STORE);
        const request = store.add(waterLog);

        request.onsuccess = () => {
            resolve(request.result as number);
        };

        request.onerror = () => {
            reject(new Error('Failed to add water log'));
        };
    });
};

/**
 * Get all water logs for a specific date
 * @param date - Date in YYYY-MM-DD format
 */
export const getWaterLogsByDate = async (date: string): Promise<WaterLog[]> => {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([WATER_LOGS_STORE], 'readonly');
        const store = transaction.objectStore(WATER_LOGS_STORE);
        const index = store.index('date');
        const request = index.getAll(date);

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(new Error('Failed to get water logs'));
        };
    });
};

/**
 * Get water logs for a date range
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 */
export const getWaterLogsByDateRange = async (startDate: string, endDate: string): Promise<WaterLog[]> => {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([WATER_LOGS_STORE], 'readonly');
        const store = transaction.objectStore(WATER_LOGS_STORE);
        const index = store.index('date');
        const range = IDBKeyRange.bound(startDate, endDate);
        const request = index.getAll(range);

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(new Error('Failed to get water logs by date range'));
        };
    });
};

/**
 * Get all water logs
 */
export const getAllWaterLogs = async (): Promise<WaterLog[]> => {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([WATER_LOGS_STORE], 'readonly');
        const store = transaction.objectStore(WATER_LOGS_STORE);
        const request = store.getAll();

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(new Error('Failed to get all water logs'));
        };
    });
};

/**
 * Delete a water log entry
 * @param id - ID of the water log to delete
 */
export const deleteWaterLog = async (id: number): Promise<void> => {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([WATER_LOGS_STORE], 'readwrite');
        const store = transaction.objectStore(WATER_LOGS_STORE);
        const request = store.delete(id);

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = () => {
            reject(new Error('Failed to delete water log'));
        };
    });
};

/**
 * Update a water log entry
 * @param id - ID of the water log to update
 * @param updates - Partial water log data to update
 */
export const updateWaterLog = async (id: number, updates: Partial<WaterLog>): Promise<void> => {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([WATER_LOGS_STORE], 'readwrite');
        const store = transaction.objectStore(WATER_LOGS_STORE);
        const getRequest = store.get(id);

        getRequest.onsuccess = () => {
            const existingLog = getRequest.result;
            if (!existingLog) {
                reject(new Error('Water log not found'));
                return;
            }

            const updatedLog = { ...existingLog, ...updates };
            const putRequest = store.put(updatedLog);

            putRequest.onsuccess = () => {
                resolve();
            };

            putRequest.onerror = () => {
                reject(new Error('Failed to update water log'));
            };
        };

        getRequest.onerror = () => {
            reject(new Error('Failed to get water log for update'));
        };
    });
};

/**
 * Get current settings or create default settings
 */
export const getSettings = async (): Promise<Settings> => {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([SETTINGS_STORE], 'readonly');
        const store = transaction.objectStore(SETTINGS_STORE);
        const request = store.getAll();

        request.onsuccess = () => {
            const settings = request.result;
            if (settings.length > 0) {
                resolve(settings[0]);
            } else {
                // Return default settings
                resolve({
                    glassSize: 250, // 250ml per glass
                    dailyGoal: 2000, // 2000ml per day (8 glasses)
                    monthlyGoal: 60000, // 60L per month
                    notificationsEnabled: true, // notifications enabled by default
                    reminderInterval: 20, // 20 minutes default
                });
            }
        };

        request.onerror = () => {
            reject(new Error('Failed to get settings'));
        };
    });
};

/**
 * Update settings
 * @param newSettings - New settings to save
 */
export const updateSettings = async (newSettings: Omit<Settings, 'id'>): Promise<void> => {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([SETTINGS_STORE], 'readwrite');
        const store = transaction.objectStore(SETTINGS_STORE);

        // First, get existing settings
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
            const existingSettings = getAllRequest.result;

            if (existingSettings.length > 0) {
                // Update existing settings
                const updatedSettings = { ...existingSettings[0], ...newSettings };
                const putRequest = store.put(updatedSettings);

                putRequest.onsuccess = () => {
                    resolve();
                };

                putRequest.onerror = () => {
                    reject(new Error('Failed to update settings'));
                };
            } else {
                // Create new settings
                const addRequest = store.add(newSettings);

                addRequest.onsuccess = () => {
                    resolve();
                };

                addRequest.onerror = () => {
                    reject(new Error('Failed to create settings'));
                };
            }
        };

        getAllRequest.onerror = () => {
            reject(new Error('Failed to get existing settings'));
        };
    });
};

/**
 * Get daily statistics for a specific date
 * @param date - Date in YYYY-MM-DD format
 */
export const getDailyStats = async (date: string): Promise<DailyStats> => {
    const logs = await getWaterLogsByDate(date);
    const settings = await getSettings();

    const totalQuantity = logs.reduce((sum, log) => sum + log.quantity, 0);
    const totalGlasses = logs.reduce((sum, log) => sum + log.glasses, 0);
    const goalAchieved = totalQuantity >= settings.dailyGoal;
    const progress = Math.min(100, Math.round((totalQuantity / settings.dailyGoal) * 100));

    return {
        date,
        progress,
        totalQuantity,
        totalGlasses,
        goalAchieved,
    };
};

/**
 * Get weekly statistics
 * @param startDate - Start date of the week in YYYY-MM-DD format
 */
export const getWeeklyStats = async (startDate: string): Promise<DailyStats[]> => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    const endDateStr = endDate.toISOString().split('T')[0];

    const logs = await getWaterLogsByDateRange(startDate, endDateStr);
    const settings = await getSettings();

    // Group logs by date
    const logsByDate: { [date: string]: WaterLog[] } = {};
    logs.forEach(log => {
        if (!logsByDate[log.date]) {
            logsByDate[log.date] = [];
        }
        logsByDate[log.date].push(log);
    });

    // Generate stats for each day of the week
    const weeklyStats: DailyStats[] = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < 7; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayLogs = logsByDate[dateStr] || [];

        const totalQuantity = dayLogs.reduce((sum, log) => sum + log.quantity, 0);
        const totalGlasses = dayLogs.reduce((sum, log) => sum + log.glasses, 0);
        const goalAchieved = totalQuantity >= settings.dailyGoal;
        const progress = Math.min(100, Math.round((totalQuantity / settings.dailyGoal) * 100));
        weeklyStats.push({
            date: dateStr,
            progress,
            totalQuantity,
            totalGlasses,
            goalAchieved,
        });

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return weeklyStats;
};

/**
 * Get monthly statistics
 * @param year - Year
 * @param month - Month (1-12)
 */
export const getMonthlyStats = async (year: number, month: number): Promise<{
    totalQuantity: number;
    totalGlasses: number;
    daysWithGoal: number;
    totalDays: number;
    goalAchieved: boolean;
}> => {
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const logs = await getWaterLogsByDateRange(startDate, endDate);
    const settings = await getSettings();

    // Group logs by date
    const logsByDate: { [date: string]: WaterLog[] } = {};
    logs.forEach(log => {
        if (!logsByDate[log.date]) {
            logsByDate[log.date] = [];
        }
        logsByDate[log.date].push(log);
    });

    const totalQuantity = logs.reduce((sum, log) => sum + log.quantity, 0);
    const totalGlasses = logs.reduce((sum, log) => sum + log.glasses, 0);

    // Count days where daily goal was achieved
    let daysWithGoal = 0;
    Object.keys(logsByDate).forEach(date => {
        const dayTotal = logsByDate[date].reduce((sum, log) => sum + log.quantity, 0);
        if (dayTotal >= settings.dailyGoal) {
            daysWithGoal++;
        }
    });

    const totalDays = new Date(year, month, 0).getDate();
    const goalAchieved = totalQuantity >= settings.monthlyGoal;

    return {
        totalQuantity,
        totalGlasses,
        daysWithGoal,
        totalDays,
        goalAchieved,
    };
};

/**
 * Calculate current streak (consecutive days with goal achieved)
 */
export const getCurrentStreak = async (): Promise<number> => {
    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);

    // Check backwards from today
    while (true) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dailyStats = await getDailyStats(dateStr);

        if (dailyStats.goalAchieved) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }

        // Prevent infinite loop - max 365 days
        if (streak >= 365) break;
    }

    return streak;
};

/**
 * Get progress percentage for today
 */
export const getTodayProgress = async (): Promise<number> => {
    const today = new Date().toISOString().split('T')[0];
    const dailyStats = await getDailyStats(today);
    return dailyStats.progress;
};

/**
 * Clear all data (for testing or reset purposes)
 */
export const clearAllData = async (): Promise<void> => {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([WATER_LOGS_STORE, SETTINGS_STORE], 'readwrite');

        const waterLogsStore = transaction.objectStore(WATER_LOGS_STORE);
        const settingsStore = transaction.objectStore(SETTINGS_STORE);

        waterLogsStore.clear();
        settingsStore.clear();

        transaction.oncomplete = () => {
            resolve();
        };

        transaction.onerror = () => {
            reject(new Error('Failed to clear data'));
        };
    });
};

/**
 * Get the last water intake time (for cooldown calculation)
 */
export const getLastIntakeTime = async (): Promise<number | null> => {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([WATER_LOGS_STORE], 'readonly');
        const store = transaction.objectStore(WATER_LOGS_STORE);
        const index = store.index('timestamp');

        // Get the last entry by timestamp
        const request = index.openCursor(null, 'prev');

        request.onsuccess = () => {
            const cursor = request.result;
            if (cursor) {
                resolve(cursor.value.timestamp);
            } else {
                resolve(null);
            }
        };

        request.onerror = () => {
            reject(new Error('Failed to get last intake time'));
        };
    });
};
