import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState, AppDispatch } from '@/store';
import { spendDiamonds, spendGold } from './userSlice';
import { buyItem } from './farmSlice';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'seed' | 'animal' | 'decoration' | 'booster';
  rarity: Rarity;
  image: string;
  emoji?: string;
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

// generateId 미사용으로 삭제

// Initial shop items
const initialItems: ShopItem[] = [
  // Crops
  {
    id: 'carrot_seed',
    name: 'Carrot Seeds',
    description: 'Grows into delicious carrots! Takes 1 hour to grow.',
    price: 10,
    type: 'seed',
    rarity: 'common',
    image: 'carrot_seeds.png',
    emoji: '🥕',
  },
  {
    id: 'tomato_seed',
    name: 'Tomato Seeds',
    description: 'Grows into juicy tomatoes! Takes 2 hours to grow.',
    price: 20,
    type: 'seed',
    rarity: 'common',
    image: 'tomato_seeds.png',
    emoji: '🍅',
  },
  {
    id: 'pumpkin_seed',
    name: 'Pumpkin Seeds',
    description: 'Grows into big pumpkins! Takes 4 hours to grow.',
    price: 40,
    type: 'seed',
    rarity: 'uncommon',
    image: 'pumpkin_seeds.png',
    emoji: '🎃',
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
    emoji: '🐔',
  },
  {
    id: 'cow',
    name: 'Cow',
    description: 'Produces milk every 4 hours. Needs to be fed daily.',
    price: 250,
    type: 'animal',
    rarity: 'rare',
    image: 'cow.png',
    emoji: '🐮',
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
    emoji: '✨',
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
    emoji: '🍀',
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
// 구매 thunk: 타입 명시
export const purchaseItem = (itemId: string, quantity: number = 1) =>
  async (dispatch: AppDispatch, getState: () => RootState): Promise<boolean> => {
    const state = getState();
    const item = state.shop.items.find((i: ShopItem) => i.id === itemId);
    
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
      
      // 실제 농장 인벤토리/동물에 반영
      if (item.type === 'animal' || item.type === 'seed') {
        dispatch(buyItem({ itemId, quantity }));
      }
      // For now, we'll just log the purchase
      console.log(`Purchased ${quantity}x ${item.name} for ${totalPrice} diamonds`);
      
      return true;
    } catch (error) {
      console.error('Purchase failed:', error);
      return false;
    }
  };

// Gacha function
// AppThunk 타입 명확화 (비동기 Thunk)
// 가챠 카테고리별 뽑기 (씨앗/동물 pool 분리)
export const pullGacha = (payload: { category: 'plant' | 'animal', gachaType: 'single' | 'multi', currency: 'gold' | 'diamond' }) =>
  async (dispatch: AppDispatch, getState: () => RootState): Promise<ShopItem[]> => {
    const { category, gachaType, currency } = payload;
    const state = getState();
    const pullCount = gachaType === 'single' ? 1 : 10;

    const costs = {
      single: { diamond: 100, gold: 500 },
      multi: { diamond: 900, gold: 4500 },
    };

    const cost = costs[gachaType][currency];

    if (currency === 'diamond') {
      if (state.user.diamonds < cost) {
        console.error('Not enough diamonds');
        return [];
      }
      dispatch(spendDiamonds(cost));
    } else { // gold
      if (state.user.gold < cost) {
        console.error('Not enough gold');
        return [];
      }
      dispatch(spendGold(cost));
    }

    // 뽑기 결과
    const results: ShopItem[] = [];

    for (let i = 0; i < pullCount; i++) {
      // Simple gacha logic - in a real app, this would be more sophisticated
      const roll = Math.random() * 100;
      let rarity: Rarity = 'common';

      if (roll > 95) rarity = 'legendary';
      else if (roll > 85) rarity = 'epic';
      else if (roll > 70) rarity = 'rare';
      else if (roll > 40) rarity = 'uncommon';

      // 카테고리별 뽑기 pool 분리
      let gachaPool: ShopItem[];

      if (category === 'plant') {
        gachaPool = state.shop.items.filter(item => item.type === 'seed');
      } else if (category === 'animal') {
        gachaPool = state.shop.items.filter(item => item.type === 'animal');
      } else {
        gachaPool = state.shop.items;
      }

      const eligibleItems = gachaPool.filter((item: ShopItem) => item.rarity === rarity);

      if (eligibleItems.length > 0) {
        const randomIndex = Math.floor(Math.random() * eligibleItems.length);
        results.push(eligibleItems[randomIndex]);
      } else {
        // Fallback: 카테고리 pool에서 아무거나
        if (gachaPool.length > 0) {
          const fallbackIndex = Math.floor(Math.random() * gachaPool.length);
          results.push(gachaPool[fallbackIndex]);
        }
      }
    }

    // 아이템 지급
    results.forEach(item => {
      if (item.type === 'animal' || item.type === 'seed') {
        dispatch(buyItem({ itemId: item.id, quantity: 1 }));
      } else {
        // Handle other item types like decorations or boosters if needed
      }
    });

    return results;
  };

export const { addItem, updateItem, removeItem, refreshShop } = shopSlice.actions;

export default shopSlice.reducer;
