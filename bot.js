require('dotenv').config();
//Environment variables
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;
const BTC_WALLET = process.env.BTC_WALLET;
const ETH_WALLET = process.env.ETH_WALLET;
const USD_WALLET_PAYMENT = process.env.USD_WALLET_PAYMENT;
//Coinbase variables
var Client = require('coinbase').Client;
var coinbaseClient = new Client({ 'apiKey': API_KEY, 'apiSecret': API_SECRET });
//Profit margins
const BTC_MIN_PROFIT_MARGIN = process.env.BTC_MIN_PROFIT_MARGIN;
const ETH_MIN_PROFIT_MARGIN = process.env.ETH_MIN_PROFIT_MARGIN;

function checkProfitMargin(wallet, callback) {
    try {
        //Get account
        coinbaseClient.getAccount(wallet, function (err, account) {
            //Get last buy
            account.getTransactions({}, function (err, txs) {
                if (err) {
                    console.error(err);
                    throw "Error in checkETHProfitMargin - account.getTransactions";
                }
                var lastBuy;
                for (var i = 0; i < txs.length; i++) {
                    if (txs[i].amount.amount > 0 && txs[i].type == "buy" && txs[i].status.toLowerCase() == "completed") {
                        lastBuy = txs[i];
                        break;
                    }
                }
                if (lastBuy) {
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
                        var lastBuyPrice = lastBuy.native_amount.amount / lastBuy.amount.amount;
                        var currentSellPrice = tx.total.amount / tx.amount.amount;
                        var currentProfitMargin = (currentSellPrice / lastBuyPrice)-1;
                        var output = {
                            "currency": account.currency,
                            "lastBuyPrice": lastBuyPrice,
                            "currentSellPrice": currentSellPrice,
                            "currentProfitMargin": currentProfitMargin
                        }
                        callback(output);
                    });
                } else {
                    console.log("No buys yet on account - " + account.name);
                }
            });
        });
    } catch (err) {
        console.log(err);
    }
}

exports.checkProfitMargin = checkProfitMargin;