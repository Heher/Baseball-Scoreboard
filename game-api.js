const { DateTime } = require('luxon');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();

const getGameInfo = async (team) => {
  const buff = new Buffer.from(`${process.env.MSF_API_KEY}:MYSPORTSFEEDS`, 'utf-8');
  const base64Data = buff.toString('base64');

  // const date = DateTime.local().minus({ days: 1 });
  const date = DateTime.local();

  let correctDate = date;

  if (date.c.hour < 6) {
    correctDate = date.minus({ days: 1 });
  }

  const month = correctDate.c.month < 10 ? `0${correctDate.c.month}` : correctDate.c.month;
  let day = correctDate.c.day < 10 ? `0${correctDate.c.day}` : correctDate.c.day;

  const formattedDate = `${date.c.year}${month}${day}`;

  const url = `https://api.mysportsfeeds.com/v2.1/pull/mlb/current/date/${formattedDate}/games.json?`;

  let params;

  if (team) {
    params = new URLSearchParams({
      team
    });
  }

  const response = await fetch(url + params, {
    headers: {
      Authorization: `Basic ${base64Data}`
    }
  });

  const json = await response.json();

  return json;
}

module.exports = { getGameInfo };