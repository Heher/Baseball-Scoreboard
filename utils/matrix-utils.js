const { LedMatrix, GpioMapping, LedMatrixUtils, PixelMapperType, Font } = require('rpi-led-matrix');

const font = new Font('scientifica-11', `/home/pi/led-matrix/fonts/scientifica-11.bdf`);
const statusFont = new Font('tom-thumb.bdf', `/home/pi/led-matrix/fonts/tom-thumb.bdf`);

const createMatrix = () => {
  const matrix = new LedMatrix(
    {
      ...LedMatrix.defaultMatrixOptions(),
      rows: 32,
      cols: 64,
      chainLength: 3,
      hardwareMapping: GpioMapping.AdafruitHatPwm
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

module.exports = { createMatrix, font, statusFont };