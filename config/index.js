const Exchange = require('../domain/Exchange.js')
const Market = require('../domain/Market.js')
const api = require('../api/public')
const { getWays } = require('./ways.js')
const exchangesConst = require('../constants/exchangesData.js')

const getExchange = async (exchangeName) => {
    // let config = null
    const exchange = exchangesConst.exchanges[exchangeName]
    // try {
    //     const response = await api.getConfig(exchange)
    //     config = response.data
    // } catch (error) {
    //     console.log(error)
    //     throw "Error get Config"
    // }
    return new Exchange().build(exchange.id, exchange.name, exchange.apiKey, exchange.apiSecret, exchange.baseUrl, exchange.defaultTakerFee, exchange.minTradeSize);
}
// const getStartCurrency = (markets) => {
//     let startCurrency = null
//     const firstMarket = markets[0]
//     const lastMarket = markets[markets.length - 1]
//     if (firstMarket.asset === lastMarket.asset || firstMarket.asset === lastMarket.base) {
//         startCurrency = firstMarket.asset
//     } else if (firstMarket.base === lastMarket.asset || firstMarket.base === lastMarket.base) {
//         startCurrency = firstMarket.base
//     }
//     if (!startCurrency) {
//         throw "Start Asset Can't be NULL"
//     }
//     return startCurrency
// }
const makeMarkets = (ways) => {
    const marketsResult = []
    ways.forEach(markets => {
        const marketArr = markets.map((m, i) => {
            return new Market().buildMarket(i, m.market, m.market.split('_')[1], m.market.split('_')[0], m.exchange)
        })
        // const startCurrency = getStartCurrency(marketArr)
        const startCurrency = 'BTC'
        marketsResult.push({startCurrency, markets: marketArr})
        
    })
    return marketsResult
}
const configureTradeType = (ways) => {
    ways.forEach(way => {
        way.markets.map((m, index) => {
            if (index === 0) {
                if (way.startCurrency === m.base) {
                    m.tradeType = 'BUY'
                    m.currencyToCorrect = m.asset
                    m.directTransferAsset = m.asset
                    m.fieldToCorrect = 'Quantity'
                    m.fieldToCompare = 'Total'
                } else {
                    m.tradeType = 'SELL'
                    m.currencyToCorrect = m.base
                    m.directTransferAsset = m.base
                    m.fieldToCorrect = 'Total'
                    m.fieldToCompare = 'Quantity'
                }
            } else {
                const previousMarket = way.markets[index - 1]
                if (previousMarket.currencyToCorrect === m.asset) {
                    m.tradeType = 'SELL'
                    m.currencyToCorrect = m.base
                    m.directTransferAsset = m.base
                    m.fieldToCorrect = 'Total'
                    m.fieldToCompare = 'Total'
                } else if (previousMarket.currencyToCorrect === m.base) {
                    m.tradeType = 'BUY'
                    m.currencyToCorrect = m.asset
                    m.directTransferAsset = m.asset
                    m.fieldToCorrect = 'Quantity'
                    m.fieldToCompare = 'Quantity'
                }
                if (!m.currencyToCorrect) {
                    throw "Currency to Correct not found"
                }
            }
        })
    });
}
const configureBot = async () => {
    try {
        const bleuTrade = await getExchange('bleuTrade')
        const bitRecife = await getExchange('bitRecife')
        const excCripto = await getExchange('excCripto')
        const bullGain = await getExchange('bullGain')
        const bomespGlobal = await getExchange('bomespGlobal')
        const ways = getWays({bleuTrade, bitRecife, excCripto, bullGain, bomespGlobal})
        const marketsM = makeMarkets(ways) 
        configureTradeType(marketsM)
        // let response = await api.directTransfer(excCripto, {Quantity: 0.00200000, directTransferAsset: 'BTC', compare: 'Quantity' }, bleuTrade.id)
        // console.log(response.data)
        let response = await api.getBalance(bleuTrade, 'BTC')
        console.log(response.data.result)
        return {ways: marketsM, bleuTrade}     
    } catch (error) {
        console.error(error)
        throw 'Error in configuration'
    }
}

exports.configureBot = configureBot