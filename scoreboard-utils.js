const { LedMatrix, GpioMapping, LedMatrixUtils, PixelMapperType, Font, LayoutUtils } = require('rpi-led-matrix');
const Color = require('color');
const { DateTime } = require('luxon');
const font = new Font('spleen-5x8', `${process.cwd()}/fonts/spleen-5x8.bdf`);
const statusFont = new Font('tom-thumb.bdf', `${process.cwd()}/fonts/tom-thumb.bdf`);

const teamColors = require('./teamColors.json');

const createMatrix = () => {
  const matrix = new LedMatrix(
    {
      ...LedMatrix.defaultMatrixOptions(),
      rows: 16,
      cols: 32,
      chainLength: 3,
      hardwareMapping: GpioMapping.AdafruitHatPwm,
      pixelMapperConfig: LedMatrixUtils.encodeMappers({ type: PixelMapperType.U }),
    },
    {
      ...LedMatrix.defaultRuntimeOptions(),
      gpioSlowdown: 1,
    }
  );

  matrix.font(font);

  matrix.clear();

  matrix.brightness(60);

  return matrix;
}

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
      matrix.drawText(glyph.char, glyph.x + 25, verticalPosition + glyph.y);
    });
}

const inningArrow = (inningHalf, matrix, verticalPosition) => {
  matrix
  .fgColor(0xF5F5F5)
  .drawLine(65, verticalPosition + 4, 67, verticalPosition + 4);

  if (inningHalf === 'TOP') {
    matrix
    .fgColor(0xF5F5F5)
    .setPixel(66, verticalPosition + 3);
  } else {
    matrix
    .fgColor(0xF5F5F5)
    .setPixel(66, verticalPosition + 5);
  }
}

const createBase = (color, startingX, startingY, distance, matrix, verticalPosition) => {
  matrix
    .fgColor(color)
    .drawLine(startingX, verticalPosition + startingY, startingX + distance, verticalPosition + startingY - distance)
    .drawLine(startingX + distance, verticalPosition + startingY - distance, startingX + (distance * 2), verticalPosition + startingY)
    .drawLine(startingX + (distance * 2), verticalPosition + startingY, startingX + distance, verticalPosition + startingY + distance)
    .drawLine(startingX + distance, verticalPosition + startingY + distance, startingX, verticalPosition + startingY);
}

const loadBase = (startingX, startingY, matrix, verticalPosition) => {
  createBase(0xFFD500, startingX, startingY, 2, matrix, verticalPosition);
  createBase(0xFFD500, startingX + 1, startingY, 1, matrix, verticalPosition);
  matrix
    .fgColor(0xFFD500)
    .setPixel(startingX + 2, startingY + verticalPosition);
}

const renderBases = (playStatus, matrix, verticalPosition) => {
  // const bases = ['first', 'second', 'third'];

  // First base
  createBase(0xF5F5F5, 46, 10, 3, matrix, verticalPosition);
  if (playStatus.firstBaseRunner) {
    loadBase(47, 10, matrix, verticalPosition);
  }

  // Second base
  createBase(0xF5F5F5, 41, 5, 3, matrix, verticalPosition);
  if (playStatus.secondBaseRunner) {
    loadBase(42, 5, matrix, verticalPosition);
  }

  // Third base
  createBase(0xF5F5F5, 36, 10, 3, matrix, verticalPosition);
  if (playStatus.thirdBaseRunner) {
    loadBase(37, 10, matrix, verticalPosition);
  }
}

const renderOuts = (playStatus, matrix, verticalPosition) => {
  matrix
    .fgColor(0xF5F5F5)
    .drawRect(28, 1 + verticalPosition, 3, 3);

  matrix
    .fgColor(0xF5F5F5)
    .drawRect(28, 6 + verticalPosition, 3, 3);

  matrix
    .fgColor(0xF5F5F5)
    .drawRect(28, 11 + verticalPosition, 3, 3);

  if (playStatus.outCount > 0) {
    matrix
      .fgColor(0xFFD500)
      .drawRect(29, 2 + verticalPosition, 1, 1);
  }

  if (playStatus.outCount > 1) {
    matrix
      .fgColor(0xFFD500)
      .drawRect(29, 7 + verticalPosition, 1, 1);
  }

  if (playStatus.outCount > 2) {
    matrix
      .fgColor(0xFFD500)
      .drawRect(29, 12 + verticalPosition, 1, 1);
  }
}

