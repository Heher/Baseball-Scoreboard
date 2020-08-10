var LedMatrix = require("easybotics-rpi-rgb-led-matrix");

//init a 16 rows  by 16 cols led matrix 
//default hardware mapping is 'regular', could be 'adafruit-hat-pwm' ect 
var matrix = new LedMatrix(16, 32, 1, 3, 80, 'adafruit-hat-pwm');
matrix.fill(255, 50, 100);
matrix.setPixel(0, 0, 0, 50, 255);
matrix.update();
