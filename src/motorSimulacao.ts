import { type Time, type PartidaSimulada, type Gol, type Jogador } from './types';

export function calcularForcaJogador(j: Jogador): number {
  let forcaBase = 0;
  switch (j.posicao) {
    case 'GOL': 
      forcaBase = (j.ref * 0.7) + (j.fis * 0.2) + (j.tec * 0.1); 
      break;
    case 'DEF': 
      forcaBase = (j.def * 0.7) + (j.fis * 0.2) + (j.tec * 0.1); 
      break;
    case 'MEI': 
      forcaBase = (j.tec * 0.6) + (j.fis * 0.2) + (j.def * 0.1) + (j.fin * 0.1); 
      break;
    case 'ATA': 
      forcaBase = (j.fin * 0.6) + (j.fis * 0.3) + (j.tec * 0.1); 
      break;
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

const escolherAutorEmCampo = (titulares: Jogador[]): string => {
  const candidatos = titulares.filter(j => j.posicao === 'ATA' || j.posicao === 'MEI' || j.posicao === 'DEF');
  const listaSorteio = candidatos.length > 0 ? candidatos : titulares;

  const somaFinalizacao = listaSorteio.reduce((acc, j) => {
    if (j.posicao === 'DEF') return acc + (j.fin / 3);
    return acc + j.fin;
  }, 0);

  let numeroSorteado = Math.random() * somaFinalizacao;

  for (const Ovalor of listaSorteio) {
    const pesoAtual = Ovalor.posicao === 'DEF' ? (Ovalor.fin / 3) : Ovalor.fin;
    numeroSorteado -= pesoAtual;
    if (numeroSorteado <= 0) return Ovalor.nome;
  }

  return listaSorteio[0].nome;
};

export function simularPartida(timeCasa: Time, timeFora: Time, rodadaAtual: number): PartidaSimulada {
  const tCasa = obterTitulares(timeCasa.jogadores);
  const tFora = obterTitulares(timeFora.jogadores);

  const obterMediaAtributo = (lista: Jogador[], pos: string, attr: keyof Jogador) => {
    const filtrados = lista.filter(j => j.posicao === pos);
    if (filtrados.length === 0) return 50;
    return filtrados.reduce((acc, j) => acc + Number(j[attr]), 0) / filtrados.length;
  };

  const criacaoCasa = (obterMediaAtributo(tCasa, 'MEI', 'tec') * 0.7 + obterMediaAtributo(tCasa, 'MEI', 'fis') * 0.3) + 2.0; // +2 Mando de campo
  const criacaoFora = obterMediaAtributo(tFora, 'MEI', 'tec') * 0.7 + obterMediaAtributo(tFora, 'MEI', 'fis') * 0.3;

  const ataqueCasa = obterMediaAtributo(tCasa, 'ATA', 'fin');
  const defesaFora = (obterMediaAtributo(tFora, 'DEF', 'def') * 0.6 + obterMediaAtributo(tFora, 'GOL', 'ref') * 0.4);

  const ataqueFora = obterMediaAtributo(tFora, 'ATA', 'fin');
  const defesaCasa = (obterMediaAtributo(tCasa, 'DEF', 'def') * 0.6 + obterMediaAtributo(tCasa, 'GOL', 'ref') * 0.4);

  const golsDetalhes: Gol[] = [];
  let golsCasa = 0;
  let golsFora = 0;

  for (let momento = 1; momento <= 6; momento++) {
    const baseMinuto = (momento - 1) * 15 + 1;

    const chanceCasa = 0.06 + ((criacaoCasa + ataqueCasa) - defesaFora) / 160;
    if (Math.random() < Math.max(0.02, Math.min(0.35, chanceCasa))) {
      golsCasa++;
      const minutoCasa = Math.floor(Math.random() * 14) + baseMinuto;
      golsDetalhes.push({ autor: escolherAutorEmCampo(tCasa), minuto: minutoCasa, timeNome: timeCasa.nome });
    }

    const chanceFora = 0.04 + ((criacaoFora + ataqueFora) - defesaCasa) / 160;
    if (Math.random() < Math.max(0.01, Math.min(0.30, chanceFora))) {
      golsFora++;
      let minutoFora = Math.floor(Math.random() * 14) + baseMinuto;

      const minutoDuplicado = golsDetalhes.some(g => g.minuto === minutoFora);
      if (minutoDuplicado) {
        minutoFora = Math.min(90, minutoFora + 1);
      }

      golsDetalhes.push({ autor: escolherAutorEmCampo(tFora), minuto: minutoFora, timeNome: timeFora.nome });
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
