const { LayoutUtils } = require('rpi-led-matrix');
const Color = require('color');
const { DateTime } = require('luxon');
const { font, statusFont } = require('./matrix-utils');

const teamColors = require('../teamColors.json');

const getBackgroundColor = team => {
  return Color(teamColors[team.toLowerCase()].home).rgbNumber();
}

const findTeamTextColor = (team) => {
  if (teamColors[team.toLowerCase()].text) {
    return Color(teamColors[team.toLowerCase()].text).rgbNumber();
  }
  return 0xF5F5F5;
}

const showStartTime = (time, matrix, verticalPosition) => {
  matrix.fgColor(0xF5F5F5);
  
  const timeString = DateTime.fromISO(time).toLocaleString(DateTime.TIME_SIMPLE);

  const lines = LayoutUtils.textToLines(font, 60, timeString);

  LayoutUtils.linesToMappedGlyphs(lines, font.height(), 142, matrix.height(), 'center', 'middle')
    .forEach(glyph => {
      matrix.drawText(glyph.char, glyph.x + 50, verticalPosition + glyph.y);
    });
}

const completedStatus = (matrix, verticalPosition) => {
  matrix.fgColor(0xF5F5F5);

  const lines = LayoutUtils.textToLines(font, 46, 'F');

  LayoutUtils.linesToMappedGlyphs(lines, font.height(), 46, matrix.height(), 'center', 'middle')
    .forEach(glyph => {
      matrix.drawText(glyph.char, glyph.x + 100, verticalPosition + glyph.y);
    });
}

const inningArrow = (inningHalf, matrix, verticalPosition) => {
  matrix
  .fgColor(0xF5F5F5)
  .drawLine(164, verticalPosition + 16, 166, verticalPosition + 16);

  if (inningHalf === 'TOP') {
    matrix
    .fgColor(0xF5F5F5)
    .setPixel(165, verticalPosition + 15);
  } else {
    matrix
    .fgColor(0xF5F5F5)
    .setPixel(165, verticalPosition + 17);
  }
};

const createBase = (color, x, y, distance, matrix, verticalPosition) => {
  matrix
    .fgColor(color)
    .drawLine(x, verticalPosition + y, x + distance, verticalPosition + y - distance)
    .drawLine(x + distance, verticalPosition + y - distance, x + (distance * 2), verticalPosition + y)
    .drawLine(x + (distance * 2), verticalPosition + y, x + distance, verticalPosition + y + distance)
    .drawLine(x + distance, verticalPosition + y + distance, x, verticalPosition + y);
};

const ifAboveMatrix = (height, verticalPosition) => {
  if (verticalPosition + height >= 0) {
    return verticalPosition + height;
  }
  return 0;
};

const newCreateBase = (color, x, y, distance, matrix, verticalPosition) => {
  for (let i = 0; i < distance; i++) {
    createBase(color, x + i, y, distance - i, matrix, verticalPosition);
  }

  matrix.setPixel(x + distance, y + verticalPosition);
}

const renderBases = (playStatus, basesColor, matrix, verticalPosition) => {
  // First base
  const firstBaseColor = playStatus.firstBaseRunner ? basesColor : 0x333333;
  newCreateBase(firstBaseColor, 134, 20, 5, matrix, verticalPosition);

  // Second base
  const secondBaseColor = playStatus.secondBaseRunner ? basesColor : 0x333333;
  newCreateBase(secondBaseColor, 127, 13, 5, matrix, verticalPosition);

  // Third base
  const thirdBaseColor = playStatus.thirdBaseRunner ? basesColor : 0x333333;
  newCreateBase(thirdBaseColor, 120, 20, 5, matrix, verticalPosition);
};

const renderOuts = (playStatus, matrix, verticalPosition) => {
  const oneOutColor = playStatus.outCount > 0 ? 0xFFD500 : 0x333333;
  const twoOutColor = playStatus.outCount > 1 ? 0xFFD500 : 0x333333;
  const threeOutColor = playStatus.outCount > 2 ? 0xFFD500 : 0x333333;

  matrix
    .fgColor(0xF5F5F5)
    .font(statusFont)
    .drawText('O', 80, verticalPosition + 22);

  matrix
    .fgColor(oneOutColor)
    .fill(86, ifAboveMatrix(22, verticalPosition), 90, ifAboveMatrix(26, verticalPosition));

  matrix
    .fgColor(twoOutColor)
    .fill(93, ifAboveMatrix(22, verticalPosition), 97, ifAboveMatrix(26, verticalPosition));

  matrix
    .fgColor(threeOutColor)
    .fill(100, ifAboveMatrix(22, verticalPosition), 104, ifAboveMatrix(26, verticalPosition));
};

