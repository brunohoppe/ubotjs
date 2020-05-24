const { exchangesWay0, marketsWay0 } = require('../constants/way0.js')
const { exchangesWay3, marketsWay3 } = require('../constants/way3.js')
// const { exchangesWay4, marketsWay4 } = require('../constants/way4.js')

// bleuTrade excCripto bitRecife bullGain bomespGlobal
process.argv[2] = process.argv[2] || 'nexec'
process.argv[3] = process.argv[3] || 0.002


let spread = 0.00001500
let adjustedBalance = 0.001
const initialValue = process.argv[3]
const startCurrency = 'BTC'
const startExchange = 'bleuTrade'

const marketsWay1 = [
  {markets: [   'BTC_USDT'   , 'BTC_USDT'    ],},
  {markets: [   'BTC_USDT'   , 'BTC_USDT'    ],},
]
const exchangesWay1 = [
  [   'excCripto', 'bleuTrade',       ],
  [   'bleuTrade', 'excCripto'        ],
]
const marketsWay2 = [
    {markets: [   'ETH_BTC'    , 'ETH_USDT',  'BTC_USDT'    ],},
    {markets: [   'ETH_BTC'    , 'ETH_USDT',  'BTC_USDT'    ],},
    {markets: [   'ETH_BTC'    , 'ETH_USDT',  'BTC_USDT'    ],},
    {markets: [   'ETH_BTC'    , 'ETH_USDT',  'BTC_USDT'    ],},
]
const exchangesWay2 = [

    [   'excCripto', 'bleuTrade', 'excCripto',   ],
    [   'bleuTrade', 'excCripto', 'bleuTrade',   ],
    [   'excCripto', 'excCripto', 'excCripto',   ],
    [   'bleuTrade', 'bleuTrade', 'bleuTrade',   ],
]

const exchangesWay5 = [
  ['bleuTrade', 'excCripto'],
  ['excCripto', 'bleuTrade'],
]
const marketsWay5 = [
  {markets: [   'LTC_BTC'   , 'LTC_BTC',    ] },
  {markets: [   'LTC_BTC'   , 'LTC_BTC',    ] },
]


const waysGroup = [
  { marketWays: marketsWay1,  exchangeWays: exchangesWay1},
  { marketWays: marketsWay2,  exchangeWays: exchangesWay2},
  { marketWays: marketsWay5,  exchangeWays: exchangesWay5},
]
const getAllWays = (exchanges) => {
  
  const ways = waysGroup.map((ways, i) =>{

    if(ways.marketWays.length != ways.exchangeWays.length){
      throw 'Mercados e Exchanges diferem na quantidade'
    }
    return ways.marketWays.map((way, wayIndex) => {

      const markets = way.markets.map((market, marketIndex) => ({ market, exchange: exchanges[ways.exchangeWays[wayIndex][marketIndex]] }))
      way.startCurrency = way.startCurrency || startCurrency
      way.initialValue = way.initialValue || initialValue
      way.initialValueTemp = way.initialValue
      way.startExchange = exchanges[way.startExchange] || exchanges[startExchange]
      way.markets = markets
      way.spread = way.spread || spread
      way.adjustedBalance = way.adjustedBalance || adjustedBalance

      return way

    })
    
  })
  return ways
}
const getWays = (exchanges) => {
  return getAllWays(exchanges)
}

exports.getWays = getWays