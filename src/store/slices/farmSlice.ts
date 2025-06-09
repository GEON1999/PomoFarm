import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FarmPlot {
  id: string;
  cropId: string | null;
  plantedAt: number | null; // timestamp
  growthProgress: number; // 0-100
  isWatered: boolean;
}

export interface Animal {
  id: string;
  type: string;
  happiness: number; // 0-100
  lastFed: number; // timestamp
  productReady: boolean;
}

export interface InventoryItem {
  id: string;
  type: 'crop' | 'animal' | 'product' | 'decoration';
  itemId: string;
  quantity: number;
}

interface FarmState {
  plots: FarmPlot[];
  animals: Animal[];
  inventory: InventoryItem[];
  lastHarvest: number | null; // timestamp
  lastUpdated: number; // timestamp
}

// Helper function to generate a unique ID
const generateId = (prefix: string) => `${prefix}_${Math.random().toString(36).substr(2, 9)}`;

// Initialize with 9 empty plots
const initialPlots: FarmPlot[] = Array(9).fill(null).map((_, index) => ({
  id: `plot_${index}`,
  cropId: null,
  plantedAt: null,
  growthProgress: 0,
  isWatered: false,
}));

const initialState: FarmState = {
  plots: initialPlots,
  animals: [],
  inventory: [],
  lastHarvest: null,
  lastUpdated: Date.now(),
};

const farmSlice = createSlice({
  name: 'farm',
  initialState,
  reducers: {
    plantCrop: (state, action: PayloadAction<{ plotId: string; cropId: string }>) => {
      const { plotId, cropId } = action.payload;
      const plot = state.plots.find(p => p.id === plotId);
      
      if (plot && !plot.cropId) {
        plot.cropId = cropId;
        plot.plantedAt = Date.now();
        plot.growthProgress = 0;
        plot.isWatered = false;
        state.lastUpdated = Date.now();
      }
    },
    
    waterPlot: (state, action: PayloadAction<string>) => {
      const plot = state.plots.find(p => p.id === action.payload);
      if (plot) {
        plot.isWatered = true;
        state.lastUpdated = Date.now();
      }
    },
    
    harvestPlot: (state, action: PayloadAction<string>) => {
      const plotIndex = state.plots.findIndex(p => p.id === action.payload);
      const plot = state.plots[plotIndex];
      
      if (plot && plot.cropId && plot.growthProgress >= 100) {
        // Add to inventory
        const itemIndex = state.inventory.findIndex(
          item => item.itemId === plot.cropId && item.type === 'crop'
        );
        
        if (itemIndex >= 0) {
          state.inventory[itemIndex].quantity += 1;
        } else {
          state.inventory.push({
            id: generateId('item'),
            type: 'crop',
            itemId: plot.cropId,
            quantity: 1,
          });
        }
        
        // Reset plot
        state.plots[plotIndex] = {
          ...state.plots[plotIndex],
          cropId: null,
          plantedAt: null,
          growthProgress: 0,
          isWatered: false,
        };
        
        state.lastHarvest = Date.now();
        state.lastUpdated = Date.now();
      }
    },
    
    addAnimal: (state, action: PayloadAction<{ type: string }>) => {
      const newAnimal: Animal = {
        id: generateId('animal'),
        type: action.payload.type,
        happiness: 50, // Start with 50% happiness
        lastFed: Date.now(),
        productReady: false,
      };
      
      state.animals.push(newAnimal);
      state.lastUpdated = Date.now();
    },
    
    feedAnimal: (state, action: PayloadAction<string>) => {
      const animal = state.animals.find(a => a.id === action.payload);
      if (animal) {
        animal.lastFed = Date.now();
        animal.happiness = Math.min(100, animal.happiness + 20); // Increase happiness when fed
        state.lastUpdated = Date.now();
      }
    },
    
    collectProduct: (state, action: PayloadAction<string>) => {
      const animal = state.animals.find(a => a.id === action.payload);
      if (animal && animal.productReady) {
        const productType = `${animal.type}_product`; // e.g., 'chicken_egg'
        const itemIndex = state.inventory.findIndex(
          item => item.itemId === productType && item.type === 'product'
        );
        
        if (itemIndex >= 0) {
          state.inventory[itemIndex].quantity += 1;
        } else {
          state.inventory.push({
            id: generateId('product'),
            type: 'product',
            itemId: productType,
            quantity: 1,
          });
        }
        
        animal.productReady = false;
        state.lastUpdated = Date.now();
      }
    },
    
    updateGrowth: (state) => {
      const now = Date.now();
      const growthRate = 0.1; // Adjust growth rate as needed
      
      state.plots.forEach(plot => {
        if (plot.cropId && plot.plantedAt) {
          // Only grow if watered
          if (plot.isWatered) {
            plot.growthProgress = Math.min(100, plot.growthProgress + growthRate);
          }
          // Reset watered status after some time
          if (now - (plot.plantedAt + 3600000) > 0) { // 1 hour
            plot.isWatered = false;
          }
        }
      });
      
      // Update animal states
      state.animals.forEach(animal => {
        // Animals get less happy over time
        const hoursSinceFed = (now - animal.lastFed) / (1000 * 60 * 60);
        animal.happiness = Math.max(0, animal.happiness - (hoursSinceFed * 5));
        
        // If animal is happy enough, produce items
        if (animal.happiness > 70 && !animal.productReady) {
          animal.productReady = true;
        }
      });
      
      state.lastUpdated = now;
    },
  },
});

export const {
  plantCrop,
  waterPlot,
  harvestPlot,
  addAnimal,
  feedAnimal,
  collectProduct,
  updateGrowth,
} = farmSlice.actions;

export default farmSlice.reducer;
