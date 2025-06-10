export interface ShopItem {
  id: string;
  name: string;
  type: 'seed' | 'animal' | 'crop' | 'animal_product';
  buyPrice: number;
  rarity?: string;
  emoji?: string;
}

export interface CropData {
  id: string;
  name: string;
  growthTime: number; // in seconds
  sellPrice: number;
  seedId: string;
  emoji: string;
}

export interface AnimalData {
  id: string;
  name: string;
  product: {
    id: string;
    name: string;
    productionTime: number; // in seconds
    sellPrice: number;
  };
  emoji: string;
}

export const CROP_DEFINITIONS: Record<string, CropData> = {
  tomato: {
    id: 'tomato',
    name: 'Tomato',
    growthTime: 60 * 50, // 2 pomodoros (25min each)
    sellPrice: 25,
    seedId: 'tomato_seed',
    emoji: '🍅',
  },
  carrot: {
    id: 'carrot',
    name: 'Carrot',
    growthTime: 60 * 75, // 3 pomodoros
    sellPrice: 45,
    seedId: 'carrot_seed',
    emoji: '🥕',
  },
  pumpkin: {
    id: 'pumpkin',
    name: 'Pumpkin',
    growthTime: 60 * 120, // 4 pomodoros (2시간)
    sellPrice: 100,
    seedId: 'pumpkin_seed',
    emoji: '🎃',
  },
};

export const ANIMAL_DEFINITIONS: Record<string, AnimalData> = {
  chicken: {
    id: 'chicken',
    name: 'Chicken',
    product: {
      id: 'egg',
      name: 'Egg',
      productionTime: 60 * 60 * 2, // 2 hours
      sellPrice: 15,
    },
    emoji: '🐔',
  },
  cow: {
    id: 'cow',
    name: 'Cow',
    product: {
      id: 'milk',
      name: 'Milk',
      productionTime: 60 * 60 * 4, // 4 hours
      sellPrice: 40,
    },
    emoji: '🐮',
  },
};

export const SHOP_ITEMS: Record<string, ShopItem> = {
  tomato_seed: {
    id: 'tomato_seed',
    name: 'Tomato Seed',
    type: 'seed',
    buyPrice: 10,
  },
  carrot_seed: {
    id: 'carrot_seed',
    name: 'Carrot Seed',
    type: 'seed',
    buyPrice: 20,
  },
  pumpkin_seed: {
    id: 'pumpkin_seed',
    name: 'Pumpkin Seed',
    type: 'seed',
    buyPrice: 40,
  },
  chicken: {
    id: 'chicken',
    name: 'Chicken',
    type: 'animal',
    buyPrice: 100,
    rarity: 'uncommon',
    emoji: '🐔',
  },
  cow: {
    id: 'cow',
    name: 'Cow',
    type: 'animal',
    buyPrice: 250,
    rarity: 'rare',
    emoji: '🐮',
  },
  // 식물 수확물(가챠용)
  tomato: {
    id: 'tomato',
    name: 'Tomato',
    type: 'crop',
    buyPrice: 30,
    rarity: 'common',
    emoji: '🍅',
  },
  carrot: {
    id: 'carrot',
    name: 'Carrot',
    type: 'crop',
    buyPrice: 50,
    rarity: 'common',
    emoji: '🥕',
  },
  pumpkin: {
    id: 'pumpkin',
    name: 'Pumpkin',
    type: 'crop',
    buyPrice: 120,
    rarity: 'rare',
    emoji: '🎃',
  },
  // 동물 생산품(가챠용)
  egg: {
    id: 'egg',
    name: 'Egg',
    type: 'animal_product',
    buyPrice: 20,
    rarity: 'common',
    emoji: '🥚',
  },
  milk: {
    id: 'milk',
    name: 'Milk',
    type: 'animal_product',
    buyPrice: 60,
    rarity: 'rare',
    emoji: '🥛',
  }
};

// Helper to find crop by seedId
export const getCropBySeedId = (seedId: string): CropData | undefined => {
  return Object.values(CROP_DEFINITIONS).find(crop => crop.seedId === seedId);
};
