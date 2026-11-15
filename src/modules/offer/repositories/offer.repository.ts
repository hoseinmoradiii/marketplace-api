import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CoreRepository } from '../../../common/abstracts/core.repository.js';
import { OfferEntity } from '../entities/offer.entity.js';
import { ProductEntity } from '../../product/entities/product.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindOptionsWhere,
  Not,
  QueryFailedError,
  Repository,
} from 'typeorm';
import { OfferStatus } from '../utils/enums/offer-status.enum.js';
import { ProductStatus } from '../../product/utils/enums/product-status.enum.js';
import { OfferMessages } from '../utils/enums/offer-messages.enum.js';

interface OfferFilters {
  take: number;
  skip: number;
  status?: OfferStatus;
  sellerId?: string;
}

@Injectable()
export class OfferRepository extends CoreRepository<OfferEntity> {
  constructor(
    @InjectRepository(OfferEntity)
    repository: Repository<OfferEntity>,
    private readonly dataSource: DataSource,
  ) {
    super(repository);
  }

  async findPendingByProductAndBuyer(
    productId: string,
    buyerId: string,
  ): Promise<OfferEntity | null> {
    return this.repository.findOne({
      where: { productId, buyerId, status: OfferStatus.PENDING },
    });
  }

  async findByIdWithProduct(offerId: string): Promise<OfferEntity | null> {
    return this.repository.findOne({
      where: { id: offerId },
      relations: { product: true },
    });
  }

  async saveOffer(offer: OfferEntity): Promise<OfferEntity> {
    try {
      return await this.repository.save(offer);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string })?.code === '23505'
      ) {
        throw new ConflictException(OfferMessages.PENDING_OFFER_EXISTS);
      }
      throw error;
    }
  }

  async acceptOffer(offerId: string, sellerId: string): Promise<OfferEntity> {
    return this.dataSource.transaction(async (manager) => {
      const offer = await manager
        .getRepository(OfferEntity)
        .createQueryBuilder('offer')
        .innerJoinAndSelect('offer.product', 'product')
        .setLock('pessimistic_write')
        .where('offer.id = :offerId', { offerId })
        .getOne();

      if (!offer) throw new NotFoundException(OfferMessages.OFFER_NOT_FOUND);
      if (offer.product.sellerId !== sellerId) {
        throw new ForbiddenException(OfferMessages.OFFER_NOT_ON_YOUR_PRODUCT);
      }
      if (offer.status !== OfferStatus.PENDING) {
        throw new BadRequestException(OfferMessages.OFFER_NOT_PENDING);
      }
      if (offer.product.status !== ProductStatus.ACTIVE) {
        throw new BadRequestException(OfferMessages.PRODUCT_NOT_AVAILABLE);
      }

      offer.status = OfferStatus.ACCEPTED;
      offer.product.status = ProductStatus.RESERVED;

      await manager.save(OfferEntity, offer);
      await manager.save(ProductEntity, offer.product);
      await manager.update(
        OfferEntity,
        {
          productId: offer.productId,
          status: OfferStatus.PENDING,
          id: Not(offer.id),
        },
        { status: OfferStatus.REJECTED },
      );

      return offer;
    });
  }

  async transitionStatus(
    offerId: string,
    from: OfferStatus,
    to: OfferStatus,
  ): Promise<boolean> {
    const result = await this.repository.update(
      { id: offerId, status: from },
      { status: to },
    );
    return (result.affected ?? 0) > 0;
  }

  async findBuyerOffersPaginated(
    buyerId: string,
    filters: OfferFilters,
  ): Promise<[OfferEntity[], number]> {
    const where: FindOptionsWhere<OfferEntity> = { buyerId };
    if (filters.status) where.status = filters.status;
    if (filters.sellerId) where.product = { sellerId: filters.sellerId };

    return this.repository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: filters.take,
      skip: filters.skip,
    });
  }

  async findProductOffersPaginated(
    productId: string,
    sellerId: string,
    filters: Pick<OfferFilters, 'take' | 'skip' | 'status'>,
  ): Promise<[OfferEntity[], number]> {
    const where: FindOptionsWhere<OfferEntity> = {
      productId,
      product: { sellerId },
    };
    if (filters.status) where.status = filters.status;

    return this.repository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: filters.take,
      skip: filters.skip,
    });
  }
}
