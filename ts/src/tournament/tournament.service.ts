import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TournamentBodyPayload, TournamentEntity } from '../entity';

@Injectable()
export class TournamentService {
  @InjectRepository(TournamentEntity)
  private tournamentEntityRepository: Repository<TournamentEntity>;

  async createTournament(
    payload: TournamentBodyPayload,
  ): Promise<TournamentEntity> {
    return this.tournamentEntityRepository.save(
      Object.assign(new TournamentEntity(), payload),
    );
  }
}
