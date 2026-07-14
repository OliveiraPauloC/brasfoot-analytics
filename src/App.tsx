import { useState, useEffect } from 'react';
import { useJogoStore } from './store';
import { calcularForcaJogador, obterTitulares } from './motorSimulacao';

export default function App() {
  const { 
    times, 
    rodada, 
    historicoRodadas, 
    partidasEmAndamento, 
    minutoAtual, 
    estaSimulando, 
    rodadaSendoSimulada, 
    timeUsuarioId,
    nomeTecnico,
    titularesManuaisIds,
    carregarDadosIniciais, 
    escolherClube,
    alternarEscalacao,
    dispararSimulacao, 
    resetarCampeonato 
  } = useJogoStore();

  const [abaAtiva, setAbaAtiva] = useState<'classificacao' | 'artilharia' | 'elenco'>('classificacao');
  const [clubeClicadoId, setClubeClicadoId] = useState<string | null>(null);

  const [inputNome, setInputNome] = useState<string>('');
  const [timeSorteadoId, setTimeSorteadoId] = useState<string>('1');

  useEffect(() => {
    carregarDadosIniciais();
  }, [carregarDadosIniciais]);


  const iniciarCarreira = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputNome.trim()) {
      alert("Por favor, digite seu nome de treinador.");
      return;
    }
    escolherClube(timeSorteadoId, inputNome);
  };

  if (!timeUsuarioId) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <div className="text-center mb-6">
            <span className="text-4xl">🏆</span>
            <h1 className="text-2xl font-black text-green-400 mt-2 tracking-wider">NOVA CARREIRA</h1>
            <p className="text-xs text-slate-500 mt-1">Configure seu perfil de treinador offline</p>
          </div>

          <form onSubmit={iniciarCarreira} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-mono">Nome do Técnico</label>
              <input 
                type="text" 
                maxLength={25}
                placeholder="Ex: Prof. Luxemburgo"
                value={inputNome}
                onChange={(e) => setInputNome(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-green-500 text-sm rounded-lg px-3 py-2.5 outline-none font-medium transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-mono">Escolha seu Clube</label>
              <select 
                value={timeSorteadoId}
                onChange={(e) => setTimeSorteadoId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-green-500 text-sm rounded-lg px-3 py-2.5 outline-none font-bold text-slate-200 cursor-pointer transition-colors"
              >
                {[...times].sort((a,b) => a.nome.localeCompare(b.nome)).map(t => (
                  <option key={t.id} value={t.id}>{t.nome}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-slate-950 font-black py-3 rounded-lg transition-colors cursor-pointer text-sm shadow-lg shadow-green-500/10 mt-2">
              ASSINAR CONTRATO 📝
            </button>
          </form>
        </div>
      </div>
    );
  }
  const obterArtilharia = () => {
    const contagemGols: { [nomeJogador: string]: { gols: number; time: string } } = {};
    historicoRodadas.forEach((r) => {
      r.partidas.forEach((p) => {
        p.golsDetalhes.forEach((g) => {
          if (contagemGols[g.autor]) contagemGols[g.autor].gols += 1;
          else contagemGols[g.autor] = { gols: 1, time: g.timeNome };
        });
      });
    });
    return Object.entries(contagemGols)
      .map(([nome, dados]) => ({ nome, ...dados }))
      .sort((a, b) => b.gols - a.gols || a.time.localeCompare(b.time));
  };

  const listaArtilheiros = obterArtilharia();

  const idAtivoEfetivo = clubeClicadoId || timeUsuarioId || '1';
  const timeVisualizado = times.find(t => t.id === idAtivoEfetivo) || undefined;
  const meuClubeNome = times.find(t => t.id === timeUsuarioId)?.nome || '';
  const ehTimeDoUsuarioVisualizado = timeVisualizado?.id === timeUsuarioId;

  const titulares = timeVisualizado 
    ? (ehTimeDoUsuarioVisualizado && titularesManuaisIds.length > 0
        ? timeVisualizado.jogadores.filter(j => titularesManuaisIds.includes(j.id))
        : obterTitulares(timeVisualizado.jogadores))
    : [];

  const titularesIdsExibicao = titulares.map(t => t.id);
  const reservas = timeVisualizado ? timeVisualizado.jogadores.filter(j => !titularesIdsExibicao.includes(j.id)) : [];

  const handleDragStart = (e: React.DragEvent, jogadorId: string) => {
    if (estaSimulando) return;
    e.dataTransfer.setData('text/plain', jogadorId);
  };

  const handleDropNoCampo = (e: React.DragEvent) => {
    e.preventDefault();
    const jogadorId = e.dataTransfer.getData('text/plain');

    if (!titularesManuaisIds.includes(jogadorId)) {
      alternarEscalacao(jogadorId);
    }
  };

  const handleDropNoBanco = (e: React.DragEvent) => {
    e.preventDefault();
    const jogadorId = e.dataTransfer.getData('text/plain');

    if (titularesManuaisIds.includes(jogadorId)) {
      alternarEscalacao(jogadorId);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-6 flex flex-col font-sans selection:bg-green-500 selection:text-slate-950">
      <header className="max-w-5xl w-full mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-green-400 tracking-wider">⚽ BRASFOOT ANALYTICS</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Treinador: <span className="text-slate-200 font-bold">{nomeTecnico}</span> no <span className="text-green-400 font-bold">{meuClubeNome}</span>
            <span className="text-slate-600 mx-2">|</span>
            {rodada > 14 ? <span className="text-red-400 font-bold">Temporada Encerrada</span> : <span>Rodada <span className="font-bold text-slate-200">{rodada} de 14</span></span>}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={dispararSimulacao} disabled={rodada > 14 || estaSimulando || times.length === 0} className="flex-1 sm:flex-initial bg-green-500 hover:bg-green-600 text-slate-950 font-black px-5 py-2.5 rounded-lg transition-colors cursor-pointer text-sm disabled:opacity-30 shadow-lg">
            {estaSimulando ? `Simulando... (${minutoAtual}')` : 'Simular Rodada'}
          </button>
          <button onClick={resetarCampeonato} disabled={estaSimulando} className="bg-slate-900 border border-slate-800 text-slate-300 px-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-30 cursor-pointer hover:bg-slate-800 transition-colors">
            Demissão / Reset 🚪
          </button>
        </div>
      </header>

      {estaSimulando && (
        <div className="max-w-5xl w-full mx-auto bg-slate-900 border border-green-500/40 rounded-xl p-5 mb-6 shadow-2xl animate-pulse">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-green-400">⚽ Partidas em Andamento - Rodada {rodadaSendoSimulada}</h3>
            <span className="font-mono text-xl font-black bg-slate-950 px-3 py-1 rounded border border-slate-800 text-green-400">{minutoAtual >= 90 ? 'Fim de Jogo' : `${minutoAtual}'`}</span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mb-6 border border-slate-800">
            <div className="bg-green-500 h-full transition-all duration-75" style={{ width: `${(minutoAtual / 90) * 100}%` }}></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {partidasEmAndamento.map((p) => {
              const golsCasa = p.golsDetalhes.filter(g => g.minuto <= minutoAtual && g.timeNome === p.timeCasaNome);
              const golsFora = p.golsDetalhes.filter(g => g.minuto <= minutoAtual && g.timeNome === p.timeForaNome);
              const todosGolsVisiveis = p.golsDetalhes.filter(g => g.minuto <= minutoAtual);
              const ehJogoDoUsuario = p.timeCasaNome === meuClubeNome || p.timeForaNome === meuClubeNome;

              return (
                <div key={p.id} className={`bg-slate-950 p-4 rounded-lg flex flex-col justify-between shadow-inner border ${ehJogoDoUsuario ? 'border-green-500/40 bg-green-500/[0.02]' : 'border-slate-800'}`}>
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className={`w-28 text-left truncate ${p.timeCasaNome === meuClubeNome ? 'text-green-400 font-black' : 'text-slate-200'}`}>{p.timeCasaNome}</span>
                    <span className="bg-slate-900 px-4 py-1 rounded font-mono text-base border border-slate-800 text-slate-100 min-w-16 text-center">{golsCasa.length} - {golsFora.length}</span>
                    <span className={`w-28 text-right truncate ${p.timeForaNome === meuClubeNome ? 'text-green-400 font-black' : 'text-slate-200'}`}>{p.timeForaNome}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5 justify-center min-h-6">
                    {todosGolsVisiveis.map((gol, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium animate-bounce">⚽ {gol.autor} ({gol.minuto}')</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <main className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-start">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl flex flex-col min-h-[460px]">
          
          <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4 flex-wrap gap-3">
            <div className="flex gap-4">
              <button onClick={() => setAbaAtiva('classificacao')} className={`text-sm font-bold pb-1 transition-colors cursor-pointer ${abaAtiva === 'classificacao' ? 'text-green-400 border-b-2 border-green-400' : 'text-slate-500 hover:text-slate-300'}`}>Classificação</button>
              <button onClick={() => setAbaAtiva('artilharia')} className={`text-sm font-bold pb-1 transition-colors cursor-pointer ${abaAtiva === 'artilharia' ? 'text-green-400 border-b-2 border-green-400' : 'text-slate-500 hover:text-slate-300'}`}>Artilharia</button>
              <button onClick={() => setAbaAtiva('elenco')} className={`text-sm font-bold pb-1 transition-colors cursor-pointer ${abaAtiva === 'elenco' ? 'text-green-400 border-b-2 border-green-400' : 'text-slate-500 hover:text-slate-300'}`}>Elencos</button>
            </div>

            {abaAtiva === 'elenco' && times.length > 0 && (
              <select value={idAtivoEfetivo} onChange={(e) => setClubeClicadoId(e.target.value)} className="bg-slate-950 border border-slate-800 text-slate-300 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:border-green-400 cursor-pointer transition-colors">
                {[...times].sort((a, b) => a.nome.localeCompare(b.nome)).map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </select>
            )}
          </div>

          {abaAtiva === 'classificacao' && (
            <div className="overflow-x-auto">
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
                  {[...times].sort((a,b) => b.pontos - a.pontos || (b.golsPro-b.golsContra) - (a.golsPro-a.golsContra) || b.golsPro - a.golsPro).map((time, idx) => {
                    const jogos = time.vitorias + time.empates + time.derrotas;
                    const saldoGols = time.golsPro - time.golsContra;
                    const ehMeuClube = time.id === timeUsuarioId;

                    return (
                      <tr key={time.id} className={`transition-colors ${ehMeuClube ? 'bg-green-500/10 font-bold hover:bg-green-500/15' : 'hover:bg-slate-900/40'}`}>
                        <td className="py-3 font-sans text-sm flex items-center gap-1">
                          <span className="text-slate-600 mr-1 font-mono text-xs w-5">{idx + 1}.</span>
                          <span className={ehMeuClube ? 'text-green-400 font-black' : 'text-slate-200'}>{time.nome}</span>
                          {ehMeuClube && <span className="bg-green-500 text-slate-950 font-sans font-black text-[9px] px-1 rounded ml-1 scale-90 uppercase">Você</span>}
                        </td>
                        <td className="py-3 text-center text-green-400 font-bold text-sm">{time.pontos}</td>
                        <td className="py-3 text-center text-slate-300">{jogos}</td>
                        <td className="py-3 text-center text-slate-300">{time.vitorias}</td>
                        <td className="py-3 text-center text-slate-400">{time.empates}</td>
                        <td className="py-3 text-center text-slate-400">{time.derrotas}</td>
                        <td className="py-3 text-center text-slate-400">{time.golsPro}</td>
                        <td className="py-3 text-center text-slate-400">{time.golsContra}</td>
                        <td className={`py-3 text-center font-semibold ${saldoGols > 0 ? 'text-blue-400' : saldoGols < 0 ? 'text-red-400' : 'text-slate-400'}`}>{saldoGols > 0 ? `+${saldoGols}` : saldoGols}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {abaAtiva === 'artilharia' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800 text-xs uppercase tracking-wider font-mono">
                    <th className="pb-3 font-semibold text-left">Jogador</th>
                    <th className="pb-3 text-left font-semibold">Clube</th>
                    <th className="pb-3 text-center font-bold w-16 text-green-400">Gols</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-xs">
                  {listaArtilheiros.length === 0 ? (
                    <tr><td colSpan={3} className="py-8 text-center text-slate-600 italic">Nenhum gol marcado ainda.</td></tr>
                  ) : (
                    listaArtilheiros.map((artilheiro, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3 font-sans font-semibold text-slate-200 text-sm"><span className="text-slate-600 mr-2 font-mono text-xs">{idx + 1}.</span>{artilheiro.nome}</td>
                        <td className="py-3 text-slate-400 font-sans font-medium">{artilheiro.time}</td>
                        <td className="py-3 text-center text-green-400 font-mono font-bold text-sm">{artilheiro.gols}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {abaAtiva === 'elenco' && timeVisualizado && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-2 items-start">
              
              <div className="md:col-span-3 flex flex-col">
                {!ehTimeDoUsuarioVisualizado ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-green-400 mb-3 font-mono">Prováveis Titulares (IA)</h4>
                    <div className="space-y-1.5 font-sans text-xs">
                      {titulares.map(j => (
                        <div key={j.id} className="flex justify-between bg-slate-950 p-2 rounded border border-slate-800/60">
                          <span className="font-semibold text-slate-300">{j.nome}</span>
                          <span className="text-green-400 font-bold font-mono bg-slate-900 px-1 rounded">{j.posicao}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-2 px-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-green-400 font-mono">📋 Mini Campo Tático ({titulares.length}/11)</h4>
                      <p className="text-[10px] text-slate-500 italic">Arraste os jogadores para escalar ou barrar</p>
                    </div>
                    
                    <div 
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDropNoCampo}
                      className="w-full aspect-[3/4] bg-emerald-800 border-4 border-slate-100/20 rounded-2xl relative shadow-2xl overflow-hidden flex flex-col justify-between p-4 selection:bg-transparent"
                      style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                        backgroundSize: '10% 10%'
                      }}
                    >
                      <div className="absolute top-0 left-1/4 w-2/4 h-1/6 border-b-2 border-x-2 border-slate-100/10 rounded-b-xl"></div>
                      <div className="absolute bottom-0 left-1/4 w-2/4 h-1/6 border-t-2 border-x-2 border-slate-100/10 rounded-t-xl"></div>
                      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100/10"></div>
                      <div className="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-slate-100/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>

                      <div className="flex justify-center gap-12 z-10 mt-4">
                        {titulares.filter(j => j.posicao === 'ATA').map(j => (
                          <div key={j.id} draggable onDragStart={(e) => handleDragStart(e, j.id)} className="flex flex-col items-center cursor-grab active:cursor-grabbing group animate-fade-in">
                            <div className="w-10 h-10 rounded-full bg-red-600 border-2 border-slate-100 flex items-center justify-center font-black text-xs shadow-lg group-hover:scale-110 transition-transform">🏃‍♂️</div>
                            <span className="text-[10px] font-bold bg-slate-950/80 px-1.5 py-0.5 rounded mt-1 border border-slate-800 truncate max-w-[80px]">{j.nome.split(' ')[0]}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-center gap-6 z-10 my-auto flex-wrap px-4">
                        {titulares.filter(j => j.posicao === 'MEI').map(j => (
                          <div key={j.id} draggable onDragStart={(e) => handleDragStart(e, j.id)} className="flex flex-col items-center cursor-grab active:cursor-grabbing group animate-fade-in">
                            <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-slate-100 flex items-center justify-center font-black text-xs shadow-lg group-hover:scale-110 transition-transform">🧠</div>
                            <span className="text-[10px] font-bold bg-slate-950/80 px-1.5 py-0.5 rounded mt-1 border border-slate-800 truncate max-w-[80px]">{j.nome.split(' ')[0]}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-center gap-6 z-10 mb-2 flex-wrap px-4">
                        {titulares.filter(j => j.posicao === 'DEF').map(j => (
                          <div key={j.id} draggable onDragStart={(e) => handleDragStart(e, j.id)} className="flex flex-col items-center cursor-grab active:cursor-grabbing group animate-fade-in">
                            <div className="w-10 h-10 rounded-full bg-amber-600 border-2 border-slate-100 flex items-center justify-center font-black text-xs shadow-lg group-hover:scale-110 transition-transform">🛡️</div>
                            <span className="text-[10px] font-bold bg-slate-950/80 px-1.5 py-0.5 rounded mt-1 border border-slate-800 truncate max-w-[80px]">{j.nome.split(' ')[0]}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-center z-10 mb-2">
                        {titulares.filter(j => j.posicao === 'GOL').map(j => (
                          <div key={j.id} draggable onDragStart={(e) => handleDragStart(e, j.id)} className="flex flex-col items-center cursor-grab active:cursor-grabbing group animate-fade-in">
                            <div className="w-10 h-10 rounded-full bg-yellow-500 border-2 border-slate-100 flex items-center justify-center font-black text-xs shadow-lg group-hover:scale-110 transition-transform">🧤</div>
                            <span className="text-[10px] font-bold bg-slate-950/80 px-1.5 py-0.5 rounded mt-1 border border-slate-800 truncate max-w-[80px]">{j.nome.split(' ')[0]}</span>
                          </div>
                        ))}
                      </div>

                    </div>
                  </div>
                )}
              </div>

              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropNoBanco}
                className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col h-full min-h-[400px]"
              >
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 font-mono">🎒 Banco de Reservas ({reservas.length})</h4>
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[480px]">
                  {reservas.map((j) => (
                    <div 
                      key={j.id} 
                      draggable={ehTimeDoUsuarioVisualizado && !estaSimulando}
                      onDragStart={(e) => handleDragStart(e, j.id)}
                      className={`p-2 rounded border text-xs flex justify-between items-center transition-all bg-slate-950 shadow-inner ${ehTimeDoUsuarioVisualizado ? 'cursor-grab active:cursor-grabbing border-slate-800/80 hover:border-slate-700' : 'border-slate-900'}`}
                    >
                      <div className="flex flex-col truncate max-w-[110px]">
                        <span className="font-semibold text-slate-200 truncate">{j.nome}</span>
                        <span className="text-[9px] text-slate-500 font-mono">FOR: {Math.floor(calcularForcaJogador(j))} | ENE: {j.energia}%</span>
                      </div>
                      <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-[10px] text-slate-400 font-bold font-mono">{j.posicao}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col h-[460px] shadow-xl w-full">
          <h2 className="text-lg font-bold mb-4 text-slate-200">Histórico de Placares</h2>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs scrollbar-thin">
            {historicoRodadas.map((r, idx) => (
              <div key={idx} className="border border-slate-800 p-2.5 rounded-lg bg-slate-950/60 shadow-sm">
                <h4 className="font-bold text-green-400 mb-1.5 uppercase text-[10px] tracking-wider font-mono">Rodada {r.numeroRodada}</h4>
                <div className="space-y-1 font-mono text-slate-400">
                  {r.partidas.map((p, i) => (
                    <div key={i} className="flex justify-between border-b border-slate-900/60 pb-0.5">
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
