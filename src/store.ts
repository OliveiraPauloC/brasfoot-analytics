import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Time, type RodadaSimulada, type PartidaSimulada } from './types';

const TIMES_INICIAIS: Time[] = [
  { id: '1', nome: 'Flamengo', pontos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, jogadores: [{ id: 'f1', nome: 'Rossi', posicao: 'GOL', forca: 80 }, { id: 'f2', nome: 'Léo Pereira', posicao: 'DEF', forca: 78 }, { id: 'f3', nome: 'Arrascaeta', posicao: 'MEI', forca: 85 }, { id: 'f4', nome: 'Gerson', posicao: 'MEI', forca: 83 }, { id: 'f5', nome: 'Pedro', posicao: 'ATA', forca: 84 }] },
  { id: '2', nome: 'Fluminense', pontos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, jogadores: [{ id: 'fl1', nome: 'Fábio', posicao: 'GOL', forca: 76 }, { id: 'fl2', nome: 'Thiago Silva', posicao: 'DEF', forca: 80 }, { id: 'fl3', nome: 'Ganso', posicao: 'MEI', forca: 79 }, { id: 'fl4', nome: 'Martinelli', posicao: 'MEI', forca: 75 }, { id: 'fl5', nome: 'Arias', posicao: 'ATA', forca: 82 }] },
  { id: '3', nome: 'Botafogo', pontos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, jogadores: [{ id: 'b1', nome: 'John', posicao: 'GOL', forca: 78 }, { id: 'b2', nome: 'Bastos', posicao: 'DEF', forca: 77 }, { id: 'b3', nome: 'Almada', posicao: 'MEI', forca: 84 }, { id: 'b4', nome: 'Marlon Freitas', posicao: 'MEI', forca: 78 }, { id: 'b5', nome: 'Luiz Henrique', posicao: 'ATA', forca: 83 }] },
  { id: '4', nome: 'Vasco', pontos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, jogadores: [{ id: 'v1', nome: 'Léo Jardim', posicao: 'GOL', forca: 79 }, { id: 'v2', nome: 'João Victor', posicao: 'DEF', forca: 76 }, { id: 'v3', nome: 'Payet', posicao: 'MEI', forca: 78 }, { id: 'v4', nome: 'Coutinho', posicao: 'MEI', forca: 77 }, { id: 'v5', nome: 'Vegetti', posicao: 'ATA', forca: 80 }] },
  { id: '5', nome: 'Palmeiras', pontos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, jogadores: [{ id: 'p1', nome: 'Weverton', posicao: 'GOL', forca: 81 }, { id: 'p2', nome: 'Murilo', posicao: 'DEF', forca: 79 }, { id: 'p3', nome: 'Veiga', posicao: 'MEI', forca: 83 }, { id: 'p4', nome: 'Richard Ríos', posicao: 'MEI', forca: 78 }, { id: 'p5', nome: 'Flaco López', posicao: 'ATA', forca: 79 }] },
  { id: '6', nome: 'São Paulo', pontos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, jogadores: [{ id: 's1', nome: 'Rafael', posicao: 'GOL', forca: 77 }, { id: 's2', nome: 'Arboleda', posicao: 'DEF', forca: 79 }, { id: 's3', nome: 'Lucas Moura', posicao: 'MEI', forca: 82 }, { id: 's4', nome: 'Alisson', posicao: 'MEI', forca: 76 }, { id: 's5', nome: 'Calleri', posicao: 'ATA', forca: 80 }] },
  { id: '7', nome: 'Corinthians', pontos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, jogadores: [{ id: 'c1', nome: 'Hugo Souza', posicao: 'GOL', forca: 76 }, { id: 'c2', nome: 'André Ramalho', posicao: 'DEF', forca: 77 }, { id: 'c3', nome: 'Garro', posicao: 'MEI', forca: 80 }, { id: 'c4', nome: 'Carrillo', posicao: 'MEI', forca: 75 }, { id: 'c5', nome: 'Depay', posicao: 'ATA', forca: 82 }] },
  { id: '8', nome: 'Santos', pontos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, jogadores: [{ id: 'san1', nome: 'Brazão', posicao: 'GOL', forca: 73 }, { id: 'san2', nome: 'Gil', posicao: 'DEF', forca: 74 }, { id: 'san3', nome: 'Giuliano', posicao: 'MEI', forca: 75 }, { id: 'san4', nome: 'Otero', posicao: 'MEI', forca: 73 }, { id: 'san5', nome: 'Guilherme', posicao: 'ATA', forca: 76 }] },
];

interface JogoStore {
  times: Time[];
  rodada: number;
  historicoRodadas: RodadaSimulada[];
  atualizarTabela: (partidas: PartidaSimulada[]) => void;
  resetarCampeonato: () => void;
}

export const useJogoStore = create<JogoStore>()(
  persist(
    (set) => ({
      times: TIMES_INICIAIS,
      rodada: 1,
      historicoRodadas: [],

      atualizarTabela: (partidasExecutadas) => set((state) => {
        const novosTimes = JSON.parse(JSON.stringify(state.times)) as Time[];

        partidasExecutadas.forEach((res) => {
          const tCasa = novosTimes.find(t => t.nome === res.timeCasaNome)!;
          const tFora = novosTimes.find(t => t.nome === res.timeForaNome)!;

          tCasa.golsPro += res.golsCasa; 
          tCasa.golsContra += res.golsFora;
          tFora.golsPro += res.golsFora; 
          tFora.golsContra += res.golsCasa;

          if (res.golsCasa > res.golsFora) {
            tCasa.pontos += 3; tCasa.vitorias += 1; tFora.derrotas += 1;
          } else if (res.golsFora > res.golsCasa) {
            tFora.pontos += 3; tFora.vitorias += 1; tCasa.derrotas += 1;
          } else {
            tCasa.pontos += 1; tFora.pontos += 1; tCasa.empates += 1; tFora.empates += 1;
          }
        });

        novosTimes.sort((a, b) => {
          const saldoA = a.golsPro - a.golsContra;
          const saldoB = b.golsPro - b.golsContra;
          return b.pontos - a.pontos || saldoB - saldoA || b.golsPro - a.golsPro;
        });

        const novaRodadaRecord: RodadaSimulada = {
          numeroRodada: state.rodada,
          partidas: partidasExecutadas
        };

        return {
          times: novosTimes,
          rodada: state.rodada + 1,
          historicoRodadas: [novaRodadaRecord, ...state.historicoRodadas]
        };
      }),

      resetarCampeonato: () => set({ times: TIMES_INICIAIS, rodada: 1, historicoRodadas: [] })
    }),
    { name: 'brasfoot_analytics_save' }
  )
);