const { getGameInfo } = require('./game-api');
const { createMatrix, renderGame } = require('./scoreboard-utils');

const wait = (t) => new Promise(ok => setTimeout(ok, t));

const nextGame = (gameNum, gamesLength) => {
  if (gameNum + 1 > gamesLength - 1) {
    return 0;
  } else {
    return gameNum + 1;
  }
}

const updateShownGames = (shownGames, gamesLength) => {
  const newShownGames = shownGames.map(gameNum => {
    return nextGame(gameNum, gamesLength);
  });

  return newShownGames;
}

const moveGames = async (gameData, shownGames, matrix) => {
  let movingPosition = 0;
  
  while(movingPosition > -17) {
    matrix.clear();
    let position = 0;
    shownGames.forEach(game => {
      renderGame(gameData.games[game], matrix, movingPosition + position);
      position = position + 16;
    });

    matrix.sync();
    movingPosition = movingPosition - 1;
    await wait(60);
  }
}

const gamesInit = (gameData, shownGames, matrix) => {
  let position = 0;

  shownGames.forEach(game => {
    renderGame(gameData.games[game], matrix, position);
    position = position + 16;
  });

  matrix.sync();
}

(async () => {
  try {
    const matrix = createMatrix();

    let gameData = await getGameInfo();
    // console.log(gameData.games);

    let shownGames = [0, 1];
    const gamesLength = gameData.games.length;

    gamesInit(gameData, shownGames, matrix);

    while (true) {
      await wait(8000);
      await moveGames(gameData, shownGames, matrix);
      shownGames = updateShownGames(shownGames, gamesLength);
      
      if (shownGames[1] === 0) {
        gameData = await getGameInfo();
      }
    }
  } catch (error) {
    console.log(error);
  }
})();
