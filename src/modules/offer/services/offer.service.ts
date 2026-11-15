import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OfferRepository } from '../repositories/offer.repository.js';
import { ProductRepository } from '../../product/repositories/product.repository.js';
import { OfferEntity } from '../entities/offer.entity.js';
import { OfferStatus } from '../utils/enums/offer-status.enum.js';
import { ProductStatus } from '../../product/utils/enums/product-status.enum.js';
import { OfferMessages } from '../utils/enums/offer-messages.enum.js';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class OfferService {
  constructor(
    private readonly offerRepository: OfferRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async createOffer(
    buyerId: string,
    productId: string,
    amount: string,
  ): Promise<OfferEntity> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException(OfferMessages.PRODUCT_NOT_FOUND);
    }
    if (product.status !== ProductStatus.ACTIVE) {
      throw new BadRequestException(OfferMessages.PRODUCT_NOT_ACTIVE);
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      throw new BadRequestException(OfferMessages.INVALID_AMOUNT);
    }
    if (numericAmount < Number(product.price)) {
      throw new BadRequestException(OfferMessages.AMOUNT_BELOW_PRICE);
    }

    const existing = await this.offerRepository.findPendingByProductAndBuyer(
      productId,
      buyerId,
    );
    if (existing) {
      throw new ConflictException(OfferMessages.PENDING_OFFER_EXISTS);
    }

    const offer = new OfferEntity();
    offer.productId = productId;
    offer.buyerId = buyerId;
    offer.amount = amount;
    offer.status = OfferStatus.PENDING;

    return this.offerRepository.saveOffer(offer);
  }

  async acceptOffer(offerId: string, sellerId: string): Promise<OfferEntity> {
    return this.offerRepository.acceptOffer(offerId, sellerId);
  }

  async rejectOffer(offerId: string, sellerId: string): Promise<OfferEntity> {
    const offer = await this.offerRepository.findByIdWithProduct(offerId);
    if (!offer) throw new NotFoundException(OfferMessages.OFFER_NOT_FOUND);
    this.assertSeller(offer, sellerId);

    const transitioned = await this.offerRepository.transitionStatus(
      offerId,
      OfferStatus.PENDING,
      OfferStatus.REJECTED,
    );
    if (!transitioned) {
      throw new BadRequestException(OfferMessages.OFFER_NOT_PENDING);
    }

    offer.status = OfferStatus.REJECTED;
    return offer;
  }

  async withdrawOffer(offerId: string, buyerId: string): Promise<OfferEntity> {
    const offer = await this.offerRepository.findByIdWithProduct(offerId);
    if (!offer) throw new NotFoundException(OfferMessages.OFFER_NOT_FOUND);
    if (offer.buyerId !== buyerId) {
      throw new ForbiddenException(OfferMessages.OFFER_NOT_YOURS);
    }

    const transitioned = await this.offerRepository.transitionStatus(
      offerId,
      OfferStatus.PENDING,
      OfferStatus.WITHDRAWN,
    );
    if (!transitioned) {
      throw new BadRequestException(OfferMessages.OFFER_NOT_PENDING);
    }

    offer.status = OfferStatus.WITHDRAWN;
    return offer;
  }

  async getMyOffers(
    buyerId: string,
    page = 1,
    limit = 10,
    status?: OfferStatus,
    sellerId?: string,
  ): Promise<PaginatedResult<OfferEntity>> {
    const { take, skip, normalizedPage, normalizedLimit } =
      this.normalizePagination(page, limit);

    const [data, total] = await this.offerRepository.findBuyerOffersPaginated(
      buyerId,
      { take, skip, status, sellerId },
    );

    return { data, total, page: normalizedPage, limit: normalizedLimit };
  }

  async getProductOffers(
    productId: string,
    sellerId: string,
    page = 1,
    limit = 10,
    status?: OfferStatus,
  ): Promise<PaginatedResult<OfferEntity>> {
    const product = await this.productRepository.findByIdAndSellerId({
      id: productId,
      sellerId,
    });
    if (!product) {
      throw new NotFoundException(OfferMessages.PRODUCT_NOT_FOUND);
    }

    const { take, skip, normalizedPage, normalizedLimit } =
      this.normalizePagination(page, limit);

    const [data, total] =
      await this.offerRepository.findProductOffersPaginated(productId, sellerId, {
        take,
        skip,
        status,
      });

    return { data, total, page: normalizedPage, limit: normalizedLimit };
  }

  private assertSeller(offer: OfferEntity, sellerId: string): void {
    if (offer.product.sellerId !== sellerId) {
      throw new ForbiddenException(OfferMessages.OFFER_NOT_ON_YOUR_PRODUCT);
    }
  }

  private normalizePagination(page: number, limit: number) {
    const normalizedPage = Math.max(1, page);
    const normalizedLimit = Math.min(Math.max(1, limit), 100);
    return {
      take: normalizedLimit,
      skip: (normalizedPage - 1) * normalizedLimit,
      normalizedPage,
      normalizedLimit,
    };
  }
}