const renderBalls = (playStatus, matrix, verticalPosition) => {
  const oneBallsColor = playStatus.ballCount > 0 ? 0xFFD500 : 0x333333;
  const twoBallsColor = playStatus.ballCount > 1 ? 0xFFD500 : 0x333333;
  const threeBallsColor = playStatus.ballCount > 2 ? 0xFFD500 : 0x333333;
  const fourBallsColor = playStatus.ballCount > 3 ? 0xFFD500 : 0x333333;

  matrix
    .fgColor(0xF5F5F5)
    .font(statusFont)
    .drawText('B', 80, verticalPosition + 6);

  matrix
    .fgColor(oneBallsColor)
    .fill(86, ifAboveMatrix(6, verticalPosition), 90, ifAboveMatrix(10, verticalPosition));

  matrix
    .fgColor(twoBallsColor)
    .fill(93, ifAboveMatrix(6, verticalPosition), 97, ifAboveMatrix(10, verticalPosition));

  matrix
    .fgColor(threeBallsColor)
    .fill(100, ifAboveMatrix(6, verticalPosition), 104, ifAboveMatrix(10, verticalPosition));

  matrix
    .fgColor(fourBallsColor)
    .fill(107, ifAboveMatrix(6, verticalPosition), 111, ifAboveMatrix(10, verticalPosition));
};

const renderStrikes = (playStatus, matrix, verticalPosition) => {
  const oneStrikeColor = playStatus.strikeCount > 0 ? 0xFFD500 : 0x333333;
  const twoStrikeColor = playStatus.strikeCount > 1 ? 0xFFD500 : 0x333333;
  const threeStrikeColor = playStatus.strikeCount > 2 ? 0xFFD500 : 0x333333;

  matrix
    .fgColor(0xF5F5F5)
    .font(statusFont)
    .drawText('S', 80, verticalPosition + 14);

  matrix
    .fgColor(oneStrikeColor)
    .fill(86, ifAboveMatrix(14, verticalPosition), 90, ifAboveMatrix(18, verticalPosition));

  matrix
    .fgColor(twoStrikeColor)
    .fill(93, ifAboveMatrix(14, verticalPosition), 97, ifAboveMatrix(18, verticalPosition));

  matrix
    .fgColor(threeStrikeColor)
    .fill(100, ifAboveMatrix(14, verticalPosition), 104, ifAboveMatrix(18, verticalPosition));
};

const liveGameStatus = (game, matrix, verticalPosition, backgrounds) => {
  // console.log(game.score.playStatus);
  const basesColor = game.score.currentInningHalf === 'TOP' ? backgrounds.awayBackground : backgrounds.homeBackground;

  matrix
    .fgColor(0xF5F5F5)
    .font(font)
    .drawText(game.score.currentInning ? game.score.currentInning.toString() : '1', 156, verticalPosition + 10);

  inningArrow(game.score.currentInningHalf, matrix, verticalPosition);

  // console.log(game);

  renderBalls(game.score.playStatus, matrix, verticalPosition);

  renderStrikes(game.score.playStatus, matrix, verticalPosition);

  renderBases(game.score.playStatus, basesColor, matrix, verticalPosition);

  renderOuts(game.score.playStatus, matrix, verticalPosition);

  matrix.font(font); //Resets font
}

const postponedGame = (time, matrix, verticalPosition) => {
  const isoTime = DateTime.fromISO(time);

  matrix.fgColor(0xF5F5F5);

  if (DateTime.local().hasSame(isoTime, 'day')) {
    const timeStringLines = LayoutUtils.textToLines(font, 60, isoTime.toLocaleString(DateTime.TIME_SIMPLE));

    LayoutUtils.linesToMappedGlyphs(timeStringLines, font.height(), 142, matrix.height(), 'center', 'middle')
    .forEach(glyph => {
      matrix.drawText(glyph.char, glyph.x + 50, verticalPosition + glyph.y);
    });
  } else {
    const dateStringLines = LayoutUtils.textToLines(font, 60, isoTime.toLocaleString({ month: 'numeric', day: 'numeric' }));
    const timeStringLines = LayoutUtils.textToLines(font, 60, isoTime.toLocaleString({ hour: 'numeric', minute: 'numeric' }));

    LayoutUtils.linesToMappedGlyphs(dateStringLines, font.height(), 142, matrix.height(), 'center', 'middle')
    .forEach(glyph => {
      matrix.drawText(glyph.char, glyph.x + 50, verticalPosition + glyph.y - 6);
    });

    LayoutUtils.linesToMappedGlyphs(timeStringLines, font.height(), 142, matrix.height(), 'center', 'middle')
    .forEach(glyph => {
      matrix.drawText(glyph.char, glyph.x + 50, verticalPosition + glyph.y + 6);
    });
  }
  
  matrix.font(font); //Resets font
}

