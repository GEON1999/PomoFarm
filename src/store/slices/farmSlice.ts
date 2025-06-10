import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState, AppDispatch } from '@/store';
import { addGold } from './userSlice';
import { CROP_DEFINITIONS, ANIMAL_DEFINITIONS, SHOP_ITEMS, getCropBySeedId } from '@/constants/farm';

// Interfaces
export interface FarmPlot {
  id: string;
  cropId: string | null; // e.g., 'tomato'
  plantedAt: number | null;
  growthProgress: number; // 0-100
}

export interface Animal {
  id: string;
  type: string; // e.g., 'chicken'
  happiness: number; // 0-100
  lastFed: number;
  productReadyAt: number | null;
}

export interface InventoryItem {
  itemId: string; // e.g., 'tomato_seed', 'tomato', 'egg'
  quantity: number;
}

interface FarmState {
  plots: FarmPlot[];
  animals: Animal[];
  inventory: Record<string, InventoryItem>; // Use a record for easier access
  lastUpdated: number;
}

// Helpers
const generateId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

const initialPlots: FarmPlot[] = Array(9).fill(null).map((_, index) => ({
  id: `plot_${index}`,
  cropId: null,
  plantedAt: null,
  growthProgress: 0,
}));

// Initial State
const initialState: FarmState = {
  plots: initialPlots,
  animals: [],
  inventory: {
    tomato_seed: { itemId: 'tomato_seed', quantity: 5 }, // Start with some seeds
  },
  lastUpdated: Date.now(),
};

const farmSlice = createSlice({
  name: 'farm',
  initialState,
  reducers: {
    // Game loop tick
    updateFarmState: (state) => {
      const now = Date.now();

      // Update plots
      state.plots.forEach(plot => {
        if (plot.cropId && plot.plantedAt) {
          const cropData = CROP_DEFINITIONS[plot.cropId];
          if (cropData && plot.growthProgress < 100) {
            const totalGrowthTime = cropData.growthTime;
            const progress = ((now - plot.plantedAt) / (totalGrowthTime * 1000)) * 100;
            plot.growthProgress = Math.min(100, progress);
          }
        }
      });

      // Update animals
      state.animals.forEach(animal => {
        const animalData = ANIMAL_DEFINITIONS[animal.type];
        if (animalData && !animal.productReadyAt) {
            // Simplified: product becomes ready after productionTime
            const timeSinceFed = now - animal.lastFed;
            if (timeSinceFed > animalData.product.productionTime * 1000) {
                animal.productReadyAt = now;
            }
        }
      });

      state.lastUpdated = now;
    },

    buyItem: (state, action: PayloadAction<{ itemId: string; quantity: number }>) => {
      const { itemId, quantity } = action.payload;
      const shopItem = SHOP_ITEMS[itemId];
      if (!shopItem) return;

      if (shopItem.type === 'animal') {
        for (let i = 0; i < quantity; i++) {
          const newAnimal: Animal = {
            id: generateId('animal'),
            type: shopItem.id,
            happiness: 100,
            lastFed: Date.now(),
            productReadyAt: null,
          };
          state.animals.push(newAnimal);
        }
      } else { // seed
        const inventoryItem = state.inventory[itemId];
        if (inventoryItem) {
          inventoryItem.quantity += quantity;
        } else {
          state.inventory[itemId] = { itemId, quantity };
        }
      }
    },

    _removeItemFromInventory: (state, action: PayloadAction<{ itemId: string; quantity: number }>) => {
      const { itemId, quantity } = action.payload;
      const inventoryItem = state.inventory[itemId];
      if (inventoryItem && inventoryItem.quantity >= quantity) {
        inventoryItem.quantity -= quantity;
        if (inventoryItem.quantity <= 0) {
          delete state.inventory[itemId];
        }
      }
    },

    plantCrop: (state, action: PayloadAction<{ plotId: string; seedId: string }>) => {
      const { plotId, seedId } = action.payload;
      const plot = state.plots.find(p => p.id === plotId);
      if (!plot || plot.cropId) return;

      const seedInInventory = state.inventory[seedId];
      if (!seedInInventory || seedInInventory.quantity <= 0) return;

      const cropData = getCropBySeedId(seedId);
      if (!cropData) return;

      // Consume seed
      seedInInventory.quantity -= 1;
       if (seedInInventory.quantity <= 0) {
          delete state.inventory[seedId];
       }

      // Plant crop
      plot.cropId = cropData.id;
      plot.plantedAt = Date.now();
      plot.growthProgress = 0;
    },

    harvestPlot: (state, action: PayloadAction<{ plotId: string }>) => {
      const plot = state.plots.find(p => p.id === action.payload.plotId);
      if (!plot || !plot.cropId || plot.growthProgress < 100) return;

      const cropId = plot.cropId;
      const inventoryItem = state.inventory[cropId];
      if (inventoryItem) {
        inventoryItem.quantity += 1;
      } else {
        state.inventory[cropId] = { itemId: cropId, quantity: 1 };
      }

      // Reset plot
      plot.cropId = null;
      plot.plantedAt = null;
      plot.growthProgress = 0;
    },
    
    collectProduct: (state, action: PayloadAction<{ animalId: string }>) => {
        const animal = state.animals.find(a => a.id === action.payload.animalId);
        if (!animal || !animal.productReadyAt) return;

        const animalData = ANIMAL_DEFINITIONS[animal.type];
        if (!animalData) return;

        const productId = animalData.product.id;
        const inventoryItem = state.inventory[productId];
        if (inventoryItem) {
            inventoryItem.quantity += 1;
        } else {
            state.inventory[productId] = { itemId: productId, quantity: 1 };
        }

        animal.productReadyAt = null;
        animal.lastFed = Date.now(); // Reset timer after collection
    },
    resetFarm: () => initialState,
  },
});

export const {
  updateFarmState,
  buyItem,
  _removeItemFromInventory,
  plantCrop,
  harvestPlot,
  collectProduct,
  resetFarm,
} = farmSlice.actions;

export const sellItem = (payload: { itemId: string; quantity: number; }) => 
  (dispatch: AppDispatch, getState: () => RootState) => {
    const { itemId, quantity } = payload;
    const state = getState();
    const inventoryItem = state.farm.inventory[itemId];

    if (!inventoryItem || inventoryItem.quantity < quantity) {
      console.error('Not enough items to sell');
      return;
    }

    // Assuming sell price is defined in the constants
    const crop = CROP_DEFINITIONS[itemId];
    const animalProduct = Object.values(ANIMAL_DEFINITIONS).find(def => def.product.id === itemId)?.product;
    const shopItem = SHOP_ITEMS[itemId];

    let sellPrice = 0;
    if (crop?.sellPrice) {
      sellPrice = crop.sellPrice;
    } else if (animalProduct?.sellPrice) {
      sellPrice = animalProduct.sellPrice;
    } else if (shopItem) {
      sellPrice = shopItem.buyPrice / 2; // Sell for half price
    }

    if (sellPrice > 0) {
      const goldEarned = sellPrice * quantity;
      dispatch(addGold(goldEarned));
      dispatch(_removeItemFromInventory({ itemId, quantity }));
    } else {
      console.error(`Item ${itemId} cannot be sold.`);
    }
};

export default farmSlice.reducer;
