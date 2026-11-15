import { Injectable } from '@nestjs/common';
import { CoreRepository } from '../../../common/abstracts/core.repository.js';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from '../entities/product.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class ProductRepository extends CoreRepository<ProductEntity> {
  constructor(
    @InjectRepository(ProductEntity)
    repository: Repository<ProductEntity>,
  ) {
    super(repository);
  }
}
