import { Body, ValidationPipe } from '@nestjs/common';

export const ValidBody = Body(
  new ValidationPipe({ whitelist: true, transform: true }),
);
