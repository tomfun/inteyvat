import { Expose } from 'class-transformer';
import { IsEmail, Length, Min } from 'class-validator';

export class LoggingConfig {
  @Length(30)
  @Expose()
  loggingSendgridApiKey: string;

  @IsEmail()
  @Expose()
  loggingSendgridEmailFrom: string;

  @IsEmail()
  @Expose()
  loggingSendgridEmailTo: string;

  @Length(10)
  @Expose()
  loggingTelegramBotToken: string;

  @Length(9)
  @Expose()
  loggingTelegramChatId: string;

  @Min(1)
  @Expose()
  loggingSilentForPerInstance: number;
}
