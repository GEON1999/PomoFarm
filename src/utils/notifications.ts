import { v4 as uuidv4 } from 'uuid';
import { NotificationType } from '@/store/slices/notificationSlice';

/**
 * Notification utility class for managing application notifications
 */
class NotificationService {
  private static instance: NotificationService;
  private listeners: Array<(notification: NotificationType) => void> = [];
  private queue: NotificationType[] = [];
  private maxQueueSize = 5;
  private defaultDuration = 5000; // 5 seconds

  private constructor() {
    // Private constructor to enforce singleton
  }

  /**
   * Get the singleton instance of the NotificationService
   */
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Add a notification
   * @param message - The message to display
   * @param options - Notification options
   */
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
    const notification: NotificationType = {
      id,
      message,
      type,
      duration,
      action,
    };

    // Add to queue
    this.queue = [notification, ...this.queue].slice(0, this.maxQueueSize);

    // Notify listeners
    this.notifyListeners(notification);

    // Auto-remove if duration is set
    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }

    return id;
  }

  /**
   * Remove a notification by ID
   * @param id - The ID of the notification to remove
   */
  public remove(id: string): void {
    this.queue = this.queue.filter((n) => n.id !== id);
    this.notifyListeners();
  }

  /**
   * Clear all notifications
   */
  public clearAll(): void {
    this.queue = [];
    this.notifyListeners();
  }

  /**
   * Get all current notifications
   */
  public getNotifications(): NotificationType[] {
    return [...this.queue];
  }

  /**
   * Add a listener for notification changes
   * @param listener - The callback function to call when notifications change
   * @returns A function to remove the listener
   */
  public addListener(listener: (notification: NotificationType) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notify all listeners of a new notification
   * @param notification - The notification to send to listeners
   */
  private notifyListeners(notification?: NotificationType): void {
    // Clone the queue to prevent external mutations
    const currentQueue = [...this.queue];
    
    // If a specific notification was provided, use it, otherwise just notify of the queue change
    const notificationToSend = notification || currentQueue[0];
    
    if (notificationToSend) {
      this.listeners.forEach((listener) => {
        try {
          listener(notificationToSend);
        } catch (error) {
          console.error('Error in notification listener:', error);
        }
      });
    }
  }

  // Convenience methods for common notification types
  public success(message: string, duration?: number): string {
    return this.add(message, { type: 'success', duration });
  }

  public error(message: string, duration?: number): string {
    return this.add(message, { type: 'error', duration });
  }

  public warning(message: string, duration?: number): string {
    return this.add(message, { type: 'warning', duration });
  }

  public info(message: string, duration?: number): string {
    return this.add(message, { type: 'info', duration });
  }
}

// Export a singleton instance
export const notificationService = NotificationService.getInstance();

export default notificationService;
