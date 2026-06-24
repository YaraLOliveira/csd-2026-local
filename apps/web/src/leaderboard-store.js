// leaderboard-store.js — placar persistido em localStorage (sem servidor).
// Substitui o antigo leaderboard.json gravado pelo Express.
const STORAGE_KEY = 'forca:leaderboard';

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function getLeaderboard() {
  // Pontuação acumulada por jogador: soma todas as partidas do mesmo nome.
  const totals = {};
  for (const entry of readAll()) {
    totals[entry.playerName] = (totals[entry.playerName] || 0) + entry.score;
  }

  return Object.entries(totals)
    .map(([playerName, score]) => ({ playerName, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

export function saveScore(playerName, score) {
  const list = readAll();
  list.push({ playerName, score, timestamp: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
