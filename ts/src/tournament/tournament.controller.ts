import { Controller, Post } from '@nestjs/common';
import { ValidBody } from '../validBodyPipe';
import { TournamentService } from './tournament.service';
import { TournamentBodyPayload } from '../entity';

@Controller('/api/tournament')
export class TournamentController {
  constructor(private readonly orderService: TournamentService) {}

  @Post()
  async create(@ValidBody payload: TournamentBodyPayload): Promise<object> {
    const tournamentEntity = await this.orderService.createTournament(payload);
    return {
      id: tournamentEntity.id,
      name: tournamentEntity.name,
    };
  }
}
