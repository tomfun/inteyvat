import { Length } from 'class-validator';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export class TournamentBodyPayload {
  @Length(2, 200)
  name: string;
}

@Entity('tournament')
export class TournamentEntity extends TournamentBodyPayload {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
