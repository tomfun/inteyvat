import { DataSource } from 'typeorm';

import { pgConfigPromise } from './pg.module-config';
import { config } from './pg.config-factory';

export const pgDateSource = pgConfigPromise.then((pgDate) => {
  const c = config(pgDate);
  return new DataSource(c);
});
