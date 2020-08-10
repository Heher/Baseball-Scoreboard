const { LedMatrix, GpioMapping, LayoutUtils, LedMatrixUtils, PixelMapperType, Font, HorizontalAlignment, VerticalAlignment } = require('rpi-led-matrix');
const color = require('color');
const font = new Font('helvR12', `${process.cwd()}/fonts/helvR12.bdf`);

const rainbow64 = Array.from(Array(64))
  .map((_, i, { length }) => Math.floor(360 * i / length))
  .map(hue => color.hsl(hue, 100, 50).rgbNumber());

const wait = (t) => new Promise(ok => setTimeout(ok, t));

const rainbow = (i) => rainbow64[Math.min(rainbow64.length - 1, Math.max(i % 64, 0))];

(async () => {

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
const lines = LayoutUtils.textToLines(font, matrix.width(), 'Hello, matrix!');

for (const alignmentH of [HorizontalAlignment.Left, HorizontalAlignment.Center, HorizontalAlignment.Right]) {
  for (const alignmentV of [VerticalAlignment.Top, VerticalAlignment.Middle, VerticalAlignment.Bottom]) {
    matrix.fgColor(rainbow(Math.floor(64 * Math.random()))).clear();
    LayoutUtils.linesToMappedGlyphs(lines, font.height(), matrix.width(), matrix.height(), alignmentH, alignmentV)
      .map(glyph => {
        matrix.drawText(glyph.char, glyph.x, glyph.y);
      });
      matrix.sync();
      await wait(400);
  }
}

})();
