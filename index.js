require('dotenv').config();
var bot = require('./bot.js');

const BTC_WALLET = process.env.BTC_WALLET;
const ETH_WALLET = process.env.ETH_WALLET;

bot.startWatchLoop(ETH_WALLET, function (output) {
    console.log(output);
});

bot.startWatchLoop(BTC_WALLET, function (output) {
    console.log(output);
});