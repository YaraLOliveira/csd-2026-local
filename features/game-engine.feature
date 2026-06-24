#language: pt

Funcionalidade: Motor do Jogo - Palpitar Letra
  Como um jogador
  Eu quero palpitar letras no jogo da forca
  Para que eu possa tentar descobrir a palavra secreta

  Contexto:
    Dado que a palavra secreta é "scrum"
    E que o jogo foi iniciado

  Cenário: Jogador faz um palpite errado
    Quando eu palpito a letra "z"
    Então meu número de vidas deve diminuir em 1
    E a letra "z" deve ser adicionada aos meus palpites
    # E eu devo ver uma mensagem dizendo que a letra não está na palavra
    Mas o status do jogo deve permanecer "RUNNING" se eu tiver vidas restantes

  Cenário: Jogador tenta palpitar múltiplas letras de uma vez
    Quando eu palpito a letra "ccc"
    Então apenas a primeira letra "c" deve ser processada
    E meu número de vidas deve permanecer o mesmo

  Cenário: O timer começa em 60 segundos
    Então o timer deve ser 60

  Cenário: Cada tick reduz o timer em 1 segundo
    Quando ocorre 1 tick
    Então o timer deve ser 59

  Cenário: O timer nunca fica abaixo de 0
    Quando ocorrem 61 ticks
    Então o timer deve ser 0

  Cenário: O jogo termina quando o tempo se esgota
    Quando ocorrem 60 ticks
    Então o timer deve ser 0
    E o status do jogo deve ser "LOST"
    E eu devo ver uma mensagem de tempo esgotado

  Cenário: O timer não corre depois do jogo terminar
    Quando eu palpito a letra "a"
    E eu palpito a letra "b"
    E eu palpito a letra "d"
    E eu palpito a letra "e"
    E eu palpito a letra "f"
    E eu palpito a letra "g"
    E ocorre 1 tick
    Então o status do jogo deve ser "LOST"
    E o timer deve ser 60