const ballsStrikes = (playStatus, matrix, verticalPosition) => {
  matrix
    .fgColor(0xF5F5F5)
    .drawText(`${playStatus.ballCount.toString()}-${playStatus.strikeCount.toString()}`, 58, verticalPosition + 10);
}

const liveGameStatus = (game, matrix, verticalPosition) => {
  // console.log(game.score.playStatus);
  matrix
    .fgColor(0xF5F5F5)
    .font(statusFont)
    .drawText(game.score.currentInning ? game.score.currentInning.toString() : '1', 59, verticalPosition + 2);

  inningArrow(game.score.currentInningHalf, matrix, verticalPosition);

  ballsStrikes(game.score.playStatus, matrix, verticalPosition);

  renderBases(game.score.playStatus, matrix, verticalPosition);

  renderOuts(game.score.playStatus, matrix, verticalPosition);

  matrix.font(font); //Resets font
}

const postponedGame = (time, matrix, verticalPosition) => {
  const isoTime = DateTime.fromISO(time);
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
    postponedGame(game.schedule.startTime, matrix, verticalPosition);
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
  if (verticalPosition <= -16) {
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

  const backgroundX = verticalPosition < 0 ? 0 : verticalPosition;

  matrix
    .fgColor(awayBackground)
    .fill(0, backgroundX, 24, verticalPosition + 15);

  matrix
    .fgColor(homeBackground)
    .fill(71, backgroundX, 95, verticalPosition + 15);

  const awayLines = LayoutUtils.textToLines(font, 25, awayTeam);
  const awayScoreLines = LayoutUtils.textToLines(font, 25, awayScore);
  const homeLines = LayoutUtils.textToLines(font, 25, homeTeam);
  const homeScoreLines = LayoutUtils.textToLines(font, 25, homeScore);

  matrix.fgColor(awayText);

  LayoutUtils.linesToMappedGlyphs(awayLines, font.height(), 25, matrix.height(), 'center', 'top')
    .forEach(glyph => {
      matrix.drawText(glyph.char, glyph.x, verticalPosition + glyph.y);
    });

  LayoutUtils.linesToMappedGlyphs(awayScoreLines, font.height(), 25, matrix.height(), 'center', 'bottom')
    .forEach(glyph => {
      matrix.drawText(glyph.char, glyph.x, verticalPosition + glyph.y);
    });

  matrix.fgColor(homeText);

  LayoutUtils.linesToMappedGlyphs(homeLines, font.height(), 25, matrix.height(), 'center', 'top')
    .forEach(glyph => {
      matrix.drawText(glyph.char, glyph.x + 72, verticalPosition + glyph.y);
    });

  LayoutUtils.linesToMappedGlyphs(homeScoreLines, font.height(), 25, matrix.height(), 'center', 'bottom')
    .forEach(glyph => {
      matrix.drawText(glyph.char, glyph.x + 72, verticalPosition + glyph.y);
    });

  // matrix
  //   .fgColor(awayText)
  //   .drawText(awayTeam, 8, verticalPosition);

  // matrix
  //   .fgColor(awayText)
  //   .drawText(awayScore, 13, verticalPosition + 8);

  // matrix
  //   .fgColor(homeText)
  //   .drawText(homeTeam, 74, verticalPosition);

  // matrix
  //   .fgColor(homeText)
  //   .drawText(homeScore, 79, verticalPosition + 8);

  gameStatus(game, matrix, verticalPosition);
}

module.exports = { createMatrix, renderGame };