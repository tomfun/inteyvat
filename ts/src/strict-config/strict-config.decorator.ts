import { Inject } from '@nestjs/common';
import { PARAMTYPES_METADATA } from '@nestjs/common/constants';
import { PROPERTY_TYPES } from './strict-config.constants';
import { getConfigToken } from './strict-config.utils';

// todo: add type definition with types checking
export const InjectConfig =
  <T extends object>(
    configPath: keyof T & (string | number),
  ): ReturnType<typeof Inject> =>
  (target, key, index) => {
    const type = key
      ? Reflect.getMetadata(PROPERTY_TYPES, target, key)
      : Reflect.getMetadata(PARAMTYPES_METADATA, target, key)[index];
    if (!type) {
      throw new TypeError(
        `Wrong type for constructor parameter name. InjectConfig('${configPath}')`,
      );
    }
    return Inject(getConfigToken(configPath, type))(target, key, index);
  };
