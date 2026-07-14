import { type Time } from './types';

export interface ResultadoPartida {
  timeCasaNome: string;
  timeForaNome: string;
  golsCasa: number;
  golsFora: number;
}

export function simularPartida(timeCasa: Time, timeFora: Time): ResultadoPartida {
  const forcaCasa = timeCasa.jogadores.reduce((acc, j) => acc + j.forca, 0) / timeCasa.jogadores.length;
  const forcaFora = timeFora.jogadores.reduce((acc, j) => acc + j.forca, 0) / timeFora.jogadores.length;

  const pesoCasa = forcaCasa + 3;
  const pesoFora = forcaFora;

  const maxGolsCasa = Math.max(1, Math.floor(pesoCasa / 18));
  const maxGolsFora = Math.max(1, Math.floor(pesoFora / 18));

  const golsCasa = Math.floor(Math.random() * maxGolsCasa);
  const golsFora = Math.floor(Math.random() * maxGolsFora);

  return {
    timeCasaNome: timeCasa.nome,
    timeForaNome: timeFora.nome,
    golsCasa,
    golsFora,
  };
}