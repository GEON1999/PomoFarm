import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState, AppDispatch } from '@/store';
import { spendDiamonds } from './userSlice';
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
  },
  {
    id: 'tomato_seed',
    name: 'Tomato Seeds',
    description: 'Grows into juicy tomatoes! Takes 2 hours to grow.',
    price: 20,
    type: 'seed',
    rarity: 'common',
    image: 'tomato_seeds.png',
  },
  {
    id: 'pumpkin_seed',
    name: 'Pumpkin Seeds',
    description: 'Grows into big pumpkins! Takes 4 hours to grow.',
    price: 40,
    type: 'seed',
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
export const pullGacha = (category: 'plant' | 'animal' | 'crop' | 'animal_product', gachaType: 'single' | 'multi' = 'single') =>
  async (dispatch: AppDispatch, getState: () => RootState): Promise<ShopItem[]> => {
    const state = getState();
    const pullCount = gachaType === 'single' ? 1 : 10;
    let enoughResource = true;
    let costLabel = '';
    if (category === 'crop') {
      // crop 가챠: 임의의 crop 5개 필요
      const crops = Object.values(state.user.inventory).filter((item: any) => item.type === 'crop');
      const totalCrops = crops.reduce((sum: number, item: any) => sum + item.quantity, 0);
      if (totalCrops < 5 * pullCount) {
        throw new Error('Not enough crops for gacha');
      }
      costLabel = `${5 * pullCount} crops`;
    } else if (category === 'animal_product') {
      // animal_product 가챠: 임의의 animal_product 3개 필요
      const animalProds = Object.values(state.user.inventory).filter((item: any) => item.type === 'animal_product');
      const totalProds = animalProds.reduce((sum: number, item: any) => sum + item.quantity, 0);
      if (totalProds < 3 * pullCount) {
        throw new Error('Not enough animal products for gacha');
      }
      costLabel = `${3 * pullCount} animal products`;
    } else {
      // 다이아로 진행
      const pullPrice = gachaType === 'single' ? 100 : 900;
      if (state.user.diamonds < pullPrice) {
        throw new Error('Not enough diamonds');
      }
      costLabel = `${pullPrice} diamonds`;
    }
    
    try {
      // 자원 차감
      if (category === 'crop') {
        let left = 5 * pullCount;
        for (const item of Object.values(state.user.inventory)) {
          if (item.type === 'crop' && left > 0) {
            const use = Math.min(item.quantity, left);
            dispatch({type: 'user/removeFromInventory', payload: {itemId: item.id, quantity: use}});
            left -= use;
          }
        }
      } else if (category === 'animal_product') {
        let left = 3 * pullCount;
        for (const item of Object.values(state.user.inventory)) {
          if (item.type === 'animal_product' && left > 0) {
            const use = Math.min(item.quantity, left);
            dispatch({type: 'user/removeFromInventory', payload: {itemId: item.id, quantity: use}});
            left -= use;
          }
        }
      } else {
        const pullPrice = gachaType === 'single' ? 100 : 900;
        dispatch(spendDiamonds(pullPrice));
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
        let pool: ShopItem[] = [];
        if (category === 'plant') {
          pool = state.shop.items.filter((item: ShopItem) => item.type === 'seed');
        } else if (category === 'animal') {
          pool = state.shop.items.filter((item: ShopItem) => item.type === 'animal');
        } else if (category === 'crop') {
          pool = state.shop.items.filter((item: ShopItem) => item.type === 'crop');
        } else if (category === 'animal_product') {
          pool = state.shop.items.filter((item: ShopItem) => item.type === 'animal_product');
        } else {
          pool = state.shop.items;
        }
        
        const eligibleItems = pool.filter((item: ShopItem) => item.rarity === rarity);
        
        if (eligibleItems.length > 0) {
          const randomIndex = Math.floor(Math.random() * eligibleItems.length);
          results.push(eligibleItems[randomIndex]);
        } else {
          // Fallback: 카테고리 pool에서 아무거나
          const fallbackPool: ShopItem[] = state.shop.items.filter((item: ShopItem) => {
             if (category === 'plant') return item.type === 'seed';
             if (category === 'animal') return item.type === 'animal';
             if (category === 'crop') return item.type === ('crop' as ShopItem['type']);
             if (category === 'animal_product') return item.type === ('animal_product' as ShopItem['type']);
             return false;
           });
          if (fallbackPool.length > 0) {
            const fallbackIndex = Math.floor(Math.random() * fallbackPool.length);
            results.push(fallbackPool[fallbackIndex]);
          }
        }
      }
      
      // Add pulled items to farm inventory/animals
      // 뽑은 아이템을 농장 인벤토리/동물에 반영
      results.forEach((item: ShopItem) => {
        if (item.type === 'seed' || item.type === 'animal') {
          dispatch(buyItem({ itemId: item.id, quantity: 1, skipGoldCheck: true }));
        }
      });
      // 디버깅용 로그
      console.log('Gacha results:', results);
      
      return results;
    } catch (error) {
      console.error('Gacha pull failed:', error);
      throw error;
    }
  };

export const { addItem, updateItem, removeItem, refreshShop } = shopSlice.actions;

export default shopSlice.reducer;
