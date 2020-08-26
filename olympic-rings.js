const { LedMatrix, GpioMapping, LedMatrixUtils, PixelMapperType } = require('rpi-led-matrix');

const wait = (t) => new Promise(ok => setTimeout(ok, t));

(async () => {
  try {
    const matrix = new LedMatrix(
      {
        ...LedMatrix.defaultMatrixOptions(),
        rows: 32,
        cols: 64,
        chainLength: 3,
        hardwareMapping: GpioMapping.AdafruitHatPwm,
        pixelMapperConfig: LedMatrixUtils.encodeMappers({ type: PixelMapperType.U }),
      },
      {
        ...LedMatrix.defaultRuntimeOptions(),
        gpioSlowdown: 1,
      }
    );

    const centerX = Math.floor(matrix.width() / 2);
    const centerY = Math.floor(matrix.height() / 2);

    let ringsX = -25;

    while (true) {
      if (ringsX > matrix.width() + 3) {
        ringsX = -25;
      }

      matrix.clear();
      matrix
        .brightness(70)
        .fgColor(0x999999)
        .fill()
        .fgColor(0x0055ff)
        .drawCircle(ringsX, 5, 5)
        .drawCircle(ringsX, 5, 4)
        .fgColor(0xFFFF00)
        .drawCircle(ringsX + 6, 10, 5)
        .drawCircle(ringsX + 6, 10, 4)
        .fgColor(0x121212)
        .drawCircle(ringsX + 11, 5, 5)
        .drawCircle(ringsX + 11, 5, 4)
        .fgColor(0x00FF00)
        .drawCircle(ringsX + 17, 10, 5)
        .drawCircle(ringsX + 17, 10, 4)
        .fgColor(0xFF0000)
        .drawCircle(ringsX + 22, 5, 5)
        .drawCircle(ringsX + 22, 5, 4)
        .sync();

      await wait(22);

      ringsX = ringsX + 1;
    }

  } catch (error) {
    console.log(error);
  }
})();