const gameStatus = (game, matrix, verticalPosition, backgrounds) => {
  if (game.schedule.scheduleStatus === 'POSTPONED') {
    if (game.schedule.playedStatus === 'LIVE') {
      liveGameStatus(game, matrix, verticalPosition, backgrounds);
    } else if (game.schedule.playedStatus === 'COMPLETED' || game.schedule.playedStatus === 'COMPLETED_PENDING_REVIEW') {
      completedStatus(matrix, verticalPosition);
    } else {
      postponedGame(game.schedule.startTime, matrix, verticalPosition);
    }
    return;
  }

  switch (game.schedule.playedStatus) {
    case 'LIVE':
      liveGameStatus(game, matrix, verticalPosition, backgrounds);
      break;
    case 'UNPLAYED':
      showStartTime(game.schedule.startTime, matrix, verticalPosition);
      break;
    case 'COMPLETED':
      completedStatus(matrix, verticalPosition);
      break;
    case 'COMPLETED_PENDING_REVIEW':
      completedStatus(matrix, verticalPosition);
      break;
    default:
      return '';
  }
}

const renderGame = (game, matrix, verticalPosition) => {
  if (verticalPosition <= -32) {
    return;
  }

  // console.log(game);

  // console.log(gameStatus(game));

  const awayTeam = game.schedule.awayTeam.abbreviation;
  const awayScore = game.score.awayScoreTotal !== null ? game.score.awayScoreTotal.toString() : '-';
  const homeTeam = game.schedule.homeTeam.abbreviation;
  const homeScore = game.score.homeScoreTotal !== null ? game.score.homeScoreTotal.toString() : '-';

  const awayBackground = getBackgroundColor(awayTeam);
  const homeBackground = getBackgroundColor(homeTeam);

  const awayText = findTeamTextColor(awayTeam);
  const homeText = findTeamTextColor(homeTeam);

  const backgrounds = { awayBackground, homeBackground };

  const backgroundYAway = verticalPosition < 0 ? 0 : verticalPosition;
  const backgroundYHome = verticalPosition < -15 ? 0 : verticalPosition + 16;

  if (verticalPosition > -15) {
    matrix
      .fgColor(awayBackground)
      .fill(0, backgroundYAway, 50, verticalPosition + 15);
  }

  matrix
    .fgColor(homeBackground)
    .fill(0, backgroundYHome, 50, verticalPosition + 31);

  const awayLines = LayoutUtils.textToLines(font, 25, awayTeam);
  const awayScoreLines = LayoutUtils.textToLines(font, 25, awayScore);
  const homeLines = LayoutUtils.textToLines(font, 25, homeTeam);
  const homeScoreLines = LayoutUtils.textToLines(font, 25, homeScore);

  matrix.fgColor(awayText);

  LayoutUtils.linesToMappedGlyphs(awayLines, font.height(), 30, 15, 'left', 'middle')
    .forEach(glyph => {
      matrix.drawText(glyph.char, glyph.x + 6, verticalPosition + glyph.y);
    });

  LayoutUtils.linesToMappedGlyphs(awayScoreLines, font.height(), 15, 15, 'center', 'middle')
    .forEach(glyph => {
      matrix.drawText(glyph.char, glyph.x + 35, verticalPosition + glyph.y);
    });

  matrix.fgColor(homeText);

  LayoutUtils.linesToMappedGlyphs(homeLines, font.height(), 30, 15, 'left', 'middle')
    .forEach(glyph => {
      matrix.drawText(glyph.char, glyph.x + 6, verticalPosition + glyph.y + 16);
    });

  LayoutUtils.linesToMappedGlyphs(homeScoreLines, font.height(), 15, 15, 'center', 'middle')
    .forEach(glyph => {
      matrix.drawText(glyph.char, glyph.x + 35, verticalPosition + glyph.y + 16);
    });

  gameStatus(game, matrix, verticalPosition, backgrounds);
}

module.exports = { renderGame };