var Client = require('coinbase').Client;
var coinbaseClient = new Client({ 'apiKey': 'lxESKgeyFx5sOaGD', 'apiSecret': 'VLwZ3tju0mJZovCueZvfQT1fZO5rUJa7' });

const minimumETHProfitMargin = 0.05;
const minimumBTCProfitMargin = 0.05;

function testCoinbase() {

    testBTCWallet();

    /* coinbaseClient.getPaymentMethods({}, function(err, pms) {
        console.log(pms);
    }); */

    /* coinbaseClient.getAccounts({}, function(err, accounts) {
        console.log(accounts);
    }); */

}

function checkETHProfitMargin() { //Check profit margins and sell all if margin is higher then limit
    console.log("checkETHProfitMargin - " + new Date().toString());
    coinbaseClient.getAccount("28b44d24-8162-5983-895f-08a5079bc86c", function (err, account) { //ETH Wallet
        account.getTransactions({}, function (err, txs) {
            if (err) {
                console.error(err);
                throw "Error in checkETHProfitMargin - account.getTransactions";
            }
            var lastBuy;
            for (var i = 0; i < txs.length; i++) {
                if (txs[i].amount.amount > 0 && txs[i].status.toLowerCase() == "completed") {
                    lastBuy = txs[i];
                    break;
                }
            }
            if (lastBuy) {
                var sellParams = {
                    "amount": account.balance.amount,
                    "currency": "ETH",
                    "payment_method": "36dfb503-14ee-522f-86fc-ea62f705e4c8", //USD Wallet       
                    "quote": true
                };
                account.sell(sellParams, function (err, tx) {
                    if (err) {
                        console.error(err);
                        throw "Error in checkETHProfitMargin - account.sell (quote)";
                    }
                    var lastBuyPrice = lastBuy.native_amount.amount / lastBuy.amount.amount;
                    var currentSellPrice = tx.total.amount / tx.amount.amount;
                    var currentProfitMargin = currentSellPrice / lastBuyPrice;
                    console.log("Last buy price - " + parseFloat(lastBuyPrice).toFixed(2));
                    console.log("Current sell price - " + parseFloat(currentSellPrice).toFixed(2));
                    console.log("Profit margin - " + parseFloat(((currentProfitMargin) - 1) * 100).toFixed(2) + "%");
                    if ((currentProfitMargin - 1) > minimumETHProfitMargin) {
                        var sellParams = {
                            "amount": account.balance.amount,
                            "currency": "ETH",
                            "payment_method": "36dfb503-14ee-522f-86fc-ea62f705e4c8"
                        }; //USD Wallet                
                        account.sell(sellParams, function (err, tx) { //SELL IT ALL
                            if (err) {
                                console.error(err);
                                throw "Error in checkETHProfitMargin - account.sell (sell)";
                            }
                            console.log("Sold all ETH for a profit margin of " + parseFloat(((currentProfitMargin) - 1) * 100).toFixed(2) + "%");
                        });
                    } else {
                        console.log("HODLing...");
                    }
                    console.log("----------");
                });
            }
        });
    });
}

function checkBTCProfitMargin() { //Check profit margins and sell all if margin is higher then limit
    console.log("checkBTCProfitMargin - " + new Date().toString());
    coinbaseClient.getAccount("8bc79f4f-eee9-5480-9cbb-44b0cceaefbe", function (err, account) { //BTC Wallet
        account.getTransactions({}, function (err, txs) {
            if (err) {
                console.error(err);
                throw "Error in checkBTCProfitMargin - account.getTransactions";
            }
            var lastBuy;
            for (var i = 0; i < txs.length; i++) {
                if (txs[i].amount.amount > 0 && txs[i].status.toLowerCase() == "completed") {
                    lastBuy = txs[i];
                    break;
                }
            }
            if (lastBuy) {
                var sellParams = {
                    "amount": account.balance.amount,
                    "currency": "BTC",
                    "payment_method": "36dfb503-14ee-522f-86fc-ea62f705e4c8", //USD Wallet       
                    "quote": true
                };
                account.sell(sellParams, function (err, tx) {
                    if (err) {
                        console.error(err);
                        throw "Error in checkBTCProfitMargin - account.sell (quote)";
                    }
                    var lastBuyPrice = lastBuy.native_amount.amount / lastBuy.amount.amount;
                    var currentSellPrice = tx.total.amount / tx.amount.amount;
                    var currentProfitMargin = currentSellPrice / lastBuyPrice;
                    console.log("Last buy price - " + parseFloat(lastBuyPrice).toFixed(2));
                    console.log("Current sell price - " + parseFloat(currentSellPrice).toFixed(2));
                    console.log("Profit margin - " + parseFloat(((currentProfitMargin) - 1) * 100).toFixed(2) + "%");
                    if ((currentProfitMargin - 1) > minimumBTCProfitMargin) {
                        var sellParams = {
                            "amount": account.balance.amount,
                            "currency": "BTC",
                            "payment_method": "36dfb503-14ee-522f-86fc-ea62f705e4c8"
                        }; //USD Wallet                
                        account.sell(sellParams, function (err, tx) { //SELL IT ALL
                            if (err) {
                                console.error(err);
                                throw "Error in checkBTCProfitMargin - account.sell (sell)";
                            }
                            console.log("Sold all BTC for a profit margin of " + parseFloat(((currentProfitMargin) - 1) * 100).toFixed(2) + "%");
                        });
                    } else {
                        console.log("HODLing...");
                    }
                    console.log("----------");
                });
            }
        });
    });
}

function testBTCWallet() {
    coinbaseClient.getAccount("8bc79f4f-eee9-5480-9cbb-44b0cceaefbe", function (err, account) { //ETH Wallet
        account.getTransactions({}, function (err, txs) {
            console.log(txs);
        });
    });
}

setInterval(checkETHProfitMargin, 10000);
//setInterval(checkBTCProfitMargin, 10000);

//testCoinbase();
