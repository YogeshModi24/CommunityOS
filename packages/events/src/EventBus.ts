import { EventEmitter } from 'node:events';

import { LoggerFactory } from '@community-os/logger';

import { DomainEvent } from './events';

const logger = LoggerFactory.createLogger('console', 'events', process.env.NODE_ENV || 'development');

type EventHandler<T> = (event: DomainEvent<T>) => void | Promise<void>;

export class EventBus {
  private emitter: EventEmitter;
  private static instance: EventBus;

  private constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(100);
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public publish<T>(event: DomainEvent<T>): void {
    logger.debug(`[EventBus] Publishing event: ${event.type}`, { eventType: event.type });
    this.emitter.emit(event.type, event);
  }

  public subscribe<T>(type: string, handler: EventHandler<T>): void {
    logger.debug(`[EventBus] Subscribing to event: ${type}`);
    this.emitter.on(type, async (event: DomainEvent<T>) => {
      try {
        await handler(event);
      } catch (error) {
        logger.error(`[EventBus] Error handling event ${type}`, error);
      }
    });
  }
}

export const eventBus = EventBus.getInstance();
