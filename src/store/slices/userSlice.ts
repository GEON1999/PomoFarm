import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../index";

interface UserSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
  notificationsEnabled: boolean;
  timerAlertsEnabled: boolean;
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  theme: "light" | "dark" | "system";
  language: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: string;
  quantity: number;
  emoji?: string;
  rarity?: string;
  description?: string;
}

interface UserState {
  id: string;
  username: string;
  email: string;
  diamonds: number;
  gold: number;
  experience: number;
  level: number;
  inventory: InventoryItem[];
  settings: UserSettings;
  lastLogin: number | null;
  createdAt: number;
}

const initialState: UserState = {
  id: "user_1",
  username: "Farmer",
  email: "",
  diamonds: 4000,
  gold: 1000,
  experience: 0,
  level: 1,
  inventory: [],
  settings: {
    soundEnabled: true,
    musicEnabled: true,
    soundVolume: 0.5,
    musicVolume: 0.5,
    notificationsEnabled: true,
    timerAlertsEnabled: true,
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    theme: "system",
    language: "en",
  },
  lastLogin: null,
  createdAt: Date.now(),
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    addDiamonds: (state, action: PayloadAction<number>) => {
      state.diamonds += action.payload;
    },

    spendDiamonds: (state, action: PayloadAction<number>) => {
      if (state.diamonds >= action.payload) {
        state.diamonds -= action.payload;
      }
    },

    addGold: (state, action: PayloadAction<number>) => {
      state.gold += action.payload;
    },

    spendGold: (state, action: PayloadAction<number>) => {
      if (state.gold >= action.payload) {
        state.gold -= action.payload;
      }
    },

    addExperience: (state, action: PayloadAction<number>) => {
      const expNeededForNextLevel = state.level * 100; // Simple leveling formula
      state.experience += action.payload;

      // Level up if enough experience
      if (state.experience >= expNeededForNextLevel) {
        state.level += 1;
        state.experience -= expNeededForNextLevel;
        // You might want to add a notification or level-up reward here
      }
    },

    updateSettings: (state, action: PayloadAction<Partial<UserSettings>>) => {
      state.settings = {
        ...state.settings,
        ...action.payload,
      };
    },

    updateProfile: (
      state,
      action: PayloadAction<{ username?: string; email?: string }>
    ) => {
      if (action.payload.username) {
        state.username = action.payload.username;
      }
      if (action.payload.email) {
        state.email = action.payload.email;
      }
    },

    // Called when the user completes a pomodoro session
    completePomodoro: (state) => {
      // Reward user with diamonds and experience
      state.diamonds += 5; // Base reward
      state.experience += 10; // Base XP

      // Bonus for consecutive days
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      if (state.lastLogin && now - state.lastLogin < oneDay * 2) {
        // Streak bonus
        state.diamonds += 2;
        state.experience += 5;
      }

      state.lastLogin = now;
    },

    // Add item to inventory
    addToInventory: (
      state,
      action: PayloadAction<{
        item: Omit<InventoryItem, "quantity">;
        quantity?: number;
      }>
    ) => {
      const { item, quantity = 1 } = action.payload;
      const existingItem = state.inventory.find((i) => i.id === item.id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.inventory.push({
          ...item,
          quantity,
        });
      }
    },

    // Remove item from inventory
    removeFromInventory: (
      state,
      action: PayloadAction<{ itemId: string; quantity?: number }>
    ) => {
      const { itemId, quantity = 1 } = action.payload;
      const itemIndex = state.inventory.findIndex((item) => item.id === itemId);

      if (itemIndex !== -1) {
        if (state.inventory[itemIndex].quantity > quantity) {
          state.inventory[itemIndex].quantity -= quantity;
        } else {
          state.inventory.splice(itemIndex, 1);
        }
      }
    },
  },
});

// Create a thunk for spending diamonds that can return a success/failure status
export const spendDiamondsWithCheck = createAsyncThunk(
  "user/spendDiamondsWithCheck",
  async (amount: number, { getState, dispatch }) => {
    const state = getState() as RootState;
    const { diamonds } = state.user;
    if (diamonds >= amount) {
      dispatch(spendDiamonds(amount));
      return true;
    }
    return false;
  }
);

// Create a thunk for removing items that can return a success/failure status
export const removeFromInventoryWithCheck = createAsyncThunk(
  "user/removeFromInventoryWithCheck",
  async (
    payload: { itemId: string; quantity?: number },
    { getState, dispatch }
  ) => {
    const state = getState() as RootState;
    const { itemId, quantity = 1 } = payload;
    const item = state.user.inventory.find(
      (i: InventoryItem) => i.id === itemId
    );
    if (item && item.quantity >= quantity) {
      dispatch(removeFromInventory({ itemId, quantity }));
      return true;
    }
    return false;
  }
);

export const {
  addDiamonds,
  spendDiamonds,
  addGold,
  spendGold,
  addExperience,
  updateSettings,
  updateProfile,
  completePomodoro,
  addToInventory,
  removeFromInventory,
} = userSlice.actions;

export default userSlice.reducer;
