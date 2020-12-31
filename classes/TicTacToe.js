class TicTacToe {
  constructor(id1, id2) {
    this.id1 = id1;
    this.id2 = id2;
    this.gameId = Math.random();
    this.turn = Math.floor(Math.random() * 2);
    this.game = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
  }
  includes(id) {
    return this.id1 === id || this.id2 === id;
  }
  yourTurn(id) {
    if (this.turn === 0 && id === this.id1) {
      return true;
    } else if (this.turn === 1 && id === this.id2) {
      return true;
    } else {
      return false;
    }
  }
  makeMove(index) {
    const [i, j] = [Math.floor(index / 3), index % 3];
    console.log(i, j);
    if (i < 0 || j < 0 || i > 2 || j > 2) return false;
    if (this.game[i][j] !== 0) return false;
    this.game[i][j] = this.turn === 0 ? 1 : 25;
    this.turn = (this.turn + 1) % 2;
    return true;
  }
  sumRow(row) {
    let sum = 0;
    for (let i = 0; i < 3; i++) sum += this.game[row][i];
    return sum;
  }
  sumCol(col) {
    let sum = 0;
    for (let i = 0; i < 3; i++) sum += this.game[i][col];
    return sum;
  }
  sumDia1() {
    let sum = 0;
    for (let i = 0; i < 3; i++) sum += this.game[i][i];
    return sum;
  }
  sumDia2() {
    let sum = 0;
    for (let i = 0, j = 2; i < 3; i++, j--) sum += this.game[i][j];
    return sum;
  }
  winner() {
    let scratch = true;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (this.game[i][j] === 0) {
          scratch = false;
          break;
        }
      }
    }
    for (let i = 0; i < 3; i++) {
      const row = this.sumRow(i);
      const col = this.sumCol(i);
      if (row === 3 || col === 3) return 1;
      else if (row === 75 || col === 75) return 2;
    }
    const dia1 = this.sumDia1();
    const dia2 = this.sumDia2();
    if (dia1 === 3 || dia2 === 3) return 1;
    else if (dia1 === 75 || dia2 === 75) return 2;

    if (scratch) return -1;

    return null;
  }
}

module.exports = TicTacToe;
