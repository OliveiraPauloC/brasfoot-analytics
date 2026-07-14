# ⚽ Brasfoot Analytics

Um simulador tático e analítico de campeonatos de futebol inspirado no clássico jogo de gerenciamento esportivo *Brasfoot*. Desenvolvido com uma arquitetura moderna **Offline-First**, o ecossistema processa em lote dados densos de múltiplos elencos reais e simula partidas minuto a minuto em tempo real de forma totalmente isolada das renderizações do frontend.

---

## 🚀 Desafios Técnicos & Engenharia de Software

Este repositório foi construído aplicando práticas avançadas de desenvolvimento para o ecossistema **React 19** e **TypeScript Estrito**, superando desafios complexos de sincronismo e performance:

### 🧠 1. Desacoplamento do Motor de Tempo (Zustand & Loops Assíncronos)
* **O Desafio:** Controlar um cronômetro minuto a minuto de 0' a 90' para múltiplos jogos simultâneos sem causar vazamentos de memória (*Memory Leaks*) ou renderizações em cascata infinitas (*Cascading Renders*).
* **A Solução:** Centralização total do ciclo de vida do `setInterval` dentro de uma instância isolada em JavaScript puro na Store do **Zustand**. A interface atua estritamente como um espelho de estado, eliminando hooks `useEffect` redundantes no frontend e mantendo o linter corporativo zerado de avisos.

### 📋 2. Prancheta Tática Gamificada com Drag & Drop Nativo
* **O Desafio:** Criar uma experiência de usuário (UX) intuitiva para alteração de escalações de titulares e reservas antes das partidas, garantindo travas táticas estritas em tempo real.
* **A Solução:** Implementação da **HTML5 Drag and Drop Web API** nativa do navegador para arrastar atletas para dentro e fora de um mini campo customizado em Tailwind CSS. O motor aplica validações matemáticas e bloqueia inconsistências operacionais (ex: barrar a escalação de mais de 1 goleiro ou mais de 10 jogadores de linha).

### 🛡️ 3. Idempotência de Estado contra o React.StrictMode
* **O Desafio:** No ambiente de desenvolvimento local, o Modo Estrito do React força execuções duplas de efeitos. Isso causava a duplicação e injeção indesejada de rodadas idênticas no histórico persistido.
* **A Solução:** Implementação de travas de **idempotência** baseadas no ID da rodada. Se a Store detectar uma tentativa de re-execução para uma rodada já computada no histórico, ela aborta o segundo disparo de forma atômica.

### 📊 4. Motor de Probabilidade por Setores & Calibragem Estatística
* **O Desafio:** Fugir de sorteios puramente lineares e aleatórios que geravam goleadas absurdas ou placares irreais na simulação.
* **A Solução:** Construção de um motor estatístico estruturado em 6 janelas de eventos cruciais por partida. O volume de criação avalia a *Técnica* contra o *Físico* dos setores de meio de campo, enquanto a chance de gol confronta a *Finalização* do ataque contra a *Defesa* e *Reflexo* do goleiro adversário. Autores de gols são definidos por um algoritmo de **Roleta Ponderada (Weighted Random Choice)** com peso reduzido para zagueiros.

---

## 🛠️ Tecnologias Utilizadas

* **React 19** (Filosofia de renderização limpa e assíncrona)
* **TypeScript** (Tipagem estrita de dados e contratos de interfaces)
* **Zustand** + Middleware **Persist** (Gerenciamento de estado robusto e persistência em `localStorage`)
* **Tailwind CSS** (Interface corporativa responsiva e estilização de alta fidelidade)
* **Vite** (Ambiente de build rápido e otimizado)

---

## 📋 Atributos e Regras de Negócio Integradas

* **Fadiga & Fisiologia:** Titulares em campo sofrem desgaste de energia dinâmico pós-jogo, enquanto atletas no banco recuperam fôlego. No início de cada rodada, todos os 176 atletas da liga recebem um bônus de recuperação semanal limitados ao teto de 100%.
* **Gerenciamento de Elenco:** Jogadores com energia abaixo de 70% são poupados automaticamente pela Inteligência Artificial. Para o time do usuário, os atletas mantêm a vaga pela *Força Nominal* soberana até que o técnico decida barrá-los na prancheta.
* **Dados Reais Expandidos:** O motor consome um arquivo JSON estático (`dadosIniciais.json`) populado com atletas reais (Idade, Salário, Técnica, Físico, Finalização, Defesa e Reflexos).
* **Análise Multidimencional:** Abas integradas exibem a tabela completa do torneio (P, J, V, E, D, GP, GC, SG), histórico cronológico de placares e ranking de artilharia agregada e ordenada secundariamente por ordem alfabética de clubes.

---

## ⚙️ Como Executar o Projeto Localmente

```bash
# 1. Clone o repositório
git clone https://github.com/OliveiraPauloC/brasfoot-analytics.git

# 2. Acesse a pasta do projeto
cd brasfoot-analytics

# 3. Instale as dependências
npm install

# 4. Inicie o servidor de desenvolvimento local
npm run dev

# 5. Valide a integridade dos tipos e regras do linter
npx tsc
```

---

## 📦 Versionamento Semântico

* **v0.1 (Atual):** MVP Estável com calendário de turno/returno (14 rodadas), prancheta tática gamificada em Drag & Drop, controle físico de fadiga/fisiologia e aba de artilharia combinada.

---
Desenvolvido por **Paulo Oliveira** 🚀
