import { FactoryProvider } from '@nestjs/common';
import {
  getMetadataStorage,
  IS_NOT_EMPTY,
  ValidationTypes,
} from 'class-validator';
import { ValidationMetadata } from 'class-validator/types/metadata/ValidationMetadata';
import { CONFIG_TOKEN_PREFIX, typeofMap } from './strict-config.constants';

export type Type = { new (): unknown };

export function getConfigToken(
  configPath: string | number,
  type: Type,
): string {
  if (typeof configPath === 'string' && configPath.includes('.')) {
    throw new RangeError(
      'configPath dot notation not implemented: ' + configPath,
    );
  }
  return CONFIG_TOKEN_PREFIX + configPath + '$' + type.name;
}

export class MetadataHelper<T> {
  public readonly schemaMetadatas: ValidationMetadata[];
  constructor(private readonly Schema: { new (): T }) {
    const storage = getMetadataStorage();
    this.schemaMetadatas = storage.getTargetValidationMetadatas(
      Schema,
      '',
      false,
      false,
    );
  }

  createConfigProviders(): Array<FactoryProvider> {
    const map = this.schemaMetadatas.reduce((a, metadata) => {
      const { propertyName: path } = metadata;
      if (!path || a.has(path)) {
        return a;
      }
      const type = Reflect.getMetadata(
        'design:type',
        this.Schema.prototype,
        path,
      );
      const p = this.createProvider(
        path,
        type,
        this.getIsNotEmpty(path),
        this.getIsOptional(path),
      );

      a.set(path, p);
      return a;
    }, new Map() as Map<string, FactoryProvider>);
    return Array.from(map.values());
  }

  private getIsOptional(path): boolean {
    return !!this.schemaMetadatas.find(
      (m) =>
        m.type === ValidationTypes.CONDITIONAL_VALIDATION &&
        m.propertyName === path &&
        m.constraints.find((f) =>
          f.toString().includes(
            'object[propertyName] !== null && object[propertyName] !== undefined', // todo: get source
          ),
        ),
    );
  }

  private getIsNotEmpty(path): boolean {
    return !!this.schemaMetadatas.find(
      (m) => m.type === IS_NOT_EMPTY && m.propertyName === path,
    );
  }

  private createProvider(
    path: string | number,
    type: Type,
    isNotEmpty: boolean,
    isOptional: boolean,
  ): FactoryProvider {
    return {
      provide: getConfigToken(path, type),
      useFactory: (typed: T) => {
        const v = typed[path];
        if ((v === null || v === undefined) && isOptional) {
          return v;
        }
        if ((v === null || v === undefined || v === '') && !isNotEmpty) {
          return v;
        }
        if (
          !(v instanceof type) &&
          typeofMap.has(type) &&
          typeof v !== typeofMap.get(type)
        ) {
          throw new TypeError(
            `Config of ${this.Schema.name}['${path}'] must have ${
              type.name
            } type, got ${typeof v} ` + JSON.stringify(v),
          );
        }
        return v;
      },
      inject: [this.Schema],
    };
  }
}
