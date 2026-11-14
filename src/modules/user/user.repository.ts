import { Injectable, NotFoundException } from '@nestjs/common';
import { CoreRepository } from '../../common/abstracts/core.repository.js';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class UserRepository extends CoreRepository<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    repository: Repository<UserEntity>,
  ) {
    super(repository);
  }

  async findUserByMobile(mobile: string): Promise<UserEntity | null> {
    const user = await this.repository.findOneBy({ mobile });
    return user;
  }
}
