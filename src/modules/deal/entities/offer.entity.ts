import { Entity, Column, ManyToOne, JoinColumn, Index, Check } from 'typeorm';
import { EntityNames } from '../../../common/enums/entity-names.enum.js';
import { ProductEntity } from './product.entity.js';
import { CoreEntity } from '../../../common/abstracts/core.entity.js';
import { OfferStatus } from '../utils/enums/offer-status.enum.js';
import { UserEntity } from '../../user/entities/user.entity.js';

@Entity(EntityNames.Offers)
@Check('"amount" > 0')
@Index('IDX_offer_one_pending_per_buyer', ['product_id', 'buyer_id'], {
  unique: true,
  where: '"status" = \'PENDING\'',
})
@Index(['product_id', 'status', 'created_at'])
@Index(['buyer_id', 'created_at'])
export class OfferEntity extends CoreEntity {
  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @ManyToOne(() => ProductEntity, (product) => product.offers, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @Column({ name: 'buyer_id', type: 'uuid' })
  buyerId: string;

  @ManyToOne(() => UserEntity, (user) => user.offers, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'buyer_id' })
  buyer: UserEntity;

  @Column({ type: 'numeric', precision: 14, scale: 0 })
  amount: string;

  @Column({
    type: 'enum',
    enum: OfferStatus,
    enumName: 'offer_status_enum',
    default: OfferStatus.PENDING,
  })
  status: OfferStatus;
}
