#language: pt

Funcionalidade: Motor do Jogo - Pontuação
  Como um jogador
  Eu quero ganhar pontos com base no tempo que levo para vencer
  Para que partidas mais rápidas valham mais

  Contexto:
    Dado que a palavra secreta é "CASA"
    E que o jogo foi iniciado

  Cenário: A pontuação começa em 0
    Então a pontuação deve ser 0

  Cenário: Vencer rápido e sem erros dá a pontuação máxima
    Quando eu palpito a letra "c"
    E eu palpito a letra "a"
    E eu palpito a letra "s"
    Então o status do jogo deve ser "WON"
    E a pontuação deve ser 360

  Cenário: A pontuação é o tempo restante vezes as vidas restantes
    Quando ocorrem 10 ticks
    E eu palpito a letra "c"
    E eu palpito a letra "a"
    E eu palpito a letra "s"
    Então o status do jogo deve ser "WON"
    E a pontuação deve ser 300

  Cenário: Errar reduz a pontuação pelas vidas perdidas
    Quando eu palpito a letra "z"
    E eu palpito a letra "x"
    E eu palpito a letra "c"
    E eu palpito a letra "a"
    E eu palpito a letra "s"
    Então o status do jogo deve ser "WON"
    E a pontuação deve ser 240

  Cenário: Perder por falta de vidas zera a pontuação
    Quando eu palpito a letra "z"
    E eu palpito a letra "x"
    E eu palpito a letra "w"
    E eu palpito a letra "v"
    E eu palpito a letra "q"
    E eu palpito a letra "k"
    Então o status do jogo deve ser "LOST"
    E a pontuação deve ser 0

  Cenário: Perder por tempo esgotado zera a pontuação
    Quando ocorrem 60 ticks
    Então o status do jogo deve ser "LOST"
    E a pontuação deve ser 0

  Cenário: O score é armazenado em memória ao fim da partida
    Dado que o histórico de scores está vazio
    Quando eu palpito a letra "c"
    E eu palpito a letra "a"
    E eu palpito a letra "s"
    E o score da partida é armazenado
    Então o histórico de scores deve conter 360

  Cenário: A pontuação acumulada soma as partidas
    Dado que o histórico de scores está vazio
    E que uma partida valendo 360 pontos foi armazenada
    E que uma partida valendo 240 pontos foi armazenada
    Então a pontuação acumulada deve ser 600
