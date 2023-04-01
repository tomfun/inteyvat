import { Controller, Get, Header, Param, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FastifyReply } from 'fastify/types/reply';
import { Repository } from 'typeorm';

import { TournamentEntity } from '../entity';
import { InjectConfig } from '../strict-config/strict-config.decorator';
import { FormConfig } from './form.config';

@Controller()
export class FormController {
  @InjectConfig<FormConfig>('sentryDsn')
  private readonly sentryDsn: string;

  @InjectConfig<FormConfig>('VERSION')
  private readonly VERSION: string;

  @InjectConfig<FormConfig>('ENVIRONMENT')
  private readonly ENVIRONMENT: string;

  @InjectRepository(TournamentEntity)
  private readonly tournamentRepository: Repository<TournamentEntity>;

  @Get('/form/:id')
  @Header('Cache-Control', 'none')
  @Header('content-type', 'text/html')
  async show(@Param('id') id: number, @Res() res: FastifyReply): Promise<void> {
    const tournament = await this.tournamentRepository.findOne({
      where: { id },
    });
    const pageHtml = `<!doctype html>
<html lang="us">
<head>
<title>Payment page</title>
<meta charset="utf-8" name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>
  <script
    src="https://browser.sentry-cdn.com/7.30.0/bundle.tracing.min.js"
    integrity="sha384-Bg62zHsi987Oz6ZjY/kTpVoikSkPPnyah43/7/6C2tbDyLobJYG32x8EmoesZGNU"
    crossorigin="anonymous"
  ></script>
  <script src="/js/scripts.js"></script>
  <div id="app">
      <!-- Elements will create form elements here -->
  </div>
  <script>
  Sentry.init(Object.assign(${JSON.stringify({
    environment: this.ENVIRONMENT,
    release: `form@${this.VERSION}`,
    initialScope: {
      tags: {
        tournament: tournament.id,
      },
    },
    dsn: this.sentryDsn,
  })}, {
    denyUrls: [/localhost/],
    integrations: [new Sentry.BrowserTracing()],
  
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  }));
  initForm(${JSON.stringify({
    tournament: { id: tournament.id },
  })})
  </script>
</body>
</html>`;
    res.send(pageHtml);
  }
}
