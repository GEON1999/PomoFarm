import { v4 as uuidv4 } from 'uuid';

// This interface defines the structure for notifications managed by this service.
// It is separate from the Redux notification state.
export interface AppNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Notification utility class for managing a queue of application notifications.
 * Note: This is a standalone service and does not interact with the Redux notification state.
 */
class NotificationService {
  private static instance: NotificationService;
  private listeners: Array<(notifications: AppNotification[]) => void> = [];
  private queue: AppNotification[] = [];
  private maxQueueSize = 5;
  private defaultDuration = 5000; // 5 seconds

  private constructor() {
    // Private constructor to enforce singleton
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public add(
    message: string,
    options: {
      type?: 'success' | 'error' | 'warning' | 'info';
      duration?: number;
      action?: {
        label: string;
        onClick: () => void;
      };
    } = {}
  ): string {
    const {
      type = 'info',
      duration = this.defaultDuration,
      action,
    } = options;

    const id = uuidv4();
    const notification: AppNotification = {
      id,
      message,
      type,
      duration,
      action,
    };

    this.queue = [notification, ...this.queue].slice(0, this.maxQueueSize);
    this.notifyListeners();

    if (duration && duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }

    return id;
  }

  public remove(id: string): void {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter((n) => n.id !== id);
    if (this.queue.length < initialLength) {
      this.notifyListeners();
    }
  }

  public clearAll(): void {
    if (this.queue.length > 0) {
      this.queue = [];
      this.notifyListeners();
    }
  }

  public getNotifications(): AppNotification[] {
    return [...this.queue];
  }

  public subscribe(listener: (notifications: AppNotification[]) => void): () => void {
    this.listeners.push(listener);
    // Immediately notify the new listener with the current queue
    listener(this.queue);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.queue));
  }
}

export default NotificationService.getInstance();
