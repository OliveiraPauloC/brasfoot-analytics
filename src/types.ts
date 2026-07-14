export interface Jogador {
  id: string;
  nome: string;
  posicao: 'GOL' | 'DEF' | 'MEI' | 'ATA';
  forca: number;
  idade: number;
  energia: number; 
  salario: number; 
}

export interface Time {
  id: string;
  nome: string;
  pontos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golsPro: number;
  golsContra: number;
  jogadores: Jogador[];
}

export interface Gol {
  autor: string;
  minuto: number;
  timeNome: string;
}

export interface PartidaSimulada {
  id: string;
  timeCasaNome: string;
  timeForaNome: string;
  golsCasa: number;
  golsFora: number;
  golsDetalhes: Gol[];
}

export interface RodadaSimulada {
  numeroRodada: number;
  partidas: PartidaSimulada[];
}