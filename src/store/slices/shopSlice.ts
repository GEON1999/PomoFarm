import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk } from '@/store';
import { addDiamonds, spendDiamonds } from './userSlice';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'crop' | 'animal' | 'decoration' | 'booster';
  rarity: Rarity;
  image: string;
  quantity?: number;
  effect?: {
    type: string;
    value: number;
    duration?: number; // in seconds
  };
}

interface ShopState {
  items: ShopItem[];
  lastRefresh: number;
  featuredItems: string[]; // IDs of featured items
}

// Helper function to generate a random ID
const generateId = (prefix: string) => `${prefix}_${Math.random().toString(36).substr(2, 9)}`;

// Initial shop items
const initialItems: ShopItem[] = [
  // Crops
  {
    id: 'carrot_seeds',
    name: 'Carrot Seeds',
    description: 'Grows into delicious carrots! Takes 1 hour to grow.',
    price: 10,
    type: 'crop',
    rarity: 'common',
    image: 'carrot_seeds.png',
  },
  {
    id: 'tomato_seeds',
    name: 'Tomato Seeds',
    description: 'Grows into juicy tomatoes! Takes 2 hours to grow.',
    price: 20,
    type: 'crop',
    rarity: 'common',
    image: 'tomato_seeds.png',
  },
  {
    id: 'pumpkin_seeds',
    name: 'Pumpkin Seeds',
    description: 'Grows into big pumpkins! Takes 4 hours to grow.',
    price: 40,
    type: 'crop',
    rarity: 'uncommon',
    image: 'pumpkin_seeds.png',
  },
  
  // Animals
  {
    id: 'chicken',
    name: 'Chicken',
    description: 'Lays eggs every 2 hours. Needs to be fed daily.',
    price: 100,
    type: 'animal',
    rarity: 'uncommon',
    image: 'chicken.png',
  },
  {
    id: 'cow',
    name: 'Cow',
    description: 'Produces milk every 4 hours. Needs to be fed daily.',
    price: 250,
    type: 'animal',
    rarity: 'rare',
    image: 'cow.png',
  },
  
  // Boosters
  {
    id: 'growth_booster',
    name: 'Growth Booster',
    description: 'Speeds up crop growth by 2x for 1 hour.',
    price: 50,
    type: 'booster',
    rarity: 'rare',
    image: 'growth_booster.png',
    effect: {
      type: 'growthSpeed',
      value: 2,
      duration: 3600, // 1 hour in seconds
    },
  },
  {
    id: 'lucky_charm',
    name: 'Lucky Charm',
    description: 'Increases rare item chance by 20% for the next pull.',
    price: 75,
    type: 'booster',
    rarity: 'epic',
    image: 'lucky_charm.png',
    effect: {
      type: 'luckBoost',
      value: 20,
    },
  },
];

const initialState: ShopState = {
  items: initialItems,
  lastRefresh: Date.now(),
  featuredItems: ['chicken', 'growth_booster'], // Example featured items
};

const shopSlice = createSlice({
  name: 'shop',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<ShopItem>) => {
      state.items.push(action.payload);
    },
    
    updateItem: (state, action: PayloadAction<{id: string; changes: Partial<ShopItem>}>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = {
          ...state.items[index],
          ...action.payload.changes,
        };
      }
    },
    
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    
    refreshShop: (state) => {
      // In a real app, this would fetch new items from a server
      // For now, we'll just update the last refresh time
      state.lastRefresh = Date.now();
      
      // Rotate featured items (simple implementation)
      if (state.items.length > 2) {
        const availableItems = state.items.map(item => item.id);
        state.featuredItems = [
          availableItems[Math.floor(Math.random() * availableItems.length)],
          availableItems[Math.floor(Math.random() * availableItems.length)],
        ];
      }
    },
  },
});

// Thunks
export const purchaseItem = (itemId: string, quantity: number = 1): AppThunk<Promise<boolean>> => 
  async (dispatch, getState) => {
    const state = getState();
    const item = state.shop.items.find(i => i.id === itemId);
    
    if (!item) {
      console.error('Item not found:', itemId);
      return false;
    }
    
    const totalPrice = item.price * quantity;
    
    // Check if user has enough diamonds
    if (state.user.diamonds < totalPrice) {
      console.error('Not enough diamonds');
      return false;
    }
    
    try {
      // Spend diamonds
      dispatch(spendDiamonds(totalPrice));
      
      // Add item to inventory or apply effect
      // This would be handled by the appropriate slice (farm, user, etc.)
      // For now, we'll just log the purchase
      console.log(`Purchased ${quantity}x ${item.name} for ${totalPrice} diamonds`);
      
      return true;
    } catch (error) {
      console.error('Purchase failed:', error);
      return false;
    }
  };

// Gacha function
export const pullGacha = (gachaType: 'single' | 'multi' = 'single'): AppThunk<Promise<ShopItem[]>> => 
  async (dispatch, getState) => {
    const state = getState();
    const pullCount = gachaType === 'single' ? 1 : 10;
    const pullPrice = gachaType === 'single' ? 100 : 900; // 10% discount for multi
    
    // Check if user has enough diamonds
    if (state.user.diamonds < pullPrice) {
      throw new Error('Not enough diamonds');
    }
    
    try {
      // Spend diamonds
      dispatch(spendDiamonds(pullPrice));
      
      // Determine pulls based on rarity weights
      const rarityWeights = {
        common: 60,
        uncommon: 25,
        rare: 10,
        epic: 4,
        legendary: 1,
      };
      
      const results: ShopItem[] = [];
      
      for (let i = 0; i < pullCount; i++) {
        // Simple gacha logic - in a real app, this would be more sophisticated
        const roll = Math.random() * 100;
        let rarity: Rarity = 'common';
        
        if (roll > 95) rarity = 'legendary';
        else if (roll > 85) rarity = 'epic';
        else if (roll > 70) rarity = 'rare';
        else if (roll > 40) rarity = 'uncommon';
        
        // Filter items by rarity and pick a random one
        const eligibleItems = state.shop.items.filter(item => item.rarity === rarity);
        if (eligibleItems.length > 0) {
          const randomIndex = Math.floor(Math.random() * eligibleItems.length);
          results.push(eligibleItems[randomIndex]);
        } else {
          // Fallback to any item if no items of the selected rarity exist
          const fallbackIndex = Math.floor(Math.random() * state.shop.items.length);
          results.push(state.shop.items[fallbackIndex]);
        }
      }
      
      // Here you would typically add the pulled items to the user's inventory
      console.log('Gacha results:', results);
      
      return results;
    } catch (error) {
      console.error('Gacha pull failed:', error);
      throw error;
    }
  };

export const { addItem, updateItem, removeItem, refreshShop } = shopSlice.actions;

export default shopSlice.reducer;
