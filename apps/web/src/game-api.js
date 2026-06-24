// game-api.js — adaptador client-side da engine.
//
// Expõe a MESMA superfície que os antigos endpoints HTTP (/api/start, /api/guess,
// /api/event, /api/version), mas chamando a engine diretamente no navegador.
// É o mesmo contrato da TUI e do antigo servidor Express — só muda o adapter.
import engine from '@forca/engine';

export function startGame(difficulty) {
  return difficulty ? engine.startGame(difficulty) : engine.startGame();
}

export function guessLetter(gameState, letter) {
  return engine.guessLetter(gameState, letter);
}

export function handleEvent(event, data, gameState) {
  return engine.handleEvent(event, data, gameState);
}

export function version() {
  return engine.version();
}

export function saveScore(score) {
  return engine.saveScore(score);
}

export function getScores() {
  return engine.getScores();
}

export function getTotalScore() {
  return engine.getTotalScore();
}
