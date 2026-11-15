import { Column, Entity, Index } from 'typeorm';
import { EntityNames } from '../enums/entity-names.enum.js';
import { CoreEntity } from '../abstracts/core.entity.js';
import { OutboxStatus } from '../enums/outbox-status.enum.js';

@Entity(EntityNames.OutBoxes)
@Index(['status', 'createdAt'])
export class OutboxEntity extends CoreEntity {
  @Column({ name: 'event_type', type: 'varchar', length: 150 })
  eventType: string;

  @Column({ type: 'jsonb' })
  payload: Record<string, any>;

  @Column({
    type: 'enum',
    enum: OutboxStatus,
    enumName: 'outbox_status_enum',
    default: OutboxStatus.PENDING,
  })
  status: OutboxStatus;

  @Column({ type: 'integer', default: 0 })
  attempts: number;

  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt: Date | null;
}
