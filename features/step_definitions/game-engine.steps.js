const { Given, When, Then } = require("@cucumber/cucumber");
const assert = require("assert");
const GameEngine = require("@forca/engine");
const Config = require("@forca/engine/config");
const TestDictionaryAdapter = require("../../tests/helpers/test-dictionary");

let gameEngine;
let initialGameState;
let currentGameState;

Given("que a palavra secreta é {string}", function (palavra) {
  const testDictionary = new TestDictionaryAdapter(palavra);
  Config.setDictionaryAdapter(testDictionary);
});

Given("que o jogo foi iniciado", function () {
  gameEngine = GameEngine;
  initialGameState = gameEngine.startGame();
  currentGameState = { ...initialGameState };
});

When("eu palpito a letra {string}", function (letra) {
  // Pegar apenas a primeira letra se múltiplas forem fornecidas
  const singleLetter = letra.charAt(0);
  currentGameState = gameEngine.guessLetter(currentGameState, singleLetter);
});

Then('meu número de vidas deve permanecer o mesmo', function () {
  assert.strictEqual(currentGameState.lives, initialGameState.lives);
});

Then("meu número de vidas deve diminuir em {int}", function (livesDecrease) {
  assert.strictEqual(
    currentGameState.lives,
    initialGameState.lives - livesDecrease,
  );
});

Then(
  "a letra {string} deve ser adicionada aos meus palpites",
  function (letter) {
    const normalizedLetter = letter.toUpperCase();
    assert.ok(
      currentGameState.guesses.includes(normalizedLetter),
      `Esperava que a letra "${normalizedLetter}" estivesse em ${JSON.stringify(currentGameState.guesses)}`,
    );
  },
);

Then(
  "eu devo ver uma mensagem dizendo que a letra não está na palavra",
  function () {
    assert.match(currentGameState.message, /não está na palavra/);
  },
);

Then(
  "o status do jogo deve permanecer {string} se eu tiver vidas restantes",
  function (status) {
    if (currentGameState.lives > 0) {
      assert.strictEqual(currentGameState.status, status);
    }
  },
);

Then('as letras {string} devem ser adicionadas aos meus palpites', function (letras) {
  // "letras" é uma lista separada por vírgula, ex.: "a, b, c"
  const letrasEsperadas = letras.split(",").map((l) => l.trim().toUpperCase());
  letrasEsperadas.forEach((letra) => {
    assert.ok(
      currentGameState.guesses.includes(letra),
      `Esperava que a letra "${letra}" estivesse em ${JSON.stringify(currentGameState.guesses)}`,
    );
  });
});

Then('apenas a letra {string} deve ser adicionada aos meus palpites', function (letter) {
  const normalizedLetter = letter.toUpperCase();
  assert.strictEqual(
    currentGameState.guesses.length,
    1,
    `Esperava apenas 1 letra nos palpites, mas encontrei ${currentGameState.guesses.length}`,
  );
  assert.ok(
    currentGameState.guesses.includes(normalizedLetter),
    `Esperava que a letra "${normalizedLetter}" estivesse em ${JSON.stringify(currentGameState.guesses)}`,
  );
});

Then('apenas a primeira letra {string} deve ser processada', function (letter) {
  const normalizedLetter = letter.toUpperCase();
  assert.ok(
    currentGameState.guesses.includes(normalizedLetter),
    `Esperava que a letra "${normalizedLetter}" estivesse em ${JSON.stringify(currentGameState.guesses)}`,
  );
  // Verificar que não há múltiplas instâncias da mesma letra
  const countLetter = currentGameState.guesses.filter(g => g === normalizedLetter).length;
  assert.strictEqual(
    countLetter,
    1,
    `Esperava apenas 1 instância da letra "${normalizedLetter}", mas encontrei ${countLetter}`,
  );
});

// --- Timer ---

When('ocorre {int} tick', function (ticks) {
  for (let i = 0; i < ticks; i++) {
    currentGameState = gameEngine.handleEvent('tick', undefined, currentGameState);
  }
});

When('ocorrem {int} ticks', function (ticks) {
  for (let i = 0; i < ticks; i++) {
    currentGameState = gameEngine.handleEvent('tick', undefined, currentGameState);
  }
});

Then('o timer deve ser {int}', function (expectedTimer) {
  assert.strictEqual(currentGameState.timer, expectedTimer);
});

Then('o status do jogo deve ser {string}', function (status) {
  assert.strictEqual(currentGameState.status, status);
});

Then('eu devo ver uma mensagem de tempo esgotado', function () {
  assert.match(currentGameState.message, /[Tt]empo esgotado/);
});

// --- Pontuação ---

Then('a pontuação deve ser {int}', function (expectedScore) {
  assert.strictEqual(currentGameState.score, expectedScore);
});

Given('que o histórico de scores está vazio', function () {
  gameEngine.clearScores();
  assert.deepStrictEqual(gameEngine.getScores(), []);
});

When('o score da partida é armazenado', function () {
  gameEngine.saveScore(currentGameState.score);
});

Then('o histórico de scores deve conter {int}', function (expectedScore) {
  assert.ok(
    gameEngine.getScores().includes(expectedScore),
    `Esperava que o histórico ${JSON.stringify(gameEngine.getScores())} contivesse ${expectedScore}`,
  );
});

Given('que uma partida valendo {int} pontos foi armazenada', function (score) {
  gameEngine.saveScore(score);
});

Then('a pontuação acumulada deve ser {int}', function (expectedTotal) {
  assert.strictEqual(gameEngine.getTotalScore(), expectedTotal);
});
