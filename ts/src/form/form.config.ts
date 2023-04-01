import { Expose } from 'class-transformer';
import { Allow, IsUrl, Matches } from 'class-validator';

export class FormConfig {
  @Allow()
  @Expose()
  ENVIRONMENT: string;

  @Allow()
  @Expose()
  VERSION: string;

  @IsUrl({ allow_query_components: false, require_tld: true })
  @Expose()
  sentryDsn: string;

  @IsUrl({ allow_query_components: false, require_tld: false })
  @Matches(/[^\/]$/)
  @Expose()
  publicUrl: string;
}
