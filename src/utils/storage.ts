/**
 * Local storage keys for the application
 */
const STORAGE_KEYS = {
  USER: 'pomofarm_user',
  FARM: 'pomofarm_farm',
  TIMER: 'pomofarm_timer',
  SHOP: 'pomofarm_shop',
  SETTINGS: 'pomofarm_settings',
  LAST_SAVE: 'pomofarm_last_save',
} as const;

type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

/**
 * Safely gets an item from localStorage
 * @param key - The storage key
 * @returns The parsed item or null if not found or error occurs
 */
const getItem = <T>(key: StorageKey): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting item from localStorage (${key}):`, error);
    return null;
  }
};

/**
 * Safely sets an item in localStorage
 * @param key - The storage key
 * @param value - The value to store
 */
const setItem = <T>(key: StorageKey, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting item in localStorage (${key}):`, error);
  }
};

/**
 * Removes an item from localStorage
 * @param key - The storage key to remove
 */
const removeItem = (key: StorageKey): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing item from localStorage (${key}):`, error);
  }
};

/**
 * Clears all application data from localStorage
 */
export const clearAppData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    removeItem(key as StorageKey);
  });
};

/**
 * Saves the entire application state to localStorage
 * @param state - The complete Redux state
 */
export const saveState = (state: any): void => {
  try {
    // Save each slice of state separately
    setItem(STORAGE_KEYS.USER, state.user);
    setItem(STORAGE_KEYS.FARM, state.farm);
    setItem(STORAGE_KEYS.TIMER, state.timer);
    setItem(STORAGE_KEYS.SHOP, state.shop);
    setItem(STORAGE_KEYS.LAST_SAVE, Date.now());
  } catch (error) {
    console.error('Error saving state to localStorage:', error);
  }
};

/**
 * Loads the entire application state from localStorage
 * @returns The loaded state or null if no saved state exists
 */
export const loadState = (): any | null => {
  try {
    const user = getItem(STORAGE_KEYS.USER);
    const farm = getItem(STORAGE_KEYS.FARM);
    const timer = getItem(STORAGE_KEYS.TIMER);
    const shop = getItem(STORAGE_KEYS.SHOP);
    const settings = getItem(STORAGE_KEYS.SETTINGS);
    const lastSave = getItem<number>(STORAGE_KEYS.LAST_SAVE);

    // If no saved state exists, return null to use the initial state
    if (!user && !farm && !timer && !shop) {
      return null;
    }

    // Return the loaded state, merging with defaults if necessary
    return {
      user: user || {},
      farm: farm || {},
      timer: timer || {},
      shop: shop || {},
      settings: settings || {},
      _lastSave: lastSave || null,
    };
  } catch (error) {
    console.error('Error loading state from localStorage:', error);
    return null;
  }
};

/**
 * Saves user settings to localStorage
 * @param settings - The settings object to save
 */
export const saveSettings = (settings: any): void => {
  setItem(STORAGE_KEYS.SETTINGS, settings);
};

/**
 * Loads user settings from localStorage
 * @returns The loaded settings or null if not found
 */
export const loadSettings = (): any | null => {
  return getItem(STORAGE_KEYS.SETTINGS);
};

/**
 * Gets the timestamp of the last save
 * @returns The timestamp in milliseconds or null if not found
 */
export const getLastSaveTime = (): number | null => {
  return getItem<number>(STORAGE_KEYS.LAST_SAVE);
};

/**
 * Checks if there's unsaved data that could be loaded
 * @returns Boolean indicating if there's saved data
 */
export const hasSavedData = (): boolean => {
  return (
    localStorage.getItem(STORAGE_KEYS.USER) !== null ||
    localStorage.getItem(STORAGE_KEYS.FARM) !== null ||
    localStorage.getItem(STORAGE_KEYS.TIMER) !== null ||
    localStorage.getItem(STORAGE_KEYS.SHOP) !== null
  );
};

/**
 * Creates a backup of the current state as a downloadable file
 */
export const createBackup = (): void => {
  try {
    const state = {
      user: getItem(STORAGE_KEYS.USER),
      farm: getItem(STORAGE_KEYS.FARM),
      timer: getItem(STORAGE_KEYS.TIMER),
      shop: getItem(STORAGE_KEYS.SHOP),
      settings: getItem(STORAGE_KEYS.SETTINGS),
      _backupDate: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportName = `pomofarm-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    linkElement.click();
  } catch (error) {
    console.error('Error creating backup:', error);
    throw error;
  }
};

/**
 * Restores the application state from a backup file
 * @param file - The backup file to restore from
 * @returns A promise that resolves when the restore is complete
 */
export const restoreFromBackup = (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const backup = JSON.parse(event.target?.result as string);
        
        // Validate the backup structure
        if (!backup.user || !backup.farm || !backup.timer || !backup.shop) {
          throw new Error('Invalid backup file format');
        }
        
        // Save each part of the backup
        setItem(STORAGE_KEYS.USER, backup.user);
        setItem(STORAGE_KEYS.FARM, backup.farm);
        setItem(STORAGE_KEYS.TIMER, backup.timer);
        setItem(STORAGE_KEYS.SHOP, backup.shop);
        
        if (backup.settings) {
          setItem(STORAGE_KEYS.SETTINGS, backup.settings);
        }
        
        setItem(STORAGE_KEYS.LAST_SAVE, Date.now());
        
        resolve();
      } catch (error) {
        console.error('Error parsing backup file:', error);
        reject(new Error('Failed to parse backup file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading backup file'));
    };
    
    reader.readAsText(file);
  });
};

export default {
  getItem,
  setItem,
  removeItem,
  clearAppData,
  saveState,
  loadState,
  saveSettings,
  loadSettings,
  getLastSaveTime,
  hasSavedData,
  createBackup,
  restoreFromBackup,
  STORAGE_KEYS,
};
