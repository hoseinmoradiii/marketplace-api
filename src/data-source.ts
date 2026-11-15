import 'dotenv/config';
import { fileURLToPath } from 'node:url';
import { DataSource } from 'typeorm';
import { UserEntity } from './modules/user/entities/user.entity.js';
import { ProductEntity } from './modules/product/entities/product.entity.js';
import { OfferEntity } from './modules/offer/entities/offer.entity.js';
import { OutboxEntity } from './common/entities/outbox.entity.js';

const dir = fileURLToPath(new URL('.', import.meta.url));

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [UserEntity, ProductEntity, OfferEntity, OutboxEntity],
  migrations: [`${dir}migrations/*{.ts,.js}`],
  synchronize: false,
});
