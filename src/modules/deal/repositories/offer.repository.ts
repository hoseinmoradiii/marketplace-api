import { Injectable } from '@nestjs/common';
import { CoreRepository } from '../../../common/abstracts/core.repository.js';
import { OfferEntity } from '../entities/offer.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class OfferRepository extends CoreRepository<OfferEntity> {
  constructor(
    @InjectRepository(OfferEntity)
    repository: Repository<OfferEntity>,
  ) {
    super(repository);
  }
}
