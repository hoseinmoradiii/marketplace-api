import { FindOptionsWhere, Repository } from 'typeorm';
import { CoreEntity } from './core.entity.js';
import { NotFoundException } from '@nestjs/common';

export abstract class CoreRepository<T extends CoreEntity> {
  constructor(protected readonly repository: Repository<T>) {}

  async findById(id: string): Promise<T | null> {
    return this.repository.findOneBy({ id } as FindOptionsWhere<T>);
  }

  async findAll(): Promise<T[]> {
    return this.repository.find();
  }

  async save(entity: T): Promise<T> {
    return this.repository.save(entity);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return (result.affected ?? 0) > 0;
  }

  async remove(id: string): Promise<void> {
    const softDeleteResult = await this.repository.softDelete(id);
    if (!softDeleteResult.affected)
      throw new NotFoundException('No user found');
  }
}
