import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FastifyReply } from 'fastify/types/reply';
import { TournamentEntity } from '../entity';
import { FormController } from './form.controller';

describe('FormController', () => {
  const tournamentEntity = new TournamentEntity();
  let controller: FormController;
  let repository: { findOne: jest.Mock };

  beforeEach(async () => {
    repository = {
      findOne: jest.fn().mockResolvedValue(tournamentEntity),
    };
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FormController],
      providers: [
        {
          provide: 'strict-config#ENVIRONMENT$String',
          useValue: 'None',
        },
        {
          provide: 'strict-config#VERSION$String',
          useValue: 'n/a',
        },
        {
          provide: 'strict-config#sentryDsn$String',
          useValue: '123-STRIPE_PLATFORM_PUBLIC_API_KEY-555432',
        },
        {
          provide: getRepositoryToken(TournamentEntity),
          useValue: repository,
        },
      ],
    }).compile();

    controller = app.get<FormController>(FormController);
  });

  describe('root', () => {
    it('should return html', async () => {
      Object.assign(tournamentEntity, {
        id: 123,
      } as TournamentEntity);
      const reply = {
        send: jest.fn(),
      };
      await controller.show(123, reply as unknown as FastifyReply);
      expect(reply.send).toHaveBeenCalledTimes(1);
      const html = reply.send.mock.calls[0][0];
      expect(html).toMatch(/<div.+id="app"/);
      expect(html).toMatch(/"id":\s*123/);
    });
  });
});
