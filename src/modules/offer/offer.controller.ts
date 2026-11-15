import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
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
import { OfferService } from './services/offer.service.js';
import { OfferEntity } from './entities/offer.entity.js';
import { UserId } from '../user/decorators/user-id.decorator.js';
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js';
import { CreateOfferDto } from './dtos/create-offer.dto.js';
import { MyOffersQueryDto } from './dtos/my-offers.query.dto.js';
import { ProductOffersQueryDto } from './dtos/product-offers.query.dto.js';

@ApiTags('offers')
@ApiBearerAuth()
@Controller('offers')
@UseGuards(AccessTokenGuard)
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Post()
  @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
  @ApiOperation({
    summary: 'Send an offer on an active product (amount must be >= price)',
  })
  @ApiBody({
    type: CreateOfferDto,
    examples: {
      createOffer: {
        summary: 'Create offer',
        value: { productId: '3fa85f64-5717-4562-b3fc-2c963f66afa6', amount: '55000000' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Offer created', type: OfferEntity })
  @ApiResponse({ status: 400, description: 'Invalid product or amount' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 409, description: 'Pending offer already exists' })
  async createOffer(
    @UserId() userId: string,
    @Body() dto: CreateOfferDto,
  ): Promise<OfferEntity> {
    return this.offerService.createOffer(userId, dto.productId, dto.amount);
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'Accept an offer on your product (seller only)' })
  @ApiParam({ name: 'id', description: 'Offer id' })
  @ApiResponse({ status: 201, description: 'Offer accepted', type: OfferEntity })
  @ApiResponse({ status: 400, description: 'Offer not pending or product unavailable' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not your product' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  async acceptOffer(
    @UserId() userId: string,
    @Param('id', ParseUUIDPipe) offerId: string,
  ): Promise<OfferEntity> {
    return this.offerService.acceptOffer(offerId, userId);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject an offer on your product (seller only)' })
  @ApiParam({ name: 'id', description: 'Offer id' })
  @ApiResponse({ status: 201, description: 'Offer rejected', type: OfferEntity })
  @ApiResponse({ status: 400, description: 'Offer not pending' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not your product' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  async rejectOffer(
    @UserId() userId: string,
    @Param('id', ParseUUIDPipe) offerId: string,
  ): Promise<OfferEntity> {
    return this.offerService.rejectOffer(offerId, userId);
  }

  @Post(':id/withdraw')
  @ApiOperation({ summary: 'Withdraw your own pending offer' })
  @ApiParam({ name: 'id', description: 'Offer id' })
  @ApiResponse({ status: 201, description: 'Offer withdrawn', type: OfferEntity })
  @ApiResponse({ status: 400, description: 'Offer not pending' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not your offer' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  async withdrawOffer(
    @UserId() userId: string,
    @Param('id', ParseUUIDPipe) offerId: string,
  ): Promise<OfferEntity> {
    return this.offerService.withdrawOffer(offerId, userId);
  }

  @Get('my')
  @ApiOperation({
    summary: 'Get offers sent by the current user, filterable by status and seller',
  })
  @ApiResponse({ status: 200, description: 'Paginated offers' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyOffers(@UserId() userId: string, @Query() query: MyOffersQueryDto) {
    return this.offerService.getMyOffers(
      userId,
      query.page,
      query.limit,
      query.status,
      query.sellerId,
    );
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get offers on your product (seller only)' })
  @ApiParam({ name: 'productId', description: 'Product id' })
  @ApiResponse({ status: 200, description: 'Paginated offers' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProductOffers(
    @UserId() userId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query() query: ProductOffersQueryDto,
  ) {
    return this.offerService.getProductOffers(
      productId,
      userId,
      query.page,
      query.limit,
      query.status,
    );
  }
}
