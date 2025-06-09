import { FarmPlot, Animal, InventoryItem } from '@/store/slices/farmSlice';

/**
 * Calculates the growth progress of a crop based on the time passed
 * @param plot - The farm plot containing the crop
 * @param currentTime - Current timestamp in milliseconds
 * @returns Updated growth progress (0-100)
 */
export const calculateGrowthProgress = (
  plot: FarmPlot,
  currentTime: number
): number => {
  if (!plot.plantedAt || plot.growthProgress >= 100) {
    return plot.growthProgress || 0;
  }

  const growthRate = plot.isWatered ? 1.5 : 1; // 1.5x faster when watered
  const timeElapsed = (currentTime - plot.plantedAt) / 1000; // Convert to seconds
  const growthPerSecond = 100 / (plot.growthTime || 300); // Default 5 minutes to grow
  
  const progress = plot.growthProgress + (timeElapsed * growthPerSecond * growthRate);
  return Math.min(100, Math.max(0, progress));
};

/**
 * Calculates the happiness of an animal based on the time since last fed
 * @param animal - The animal to calculate happiness for
 * @param currentTime - Current timestamp in milliseconds
 * @returns Updated happiness percentage (0-100)
 */
export const calculateAnimalHappiness = (
  animal: Animal,
  currentTime: number
): number => {
  if (animal.lastFed === 0) return 0;
  
  const hoursSinceFed = (currentTime - animal.lastFed) / (1000 * 60 * 60);
  const happinessDecreasePerHour = 5; // Decrease 5% per hour
  const newHappiness = Math.max(0, 100 - (hoursSinceFed * happinessDecreasePerHour));
  
  return Math.round(newHappiness * 10) / 10; // Round to 1 decimal place
};

/**
 * Checks if an animal can produce an item based on happiness and time since last production
 * @param animal - The animal to check
 * @param currentTime - Current timestamp in milliseconds
 * @returns Boolean indicating if the animal can produce an item
 */
export const canProduceItem = (
  animal: Animal,
  currentTime: number
): boolean => {
  if (animal.happiness < 50) return false; // Too unhappy to produce
  
  const hoursSinceLastProduced = animal.lastProduced 
    ? (currentTime - animal.lastProduced) / (1000 * 60 * 60)
    : Infinity;
    
  const productionInterval = 2; // Hours between productions
  
  return hoursSinceLastProduced >= productionInterval;
};

/**
 * Calculates the experience gained from harvesting a crop
 * @param cropId - The ID of the crop being harvested
 * @returns Amount of experience points gained
 */
export const getHarvestXp = (cropId: string): number => {
  // Base XP values for different crops
  const xpValues: Record<string, number> = {
    'wheat': 10,
    'carrot': 15,
    'potato': 20,
    'corn': 25,
    'strawberry': 30,
    'dragon_fruit': 50,
  };
  
  // Remove '_seed' suffix if present
  const baseCropId = cropId.replace('_seed', '');
  return xpValues[baseCropId] || 10; // Default to 10 XP if crop not found
};

/**
 * Calculates the experience needed to reach the next level
 * @param currentLevel - The current level
 * @returns Experience points needed to reach the next level
 */
export const getXpForNextLevel = (currentLevel: number): number => {
  return currentLevel * 100; // Simple linear progression
};

/**
 * Finds an item in the inventory by ID
 * @param inventory - Array of inventory items
 * @param itemId - ID of the item to find
 * @returns The inventory item if found, otherwise undefined
 */
export const findInventoryItem = (
  inventory: InventoryItem[],
  itemId: string
): InventoryItem | undefined => {
  return inventory.find(item => item.itemId === itemId);
};

/**
 * Checks if the player has enough of an item in their inventory
 * @param inventory - Array of inventory items
 * @param itemId - ID of the item to check
 * @param quantity - Required quantity (default: 1)
 * @returns Boolean indicating if the player has enough of the item
 */
export const hasEnoughItems = (
  inventory: InventoryItem[],
  itemId: string,
  quantity: number = 1
): boolean => {
  const item = findInventoryItem(inventory, itemId);
  return item ? item.quantity >= quantity : false;
};

/**
 * Generates a random ID
 * @param prefix - Optional prefix for the ID
 * @returns A random ID string
 */
export const generateId = (prefix: string = ''): string => {
  return `${prefix}${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Gets the sell price of an item
 * @param itemId - ID of the item
 * @returns The sell price in diamonds
 */
export const getSellPrice = (itemId: string): number => {
  // Base sell prices for different items
  const prices: Record<string, number> = {
    'wheat': 5,
    'carrot': 8,
    'potato': 12,
    'corn': 15,
    'strawberry': 20,
    'dragon_fruit': 50,
    'egg': 10,
    'milk': 25,
    'magic_dust': 100,
  };
  
  return prices[itemId] || 0;
};

/**
 * Calculates the boost multiplier based on animal happiness
 * @param happiness - The animal's happiness percentage (0-100)
 * @returns A multiplier value (1.0 - 2.0)
 */
export const getHappinessBoost = (happiness: number): number => {
  // Linear scale from 1.0 (0% happiness) to 2.0 (100% happiness)
  return 1 + (happiness / 100);
};
