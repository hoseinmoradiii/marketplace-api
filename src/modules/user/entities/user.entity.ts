import { Column, Entity, Index, OneToMany } from 'typeorm';
import { CoreEntity } from '../../../common/abstracts/core.entity.js';
import { EntityNames } from '../../../common/enums/entity-names.enum.js';
import { ProductEntity } from '../../product/entities/product.entity.js';
import { OfferEntity } from '../../product/entities/offer.entity.js';

@Entity(EntityNames.Users)
export class UserEntity extends CoreEntity {
  @Column({ name: 'full_name', nullable: true, default: null })
  fullName: string;

  @Index()
  @Column({ unique: true })
  mobile: string;

  @Column({ name: 'mobile_verified', default: false })
  mobileVerified: boolean;

  @Column({ name: 'access_token', nullable: true, default: null })
  accessToken: string;

  @Column({ name: 'refresh_token', nullable: true, default: null })
  refreshToken: string;

  @OneToMany(() => ProductEntity, (product) => product.seller)
  products: ProductEntity[];

  @OneToMany(() => OfferEntity, (offer) => offer.buyer)
  offers: OfferEntity[];
}
