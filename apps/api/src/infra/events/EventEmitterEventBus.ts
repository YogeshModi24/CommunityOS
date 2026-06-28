import { DomainEvent } from '@community-os/types';
import { EventEmitter } from 'events';

import { logger } from '../../lib/logger';
import { IEventBus } from '../../services/contracts/IEventBus';

export class EventEmitterEventBus implements IEventBus {
  private emitter = new EventEmitter();

  publish(event: DomainEvent): void {
    logger.info(`[EventBus] Publishing event: ${event.name} for aggregate: ${event.aggregateId}`, {
      event: 'event_bus_publish',
      eventName: event.name,
      eventId: event.eventId,
      aggregateId: event.aggregateId,
    });
    this.emitter.emit(event.name, event);
  }

  subscribe(eventName: string, handler: (event: any) => void): void {
    logger.info(`[EventBus] Subscribing handler to event: ${eventName}`, {
      event: 'event_bus_subscribe',
      eventName,
    });
    this.emitter.on(eventName, handler);
  }
}
