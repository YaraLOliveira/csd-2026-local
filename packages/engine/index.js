const Config = require('./config');

const TOTAL_TIME = 60;

class GameEngine {
  constructor() {
    // Armazenamento em memória dos scores das partidas (nada complexo, some ao reiniciar o processo).
    this._scoreHistory = [];
  }

  startGame(difficulty) {
    const dictionary = Config.getCurrentDictionaryAdapter();
    const word = dictionary.getRandomWord(difficulty);

    return {
      status: 'RUNNING',
      word: word,
      lives: 6,
      timer: TOTAL_TIME,
      score: 0,
      display_word: this._getInitialDisplayWord(word),
      guesses: [],
      message: 'Adivinhe uma letra',
    };
  }

  guessLetter(currentGameState, letter) {
    const normalizedLetter = letter.toUpperCase();
    const normalizedWord = currentGameState.word.toUpperCase();

    if (currentGameState.guesses.includes(normalizedLetter)) {
      return {
        ...currentGameState,
        message: `Você já chutou a letra ${normalizedLetter}.`,
      };
    }

    const guesses = [...currentGameState.guesses, normalizedLetter];
    const isCorrect = normalizedWord.includes(normalizedLetter);
    let lives = isCorrect ? currentGameState.lives : currentGameState.lives - 1;

    if (lives < 0) lives = 0;

    const newGameState = {
      ...currentGameState,
      guesses,
      lives,
      message: isCorrect
        ? `Boa! A letra ${letter} está na palavra.`
        : `A letra ${letter} não está na palavra.`,
    };

    newGameState.display_word = this._getDisplayWord(newGameState);

    if (newGameState.lives === 0 && newGameState.display_word.includes('_')) {
      newGameState.status = 'LOST';
      newGameState.message = 'Você perdeu. Tente novamente.';
      newGameState.score = 0;
    }

    if (!newGameState.display_word.includes('_')) {
      newGameState.status = 'WON';
      newGameState.score = this._calculateScore(newGameState);
      newGameState.message = `Parabéns! Você ganhou. Pontuação: ${newGameState.score}`;
    }

    return newGameState;
  }

  handleEvent(event, data, currentGameState) {
    if (event === 'tick' && currentGameState.status === 'RUNNING') {
      let newTimer = currentGameState.timer - 1;
      
      if (newTimer < 0) {
        newTimer = 0;
      }

      const newGameState = {
        ...currentGameState,
        timer: newTimer,
      };

      // Game over if timer reaches 0
      if (newTimer === 0) {
        newGameState.status = 'LOST';
        newGameState.message = 'Tempo esgotado! Você perdeu.';
        newGameState.score = 0;
      }

      return newGameState;
    }

    return currentGameState;
  }

  // Armazenamento em memória dos scores.
  saveScore(score) {
    this._scoreHistory.push(score);
    return this._scoreHistory.length;
  }

  getScores() {
    return [...this._scoreHistory];
  }

  // Pontuação acumulada: soma de todas as partidas armazenadas.
  getTotalScore() {
    return this._scoreHistory.reduce((total, score) => total + score, 0);
  }

  clearScores() {
    this._scoreHistory = [];
  }

  version() {
    return '0.0.1-beta';
  }

  // Pontuação de uma partida: Tempo restante x Vidas restantes.
  // Quanto mais rápido (mais tempo no relógio) e com menos erros (mais vidas), maior o ponto.
  _calculateScore(gameState) {
    return gameState.timer * gameState.lives;
  }

  _getInitialDisplayWord(word) {
    return word
      .split('')
      .map(() => '_')
      .join(' ');
  }

  _getDisplayWord(gameState) {
    return gameState.word
      .split('')
      .map((letter) => (gameState.guesses.includes(letter) ? letter : '_'))
      .join(' ');
  }
}

module.exports = new GameEngine();
