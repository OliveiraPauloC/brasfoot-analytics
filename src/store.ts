import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Time, type RodadaSimulada, type PartidaSimulada } from './types';
import { simularPartida } from './motorSimulacao';

const TIMES_INICIAIS: Time[] = [
  { id: '1', nome: 'Flamengo', pontos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, jogadores: [{ id: 'f1', nome: 'Arrascaeta', posicao: 'MEI', forca: 85 }, { id: 'f2', nome: 'Pedro', posicao: 'ATA', forca: 84 }] },
  { id: '2', nome: 'Fluminense', pontos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, jogadores: [{ id: 'fl1', nome: 'Ganso', posicao: 'MEI', forca: 79 }, { id: 'fl2', nome: 'Arias', posicao: 'ATA', forca: 82 }] },
  { id: '3', nome: 'Botafogo', pontos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, jogadores: [{ id: 'b1', nome: 'Almada', posicao: 'MEI', forca: 84 }, { id: 'b2', nome: 'Luiz Henrique', posicao: 'ATA', forca: 83 }] },
  { id: '4', nome: 'Vasco', pontos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, jogadores: [{ id: 'v1', nome: 'Payet', posicao: 'MEI', forca: 78 }, { id: 'v2', nome: 'Veitti', posicao: 'ATA', forca: 80 }] },
  { id: '5', nome: 'Palmeiras', pontos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, jogadores: [{ id: 'p1', nome: 'Veiga', posicao: 'MEI', forca: 83 }, { id: 'p2', nome: 'Gómez', posicao: 'DEF', forca: 81 }] },
  { id: '6', nome: 'São Paulo', pontos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, jogadores: [{ id: 's1', nome: 'Lucas Moura', posicao: 'MEI', forca: 82 }, { id: 's2', nome: 'Calleri', posicao: 'ATA', forca: 80 }] },
  { id: '7', nome: 'Corinthians', pontos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, jogadores: [{ id: 'c1', nome: 'Garro', posicao: 'MEI', forca: 80 }, { id: 'c2', nome: 'Depay', posicao: 'ATA', forca: 82 }] },
  { id: '8', nome: 'Santos', pontos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, jogadores: [{ id: 'san1', nome: 'Giuliano', posicao: 'MEI', forca: 75 }, { id: 'san2', nome: 'Furch', posicao: 'ATA', forca: 74 }] },
];

interface JogoStore {
  times: Time[];
  rodada: number;
  historicoRodadas: RodadaSimulada[];
  partidasEmAndamento: PartidaSimulada[];
  minutoAtual: number;
  estaSimulando: boolean;
  rodadaSendoSimulada: number;
  dispararSimulacao: () => void;
  resetarCampeonato: () => void;
}

let tictacInterval: ReturnType<typeof setInterval> | null = null;

export const useJogoStore = create<JogoStore>()(
  persist(
    (set, get) => ({
      times: TIMES_INICIAIS,
      rodada: 1,
      historicoRodadas: [],
      partidasEmAndamento: [],
      minutoAtual: 0,
      estaSimulando: false,
      rodadaSendoSimulada: 1,

      dispararSimulacao: () => {
        const { rodada, times, estaSimulando } = get();
        if (rodada > 7 || estaSimulando) return;

        if (tictacInterval) clearInterval(tictacInterval);

        const numTimes = times.length;
        const r = rodada - 1;
        const confrontos: [number, number][] = [];

        for (let i = 0; i < numTimes / 2; i++) {
          const casa = (r + i) % (numTimes - 1);
          let fora = (numTimes - 1 - i + r) % (numTimes - 1);
          if (i === 0) fora = numTimes - 1;
          confrontos.push([casa, fora]);
        }

        const resultados = confrontos.map(([idxCasa, idxFora]) => 
          simularPartida(times[idxCasa], times[idxFora], rodada)
        );

        set({
          partidasEmAndamento: resultados,
          minutoAtual: 1,
          estaSimulando: true,
          rodadaSendoSimulada: rodada
        });

        tictacInterval = setInterval(() => {
          const m = get().minutoAtual;
          
          if (m >= 90) {
            if (tictacInterval) clearInterval(tictacInterval);
            
            const estadoAtual = get();
            const jaExiste = estadoAtual.historicoRodadas.some(hr => hr.numeroRodada === estadoAtual.rodada);
            
            if (jaExiste) {
              set({ estaSimulando: false, minutoAtual: 0 });
              return;
            }

            const novosTimes = JSON.parse(JSON.stringify(estadoAtual.times)) as Time[];

            estadoAtual.partidasEmAndamento.forEach((res) => {
              const tCasa = novosTimes.find(t => t.nome === res.timeCasaNome)!;
              const tFora = novosTimes.find(t => t.nome === res.timeForaNome)!;

              tCasa.golsPro += res.golsCasa; tCasa.golsContra += res.golsFora;
              tFora.golsPro += res.golsFora; tFora.golsContra += res.golsCasa;

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
              numeroRodada: estadoAtual.rodada,
              partidas: estadoAtual.partidasEmAndamento
            };

            set({
              times: novosTimes,
              rodada: estadoAtual.rodada + 1,
              historicoRodadas: [novaRodadaRecord, ...estadoAtual.historicoRodadas],
              estaSimulando: false,
              minutoAtual: 0
            });
          } else {
            set({ minutoAtual: m + 1 });
          }
        }, 150);
      },

      resetarCampeonato: () => {
        if (tictacInterval) clearInterval(tictacInterval);
        set({ times: TIMES_INICIAIS, rodada: 1, historicoRodadas: [], partidasEmAndamento: [], minutoAtual: 0, estaSimulando: false });
      }
    }),
    { 
      name: 'brasfoot_analytics_save',
      partialize: (state) => ({
        times: state.times,
        rodada: state.rodada,
        historicoRodadas: state.historicoRodadas
      })
    }
  )
);
