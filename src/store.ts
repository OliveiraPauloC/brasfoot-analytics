import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Time } from './types';
import { simularPartida } from './motorSimulacao';

const TIMES_INICIAIS: Time[] = [
  { id: '1', nome: 'Botafogo', pontos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, jogadores: [{ id: '5', nome: 'Almada', posicao: 'MEI', forca: 84 }, { id: '6', nome: 'Luiz Henrique', posicao: 'ATA', forca: 83 }] },
  { id: '2', nome: 'Corinthians', pontos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, jogadores: [{ id: '13', nome: 'Garro', posicao: 'MEI', forca: 80 }, { id: '14', nome: 'Depay', posicao: 'ATA', forca: 82 }] },
  { id: '3', nome: 'Flamengo', pontos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, jogadores: [{ id: '1', nome: 'Arrascaeta', posicao: 'MEI', forca: 85 }, { id: '2', nome: 'Pedro', posicao: 'ATA', forca: 84 }] },
  { id: '4', nome: 'Fluminense', pontos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, jogadores: [{ id: '3', nome: 'Ganso', posicao: 'MEI', forca: 79 }, { id: '4', nome: 'Arias', posicao: 'ATA', forca: 82 }] },
  { id: '5', nome: 'Palmeiras', pontos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, jogadores: [{ id: '9', nome: 'Veiga', posicao: 'MEI', forca: 83 }, { id: '10', nome: 'Gómez', posicao: 'DEF', forca: 81 }] },
  { id: '6', nome: 'Santos', pontos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, jogadores: [{ id: '15', nome: 'Giuliano', posicao: 'MEI', forca: 75 }, { id: '16', nome: 'Furch', posicao: 'ATA', forca: 74 }] },
  { id: '7', nome: 'São Paulo', pontos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, jogadores: [{ id: '11', nome: 'Lucas Moura', posicao: 'MEI', forca: 82 }, { id: '12', nome: 'Calleri', posicao: 'ATA', forca: 80 }] },
  { id: '8', nome: 'Vasco', pontos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, jogadores: [{ id: '7', nome: 'Payet', posicao: 'MEI', forca: 78 }, { id: '8', nome: 'Vegetti', posicao: 'ATA', forca: 80 }] },
];


interface JogoStore {
  times: Time[];
  rodada: number;
  historico: string[];
  jogarRodada: () => void;
  resetarCampeonato: () => void;
}

export const useJogoStore = create<JogoStore>()(
  persist(
    (set) => ({
      times: TIMES_INICIAIS,
      rodada: 1,
      historico: [],

      jogarRodada: () => set((state) => {
        if (state.rodada > 7) {
          alert("Campeonato encerrado! Clique em Resetar para reiniciar.");
          return {};
        }

        const novosTimes = JSON.parse(JSON.stringify(state.times)) as Time[];
        const novosRelatos: string[] = [];
        
        const numTimes = novosTimes.length;
        const r = state.rodada - 1;

        const confrontos: [number, number][] = [];
        for (let i = 0; i < numTimes / 2; i++) {
          const casa = (r + i) % (numTimes - 1);
          let fora = (numTimes - 1 - i + r) % (numTimes - 1);

          if (i === 0) {
            fora = numTimes - 1;
          }

          confrontos.push([casa, fora]);
        }

        confrontos.forEach(([idxCasa, idxFora]) => {
          const tCasa = novosTimes[idxCasa];
          const tFora = novosTimes[idxFora];
          const res = simularPartida(tCasa, tFora);

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
          novosRelatos.push(`Rodada ${state.rodada}: ${res.timeCasaNome} ${res.golsCasa} x ${res.golsFora} ${res.timeForaNome}`);
        });

        novosTimes.sort((a, b) => {
          const saldoA = a.golsPro - a.golsContra;
          const saldoB = b.golsPro - b.golsContra;
          return b.pontos - a.pontos || saldoB - saldoA || b.golsPro - a.golsPro;
        });

        return { 
          times: novosTimes, 
          rodada: state.rodada + 1, 
          historico: [...novosRelatos, ...state.historico] 
        };
      }),
      resetarCampeonato: () => set({ times: TIMES_INICIAIS, rodada: 1, historico: [] })
    }),
    { name: 'brasfoot_analytics_save' }
  )
);
