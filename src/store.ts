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
  timeUsuarioId: string | null;
  nomeTecnico: string;
  titularesManuaisIds: string[];
  
  carregarDadosIniciais: () => Promise<void>;
  escolherClube: (timeId: string, nome: string) => void;
  alternarEscalacao: (jogadorId: string) => void;
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
      timeUsuarioId: null,
      nomeTecnico: '',
      titularesManuaisIds: [],

      carregarDadosIniciais: async () => {
        if (get().times.length > 0) return;
        try {
          const resposta = await fetch('/dadosIniciais.json');
          const dados: Time[] = await resposta.json();
          set({ times: dados });
        } catch (erro) {
          console.error("Falha ao consumir o JSON:", erro);
        }
      },

      escolherClube: (timeId, nome) => {
        const estado = get();
        const meuTime = estado.times.find(t => t.id === timeId);

        const titularesIniciaisIds = meuTime ? obterTitulares(meuTime.jogadores).map(j => j.id) : [];

        set({
          timeUsuarioId: timeId,
          nomeTecnico: nome,
          titularesManuaisIds: titularesIniciaisIds,
          rodada: 1,
          historicoRodadas: [],
          partidasEmAndamento: [],
          minutoAtual: 0,
          estaSimulando: false
        });
      },

      alternarEscalacao: (jogadorId) => set((state) => {
        const jaEhTitular = state.titularesManuaisIds.includes(jogadorId);
        
        if (jaEhTitular) {
          return { titularesManuaisIds: state.titularesManuaisIds.filter(id => id !== jogadorId) };
        } else {
          if (state.titularesManuaisIds.length >= 11) {
            alert("Você já tem 11 titulares escalados! Tire alguém do time primeiro.");
            return {};
          }
          return { titularesManuaisIds: [...state.titularesManuaisIds, jogadorId] };
        }
      }),

      dispararSimulacao: () => {
        const { rodada, times, estaSimulando, timeUsuarioId, titularesManuaisIds } = get();
        if (rodada > 14 || estaSimulando || times.length === 0) return;

        if (titularesManuaisIds.length < 11) {
          alert(`Você precisa escalar exatamente 11 titulares antes de jogar! Atualmente tem ${titularesManuaisIds.length}. Vá na aba Elencos.`);
          return;
        }

        if (tictacInterval) clearInterval(tictacInterval);

        const timesComDescanso = JSON.parse(JSON.stringify(times)) as Time[];
        timesComDescanso.forEach((t) => {
          t.jogadores.forEach((j) => {
            j.energia = Math.min(100, j.energia + 15);
          });
        });

        const numTimes = timesComDescanso.length;
        const ehSegundoTurno = rodada > 7;
        const r = ehSegundoTurno ? (rodada - 8) : (rodada - 1);
        const confrontos: [number, number][] = [];

        for (let i = 0; i < numTimes / 2; i++) {
          const casaBase = (r + i) % (numTimes - 1);
          let foraBase = (numTimes - 1 - i + r) % (numTimes - 1);
          if (i === 0) foraBase = numTimes - 1;
          if (ehSegundoTurno) confrontos.push([foraBase, casaBase]);
          else confrontos.push([casaBase, foraBase]);
        }

        const resultados = confrontos.map(([idxCasa, idxFora]) => 
          simularPartida(timesComDescanso[idxCasa], timesComDescanso[idxFora], rodada)
        );

        set({
          times: timesComDescanso,
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

              const tCasaIds = tCasa.id === timeUsuarioId 
                ? estadoAtual.titularesManuaisIds 
                : obterTitulares(tCasa.jogadores).map(j => j.id);

              const tForaIds = tFora.id === timeUsuarioId 
                ? estadoAtual.titularesManuaisIds 
                : obterTitulares(tFora.jogadores).map(j => j.id);

              tCasa.jogadores.forEach(j => {
                if (tCasaIds.includes(j.id)) j.energia = Math.max(10, j.energia - (Math.floor(Math.random() * 8) + 7));
                else j.energia = Math.min(100, j.energia + 10);
              });

              tFora.jogadores.forEach(j => {
                if (tForaIds.includes(j.id)) j.energia = Math.max(10, j.energia - (Math.floor(Math.random() * 8) + 7));
                else j.energia = Math.min(100, j.energia + 10);
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
        set({ times: [], rodada: 1, historicoRodadas: [], partidasEmAndamento: [], minutoAtual: 0, estaSimulando: false, timeUsuarioId: null, nomeTecnico: '', titularesManuaisIds: [] });
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
        historicoRodadas: state.historicoRodadas,
        timeUsuarioId: state.timeUsuarioId,
        nomeTecnico: state.nomeTecnico,
        titularesManuaisIds: state.titularesManuaisIds
      })
    }
  )
);