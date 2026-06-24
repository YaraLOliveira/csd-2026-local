const gameEngine = require('@forca/engine');
const Config = require('@forca/engine/config');
const TestDictionary = require('./helpers/test-dictionary');

/**
 * Basic tests for GameEngine interface
 */

describe('GameEngine Interface', () => {
  beforeAll(() => {
    const testDictionary = new TestDictionary('CASA');
    Config.setDictionaryAdapter(testDictionary);
  });

  describe('startGame()', () => {
    it('should return a valid GameState object', () => {
      const gameState = gameEngine.startGame();

      expect(gameState).toHaveProperty('status');
      expect(gameState).toHaveProperty('word');
      expect(gameState).toHaveProperty('lives');
      expect(gameState).toHaveProperty('display_word');
      expect(gameState).toHaveProperty('guesses');
      expect(gameState).toHaveProperty('message');
      expect(Array.isArray(gameState.guesses)).toBe(true);
    });

  });

  describe('guessLetter()', () => {
    it('should accept gameState and letter parameters', () => {
      const initialState = gameEngine.startGame();
      const updatedState = gameEngine.guessLetter(initialState, 'A');

      expect(updatedState).toHaveProperty('status');
      expect(updatedState).toHaveProperty('guesses');
    });

    it('should decrease lives by 1 when the letter is wrong', () => {
      // A palavra de teste é "CASA", então "Z" é um palpite errado
      const initialState = gameEngine.startGame();
      const updatedState = gameEngine.guessLetter(initialState, 'Z');

      expect(updatedState.lives).toBe(initialState.lives - 1);
    });

    it('should add the guessed letter to guesses', () => {
      const initialState = gameEngine.startGame();
      const updatedState = gameEngine.guessLetter(initialState, 'Z');

      expect(updatedState.guesses).toContain('Z');
    });

    it('should ignore case when comparing guesses', () => {
      const initialState = gameEngine.startGame();
      const updatedState = gameEngine.guessLetter(initialState, 'a');

      expect(updatedState.lives).toBe(initialState.lives);
      expect(updatedState.guesses).toContain('A');
      expect(updatedState.display_word).toBe('_ A _ A');
    });

    it('should not reduce lives for repeated guess of same letter in a different case', () => {
      const initialState = gameEngine.startGame();
      let gameState = gameEngine.guessLetter(initialState, 'a');
      gameState = gameEngine.guessLetter(gameState, 'A');

      expect(gameState.lives).toBe(initialState.lives);
      expect(gameState.guesses.filter((letter) => letter === 'A').length).toBe(1);
      expect(gameState.message).toContain('já chutou');
    });
  });

  describe('Game Over - Losing', () => {
    it('should not allow lives to go below 0', () => {
      const initialState = gameEngine.startGame();
      
      let gameState = initialState;
      gameState = gameEngine.guessLetter(gameState, 'Z'); // 5 lives
      gameState = gameEngine.guessLetter(gameState, 'X'); // 4 lives
      gameState = gameEngine.guessLetter(gameState, 'Q'); // 3 lives
      gameState = gameEngine.guessLetter(gameState, 'K'); // 2 lives
      gameState = gameEngine.guessLetter(gameState, 'J'); // 1 life
      gameState = gameEngine.guessLetter(gameState, 'W'); // 0 lives
      gameState = gameEngine.guessLetter(gameState, 'V'); // should stay at 0, but goes to -1 due to bug
      gameState = gameEngine.guessLetter(gameState, 'U'); // -2
      gameState = gameEngine.guessLetter(gameState, 'T'); // -3
      gameState = gameEngine.guessLetter(gameState, 'R'); // -4

      expect(gameState.lives).toBeGreaterThanOrEqual(0);
      expect(gameState.lives).toBe(0);
      expect(gameState.message).toBeDefined();
      expect(typeof gameState.message).toBe('string');
    });

    it('should update status and display_word when user loses', () => {
      const initialState = gameEngine.startGame();
      
      let gameState = initialState;
      for (let i = 0; i < 10; i++) {
        gameState = gameEngine.guessLetter(gameState, String.fromCharCode(90 - i));
      }

      expect(gameState.lives).toBeGreaterThanOrEqual(0);
      expect(gameState.lives).toBe(0);
      expect(gameState.status).toBe('LOST');
    });
  });

  describe('Winning', () => {
    it('should set status to WON when the user guesses the full word', () => {
      const initialState = gameEngine.startGame();

      let gameState = initialState;
      gameState = gameEngine.guessLetter(gameState, 'C');
      gameState = gameEngine.guessLetter(gameState, 'A');
      gameState = gameEngine.guessLetter(gameState, 'S');

      expect(gameState.display_word).toBe('C A S A');
      expect(gameState.status).toBe('WON');
      expect(gameState.message).toBe('Parabéns! Você ganhou.');
    });
  });

  describe('Timer', () => {
    it('should initialize with a default timer value', () => {
      const initialState = gameEngine.startGame();

      expect(initialState).toHaveProperty('timer');
      expect(initialState.timer).toBe(60);
    });

    it('should decrement timer by 1 on tick event', () => {
      const initialState = gameEngine.startGame();

      const stateAfterTick = gameEngine.handleEvent('tick', undefined, initialState);

      expect(stateAfterTick.timer).toBe(59);
    });

    it('should not go below 0', () => {
      const initialState = gameEngine.startGame();
      let state = initialState;

      // Tick 60 times to reach 0
      for (let i = 0; i < 60; i++) {
        state = gameEngine.handleEvent('tick', undefined, state);
      }

      expect(state.timer).toBe(0);

      // Try to tick again
      const stateBelowZero = gameEngine.handleEvent('tick', undefined, state);
      expect(stateBelowZero.timer).toBe(0);
    });

    it('should set status to LOST when timer reaches 0', () => {
      const initialState = gameEngine.startGame();
      let state = initialState;

      // Tick 60 times to reach 0
      for (let i = 0; i < 60; i++) {
        state = gameEngine.handleEvent('tick', undefined, state);
      }

      expect(state.status).toBe('LOST');
      expect(state.message).toContain('Tempo esgotado');
    });

    it('should not process tick event if game status is not RUNNING', () => {
      const initialState = gameEngine.startGame();
      let gameState = initialState;

      // Finish the game by winning
      gameState = gameEngine.guessLetter(gameState, 'C');
      gameState = gameEngine.guessLetter(gameState, 'A');
      gameState = gameEngine.guessLetter(gameState, 'S');

      expect(gameState.status).toBe('WON');

      // Timer should not change after game ends
      const stateAfterTick = gameEngine.handleEvent('tick', undefined, gameState);
      expect(stateAfterTick.timer).toBe(gameState.timer);
    });
  });

  describe('version()', () => {
    it('should return a version string', () => {
      const version = gameEngine.version();
      expect(typeof version).toBe('string');
      expect(version.length).toBeGreaterThan(0);
    });
  });
});
