const wait = (t) => new Promise(ok => setTimeout(ok, t));

module.exports = { wait };