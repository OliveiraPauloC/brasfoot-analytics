import { useEffect } from 'react';
import { useJogoStore } from './store';

export default function App() {
  const { 
    times, 
    rodada, 
    historicoRodadas, 
    partidasEmAndamento, 
    minutoAtual, 
    estaSimulando, 
    rodadaSendoSimulada,
    carregarDadosIniciais, 
    dispararSimulacao, 
    resetarCampeonato 
  } = useJogoStore();

  useEffect(() => {
    carregarDadosIniciais();
  }, [carregarDadosIniciais]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-6 flex flex-col font-sans">
      <header className="max-w-5xl w-full mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-green-400 tracking-wider">⚽ BRASFOOT ANALYTICS</h1>
          <p className="text-sm text-slate-400">Rodada atual: <span className="font-bold text-slate-200">{rodada} de 7</span></p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={dispararSimulacao} 
            disabled={rodada > 7 || estaSimulando}
            className="flex-1 sm:flex-initial bg-green-500 hover:bg-green-600 text-slate-950 font-black px-5 py-2.5 rounded-lg transition-colors cursor-pointer text-sm disabled:opacity-30 shadow-lg"
          >
            {estaSimulando ? `Simulando... (${minutoAtual}')` : 'Simular Rodada'}
          </button>
          <button 
            onClick={resetarCampeonato} 
            disabled={estaSimulando} 
            className="bg-slate-900 border border-slate-800 text-slate-300 px-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-30"
          >
            Resetar
          </button>
        </div>
      </header>

      {estaSimulando && (
        <div className="max-w-5xl w-full mx-auto bg-slate-900 border border-green-500/40 rounded-xl p-5 mb-6 shadow-2xl animate-pulse">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-green-400">⚽ Partidas em Andamento - Rodada {rodadaSendoSimulada}</h3>
            <span className="font-mono text-xl font-black bg-slate-950 px-3 py-1 rounded border border-slate-800 text-green-400">
              {minutoAtual >= 90 ? 'Fim de Jogo' : `${minutoAtual}'`}
            </span>
          </div>
          
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mb-6 border border-slate-800">
            <div className="bg-green-500 h-full transition-all duration-75" style={{ width: `${(minutoAtual / 90) * 100}%` }}></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {partidasEmAndamento.map((p) => {
              const golsAteAgoraCasa = p.golsDetalhes.filter(g => g.minuto <= minutoAtual && g.timeNome === p.timeCasaNome);
              const golsAteAgoraFora = p.golsDetalhes.filter(g => g.minuto <= minutoAtual && g.timeNome === p.timeForaNome);
              const todosGolsVisiveis = p.golsDetalhes.filter(g => g.minuto <= minutoAtual);

              return (
                <div key={p.id} className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-200">{p.timeCasaNome}</span>
                    <span className="bg-slate-900 px-4 py-1 rounded font-mono text-base border border-slate-800 text-slate-100">
                      {golsAteAgoraCasa.length} - {golsAteAgoraFora.length}
                    </span>
                    <span className="text-slate-200">{p.timeForaNome}</span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
                    {todosGolsVisiveis.map((gol, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium animate-bounce">
                        ⚽ {gol.autor} ({gol.minuto}')
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <main className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-start">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <h2 className="text-lg font-bold mb-4 text-slate-200">Tabela de Classificação</h2>
           <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800 text-xs uppercase tracking-wider font-mono">
                  <th className="pb-3 font-semibold text-left">Clube</th>
                  <th className="pb-3 text-center font-bold w-10 text-green-400">P</th>
                  <th className="pb-3 text-center font-semibold w-10">J</th>
                  <th className="pb-3 text-center font-semibold w-10">V</th>
                  <th className="pb-3 text-center font-semibold w-10">E</th>
                  <th className="pb-3 text-center font-semibold w-10">D</th>
                  <th className="pb-3 text-center font-semibold w-10">GP</th>
                  <th className="pb-3 text-center font-semibold w-10">GC</th>
                  <th className="pb-3 text-center font-semibold w-10">SG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 font-mono text-xs">
                {times.map((time, idx) => {
                  const jogos = time.vitorias + time.empates + time.derrotas;
                  const saldoGols = time.golsPro - time.golsContra;
                  
                  return (
                    <tr key={time.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 font-sans font-semibold text-slate-200 text-sm">
                        <span className="text-slate-600 mr-2 font-mono text-xs">{idx + 1}.</span>
                        {time.nome}
                      </td>
                      <td className="py-3 text-center text-green-400 font-bold text-sm">{time.pontos}</td>
                      <td className="py-3 text-center text-slate-300">{jogos}</td>
                      <td className="py-3 text-center text-slate-300">{time.vitorias}</td>
                      <td className="py-3 text-center text-slate-400">{time.empates}</td>
                      <td className="py-3 text-center text-slate-400">{time.derrotas}</td>
                      <td className="py-3 text-center text-slate-450">{time.golsPro}</td>
                      <td className="py-3 text-center text-slate-450">{time.golsContra}</td>
                      <td className={`py-3 text-center font-semibold ${saldoGols > 0 ? 'text-blue-400' : saldoGols < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                        {saldoGols > 0 ? `+${saldoGols}` : saldoGols}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col h-[400px]">
          <h2 className="text-lg font-bold mb-4 text-slate-200">Histórico de Placares</h2>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
            {historicoRodadas.map((r, idx) => (
              <div key={idx} className="border border-slate-800 p-2.5 rounded-lg bg-slate-950/60">
                <h4 className="font-bold text-green-400 mb-1.5 uppercase text-[10px]">Rodada {r.numeroRodada}</h4>
                <div className="space-y-1 font-mono text-slate-400">
                  {r.partidas.map((p, i) => (
                    <div key={i} className="flex justify-between border-b border-slate-900 pb-0.5">
                      <span>{p.timeCasaNome} {p.golsCasa} x {p.golsFora} {p.timeForaNome}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}