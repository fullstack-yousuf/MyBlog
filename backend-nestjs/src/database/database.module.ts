
// src/database/database.module.ts
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
// DATABASE_URL='postgresql://neondb_owner:npg_Kaz8VbqZEj7f@ep-winter-math-a1v8rkqv.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: false,
        ssl: {
          rejectUnauthorized: false, // required for Neon
        },
        extra: {
          ssl: {
            rejectUnauthorized: false,
          },
        },
      }),
    }),
  ],
})
export class DatabaseModule {}

// import { Module } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// // import { DatabaseService } from './database.service';
// import {TypeOrmModule} from '@nestjs/typeorm';

// @Module({
//   // providers: [DatabaseSe rvice]
//    imports: [
//     TypeOrmModule.forRootAsync({
//       inject: [ConfigService],
//       useFactory: (config: ConfigService) => ({
//         type: 'sqlite',
//         database: config.get('DATABASE_PATH'),
//         autoLoadEntities: true,
//         synchronize: true,
//       }),
//     }),
//   ],
// })
// export class DatabaseModule {}


