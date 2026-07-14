import { useJogoStore } from './store';

export default function App() {
  const { times, rodada, historico, jogarRodada, resetarCampeonato } = useJogoStore();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-6 flex flex-col font-sans selection:bg-green-500 selection:text-slate-950">
      <header className="max-w-5xl w-full mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-green-400 tracking-wider">⚽ BRASFOOT ANALYTICS</h1>
          <p className="text-sm text-slate-400">
            Fase do Torneio: {rodada > 7 ? (
              <span className="text-red-400 font-bold">Encerrado</span>
            ) : (
              <span>Rodada <span className="font-bold text-slate-200">{rodada} de 7</span></span>
            )}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={jogarRodada} 
            className="flex-1 sm:flex-initial bg-green-500 hover:bg-green-600 text-slate-950 font-black px-5 py-2.5 rounded-lg transition-colors cursor-pointer text-sm shadow-lg shadow-green-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={rodada > 7}
          >
            {rodada > 7 ? 'Campeonato Finalizado' : 'Simular Próxima Rodada'}
          </button>
          <button 
            onClick={resetarCampeonato} 
            className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 px-4 py-2.5 rounded-lg transition-colors cursor-pointer text-sm font-semibold"
          >
            Reiniciar Temporada
          </button>
        </div>
      </header>

      <main className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-start">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-200">Tabela de Classificação</h2>
            <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full font-mono border border-slate-700/50">RJ x SP</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800">
                  <th className="pb-3 font-semibold">Clube</th>
                  <th className="pb-3 text-center font-semibold w-12">P</th>
                  <th className="pb-3 text-center font-semibold w-12">V</th>
                  <th className="pb-3 text-center font-semibold w-12">E</th>
                  <th className="pb-3 text-center font-semibold w-12">D</th>
                  <th className="pb-3 text-center font-semibold w-12">SG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {times.map((time, index) => {
                  const saldoGols = time.golsPro - time.golsContra;
                  return (
                    <tr key={time.id} className="hover:bg-slate-900/60 group transition-colors">
                      <td className="py-3 font-semibold text-slate-200 flex items-center">
                        <span className="text-slate-600 font-mono text-xs w-6 group-hover:text-slate-400 transition-colors">
                          {index + 1}.
                        </span>
                        {time.nome}
                      </td>
                      <td className="py-3 text-center text-green-400 font-bold">{time.pontos}</td>
                      <td className="py-3 text-center text-slate-300 font-mono">{time.vitorias}</td>
                      <td className="py-3 text-center text-slate-300 font-mono">{time.empates}</td>
                      <td className="py-3 text-center text-slate-300 font-mono">{time.derrotas}</td>
                      <td className={`py-3 text-center font-mono font-semibold ${saldoGols > 0 ? 'text-blue-400' : saldoGols < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                        {saldoGols > 0 ? `+${saldoGols}` : saldoGols}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col h-[460px] shadow-2xl">
          <h2 className="text-lg font-bold mb-4 text-slate-200">Painel de Resultados</h2>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
            {historico.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-600 px-4 text-center">
                <span className="text-3xl mb-2">📊</span>
                <p className="italic text-sm">Nenhuma rodada simulada na temporada atual.</p>
              </div>
            ) : (
              historico.map((log, idx) => (
                <div 
                  key={idx} 
                  className="bg-slate-950 px-3 py-2.5 rounded-lg border border-slate-800/80 text-center font-mono text-xs text-slate-300 shadow-inner hover:border-slate-700 transition-colors"
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
