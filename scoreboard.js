const { getGameInfo } = require('./game-api');
const { createMatrix } = require('./utils/matrix-utils');
const { wait } = require('./utils/node-utils');
const { renderGame } = require('./utils/scoreboard-utils');

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
  
  while(movingPosition > -33) {
    matrix.clear();
    let position = 0;
    shownGames.forEach(game => {
      renderGame(gameData.games[game], matrix, movingPosition + position);
      position = position + 32;
    });

    matrix.sync();
    movingPosition = movingPosition - 1;
    await wait(30);
  }
}

const gamesInit = (gameData, shownGames, matrix) => {
  let position = 0;

  shownGames.forEach(game => {
    renderGame(gameData.games[game], matrix, position);
    position = position + 32;
  });

  matrix.sync();
}

const initAndStartBoard = async () => {
  try {
    const matrix = createMatrix();

    let gameData = await getGameInfo();
    
    gameData.games.forEach(game => {
      console.log(game.schedule);
    });

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

    // await wait(99999999);
  } catch (error) {
    console.log(error);
  }
};

initAndStartBoard();
