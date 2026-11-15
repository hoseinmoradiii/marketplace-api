import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductRepository } from '../repositories/product.repository.js';
import { ProductEntity } from '../entities/product.entity.js';
import { ProductStatus } from '../utils/enums/product-status.enum.js';
import { ProductMessages } from '../utils/enums/product-messages.enum.js';

interface CreateProductDto {
  sellerId: string;
  title: string;
  description: string;
  price: string;
}

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async create(dto: CreateProductDto): Promise<ProductEntity> {
    const { description, price, sellerId, title } = dto;
    const newProduct = new ProductEntity();
    newProduct.sellerId = sellerId;
    newProduct.title = title;
    newProduct.description = description;
    newProduct.price = price;
    const saved = await this.productRepository.save(newProduct);
    return saved;
  }

  async sellProduct(productId: string, sellerId: string): Promise<string> {
    const product = await this.productRepository.findByIdAndSellerId({
      id: productId,
      sellerId,
    });
    if (!product) throw new NotFoundException(ProductMessages.PRODUCT_NOT_FOUND);
    if (product.status === ProductStatus.SOLD)
      throw new BadRequestException(ProductMessages.PRODUCT_ALREADY_SOLD);
    if (product.status === ProductStatus.CANCELLED)
      throw new BadRequestException(ProductMessages.PRODUCT_IS_CANCELLED);

    // atomic conditional update: only succeeds if status hasn't changed
    // since the read above (e.g. a concurrent offer acceptance)
    const updated = await this.productRepository.tryUpdateStatus(
      productId,
      sellerId,
      [ProductStatus.ACTIVE, ProductStatus.RESERVED],
      ProductStatus.SOLD,
    );
    if (!updated) {
      throw new BadRequestException(ProductMessages.PRODUCT_STATUS_CHANGED);
    }
    return ProductMessages.PRODUCT_SOLD;
  }

  async cancelProduct(productId: string, sellerId: string): Promise<string> {
    const product = await this.productRepository.findByIdAndSellerId({
      id: productId,
      sellerId,
    });
    if (!product) throw new NotFoundException(ProductMessages.PRODUCT_NOT_FOUND);
    if (product.status === ProductStatus.SOLD)
      throw new BadRequestException(ProductMessages.PRODUCT_IS_SOLD);
    if (product.status === ProductStatus.RESERVED)
      throw new BadRequestException(ProductMessages.PRODUCT_IS_RESERVED);

    const updated = await this.productRepository.tryUpdateStatus(
      productId,
      sellerId,
      [ProductStatus.ACTIVE, ProductStatus.CANCELLED],
      ProductStatus.CANCELLED,
    );
    if (!updated) {
      throw new BadRequestException(ProductMessages.PRODUCT_STATUS_CHANGED);
    }
    return ProductMessages.PRODUCT_CANCELLED;
  }

  async getMyProducts(
    sellerId: string,
    take: number,
    skip: number,
  ): Promise<ProductEntity[]> {
    const products = await this.productRepository.findSellerProducts(
      sellerId,
      take,
      skip,
    );
    return products;
  }

  async getActiveProducts(
    sellerId: string,
    take: number,
    skip: number,
  ): Promise<ProductEntity[]> {
    const products = await this.productRepository.findActiveProducts(
      sellerId,
      take,
      skip,
    );
    return products;
  }

  async getActiveFeed(
    page = 1,
    limit = 10,
  ): Promise<{
    data: ProductEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    page = Math.max(1, page);
    limit = Math.min(Math.max(1, limit), 100);
    const [data, total] = await this.productRepository.findActivePaginated(
      limit,
      (page - 1) * limit,
    );
    return { data, total, page, limit };
  }

  async getMyProductsPaginated(
    sellerId: string,
    page = 1,
    limit = 10,
    status?: ProductStatus,
  ): Promise<{
    data: ProductEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    page = Math.max(1, page);
    limit = Math.min(Math.max(1, limit), 100);
    const skip = (page - 1) * limit;

    const [data, total] = await this.productRepository.findSellerProductsPaginated(
      sellerId,
      limit,
      skip,
      status,
    );

    return { data, total, page, limit };
  }
}
