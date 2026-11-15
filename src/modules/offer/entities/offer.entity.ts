import { Entity, Column, ManyToOne, JoinColumn, Index, Check } from 'typeorm';
import type { ProductEntity } from '../../product/entities/product.entity.js';
import type { UserEntity } from '../../user/entities/user.entity.js';
import { EntityNames } from '../../../common/enums/entity-names.enum.js';
import { CoreEntity } from '../../../common/abstracts/core.entity.js';
import { OfferStatus } from '../utils/enums/offer-status.enum.js';

@Entity(EntityNames.Offers)
@Check('"amount" > 0')
@Index('IDX_offer_one_pending_per_buyer', ['productId', 'buyerId'], {
  unique: true,
  where: '"status" = \'PENDING\'',
})
@Index(['productId', 'status', 'createdAt'])
@Index(['buyerId', 'createdAt'])
export class OfferEntity extends CoreEntity {
  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @ManyToOne(EntityNames.Products, (product: ProductEntity) => product.offers, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @Column({ name: 'buyer_id', type: 'uuid' })
  buyerId: string;

  @ManyToOne(EntityNames.Users, (user: UserEntity) => user.offers, {
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
