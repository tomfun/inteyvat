import { Length, IsFQDN, IsNumber, IsOptional, Allow } from 'class-validator';
import { Expose } from 'class-transformer';

export class PgSchema {
  @Allow()
  @Expose({ name: 'LOG' })
  log: string;

  get logPg() {
    return this.log ? this.log === '1' || !!this.log?.match(/pg/) : false;
  }

  @IsFQDN({ require_tld: false })
  @Expose({ name: 'DB_HOST' })
  dbHost: string;

  @IsNumber()
  @IsOptional()
  @Expose({ name: 'DB_PORT' })
  dbPort: number;

  @Length(1)
  @Expose({ name: 'DB_PASSWORD' })
  dbPassword: string;

  @Length(1)
  @Expose({ name: 'DB_USERNAME' })
  dbUsername: string;

  @Length(1)
  @Expose({ name: 'DB_DATABASE' })
  dbDatabase: string;
}
