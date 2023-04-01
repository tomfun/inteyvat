import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from '../entity';
import { StrictConfigModule } from '../strict-config/strict-config.module';
import { FormConfig } from './form.config';
import { FormController } from './form.controller';

@Module({
  imports: [
    StrictConfigModule.forFeature({ Schema: FormConfig }),
    TypeOrmModule.forFeature(entities),
  ],
  controllers: [FormController],
})
export class FormModule {}
