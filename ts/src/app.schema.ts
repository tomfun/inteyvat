import {
  Length,
  Min,
  Max,
  Matches,
  IsIP,
  IsUrl,
  IsFQDN,
  IsNumber,
  IsOptional,
  Allow,
  IsEmail,
  ValidateIf,
} from 'class-validator';
import { Expose, Transform } from 'class-transformer';
import {
  transformDurationToSeconds,
  TransformDurationToSeconds,
} from './helper';

export class AppSchema {
  @Allow()
  @Expose()
  ENVIRONMENT = 'None';

  @Allow()
  @Expose()
  VERSION = 'n/a';

  @IsOptional()
  @Expose({ name: 'SENTRY_DISABLE' })
  @Transform(({ value }) => value === '1')
  sentryDisable = false;

  @IsUrl({ allow_query_components: false, require_tld: true })
  @Expose({ name: 'SENTRY_DSN' })
  @ValidateIf((o: Partial<AppSchema>) => !o.sentryDisable)
  sentryDsn = 'https://9849b7f87d72471ea55aa1c7a11d3233@sentry.uastage.com/18';

  @Allow()
  @Expose({ name: 'LOG' })
  log: string;

  get logHttp(): boolean {
    return this.log ? this.log === '1' || !!this.log?.match(/http/) : false;
  }

  get logPg() {
    return this.log ? this.log === '1' || !!this.log?.match(/pg/) : false;
  }

  get logCassandra() {
    return this.log
      ? this.log === '1' || !!this.log?.match(/cassandra/)
      : false;
  }

  @Allow()
  @Expose({ name: 'TRUST_PROXY' })
  @Transform(({ value }) => (value?.match(/^\d+$/) ? +value : value))
  trustProxy: number | string;

  @IsIP()
  @Expose({ name: 'ADDRESS' })
  address: string;

  @Min(1)
  @Max(65535)
  @Expose({ name: 'PORT' })
  @Transform(({ value }) => (value?.match(/^\d+/) ? +value : value))
  port: number;

  @IsUrl({ allow_query_components: false, require_tld: false })
  @Matches(/[^\/]$/)
  @Expose({ name: 'PUBLIC_URL' })
  publicUrl: string;

  @IsFQDN({ require_tld: false })
  @Expose({ name: 'DB_HOST' })
  dbHost: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(65535)
  @Expose({ name: 'DB_PORT' })
  @Transform(({ value }) => +value)
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

  @Length(30)
  @Expose({ name: 'LOGGING_SENDGRID_API_KEY' })
  loggingSendgridApiKey: string;

  @IsEmail()
  @Expose({ name: 'LOGGING_SENDGRID_EMAIL_FROM' })
  loggingSendgridEmailFrom: string;

  @IsEmail()
  @Expose({ name: 'LOGGING_SENDGRID_EMAIL_TO' })
  loggingSendgridEmailTo: string;

  @Length(10)
  @Expose({ name: 'LOGGING_TELEGRAM_BOT_TOKEN' })
  loggingTelegramBotToken: string;

  @Length(9)
  @Expose({ name: 'LOGGING_TELEGRAM_CHAT_ID' })
  loggingTelegramChatId: string;

  @Min(1)
  @Expose({ name: 'LOGGING_SILENT_FOR_PER_INSTANCE' })
  // @Matches(/^(\d+)|(P?(\d+d)?T?(\d+h)?(\d+m)?)$/)
  @TransformDurationToSeconds
  loggingSilentForPerInstance: number;

  @Allow()
  @Expose({ name: 'NOTIFICATION_RETRY_IN' })
  @Transform(({ value }) =>
    value
      .split(',')
      .map((v) => v.trim())
      .map((v) => (v.match(/^\d+$/) ? +v : transformDurationToSeconds(v)))
      .map((v) => 1000 * v),
  )
  notificationRetryIn: number[];
}
