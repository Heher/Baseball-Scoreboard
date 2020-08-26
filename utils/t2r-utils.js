const fetch = require('node-fetch');
const Color = require('color');
const { font, statusFont } = require('./matrix-utils');

const userColors = {
  Pyrorunner: {
    background: '136, 132, 216',
    color: '227, 227, 227'
  },
  nemothewhale: {
    background: '130, 202, 157',
    color: '227, 227, 227'
  },
  'A-a-Ron87': {
    background: '220, 20, 60',
    color: '227, 227, 227'
  },
  '+rainslu+ 6969': {
    background: '255, 105, 180',
    color: '227, 227, 227'
  },
  travisirby: {
    background: '218, 165, 32',
    color: '227, 227, 227'
  },
  Drvanderbiltwootwoot: {
    background: '30, 144, 255',
    color: '227, 227, 227'
  }
};

const getPlayers = async () => {
  try {
    const response = await fetch('http://192.168.1.118:4000/graphql', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query {
            players {
              username
              totalScore
            }
          }  
        `
      })
    });

    const json = await response.json();

    return json.data.players;
  } catch (error) {
    console.log('ERROR', error);
  }
};

const renderName = (player, matrix, verticalPosition) => {
  if (verticalPosition <= -16) {
    return;
  }

  // console.log(player.username);
  let username = player.username;

  if (username === 'Drvanderbiltwootwoot') {
    username = 'Drvanderbilt';
  }

  const backgroundColor = Color(`rgb(${userColors[player.username].background})`).rgbNumber();
  const textColor = Color(`rgb(${userColors[player.username].color})`).rgbNumber();

  const backgroundX = verticalPosition < 0 ? 0 : verticalPosition;

  matrix
    .fgColor(backgroundColor)
    .fill(0, backgroundX, matrix.width(), verticalPosition + 15);

  matrix
    .font(statusFont)
    .fgColor(0x111111)
    .drawText(username, 3, verticalPosition + 6);

    matrix
      .font(font)
      .drawText(player.totalScore.toString(), 74, verticalPosition + 4);
}

module.exports = { getPlayers, renderName };