require('dotenv').config();
var bot = require('./bot.js');

const BTC_WALLET = process.env.BTC_WALLET;
const ETH_WALLET = process.env.ETH_WALLET;
const SENTRY_DSN = process.env.SENTRY_DSN;

//Sentry
var Raven = require('raven');
Raven.config(SENTRY_DSN).install();

try {
    bot.startWatchLoop(ETH_WALLET, function (output) {
        console.log(output);
    });
    setTimeout(function () {
        bot.startWatchLoop(BTC_WALLET, function (output) {
            console.log(output);
        });
    }, 5000);

} catch (err) {
    console.log(err);
}