import { DynamicModule, Module } from '@nestjs/common';
import { ConfigFactory, ConfigService } from '@nestjs/config';

import {
  BaseConfigStatic,
  CoreStrictConfigModule,
  SchemaMap,
} from './core-strict-config.module';
import { MetadataHelper } from './strict-config.utils';

interface TypeSafeConfigModuleBuilder<Schema extends BaseConfigStatic> {
  forRoot(): DynamicModule;
  provide<Feature extends BaseConfigStatic>(
    Class: InstanceType<Schema> extends InstanceType<Feature> ? Feature : never,
  ): TypeSafeConfigModuleBuilder<Schema>;
  provide<Feature extends BaseConfigStatic>(
    Class: Feature,
    mapper: (
      data: InstanceType<Schema>,
      conf: ConfigService<InstanceType<Schema>, true>,
    ) => InstanceType<Feature>,
  ): TypeSafeConfigModuleBuilder<Schema>;
}

@Module({})
export class StrictConfigModule {
  static typeSafe<Schema extends BaseConfigStatic>(data: {
    load?: ConfigFactory[];
    schema: Schema;
  }): TypeSafeConfigModuleBuilder<Schema> {
    const schemesMap = new Map() as Map<
      BaseConfigStatic,
      (
        data: InstanceType<Schema>,
        conf: ConfigService<InstanceType<Schema>, true>,
      ) => unknown | undefined
    >;
    return {
      forRoot(): DynamicModule {
        const schemes = Array.from(schemesMap.entries()).map(
          ([Class, mapper]): SchemaMap<BaseConfigStatic, Schema> =>
            mapper ? [Class, mapper] : Class,
        );
        return StrictConfigModule.forRoot({
          ...data,
          schemes,
        });
      },
      provide<Feature extends BaseConfigStatic>(
        Class: Feature,
        mapper?: (
          data: InstanceType<Schema>,
          conf: ConfigService<InstanceType<Schema>, true>,
        ) => InstanceType<Feature>,
      ): TypeSafeConfigModuleBuilder<Schema> {
        schemesMap.set(Class, mapper);
        return this;
      },
    };
  }
  static forRoot<
    Feature extends BaseConfigStatic,
    Schema extends Feature,
  >(options: {
    load?: ConfigFactory[];
    schema: Schema;
    schemes: Array<
      | Feature
      | [
          Feature,
          (
            data: InstanceType<Schema>,
            conf: ConfigService<InstanceType<Feature>, true>,
          ) => InstanceType<Feature>,
        ]
    >;
  }): DynamicModule {
    return {
      module: StrictConfigModule,
      imports: [CoreStrictConfigModule.forRoot<Feature, Schema>(options)],
    };
  }

  static forFeature<T>({ Schema }: { Schema: { new (): T } }): DynamicModule {
    const providers = new MetadataHelper(Schema).createConfigProviders();
    return {
      module: StrictConfigModule,
      providers,
      exports: providers,
    };
  }
}
