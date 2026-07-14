import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Time, type RodadaSimulada, type PartidaSimulada, type Jogador } from './types';
import { simularPartida, obterTitulares } from './motorSimulacao';

const gerarElencoFicticio = (prefixoId: string, forcaMedia: number): Jogador[] => {
  const posicoes: ('GOL' | 'DEF' | 'MEI' | 'ATA')[] = [
    'GOL', 'GOL',
    'DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF',
    'MEI', 'MEI', 'MEI', 'MEI', 'MEI', 'MEI', 'MEI', 'MEI',
    'ATA', 'ATA', 'ATA', 'ATA', 'ATA', 'ATA'
  ];

  return posicoes.map((pos, index) => {
    const variacaoForca = Math.floor(Math.random() * 11) - 5; 
    const idade = Math.floor(Math.random() * 18) + 17;
    const forcaFinal = Math.clamp(forcaMedia + variacaoForca, 40, 99);
    
    const salario = Math.floor((forcaFinal * forcaFinal) * 35);

    return {
      id: `${prefixoId}-j${index}`,
      nome: `${pos} ${prefixoId.toUpperCase()} #${index + 1}`,
      posicao: pos,
      forca: forcaFinal,
      idade,
      energia: 100,
      salario
    };
  });
};

declare global {
  interface Math {
    clamp(value: number, min: number, max: number): number;
  }
}
Math.clamp = (value, min, max) => Math.max(min, Math.min(value, max));

const TIMES_INICIAIS: Time[] = [
  { id: '1', nome: 'Flamengo', pontos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, jogadores: gerarElencoFicticio('fla', 83) },
  { id: '2', nome: 'Fluminense', pontos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, jogadores: gerarElencoFicticio('flu', 78) },
  { id: '3', nome: 'Botafogo', pontos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, jogadores: gerarElencoFicticio('bot', 82) },
  { id: '4', nome: 'Vasco', pontos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, jogadores: gerarElencoFicticio('vas', 77) },
  { id: '5', nome: 'Palmeiras', pontos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, jogadores: gerarElencoFicticio('pal', 82) },
  { id: '6', nome: 'São Paulo', pontos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, jogadores: gerarElencoFicticio('sao', 79) },
  { id: '7', nome: 'Corinthians', pontos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, jogadores: gerarElencoFicticio('cor', 79) },
  { id: '8', nome: 'Santos', pontos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, jogadores: gerarElencoFicticio('san', 74) },
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

              const titularesCasaIds = obterTitulares(tCasa.jogadores).map(j => j.id);
              const titularesForaIds = obterTitulares(tFora.jogadores).map(j => j.id);

              tCasa.jogadores.forEach(j => {
                if (titularesCasaIds.includes(j.id)) {
                  j.energia = Math.max(10, j.energia - (Math.floor(Math.random() * 8) + 7));
                } else {
                  j.energia = Math.min(100, j.energia + 10);
                }
              });

              tFora.jogadores.forEach(j => {
                if (titularesForaIds.includes(j.id)) {
                  j.energia = Math.max(10, j.energia - (Math.floor(Math.random() * 8) + 7));
                } else {
                  j.energia = Math.min(100, j.energia + 10);
                }
              });

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