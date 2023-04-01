import {
  DynamicModule,
  Global,
  Module,
  FactoryProvider,
  Provider,
} from '@nestjs/common';
import { ConfigModule as NestjsConfig, ConfigService } from '@nestjs/config';
import { ConfigFactory } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { validate, validateSync } from 'class-validator';
import { CONFIG_OBJECT_TOKEN } from './strict-config.constants';

export type BaseConfigStatic = abstract new (...args: any) => Record<any, any>;
export type ConfigMapper<
  Feature extends BaseConfigStatic,
  Schema extends Feature,
> = (
  data: InstanceType<Schema>,
  conf: ConfigService<InstanceType<Schema>, true>,
) => InstanceType<Feature>;

export type SchemaMap<
  Feature extends BaseConfigStatic,
  Schema extends Feature,
> = Feature | [Feature, ConfigMapper<Feature, Schema>];

function createScopedConfigProviders<
  Feature extends BaseConfigStatic,
  Schema extends Feature,
>(schemes: Array<SchemaMap<Feature, Schema>>) {
  return schemes.map(
    (def): FactoryProvider => ({
      provide: def instanceof Array ? def[0] : def,
      useFactory: async (
        obj: InstanceType<Schema>,
        conf: ConfigService<InstanceType<Schema>, true>,
      ) => {
        const Schema: Feature = def instanceof Array ? def[0] : def;
        const plain =
          def instanceof Array && def[1] ? await def[1](obj, conf) : obj;

        const typed =
          plain instanceof Schema
            ? plain
            : plainToInstance(Schema as any, plain, {
                exposeDefaultValues: true,
                enableImplicitConversion: false,
                excludeExtraneousValues: true,
                strategy: 'exposeAll',
              });
        if (!(typed instanceof Schema)) {
          throw new TypeError(
            `Config must be instance of ${Schema.name}, ` +
              JSON.stringify(typed),
          );
        }
        const errors = await validate(typed, {
          whitelist: true,
          skipMissingProperties: false,
        });
        if (errors.length > 0) {
          const message = `Config of ${Schema.name} has validation errors`;
          console.error(message, errors, errors[0].children);
          throw new TypeError(message);
        }
        return typed;
      },
      inject: [CONFIG_OBJECT_TOKEN, ConfigService],
    }),
  );
}

@Global()
@Module({})
export class CoreStrictConfigModule {
  static forRoot<Feature extends BaseConfigStatic, Schema extends Feature>({
    load,
    schemes,
    schema: Schema,
  }: {
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
    let data = undefined;
    const inner = NestjsConfig.forRoot({
      load: load || [],
      ignoreEnvFile: true,
      validate(config: Record<string, unknown>) {
        if (!Schema) {
          return (data = config);
        }
        const typed = plainToInstance(Schema as any, config, {
          exposeDefaultValues: true,
          enableImplicitConversion: false,
          excludeExtraneousValues: true,
          strategy: 'exposeAll',
        });
        if (!(typed instanceof Schema)) {
          throw new TypeError(
            `Config must be instance of ${Schema.name}, ${JSON.stringify(
              typed,
            )}`,
          );
        }
        const errors = validateSync(typed as object, {
          whitelist: true,
          skipMissingProperties: false,
        });
        if (errors.length > 0) {
          const message = `Config of ${Schema.name} has validation errors`;
          console.error(message, errors, errors[0].children);
          throw new TypeError(message);
        }
        return (data = typed);
      },
    });
    if (!data) {
      throw new Error('Config capture error');
    }
    const providers: Provider[] = createScopedConfigProviders(schemes);
    providers.push({ useValue: data, provide: CONFIG_OBJECT_TOKEN });
    return {
      module: CoreStrictConfigModule,
      imports: [inner],
      providers,
      exports: providers,
    };
  }
}
