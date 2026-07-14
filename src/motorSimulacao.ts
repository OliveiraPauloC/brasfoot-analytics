import { type Time, type PartidaSimulada, type Gol } from './types';

export function simularPartida(timeCasa: Time, timeFora: Time, rodadaAtual: number): PartidaSimulada {
  const calcularForcaRealTime = (time: Time) => {
    const soma = time.jogadores.reduce((acc, j) => {
      const fatorEnergia = j.energia / 100;
      return acc + (j.forca * fatorEnergia);
    }, 0);
    return soma / time.jogadores.length;
  };

  const forcaCasa = calcularForcaRealTime(timeCasa);
  const forcaFora = calcularForcaRealTime(timeFora);

  const pesoCasa = forcaCasa + 3;
  const pesoFora = forcaFora;

  const maxGolsCasa = Math.max(1, Math.floor(pesoCasa / 15));
  const maxGolsFora = Math.max(1, Math.floor(pesoFora / 15));

  const golsCasa = Math.floor(Math.random() * maxGolsCasa);
  const golsFora = Math.floor(Math.random() * maxGolsFora);

  const golsDetalhes: Gol[] = [];

  const escolherAutor = (time: Time): string => {
    const elegiveis = time.jogadores.filter(j => j.posicao === 'ATA' || j.posicao === 'MEI');
    const elencoAlternativo = elegiveis.length > 0 ? elegiveis : time.jogadores;
    const sorteado = elencoAlternativo[Math.floor(Math.random() * elencoAlternativo.length)];
    return sorteado.nome;
  };

  for (let i = 0; i < golsCasa; i++) {
    golsDetalhes.push({ autor: escolherAutor(timeCasa), minuto: Math.floor(Math.random() * 89) + 1, timeNome: timeCasa.nome });
  }

  for (let i = 0; i < golsFora; i++) {
    golsDetalhes.push({ autor: escolherAutor(timeFora), minuto: Math.floor(Math.random() * 89) + 1, timeNome: timeFora.nome });
  }

  golsDetalhes.sort((a, b) => a.minuto - b.minuto);

  return {
    id: `${rodadaAtual}-${timeCasa.id}-${timeFora.id}`,
    timeCasaNome: timeCasa.nome,
    timeForaNome: timeFora.nome,
    golsCasa,
    golsFora,
    golsDetalhes
  };
}