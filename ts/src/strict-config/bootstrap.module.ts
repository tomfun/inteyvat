import { DynamicModule, Module } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces/modules/module-metadata.interface';

@Module({})
export class BootstrapModule {
  static boot(moduleMetadata: ModuleMetadata): DynamicModule {
    return {
      module: BootstrapModule,
      ...moduleMetadata,
    };
  }
}
