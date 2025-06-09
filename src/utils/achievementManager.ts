import { v4 as uuidv4 } from 'uuid';
import { notificationService } from './notifications';
import { soundManager } from './soundManager';

// Achievement categories
export enum AchievementCategory {
  TIMER = 'timer',
  FARMING = 'farming',
  ANIMALS = 'animals',
  SHOP = 'shop',
  GENERAL = 'general',
  MILESTONE = 'milestone',
}

// Rarity levels for achievements
export enum AchievementRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

// Achievement interface
export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string; // Emoji or icon name
  hidden: boolean; // Whether the achievement is hidden until unlocked
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  unlockedAt?: number; // Timestamp when unlocked
  reward?: {
    diamonds?: number;
    items?: Array<{ id: string; quantity: number }>;
  };
}

// Achievement definitions
const ACHIEVEMENTS: Omit<Achievement, 'id' | 'unlocked' | 'progress' | 'unlockedAt'>[] = [
  // Timer Achievements
  {
    title: 'First Step',
    description: 'Complete your first Pomodoro session',
    category: AchievementCategory.TIMER,
    rarity: AchievementRarity.COMMON,
    icon: '🎯',
    hidden: false,
    maxProgress: 1,
  },
  {
    title: 'Marathon Runner',
    description: 'Complete 100 Pomodoro sessions',
    category: AchievementCategory.TIMER,
    rarity: AchievementRarity.RARE,
    icon: '🏃',
    hidden: false,
    maxProgress: 100,
    reward: { diamonds: 50 },
  },
  {
    title: 'Time Lord',
    description: 'Spend 100 hours in Pomodoro mode',
    category: AchievementCategory.TIMER,
    rarity: AchievementRarity.EPIC,
    icon: '⏱️',
    hidden: false,
    maxProgress: 100 * 60 * 60, // 100 hours in seconds
  },
  
  // Farming Achievements
  {
    title: 'Green Thumb',
    description: 'Harvest your first crop',
    category: AchievementCategory.FARMING,
    rarity: AchievementRarity.COMMON,
    icon: '🌱',
    hidden: false,
    maxProgress: 1,
  },
  {
    title: 'Master Farmer',
    description: 'Harvest 100 crops',
    category: AchievementCategory.FARMING,
    rarity: AchievementRarity.UNCOMMON,
    icon: '👨‍🌾',
    hidden: false,
    maxProgress: 100,
    reward: { diamonds: 25 },
  },
  {
    title: 'Crop Collector',
    description: 'Harvest every type of crop at least once',
    category: AchievementCategory.FARMING,
    rarity: AchievementRarity.RARE,
    icon: '🌽',
    hidden: true,
    maxProgress: 1, // This would be updated based on the number of unique crops
  },
  
  // Animal Achievements
  {
    title: 'Animal Lover',
    description: 'Adopt your first animal',
    category: AchievementCategory.ANIMALS,
    rarity: AchievementRarity.COMMON,
    icon: '🐣',
    hidden: false,
    maxProgress: 1,
  },
  {
    title: 'Zoo Keeper',
    description: 'Have 5 animals on your farm',
    category: AchievementCategory.ANIMALS,
    rarity: AchievementRarity.UNCOMMON,
    icon: '🐄',
    hidden: false,
    maxProgress: 5,
  },
  {
    title: 'Perfect Caretaker',
    description: 'Keep an animal at maximum happiness for 7 days',
    category: AchievementCategory.ANIMALS,
    rarity: AchievementRarity.RARE,
    icon: '💖',
    hidden: true,
    maxProgress: 7, // Days
  },
  
  // Shop Achievements
  {
    title: 'First Purchase',
    description: 'Make your first purchase in the shop',
    category: AchievementCategory.SHOP,
    rarity: AchievementRarity.COMMON,
    icon: '🛒',
    hidden: false,
    maxProgress: 1,
  },
  {
    title: 'High Roller',
    description: 'Spend 1000 diamonds in the shop',
    category: AchievementCategory.SHOP,
    rarity: AchievementRarity.RARE,
    icon: '💰',
    hidden: false,
    maxProgress: 1000,
  },
  {
    title: 'Lucky Draw',
    description: 'Get a legendary item from the gacha',
    category: AchievementCategory.SHOP,
    rarity: AchievementRarity.LEGENDARY,
    icon: '🎰',
    hidden: true,
    maxProgress: 1,
    reward: { diamonds: 100 },
  },
  
  // Milestone Achievements
  {
    title: 'Getting Started',
    description: 'Reach level 5',
    category: AchievementCategory.MILESTONE,
    rarity: AchievementRarity.COMMON,
    icon: '⭐',
    hidden: false,
    maxProgress: 5,
  },
  {
    title: 'Halfway There',
    description: 'Reach level 25',
    category: AchievementCategory.MILESTONE,
    rarity: AchievementRarity.UNCOMMON,
    icon: '🌟',
    hidden: false,
    maxProgress: 25,
    reward: { diamonds: 25 },
  },
  {
    title: 'Master of Time',
    description: 'Reach level 50',
    category: AchievementCategory.MILESTONE,
    rarity: AchievementRarity.EPIC,
    icon: '🏆',
    hidden: false,
    maxProgress: 50,
    reward: { diamonds: 100 },
  },
];

