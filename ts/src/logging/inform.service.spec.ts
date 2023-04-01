import { Test, TestingModule } from '@nestjs/testing';
import { TournamentEntity } from '../entity';
import { InformService } from './inform.service';
import { TelegramService } from './telegram.service';
import { MailService } from './mail.service';

describe('InformService', () => {
  const tournament = new TournamentEntity();
  let informService: InformService;
  let telegramService: { sendMessage: jest.Mock };
  let mailService: { sendMessage: jest.Mock };

  beforeEach(async () => {
    telegramService = {
      sendMessage: jest.fn().mockResolvedValue(tournament),
    };
    mailService = {
      sendMessage: jest.fn().mockResolvedValue(tournament),
    };
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: InformService,
          useClass: InformService,
        },
        {
          provide: 'strict-config#loggingSilentForPerInstance$Number',
          useValue: 1,
        },
        {
          provide: TelegramService,
          useValue: telegramService,
        },
        {
          provide: MailService,
          useValue: mailService,
        },
      ],
    }).compile();

    informService = app.get<InformService>(InformService);
  });

  describe('root', () => {
    it('should send proper html', async () => {
      Object.assign(tournament, {
        id: 123,
        name: 'David',
      } as TournamentEntity);
      await informService.notifyNotEnoughBalance(tournament);
      expect(mailService.sendMessage.mock.calls).toHaveLength(1);
      expect(telegramService.sendMessage.mock.calls).toHaveLength(1);
      const { html, text, subject } = mailService.sendMessage.mock.calls[0][0];
      expect(html).toMatch(/Some.+things/i);
      expect(html).toContain('123');
      expect(text).toMatch(/Some.+things/i);
      expect(text).toContain('123');
      expect(subject).toMatch(/Some.+things/i);
    });
  });
});
