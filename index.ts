import { LedMatrix, GpioMapping, LedMatrixUtils, PixelMapperType } from 'rpi-led-matrix';

const wait = (t: number) => new Promise(ok => setTimeout(ok, t));

const nextColor = (f: number, t: number): number => {
  const brightness = 0xFF & Math.max(0, 255 * Math.sin(f * t / 1000));

  return (brightness << 16) | (brightness << 8) | brightness;
};

(async () => {
  try {
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

    const freqs = [...Array(matrix.width() * matrix.height()).keys()].map(i => i / 30);

    matrix.afterSync((mat, dt, t) =>
      matrix.map(([x, y, i]) => nextColor(freqs[i], t))
    );

    matrix.sync();

  }
  catch (error) {
    console.error(`${__filename} caught: `, error);
  }
})();

    
