import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProductService } from './services/product.service.js';
import { ProductEntity } from './entities/product.entity.js';
import { UserId } from '../user/decorators/user-id.decorator.js';
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js';
import { CreateProductDto } from './dtos/create-product.dto.js';
import { MyProductsQueryDto } from './dtos/my-products.query.dto.js';
import { ActiveProductsQueryDto } from './dtos/active-products.query.dto.js';

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
@UseGuards(AccessTokenGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
  @ApiOperation({ summary: 'Create a new product' })
  @ApiBody({
    type: CreateProductDto,
    examples: {
      createProduct: {
        summary: 'Create product',
        value: {
          title: 'iPhone 13',
          description: 'Excellent condition, barely used',
          price: '50000000',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Product created', type: ProductEntity })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @UserId() userId: string,
    @Body() dto: CreateProductDto,
  ): Promise<ProductEntity> {
    return this.productService.create({ sellerId: userId, ...dto });
  }

  @Get()
  @ApiOperation({ summary: 'Browse all active products (paginated)' })
  @ApiResponse({ status: 200, description: 'Paginated active products' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async browseActive(
    @Query() query: MyProductsQueryDto,
  ) {
    return this.productService.getActiveFeed(query.page, query.limit);
  }

  @Get('my')
  @ApiOperation({
    summary: "Get current user's products with pagination and optional status filter",
  })
  @ApiResponse({ status: 200, description: 'Paginated products' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyProducts(
    @UserId() userId: string,
    @Query() query: MyProductsQueryDto,
  ) {
    return this.productService.getMyProductsPaginated(
      userId,
      query.page,
      query.limit,
      query.status,
    );
  }

  @Get('my/active')
  @ApiOperation({ summary: "Get current user's active products" })
  @ApiResponse({ status: 200, description: 'Active products' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyActiveProducts(
    @UserId() userId: string,
    @Query() query: ActiveProductsQueryDto,
  ): Promise<ProductEntity[]> {
    return this.productService.getActiveProducts(
      userId,
      query.take ?? 10,
      query.skip ?? 0,
    );
  }

  @Patch(':id/sell')
  @ApiOperation({ summary: 'Mark one of your products as sold' })
  @ApiParam({ name: 'id', description: 'Product id' })
  @ApiResponse({ status: 200, description: 'Product marked as sold' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async sellProduct(
    @UserId() userId: string,
    @Param('id', ParseUUIDPipe) productId: string,
  ): Promise<{ message: string }> {
    const message = await this.productService.sellProduct(productId, userId);
    return { message };
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel one of your products' })
  @ApiParam({ name: 'id', description: 'Product id' })
  @ApiResponse({ status: 200, description: 'Product cancelled' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async cancelProduct(
    @UserId() userId: string,
    @Param('id', ParseUUIDPipe) productId: string,
  ): Promise<{ message: string }> {
    const message = await this.productService.cancelProduct(productId, userId);
    return { message };
  }
}
