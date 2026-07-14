import { type Time, type PartidaSimulada, type Gol, type Jogador } from './types';

export function obterTitulares(jogadores: Jogador[]): Jogador[] {
  const ordenarPorMelhor = (lista: Jogador[]) => 
    [...lista].sort((a, b) => (b.forca * (b.energia / 100)) - (a.forca * (a.energia / 100)));

  const goleiros = ordenarPorMelhor(jogadores.filter(j => j.posicao === 'GOL'));
  const defesas = ordenarPorMelhor(jogadores.filter(j => j.posicao === 'DEF'));
  const meias = ordenarPorMelhor(jogadores.filter(j => j.posicao === 'MEI'));
  const ataques = ordenarPorMelhor(jogadores.filter(j => j.posicao === 'ATA'));

  return [
    ...goleiros.slice(0, 1),
    ...defesas.slice(0, 4),
    ...meias.slice(0, 4),
    ...ataques.slice(0, 2)
  ];
}

export function simularPartida(timeCasa: Time, timeFora: Time, rodadaAtual: number): PartidaSimulada {
  const titularesCasa = obterTitulares(timeCasa.jogadores);
  const titularesFora = obterTitulares(timeFora.jogadores);

  const calcularForcaTitulares = (titulares: Jogador[]) => {
    const soma = titulares.reduce((acc, j) => acc + (j.forca * (j.energia / 100)), 0);
    return soma / titulares.length;
  };

  const forcaCasa = calcularForcaTitulares(titularesCasa);
  const forcaFora = calcularForcaTitulares(titularesFora);

  const pesoCasa = forcaCasa + 3;
  const pesoFora = forcaFora;

  const maxGolsCasa = Math.max(1, Math.floor(pesoCasa / 15));
  const maxGolsFora = Math.max(1, Math.floor(pesoFora / 15));

  const golsCasa = Math.floor(Math.random() * maxGolsCasa);
  const golsFora = Math.floor(Math.random() * maxGolsFora);

  const golsDetalhes: Gol[] = [];

  const escolherAutorEmCampo = (titulares: Jogador[]): string => {
    const atacantesEMeias = titulares.filter(j => j.posicao === 'ATA' || j.posicao === 'MEI');
    const sorteado = atacantesEMeias.length > 0 
      ? atacantesEMeias[Math.floor(Math.random() * atacantesEMeias.length)]
      : titulares[Math.floor(Math.random() * titulares.length)];
    return sorteado.nome;
  };

  for (let i = 0; i < golsCasa; i++) {
    golsDetalhes.push({ autor: escolherAutorEmCampo(titularesCasa), minuto: Math.floor(Math.random() * 89) + 1, timeNome: timeCasa.nome });
  }

  for (let i = 0; i < golsFora; i++) {
    golsDetalhes.push({ autor: escolherAutorEmCampo(titularesFora), minuto: Math.floor(Math.random() * 89) + 1, timeNome: timeFora.nome });
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