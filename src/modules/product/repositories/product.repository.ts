import { Injectable } from '@nestjs/common';
import { CoreRepository } from '../../../common/abstracts/core.repository.js';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from '../entities/product.entity.js';
import {
  FindOptionsWhere,
  In,
  Repository,
} from 'typeorm';
import { ProductStatus } from '../utils/enums/product-status.enum.js';

@Injectable()
export class ProductRepository extends CoreRepository<ProductEntity> {
  constructor(
    @InjectRepository(ProductEntity)
    repository: Repository<ProductEntity>,
  ) {
    super(repository);
  }

  async findByIdAndSellerId(
    options: FindOptionsWhere<ProductEntity>,
  ): Promise<null | ProductEntity> {
    return this.repository.findOne({
      where: {
        id: options.id,
        sellerId: options.sellerId,
      },
    });
  }

  async findSellerProducts(
    sellerId: string,
    take: number,
    skip: number,
  ): Promise<ProductEntity[]> {
    return this.repository.find({
      where: { sellerId },
      take,
      skip,
    });
  }

  async findActiveProducts(
    sellerId: string,
    take: number,
    skip: number,
  ): Promise<ProductEntity[]> {
    return this.repository.find({
      where: { sellerId, status: ProductStatus.ACTIVE },
      take,
      skip,
    });
  }

  async findSellerProductsPaginated(
    sellerId: string,
    take: number,
    skip: number,
    status?: ProductStatus,
  ): Promise<[ProductEntity[], number]> {
    const where: FindOptionsWhere<ProductEntity> = { sellerId };
    if (status) where.status = status;

    const [products, total] = await this.repository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take,
      skip,
    });
    return [products, total];
  }

  async findActivePaginated(
    take: number,
    skip: number,
  ): Promise<[ProductEntity[], number]> {
    return this.repository.findAndCount({
      where: { status: ProductStatus.ACTIVE },
      order: { createdAt: 'DESC' },
      take,
      skip,
    });
  }

  async tryUpdateStatus(
    productId: string,
    sellerId: string,
    fromStatuses: ProductStatus[],
    toStatus: ProductStatus,
  ): Promise<boolean> {
    const result = await this.repository.update(
      { id: productId, sellerId, status: In(fromStatuses) },
      { status: toStatus },
    );
    return (result.affected ?? 0) > 0;
  }
}
