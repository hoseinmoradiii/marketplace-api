import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  Check,
} from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity.js';
import { ProductStatus } from '../utils/enums/product-status.enum.js';

@Entity('products')
@Check('"price" > 0')
@Index(['status', 'createdAt'])
@Index(['sellerId', 'createdAt'])
export class Product {
  @Column({ name: 'seller_id', type: 'uuid' })
  sellerId: string;

  @ManyToOne(() => UserEntity, (user) => user.products, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'seller_id' })
  seller: UserEntity;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'numeric', precision: 14, scale: 0 })
  price: string;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    enumName: 'product_status_enum',
    default: ProductStatus.ACTIVE,
  })
  status: ProductStatus;

  @OneToMany(() => OfferEntity, (offer) => offer.product)
  offers: OfferEntity[];
}
