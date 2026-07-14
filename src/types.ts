export interface Jogador {
  id: string;
  nome: string;
  posicao: 'GOL' | 'DEF' | 'MEI' | 'ATA';
  forca: number;
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