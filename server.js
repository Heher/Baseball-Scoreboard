const express = require('express');
const { exec } = require('child_process');
// const {boardOn, setBoardOn} = require('./scoreboard');

const app = express();

const port = 4000;

app.get('/start', (req, res) => {
  exec('sudo pm2 start scoreboard.js', function (error, stdout, stderr) {
    if (error) {
      console.log(error.stack);
      console.log('Error code: '+error.code);
      console.log('Signal received: '+error.signal);
    }
    console.log('Child Process STDOUT: '+stdout);
    console.log('Child Process STDERR: '+stderr);
  });
  res.json({result: 'Started'});
});

app.get('/stop', (req, res) => {
  exec('sudo pm2 stop scoreboard.js', function (error, stdout, stderr) {
    if (error) {
      console.log(error.stack);
      console.log('Error code: '+error.code);
      console.log('Signal received: '+error.signal);
    }
    console.log('Child Process STDOUT: '+stdout);
    console.log('Child Process STDERR: '+stderr);
  });
  res.json({result: 'Stopped'});
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});