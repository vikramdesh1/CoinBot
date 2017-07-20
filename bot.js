require('dotenv').config();

//Environment variables
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;
const BTC_WALLET = process.env.BTC_WALLET;
const ETH_WALLET = process.env.ETH_WALLET;
const USD_WALLET_PAYMENT = process.env.USD_WALLET_PAYMENT;
const SENTRY_DSN = process.env.SENTRY_DSN;

//Coinbase variables
var Client = require('coinbase').Client;
var coinbaseClient = new Client({ 'apiKey': API_KEY, 'apiSecret': API_SECRET });

//Profit margins
const BTC_MIN_PROFIT_MARGIN = process.env.BTC_MIN_PROFIT_MARGIN;
const ETH_MIN_PROFIT_MARGIN = process.env.ETH_MIN_PROFIT_MARGIN;

//Refresh period
const REFRESH_PERIOD = process.env.REFRESH_PERIOD;

//Sentry
//var Raven = require('raven');
//Raven.config(SENTRY_DSN).install();

function startWatchLoop(wallet, callback) {
    try {
        coinbaseClient.getAccount(wallet, function (err, account) {
            if (err) {
                console.error(err);
                throw "Error in startWatchLoop - client.getAccount";
            }
            const loopIntervalObj = setInterval(function () {
                checkProfitMargin(account, function (output) {
                    if (output == null) {
                        console.log("No buys yet on account - " + account.name + ". Terminating loop.");
                        clearInterval(loopIntervalObj);
                    } else {
                        if (account.currency == "BTC") {
                            sellThreshold = BTC_MIN_PROFIT_MARGIN;
                            output.sellThreshold = sellThreshold;
                        } else if (account.currency == "ETH") {
                            sellThreshold = ETH_MIN_PROFIT_MARGIN;
                            output.sellThreshold = sellThreshold;
                        }
                        if (output.currentProfitMargin >= sellThreshold) {
                            var sellParams = {
                                "amount": account.balance.amount,
                                "currency": account.currency,
                                "payment_method": USD_WALLET_PAYMENT
                            };
                            //Sell all coins
                            account.sell(sellParams, function (err, tx) {
                                if (err) {
                                    console.error(err);
                                    throw "Error in startWatchLoop - account.sell (sell)";
                                }
                                callback(tx);
                                clearInterval(loopIntervalObj);
                            });
                        }
                        callback(account.currency + " - avgBuyPrice : " + output.avgBuyPrice.toFixed(2) + ", sellPrice : " + output.currentSellPrice.toFixed(2) + ", profit : " + output.currentProfitMargin.toFixed(2) + ", minProfit : " + sellThreshold);
                    }
                });
            }, REFRESH_PERIOD);
            callback("Watch loop started for - " + account.name);
        });
    } catch (err) {
        console.log(err);
        callback(null);
    }

}

function checkProfitMargin(account, callback) {
    try {
        //Get last buy
        account.getTransactions({}, function (err, txs) {
            if (err) {
                console.error(err);
                throw "Error in checkETHProfitMargin - account.getTransactions";
            }
            var lastBuys = [];
            if (txs.length > 0) {
                for (var i = 0; i < txs.length; i++) {
                    if (txs[i].amount.amount > 0 && txs[i].status.toLowerCase() == "completed") {
                        lastBuys.push(txs[i]);
                    }
                    if (txs[i].amount.amount < 0 && txs[i].type == "sell") {
                        break;
                    }
                }
            }
            var buyPrice = 0.0;
            if (lastBuys.length > 0) {
                var num = 0.0, denom = 0.0;
                lastBuys.forEach(function (buy) {
                    num += parseFloat(buy.native_amount.amount);
                    denom += parseFloat(buy.amount.amount);
                });
                buyPrice = num / denom;
            }
            if (buyPrice != 0.0) {
                var quoteParams = {
                    "amount": account.balance.amount,
                    "currency": account.currency,
                    "payment_method": USD_WALLET_PAYMENT,
                    "quote": true
                };
                //Get a quote
                account.sell(quoteParams, function (err, tx) {
                    if (err) {
                        console.error(err);
                        throw "Error in checkETHProfitMargin - account.sell (quote)";
                    }
                    var avgBuyPrice = buyPrice;
                    var currentSellPrice = tx.total.amount / tx.amount.amount;
                    var currentProfitMargin = (currentSellPrice / avgBuyPrice) - 1;
                    var output = {
                        "currency": account.currency,
                        "averageBuyPrice": avgBuyPrice,
                        "currentSellPrice": currentSellPrice,
                        "currentProfitMargin": currentProfitMargin,
                        "timestamp": new Date().toString()
                    }
                    callback(output);
                });
            } else {
                callback(null);
            }
        });
    } catch (err) {
        console.log(err);
        callback(null);
    }
}

exports.startWatchLoop = startWatchLoop;
