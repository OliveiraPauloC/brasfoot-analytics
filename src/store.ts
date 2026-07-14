import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Time, type RodadaSimulada, type PartidaSimulada } from './types';
import { simularPartida, obterTitulares } from './motorSimulacao';

interface JogoStore {
  times: Time[];
  rodada: number;
  historicoRodadas: RodadaSimulada[];
  partidasEmAndamento: PartidaSimulada[];
  minutoAtual: number;
  estaSimulando: boolean;
  rodadaSendoSimulada: number;
  carregarDadosIniciais: () => Promise<void>;
  dispararSimulacao: () => void;
  resetarCampeonato: () => void;
}

let tictacInterval: ReturnType<typeof setInterval> | null = null;

export const useJogoStore = create<JogoStore>()(
  persist(
    (set, get) => ({
      times: [],
      rodada: 1,
      historicoRodadas: [],
      partidasEmAndamento: [],
      minutoAtual: 0,
      estaSimulando: false,
      rodadaSendoSimulada: 1,

      carregarDadosIniciais: async () => {
        if (get().times.length > 0) return;
        try {
          const resposta = await fetch('/dadosIniciais.json');
          const dados: Time[] = await resposta.json();
          set({ times: dados });
        } catch (erro) {
          console.error("Falha ao consumir o JSON de elencos reais:", erro);
        }
      },

      dispararSimulacao: () => {
        const { rodada, times, estaSimulando } = get();

        if (rodada > 14 || estaSimulando || times.length === 0) return;

        if (tictacInterval) clearInterval(tictacInterval);

        const numTimes = times.length;
        
        const ehSegundoTurno = rodada > 7;
        const r = ehSegundoTurno ? (rodada - 8) : (rodada - 1);

        const confrontos: [number, number][] = [];

        for (let i = 0; i < numTimes / 2; i++) {
          const casaBase = (r + i) % (numTimes - 1);
          let foraBase = (numTimes - 1 - i + r) % (numTimes - 1);
          if (i === 0) foraBase = numTimes - 1;

          if (ehSegundoTurno) {
            confrontos.push([foraBase, casaBase]);
          } else {
            confrontos.push([casaBase, foraBase]);
          }
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

      resetarCampeonato: async () => {
        if (tictacInterval) clearInterval(tictacInterval);
        set({ times: [], rodada: 1, historicoRodadas: [], partidasEmAndamento: [], minutoAtual: 0, estaSimulando: false });
        try {
          const resposta = await fetch('/dadosIniciais.json');
          const dados = await resposta.json();
          set({ times: dados });
        } catch (erro) {
          console.error(erro);
        }
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