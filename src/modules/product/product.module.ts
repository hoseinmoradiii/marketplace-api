import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity.js';
import { ProductRepository } from './repositories/product.repository.js';
import { ProductService } from './services/product.service.js';
import { ProductController } from './product.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity]), AuthModule],
  controllers: [ProductController],
  providers: [ProductRepository, ProductService],
  exports: [ProductRepository, ProductService],
})
export class ProductModule {}