/**
 * Achievement Manager class for handling game achievements
 */
class AchievementManager {
  private static instance: AchievementManager;
  private achievements: Record<string, Achievement> = {};
  private listeners: Array<(achievement: Achievement) => void> = [];

  private constructor() {
    // Initialize achievements with unique IDs
    ACHIEVEMENTS.forEach(ach => {
      const id = uuidv4();
      this.achievements[id] = {
        ...ach,
        id,
        unlocked: false,
        progress: 0,
      };
    });
  }

  /**
   * Get the singleton instance of the AchievementManager
   */
  public static getInstance(): AchievementManager {
    if (!AchievementManager.instance) {
      AchievementManager.instance = new AchievementManager();
    }
    return AchievementManager.instance;
  }

  /**
   * Load achievements from saved state
   */
  public loadState(savedState: Record<string, Achievement>): void {
    // Only load achievements that exist in our definitions
    Object.values(savedState).forEach(savedAch => {
      if (this.achievements[savedAch.id]) {
        this.achievements[savedAch.id] = {
          ...this.achievements[savedAch.id],
          ...savedAch,
        };
      }
    });
  }

  /**
   * Get the current state of all achievements
   */
  public getState(): Record<string, Achievement> {
    return { ...this.achievements };
  }

  /**
   * Get all achievements, optionally filtered by category or unlocked status
   */
  public getAchievements(filter?: {
    category?: AchievementCategory;
    unlocked?: boolean;
    hidden?: boolean;
  }): Achievement[] {
    return Object.values(this.achievements).filter(ach => {
      if (filter?.category !== undefined && ach.category !== filter.category) return false;
      if (filter?.unlocked !== undefined && ach.unlocked !== filter.unlocked) return false;
      if (filter?.hidden !== undefined && ach.hidden !== filter.hidden) return false;
      return true;
    });
  }

  /**
   * Get a specific achievement by ID
   */
  public getAchievement(id: string): Achievement | null {
    return this.achievements[id] || null;
  }

  /**
   * Update progress for an achievement
   * @param achievementId - The ID of the achievement to update
   * @param progress - The amount to add to the current progress
   * @param setExact - If true, sets the progress to the exact value instead of adding to it
   */
  public updateProgress(
    achievementId: string,
    progress: number,
    setExact: boolean = false
  ): void {
    const achievement = this.achievements[achievementId];
    if (!achievement || achievement.unlocked) return;

    const newProgress = setExact 
      ? Math.min(progress, achievement.maxProgress)
      : Math.min(achievement.progress + progress, achievement.maxProgress);

    // Only update if progress has changed
    if (newProgress !== achievement.progress) {
      const wasUnlocked = achievement.unlocked;
      achievement.progress = newProgress;
      
      // Check if achievement is now unlocked
      if (!wasUnlocked && achievement.progress >= achievement.maxProgress) {
        this.unlockAchievement(achievementId);
      } else {
        // Notify listeners of progress update
        this.notifyListeners(achievement);
      }
    }
  }

  /**
   * Unlock an achievement
   */
  public unlockAchievement(achievementId: string): void {
    const achievement = this.achievements[achievementId];
    if (!achievement || achievement.unlocked) return;

    achievement.unlocked = true;
    achievement.progress = achievement.maxProgress; // Ensure progress is at max
    achievement.unlockedAt = Date.now();

    // Show notification
    this.showAchievementUnlocked(achievement);

    // Notify listeners
    this.notifyListeners(achievement);
  }

  /**
   * Reset an achievement's progress
   */
  public resetAchievement(achievementId: string): void {
    const achievement = this.achievements[achievementId];
    if (!achievement) return;

    achievement.unlocked = false;
    achievement.progress = 0;
    delete achievement.unlockedAt;

    // Notify listeners
    this.notifyListeners(achievement);
  }

  /**
   * Add a listener for achievement updates
   */
  public addListener(listener: (achievement: Achievement) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Show achievement unlocked notification
   */
  private showAchievementUnlocked(achievement: Achievement): void {
    // Play sound
    soundManager.play('notification');
    
    // Show notification
    notificationService.add(
      `Achievement Unlocked: ${achievement.title}`,
      {
        type: 'success',
        duration: 5000,
      }
    );
    
    // Log to console for debugging
    console.log(`Achievement Unlocked: ${achievement.title} - ${achievement.description}`);
  }

  /**
   * Notify all listeners of an achievement update
   */
  private notifyListeners(achievement: Achievement): void {
    const achCopy = { ...achievement };
    this.listeners.forEach(listener => {
      try {
        listener(achCopy);
      } catch (error) {
        console.error('Error in achievement listener:', error);
      }
    });
  }
}

// Export a singleton instance
export const achievementManager = AchievementManager.getInstance();

export default achievementManager;
