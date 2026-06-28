import { DomainEvent } from '@community-os/types';

export interface IEventBus {
  publish(event: DomainEvent): void;
  subscribe(eventName: string, handler: (event: any) => void): void;
}
