const Config = require('./config');

class GameEngine {
  startGame(difficulty) {
    const dictionary = Config.getCurrentDictionaryAdapter();
    const word = dictionary.getRandomWord(difficulty);

    return {
      status: 'RUNNING',
      word: word,
      lives: 6,
      timer: 60,
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
    }

    if (!newGameState.display_word.includes('_')) {
      newGameState.status = 'WON';
      newGameState.message = 'Parabéns! Você ganhou.';
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
      }

      return newGameState;
    }

    return currentGameState;
  }

  version() {
    return '0.0.1-beta';
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
