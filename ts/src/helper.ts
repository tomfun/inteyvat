import { Transform } from 'class-transformer';

export function transformDurationToSeconds(value: string): number {
  const {
    groups: { d, h, m },
  } = value.match(/P?((?<d>\d+)D)?T?((?<h>\d+)H)?((?<m>\d+)M)?$/);
  const hours = (h ? +h : 0) + (d ? +d : 0) * 24;
  const minutes = (m ? +m : 0) + hours * 60;
  return minutes * 60;
}

export const TransformDurationToSeconds = Transform(({ value }) =>
  value?.match(/^\d+$/) ? +value : transformDurationToSeconds(value),
);
