import { type Time, type PartidaSimulada, type Gol, type Jogador } from './types';

export function calcularForcaJogador(j: Jogador): number {
  let forcaBase = 0;
  switch (j.posicao) {
    case 'GOL': forcaBase = (j.ref * 0.7) + (j.fis * 0.2) + (j.tec * 0.1); break;
    case 'DEF': forcaBase = (j.def * 0.7) + (j.fis * 0.2) + (j.tec * 0.1); break;
    case 'MEI': forcaBase = (j.tec * 0.6) + (j.fis * 0.2) + (j.def * 0.1) + (j.fin * 0.1); break;
    case 'ATA': forcaBase = (j.fin * 0.6) + (j.fis * 0.3) + (j.tec * 0.1); break;
  }
  return forcaBase * (j.energia / 100);
}

export function obterTitulares(jogadores: Jogador[]): Jogador[] {
  const ordenarPorMelhor = (lista: Jogador[]) => 
    [...lista].sort((a, b) => calcularForcaJogador(b) - calcularForcaJogador(a));

  return [
    ...ordenarPorMelhor(jogadores.filter(j => j.posicao === 'GOL')).slice(0, 1),
    ...ordenarPorMelhor(jogadores.filter(j => j.posicao === 'DEF')).slice(0, 4),
    ...ordenarPorMelhor(jogadores.filter(j => j.posicao === 'MEI')).slice(0, 4),
    ...ordenarPorMelhor(jogadores.filter(j => j.posicao === 'ATA')).slice(0, 2)
  ];
}

export function simularPartida(timeCasa: Time, timeFora: Time, rodadaAtual: number): PartidaSimulada {
  const tCasa = obterTitulares(timeCasa.jogadores);
  const tFora = obterTitulares(timeFora.jogadores);

  const obterForcaSetor = (lista: Jogador[], pos: string) => {
    const filtrados = lista.filter(j => j.posicao === pos);
    return filtrados.reduce((acc, j) => acc + calcularForcaJogador(j), 0) / filtrados.length;
  };

  const ataCasa = (obterForcaSetor(tCasa, 'ATA') + obterForcaSetor(tCasa, 'MEI')) / 2 + 1.5; 
  const defCasa = (obterForcaSetor(tCasa, 'DEF') + obterForcaSetor(tCasa, 'GOL')) / 2 + 1.5;
  
  const ataFora = (obterForcaSetor(tFora, 'ATA') + obterForcaSetor(tFora, 'MEI')) / 2;
  const defFora = (obterForcaSetor(tFora, 'DEF') + obterForcaSetor(tFora, 'GOL')) / 2;

  const golsDetalhes: Gol[] = [];
  let golsCasa = 0;
  let golsFora = 0;

  const escolherAutorEmCampo = (titulares: Jogador[]): string => {
    const atacantesEMeias = titulares.filter(j => j.posicao === 'ATA' || j.posicao === 'MEI');
    const sorteado = atacantesEMeias.length > 0 
      ? atacantesEMeias[Math.floor(Math.random() * atacantesEMeias.length)]
      : titulares[Math.floor(Math.random() * titulares.length)];
    return sorteado.nome;
  };

  for (let momento = 1; momento <= 6; momento++) {
    const minutoDoEvento = Math.floor(Math.random() * 14) + (momento - 1) * 15 + 1;

    const chanceCasa = 0.08 + (ataCasa - defFora) / 150; 
    if (Math.random() < Math.max(0.02, Math.min(0.35, chanceCasa))) {
      golsCasa++;
      golsDetalhes.push({ autor: escolherAutorEmCampo(tCasa), minuto: minutoDoEvento, timeNome: timeCasa.nome });
    }

    const chanceFora = 0.06 + (ataFora - defCasa) / 150;
    if (Math.random() < Math.max(0.01, Math.min(0.30, chanceFora))) {
      golsFora++;
      golsDetalhes.push({ autor: escolherAutorEmCampo(tFora), minuto: minutoDoEvento, timeNome: timeFora.nome });
    }
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