const fs = require('fs');
const { getGameInfo } = require('./game-api');

const getAndWriteData = async () => {
  const gameData = await getGameInfo();
  
  const json = JSON.stringify(gameData);
  fs.writeFileSync('./data.json', json);
};

getAndWriteData();