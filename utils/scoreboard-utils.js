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
  const timeString = DateTime.fromISO(time).toLocaleString(DateTime.TIME_SIMPLE);

  matrix
    .font(statusFont)
    .fgColor(0xF5F5F5)
    .drawText(timeString, 35, verticalPosition + 5);
  
  matrix.font(font); //Resets font
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
  .drawLine(105, verticalPosition + 4, 107, verticalPosition + 4);

  if (inningHalf === 'TOP') {
    matrix
    .fgColor(0xF5F5F5)
    .setPixel(106, verticalPosition + 3);
  } else {
    matrix
    .fgColor(0xF5F5F5)
    .setPixel(106, verticalPosition + 5);
  }
}

const createBase = (color, x, y, distance, matrix, verticalPosition) => {
  matrix
    .fgColor(color)
    .drawLine(x, verticalPosition + y, x + distance, verticalPosition + y - distance)
    .drawLine(x + distance, verticalPosition + y - distance, x + (distance * 2), verticalPosition + y)
    .drawLine(x + (distance * 2), verticalPosition + y, x + distance, verticalPosition + y + distance)
    .drawLine(x + distance, verticalPosition + y + distance, x, verticalPosition + y);
}

const loadBase = (x, y, matrix, verticalPosition) => {
  createBase(0xFFD500, x, y, 4, matrix, verticalPosition);
  createBase(0xFFD500, x + 1, y, 3, matrix, verticalPosition);
  createBase(0xFFD500, x + 2, y, 2, matrix, verticalPosition);
  createBase(0xFFD500, x + 3, y, 1, matrix, verticalPosition);
  matrix
    .fgColor(0xFFD500)
    .setPixel(x + 4, y + verticalPosition);
}

const ifAboveMatrix = (height, verticalPosition) => {
  if (verticalPosition + height >= 0) {
    return verticalPosition + height;
  }
  return 0;
}

const renderBases = (playStatus, matrix, verticalPosition) => {
  // First base
  createBase(0xF5F5F5, 134, 20, 5, matrix, verticalPosition);
  if (playStatus.firstBaseRunner) {
    loadBase(135, 20, matrix, verticalPosition);
  }

  // Second base
  createBase(0xF5F5F5, 127, 13, 5, matrix, verticalPosition);
  if (playStatus.secondBaseRunner) {
    loadBase(128, 13, matrix, verticalPosition);
  }

  // Third base
  createBase(0xF5F5F5, 120, 20, 5, matrix, verticalPosition);
  if (playStatus.thirdBaseRunner) {
    loadBase(121, 20, matrix, verticalPosition);
  }
}

const renderOuts = (playStatus, matrix, verticalPosition) => {
  matrix
    .fgColor(0xF5F5F5)
    .drawRect(105, 7 + verticalPosition, 6, 6);

  matrix
    .fgColor(0xF5F5F5)
    .drawRect(105, 15 + verticalPosition, 6, 6);

  matrix
    .fgColor(0xF5F5F5)
    .drawRect(105, 23 + verticalPosition, 6, 6);

  if (playStatus.outCount > 0) {
    matrix
      .fgColor(0xFFD500)
      .fill(106, ifAboveMatrix(8, verticalPosition), 110, ifAboveMatrix(12, verticalPosition));
  }

  if (playStatus.outCount > 1) {
    matrix
      .fgColor(0xFFD500)
      .fill(106, ifAboveMatrix(16, verticalPosition), 110, ifAboveMatrix(20, verticalPosition));
  }

  if (playStatus.outCount > 2) {
    matrix
      .fgColor(0xFFD500)
      .fill(106, ifAboveMatrix(24, verticalPosition), 110, ifAboveMatrix(28, verticalPosition));
  }
}

const ballsStrikes = (playStatus, matrix, verticalPosition) => {
  // console.log(playStatus);
  matrix
    .fgColor(0xF5F5F5)
    .drawText(`${playStatus.ballCount ? playStatus.ballCount.toString() : '0'}-${playStatus.strikeCount ? playStatus.strikeCount.toString() : '0'}`, 158, verticalPosition + 16);
}

