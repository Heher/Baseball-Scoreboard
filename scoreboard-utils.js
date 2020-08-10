const { LedMatrix, GpioMapping, LedMatrixUtils, PixelMapperType, Font, LayoutUtils } = require('rpi-led-matrix');
const Color = require('color');
const { DateTime } = require('luxon');
const font = new Font('spleen-5x8', `${process.cwd()}/fonts/spleen-5x8.bdf`);
const statusFont = new Font('4x6.bdf', `${process.cwd()}/fonts/4x6.bdf`);

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

  matrix.brightness(70);

  return matrix;
}

const getBackgroundColor = team => {
  return Color(teamColors[team.toLowerCase()].home).rgbNumber();
}

const findTeamTextColor = (team) => {
  // console.log(team);
  if (teamColors[team.toLowerCase()].text) {
    // console.log(teamColors[team.toLowerCase()].text);
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
  matrix
    .fgColor(0xF5F5F5)
    .drawText('F', 45, verticalPosition + 4);
}

const liveGameStatus = (game, matrix, verticalPosition) => {
  matrix
    .fgColor(0xF5F5F5)
    .drawText(game.score.currentInning.toString(), 45, verticalPosition + 4);
}

const gameStatus = (game, matrix, verticalPosition) => {
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
  const awayScore = game.score.awayScoreTotal !== null ? game.score.awayScoreTotal.toString() : '';
  const homeTeam = game.schedule.homeTeam.abbreviation;
  const homeScore = game.score.homeScoreTotal !== null ? game.score.homeScoreTotal.toString() : '';

  const awayBackground = getBackgroundColor(awayTeam);
  const homeBackground = getBackgroundColor(homeTeam);

  const awayText = findTeamTextColor(awayTeam);
  const homeText = findTeamTextColor(homeTeam);

  // const status = gameStatus(game);

  const backgroundX = verticalPosition < 0 ? 0 : verticalPosition;

  matrix
    .fgColor(awayBackground)
    .fill(0, backgroundX, 30, verticalPosition + 15);

  matrix
    .fgColor(homeBackground)
    .fill(65, backgroundX, 95, verticalPosition + 15);

  matrix
    .fgColor(awayText)
    .drawText(awayTeam, 8, verticalPosition);

  matrix
    .fgColor(awayText)
    .drawText(awayScore, 13, verticalPosition + 8);

  matrix
    .fgColor(homeText)
    .drawText(homeTeam, 74, verticalPosition);

  matrix
    .fgColor(homeText)
    .drawText(homeScore, 79, verticalPosition + 8);

  gameStatus(game, matrix, verticalPosition);
}

module.exports = { createMatrix, renderGame };