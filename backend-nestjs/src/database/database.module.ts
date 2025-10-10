import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { DatabaseService } from './database.service';
import {TypeOrmModule} from '@nestjs/typeorm';

@Module({
  // providers: [DatabaseSe rvice]
   imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'sqlite',
        database: config.get('DATABASE_PATH'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
