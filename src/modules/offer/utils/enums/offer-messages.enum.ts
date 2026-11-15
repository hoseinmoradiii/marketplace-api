export enum OfferMessages {
  OFFER_NOT_FOUND = 'offer does not exist',
  OFFER_NOT_ON_YOUR_PRODUCT = 'this offer is not on your product',
  OFFER_NOT_PENDING = 'offer is not pending',
  OFFER_NOT_YOURS = 'this offer does not belong to you',
  PRODUCT_NOT_FOUND = 'product does not exist',
  PRODUCT_NOT_ACTIVE = 'product is not active',
  PRODUCT_NOT_AVAILABLE = 'product is no longer available',
  INVALID_AMOUNT = 'invalid offer amount',
  AMOUNT_BELOW_PRICE =
    'offer amount must be greater than or equal to the product price',
  PENDING_OFFER_EXISTS = 'you already have a pending offer on this product',
}
