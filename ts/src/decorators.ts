import { Inject } from '@nestjs/common';
import { PARAMTYPES_METADATA } from '@nestjs/common/constants';
import { SENTRY_TOKEN, SentryService } from '@ntegral/nestjs-sentry';
import { PROPERTY_TYPES } from './strict-config/strict-config.constants';

export const InjectSentry =
  (): ReturnType<typeof Inject> => (target, key, index) => {
    const type = key
      ? Reflect.getMetadata(PROPERTY_TYPES, target, key)
      : Reflect.getMetadata(PARAMTYPES_METADATA, target, key)[index];
    if (!type) {
      throw new TypeError(`Wrong type for parameter. InjectSentry()`);
    }
    if (type !== SentryService) {
      throw new TypeError(`Wrong type for InjectSentry(): whatever: WrongType`);
    }
    return Inject(SENTRY_TOKEN)(target, key, index);
  };
