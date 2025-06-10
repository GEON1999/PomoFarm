import { v4 as uuidv4 } from 'uuid';
import notificationService from './notifications';
import { soundManager } from './soundManager';

// Tutorial step interface
export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  targetElement?: string; // CSS selector for the element to highlight
  position?: 'top' | 'right' | 'bottom' | 'left' | 'center';
  actionRequired?: boolean; // Whether user needs to perform an action to proceed
  actionLabel?: string; // Label for the action button
  actionCallback?: () => void; // Callback when the action is performed
  onShow?: () => void; // Callback when the step is shown
  onHide?: () => void; // Callback when the step is hidden
  showOverlay?: boolean; // Whether to show a dark overlay
  highlightPadding?: number; // Padding around the highlighted element
  disableInteraction?: boolean; // Whether to disable interaction with other elements
}

// Tutorial interface
export interface Tutorial {
  id: string;
  name: string;
  description: string;
  steps: TutorialStep[];
  completed: boolean;
  requiredTutorials?: string[]; // IDs of tutorials that must be completed first
  requiredLevel?: number; // Minimum level required to start this tutorial
}

// Tutorial definitions
const TUTORIALS: Omit<Tutorial, 'id' | 'completed'>[] = [
  // Welcome Tutorial
  {
    name: 'Welcome to PomoFarm',
    description: 'Learn the basics of PomoFarm',
    steps: [
      {
        id: 'welcome-1',
        title: 'Welcome to PomoFarm!',
        content: 'PomoFarm combines productivity with farming. Complete Pomodoro sessions to earn rewards and grow your farm!',
        position: 'center',
        showOverlay: true,
      },
      {
        id: 'welcome-2',
        title: 'The Pomodoro Timer',
        content: 'This is your Pomodoro timer. Work for 25 minutes, then take a short break. After 4 cycles, take a longer break!',
        targetElement: '.pomodoro-timer',
        position: 'bottom',
      },
      {
        id: 'welcome-3',
        title: 'Your Farm',
        content: 'This is your farm. Plant crops and raise animals to earn more rewards!',
        targetElement: '.farm-grid',
        position: 'top',
      },
      {
        id: 'welcome-4',
        title: 'The Shop',
        content: 'Use your earned diamonds to buy new seeds, animals, and decorations in the shop!',
        targetElement: '.shop-tab',
        position: 'right',
      },
      {
        id: 'welcome-5',
        title: 'Get Started!',
        content: 'Ready to start your farming journey? Complete your first Pomodoro session to earn your first seeds!',
        position: 'center',
        actionLabel: 'Start First Pomodoro',
        actionRequired: true,
      },
    ],
  },
  
  // Farming Tutorial
  {
    name: 'Farming Basics',
    description: 'Learn how to plant and harvest crops',
    requiredTutorials: ['welcome'],
    steps: [
      {
        id: 'farming-1',
        title: 'Planting Seeds',
        content: 'Click on an empty plot to plant a seed. Different crops take different amounts of time to grow.',
        targetElement: '.farm-plot:not(.has-plant)',
        position: 'top',
        actionRequired: true,
        actionLabel: 'Plant a Seed',
      },
      {
        id: 'farming-2',
        title: 'Watering Crops',
        content: 'Water your crops to help them grow faster. Click on a planted crop to water it.',
        targetElement: '.farm-plot.has-plant',
        position: 'top',
        actionRequired: true,
        actionLabel: 'Water a Crop',
      },
      {
        id: 'farming-3',
        title: 'Harvesting',
        content: 'When your crops are fully grown, click on them to harvest and earn rewards!',
        targetElement: '.farm-plot.ready-to-harvest',
        position: 'top',
        actionRequired: true,
        actionLabel: 'Harvest a Crop',
      },
    ],
  },
  
  // Animal Care Tutorial
  {
    name: 'Animal Care',
    description: 'Learn how to take care of your animals',
    requiredTutorials: ['welcome', 'farming'],
    requiredLevel: 3,
    steps: [
      {
        id: 'animals-1',
        title: 'Adopting Animals',
        content: 'Visit the shop to adopt animals. Each animal produces different resources!',
        targetElement: '.shop-animals-tab',
        position: 'right',
      },
      {
        id: 'animals-2',
        title: 'Feeding Animals',
        content: 'Keep your animals happy by feeding them regularly. Happy animals produce more!',
        targetElement: '.animal-pen',
        position: 'top',
      },
      {
        id: 'animals-3',
        title: 'Collecting Resources',
        content: 'Click on animals to collect the resources they produce. The longer you wait, the more you get!',
        targetElement: '.animal-ready',
        position: 'top',
        actionRequired: true,
        actionLabel: 'Collect Resources',
      },
    ],
  },
  
  // Shop Tutorial
  {
    name: 'Shopping Guide',
    description: 'Learn how to use the shop effectively',
    requiredTutorials: ['welcome'],
    steps: [
      {
        id: 'shop-1',
        title: 'The Shop',
        content: 'Use your hard-earned diamonds to buy new items in the shop!',
        targetElement: '.shop-tab',
        position: 'right',
      },
      {
        id: 'shop-2',
        title: 'Gacha Boxes',
        content: 'Try your luck with gacha boxes to get rare items and animals!',
        targetElement: '.gacha-section',
        position: 'left',
      },
      {
        id: 'shop-3',
        title: 'Daily Deals',
        content: 'Check back daily for special deals and discounts!',
        targetElement: '.daily-deals',
        position: 'top',
      },
    ],
  },
];

