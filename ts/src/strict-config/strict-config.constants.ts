import { Type } from './strict-config.utils';

export const PROPERTY_TYPES = 'design:type';
export const CONFIG_TOKEN_PREFIX = 'strict-config#';
export const CONFIG_OBJECT_TOKEN = CONFIG_TOKEN_PREFIX + 'envs';

export const typeofMap = new Map<Type, string>()
  .set(String, typeof '')
  .set(Boolean, typeof true)
  .set(Number, typeof 0);
