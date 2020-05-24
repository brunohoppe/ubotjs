const Exchange = require('../domain/Exchange.js')
const { getWays } = require('./ways.js')
const exchangesConst = require('../constants/exchangesData.js')
const {getBalance} = require('../api/public')
const getExchange = async (exchangeName) => {
    const exchange = exchangesConst.exchanges[exchangeName]
    return new Exchange().build(exchange.id, exchange.name, exchange.apiKey, exchange.apiSecret, exchange.baseUrl, exchange.defaultTakerFee, exchange.minTradeSize);
}
const printMarkets = (configWays) => {

    configWays.map((way) => {
        const result = way.markets.reduce((prev, next) => {
            return {market : prev.market  + " - " + next.market}
        })
        console.log(result.market)
    })
}
const configureBot = async () => {
    try {
        const bleuTrade = await getExchange('bleuTrade')
        const bitRecife = await getExchange('bitRecife')
        const excCripto = await getExchange('excCripto')
        const bullGain = await getExchange('bullGain')
        const bomespGlobal = await getExchange('bomespGlobal')
        const configWays = getWays({bleuTrade, bitRecife, excCripto, bullGain, bomespGlobal})
        if(process.argv[2] === 'markets'){
            printMarkets(configWays)
            return []
        }
        const ways = configureTrades(configWays)
        return ways  
    } catch (error) {
        console.error(error)
        throw 'Error in configuration'
    }
}
const getTradeBalance = (way, trades, index) => {
    if(index == 0){
        return way.startCurrency

    } else {
        return trades[index-1].Gain
    }
}
const getTradeGain = (way, trade) => {
    return way.market.split('_').filter(t => t != trade.Balance)[0]
}
const getTradeType = (way, trade) => {
    return trade.Gain == way.market.split('_')[0] ? 'BUY' : 'SELL'
}
const getTrades = (way) => {
    const trades = []
    way.markets.map((marketWay, j) => {
        let trade = {Rate: 0, Quantity: 0, Total: 0}
        trade[marketWay.market.split('_')[0]] = 'Quantity'
        trade[marketWay.market.split('_')[1]] = 'Total'
        trade.Balance = getTradeBalance(way, trades, j)
        trade.Gain = getTradeGain(marketWay, trade)
        trade.Type = getTradeType(marketWay, trade)
        trade.market = marketWay.market
        trade.exchange = marketWay.exchange
        trades.push(trade)
    })
    return trades
}
const getWaysTrades = (allWays) => {

    return allWays.map((way, j) => {
        const trades = getTrades(way);
        way.trades = trades
        return way
    })
}
const configureTrades = (allGroupedWays) => {
    let groupedWays = []

    for(let i = 0; i < allGroupedWays.length; i++){
        const waysTrades = getWaysTrades(allGroupedWays[i])
        groupedWays.push(waysTrades)
    }
    return groupedWays

}
exports.configureBot = configureBot;