/**
 * Tutorial Manager class for handling in-game tutorials
 */
class TutorialManager {
  private static instance: TutorialManager;
  private tutorials: Record<string, Tutorial> = {};
  private activeTutorial: string | null = null;
  private currentStepIndex: number = 0;
  private completedTutorials: Set<string> = new Set();
  private listeners: Array<{
    event: 'start' | 'step' | 'complete' | 'close';
    callback: (tutorial: Tutorial, step?: TutorialStep) => void;
  }> = [];
  private isInitialized: boolean = false;

  private constructor() {
    // Initialize tutorials with unique IDs
    TUTORIALS.forEach(tutorial => {
      const id = tutorial.name.toLowerCase().replace(/\s+/g, '-');
      this.tutorials[id] = {
        ...tutorial,
        id,
        steps: tutorial.steps.map(step => ({
          ...step,
          id: step.id || uuidv4(),
        })),
        completed: false,
      };
    });
  }

  /**
   * Get the singleton instance of the TutorialManager
   */
  public static getInstance(): TutorialManager {
    if (!TutorialManager.instance) {
      TutorialManager.instance = new TutorialManager();
    }
    return TutorialManager.instance;
  }

  /**
   * Initialize the tutorial manager with saved state
   */
  public initialize(savedState?: {
    completedTutorials: string[];
    tutorialProgress?: Record<string, number>;
  }): void {
    if (this.isInitialized) return;

    // Load completed tutorials
    if (savedState?.completedTutorials) {
      savedState.completedTutorials.forEach(id => {
        if (this.tutorials[id]) {
          this.completedTutorials.add(id);
          this.tutorials[id].completed = true;
        }
      });
    }

    this.isInitialized = true;
  }

  /**
   * Get the current state for saving
   */
  public getState(): {
    completedTutorials: string[];
    tutorialProgress: Record<string, number>;
  } {
    return {
      completedTutorials: Array.from(this.completedTutorials),
      tutorialProgress: Object.entries(this.tutorials).reduce<Record<string, number>>(
        (acc, [id, tutorial]) => {
          if (tutorial.completed) {
            acc[id] = tutorial.steps.length - 1; // Mark as completed by setting to last step
          }
          return acc;
        },
        {}
      ),
    };
  }

  /**
   * Start a tutorial
   */
  public startTutorial(tutorialId: string): boolean {
    const tutorial = this.tutorials[tutorialId];
    
    // Check if tutorial exists and is not already completed
    if (!tutorial || this.completedTutorials.has(tutorialId)) {
      return false;
    }

    // Check if required tutorials are completed
    if (tutorial.requiredTutorials?.some(id => !this.completedTutorials.has(id))) {
      return false;
    }

    // Check level requirement if any
    if (tutorial.requiredLevel) {
      // This would be connected to the actual game state
      const playerLevel = 1; // Get from game state
      if (playerLevel < tutorial.requiredLevel) {
        return false;
      }
    }

    this.activeTutorial = tutorialId;
    this.currentStepIndex = 0;

    // Notify listeners
    this.notifyListeners('start', tutorial);
    this.showCurrentStep();

    return true;
  }

