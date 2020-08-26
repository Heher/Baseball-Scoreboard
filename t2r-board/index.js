const { createMatrix } = require('../utils/matrix-utils');
const { getPlayers, renderName } = require('../utils/t2r-utils');
const { wait } = require('../utils/node-utils');

const nextPlayer = (gameNum, gamesLength) => {
  if (gameNum + 1 > gamesLength - 1) {
    return 0;
  } else {
    return gameNum + 1;
  }
}

const updateShownPlayers = (shownPlayers, playersLength) => {
  const newShownPlayers = shownPlayers.map(playerNum => {
    return nextPlayer(playerNum, playersLength);
  });

  return newShownPlayers;
}

const movePlayers = async (players, shownPlayers, matrix) => {
  let movingPosition = 0;
  
  while(movingPosition > -17) {
    matrix.clear();
    let position = 0;
    shownPlayers.forEach(player => {
      renderName(players[player], matrix, movingPosition + position);
      position = position + 16;
    });

    matrix.sync();
    movingPosition = movingPosition - 1;
    await wait(60);
  }
}

const playersInit = (players, shownPlayers, matrix) => {
  let position = 0;

  shownPlayers.forEach(player => {
    renderName(players[player], matrix, position);
    position = position + 16;
  });

  matrix.sync();
}

(async () => {
  try {
    const matrix = createMatrix();

    let players = await getPlayers();
    console.log(players);

    let shownPlayers = [0, 1];
    const playersLength = players.length;

    matrix.clear();

    // matrix.font(statusFont);

    playersInit(players, shownPlayers, matrix);

    // await wait(999999);

    // let shownGames = [0, 1];
    // const gamesLength = gameData.games.length;

    // gamesInit(gameData, shownGames, matrix);

    while (true) {
      await wait(2000);
      await movePlayers(players, shownPlayers, matrix);
      shownPlayers = updateShownPlayers(shownPlayers, playersLength);
      
    //   if (shownGames[1] === 0) {
    //     gameData = await getGameInfo();
    //   }
    }
  } catch (error) {
    console.log(error);
  }
})();