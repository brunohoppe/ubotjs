const Trade = require('./Trade.js')
class Market {
    id
    name
    base
    asset
    orders
    trade
    tradeType
    currencyToCorrect
    exchange

    constructor(){
        this.id = 0
        this.name = ''
        this.base = ''
        this.asset = ''
        this.orders = []
        this.trade = {}
        this.tradeType = {}
        this.fieldToCorrect = ''
        this.currencyToCorrect = ''
        this.exchange = {}
    }
    build(id, name, base, asset, orders, trade){
        this.id = id
        this.name = name
        this.base = base
        this.asset = asset
        this.orders = orders
        this.trade = trade
        return this
    }
    buildMarket(id, name, base, asset, exchange) {
        this.id = id
        this.name = name
        this.base = base
        this.asset = asset
        this.exchange = exchange
        return this
    }
    buildTrade(trade){
        this.trade = new Trade(
            trade.rate,
            trade.quantity,
            trade.total,
        )
    }
}
module.exports = Market;