  /**
   * Go to the next step in the current tutorial
   */
  public nextStep(): void {
    if (this.activeTutorial === null) return;

    const tutorial = this.tutorials[this.activeTutorial];
    const currentStep = tutorial.steps[this.currentStepIndex];

    // Call onHide callback if exists
    if (currentStep.onHide) {
      currentStep.onHide();
    }

    // Check if this is the last step
    if (this.currentStepIndex >= tutorial.steps.length - 1) {
      this.completeTutorial();
      return;
    }

    // Go to next step
    this.currentStepIndex++;
    this.showCurrentStep();
  }

  /**
   * Go to a specific step in the current tutorial
   */
  public goToStep(stepIndex: number): void {
    if (this.activeTutorial === null) return;

    const tutorial = this.tutorials[this.activeTutorial];
    
    // Validate step index
    if (stepIndex < 0 || stepIndex >= tutorial.steps.length) {
      return;
    }

    // Call onHide for current step if exists
    const currentStep = tutorial.steps[this.currentStepIndex];
    if (currentStep.onHide) {
      currentStep.onHide();
    }

    // Update step index
    this.currentStepIndex = stepIndex;
    this.showCurrentStep();
  }

  /**
   * Complete the current tutorial
   */
  public completeTutorial(): void {
    if (this.activeTutorial === null) return;

    const tutorial = this.tutorials[this.activeTutorial];
    tutorial.completed = true;
    this.completedTutorials.add(this.activeTutorial);

    // Show completion notification
    notificationService.add(`Tutorial Complete: ${tutorial.name}`, { type: 'success', duration: 3000 });
    soundManager.playSound('success');

    // Notify listeners
    this.notifyListeners('complete', tutorial);

    // Reset state
    this.activeTutorial = null;
    this.currentStepIndex = 0;
  }

  /**
   * Close the current tutorial
   */
  public closeTutorial(): void {
    if (this.activeTutorial === null) return;

    const tutorial = this.tutorials[this.activeTutorial];
    
    // Call onHide for current step if exists
    const currentStep = tutorial.steps[this.currentStepIndex];
    if (currentStep.onHide) {
      currentStep.onHide();
    }

    // Notify listeners
    this.notifyListeners('close', tutorial);

    // Reset state
    this.activeTutorial = null;
    this.currentStepIndex = 0;
  }

  /**
   * Check if a tutorial is completed
   */
  public isTutorialCompleted(tutorialId: string): boolean {
    return this.completedTutorials.has(tutorialId);
  }

  /**
   * Get all available tutorials
   */
  public getAvailableTutorials(): Tutorial[] {
    return Object.values(this.tutorials);
  }

  /**
   * Get the current tutorial and step
   */
  public getCurrentTutorial(): { tutorial: Tutorial | null; step: TutorialStep | null } {
    if (this.activeTutorial === null) {
      return { tutorial: null, step: null };
    }

    const tutorial = this.tutorials[this.activeTutorial];
    const step = tutorial.steps[this.currentStepIndex];
    
    return { tutorial, step };
  }

  /**
   * Add an event listener
   */
  public on(
    event: 'start' | 'step' | 'complete' | 'close',
    callback: (tutorial: Tutorial, step?: TutorialStep) => void
  ): () => void {
    const listener = { event, callback };
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Show the current step of the active tutorial
   */
  private showCurrentStep(): void {
    if (this.activeTutorial === null) return;

    const tutorial = this.tutorials[this.activeTutorial];
    const step = tutorial.steps[this.currentStepIndex];

    // Call onShow callback if exists
    if (step.onShow) {
      step.onShow();
    }

    // Play a sound
    soundManager.playSound('notification');

    // Notify listeners
    this.notifyListeners('step', tutorial, step);
  }

  /**
   * Notify all listeners of an event
   */
  private notifyListeners(
    event: 'start' | 'step' | 'complete' | 'close',
    tutorial: Tutorial,
    step?: TutorialStep
  ): void {
    this.listeners
      .filter(listener => listener.event === event)
      .forEach(listener => {
        try {
          listener.callback(tutorial, step);
        } catch (error) {
          console.error('Error in tutorial listener:', error);
        }
      });
  }
}

// Export a singleton instance
export const tutorialManager = TutorialManager.getInstance();

export default tutorialManager;
