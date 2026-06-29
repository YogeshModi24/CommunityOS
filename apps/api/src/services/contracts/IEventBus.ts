import { DomainEvent } from '@community-os/events';

export interface IEventBus {
  publish<T>(event: DomainEvent<T>): void;
  subscribe(eventName: string, handler: (event: any) => void): void;
}