const liveGameStatus = (game, matrix, verticalPosition) => {
  // console.log(game.score.playStatus);
  matrix
    .fgColor(0xF5F5F5)
    .font(statusFont)
    .drawText(game.score.currentInning ? game.score.currentInning.toString() : '1', 100, verticalPosition + 6);

  inningArrow(game.score.currentInningHalf, matrix, verticalPosition);

  // console.log(game);

  ballsStrikes(game.score.playStatus, matrix, verticalPosition);

  renderBases(game.score.playStatus, matrix, verticalPosition);

  renderOuts(game.score.playStatus, matrix, verticalPosition);

  matrix.font(font); //Resets font
}

const postponedGame = (time, matrix, verticalPosition) => {
  const isoTime = DateTime.fromISO(time);
  // console.log(isoTime);
  // console.log(isoTime.toLocaleString(DateTime.TIME_SIMPLE));
  matrix.font(statusFont).fgColor(0xF5F5F5);

  if (DateTime.local().hasSame(isoTime, 'day')) {
    const timeStringLines = LayoutUtils.textToLines(statusFont, 46, isoTime.toLocaleString(DateTime.TIME_SIMPLE));

    LayoutUtils.linesToMappedGlyphs(timeStringLines, statusFont.height(), 46, matrix.height(), 'center', 'middle')
    .forEach(glyph => {
      matrix.drawText(glyph.char, glyph.x + 25, verticalPosition + glyph.y);
    });
  } else {
    const dateStringLines = LayoutUtils.textToLines(statusFont, 46, isoTime.toLocaleString({ month: 'numeric', day: 'numeric' }));
    const timeStringLines = LayoutUtils.textToLines(statusFont, 46, isoTime.toLocaleString({ hour: 'numeric', minute: 'numeric' }));

    LayoutUtils.linesToMappedGlyphs(dateStringLines, statusFont.height(), 46, matrix.height(), 'center', 'middle')
    .forEach(glyph => {
      matrix.drawText(glyph.char, glyph.x + 25, verticalPosition + glyph.y - 3);
    });

    LayoutUtils.linesToMappedGlyphs(timeStringLines, statusFont.height(), 46, matrix.height(), 'center', 'middle')
    .forEach(glyph => {
      matrix.drawText(glyph.char, glyph.x + 25, verticalPosition + glyph.y + 3);
    });
  }
  
  matrix.font(font); //Resets font
}

const gameStatus = (game, matrix, verticalPosition) => {
  if (game.schedule.scheduleStatus === 'POSTPONED') {
    if (game.schedule.playedStatus === 'LIVE') {
      liveGameStatus(game, matrix, verticalPosition);
    } else if (game.schedule.playedStatus === 'COMPLETED' || game.schedule.playedStatus === 'COMPLETED_PENDING_REVIEW') {
      completedStatus(matrix, verticalPosition);
    } else {
      postponedGame(game.schedule.startTime, matrix, verticalPosition);
    }
    return;
  }

  switch (game.schedule.playedStatus) {
    case 'LIVE':
      liveGameStatus(game, matrix, verticalPosition);
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

  // const status = gameStatus(game);

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

  LayoutUtils.linesToMappedGlyphs(awayLines, font.height(), 30, 15, 'center', 'middle')
    .forEach(glyph => {
      matrix.drawText(glyph.char, glyph.x, verticalPosition + glyph.y);
    });

  LayoutUtils.linesToMappedGlyphs(awayScoreLines, font.height(), 15, 15, 'center', 'middle')
    .forEach(glyph => {
      matrix.drawText(glyph.char, glyph.x + 35, verticalPosition + glyph.y);
    });

  matrix.fgColor(homeText);

  LayoutUtils.linesToMappedGlyphs(homeLines, font.height(), 30, 15, 'center', 'middle')
    .forEach(glyph => {
      matrix.drawText(glyph.char, glyph.x, verticalPosition + glyph.y + 16);
    });

  LayoutUtils.linesToMappedGlyphs(homeScoreLines, font.height(), 15, 15, 'center', 'middle')
    .forEach(glyph => {
      matrix.drawText(glyph.char, glyph.x + 35, verticalPosition + glyph.y + 16);
    });

  gameStatus(game, matrix, verticalPosition);
}

module.exports = { renderGame };