

const api = require('./api/public')
const { orderBook } = require('./constants/orderbook.js')
const Decimal = require('decimal.js');
const { socket } = require('./socket/client')
const { selectOrder } = require('./orderRule/rules.js')

let canRun = true
let currentBalance = null
const configureOrders = async (way) => {
    for (let i = 0; i < way.trades.length; i++) {
        const op = way.trades[i].Type === 'BUY' ? 'SELL' : 'BUY'
        const response = await api.getOrderBook(way.trades[i].exchange, { market: way.trades[i].market, type: op })

        way.trades[i].orders = response.data.result[op.toLocaleLowerCase()]


        if(!way.trades[i].orders || way.trades[i].orders.length === 0 || way.trades[i].orders.length === 1){

            console.log('Não tem ordens suficientes: ', way.trades[i].market + " : " + way.trades[i].exchange.name)
            throw "\033[31m" + '.' + '\u001b[0m'
        }
    }
}

const payedValue = (order, fee) => {
    let value = order.Quantity * (1 + fee / 100) * order.Rate
    return value
}
const receivedValue = (order, fee) => {
    let value = order.Quantity * (1 - fee / 100) * order.Rate
    return value
}
const truncValue = (value) => {
    return Math.trunc(value * 100000000) / 100000000
}

const searchTrades = async (way) => {
  for(let tradeIndex = 0; tradeIndex < way.trades.length; tradeIndex++){
    let value = 0
    const trade = way.trades[tradeIndex]
    if(tradeIndex === 0){
      value = way.initialValue
    }else {
      const prevTrade = way.trades[tradeIndex - 1]
      value =  prevTrade[prevTrade[prevTrade.Gain]]  

    }
    selectOrder(trade, trade.exchange, trade.orders, value)
  }
  await makeTrades(way.trades, way)
}
const goThroughGroupedWays = async (ways) => {

  for (let j = 0; j < ways.length; j++) {
    try {
      const way = ways[j]
      await configureOrders(way)
      await searchTrades(way, ways)
      
      way.initialValue = truncValue(way.initialValue - way.adjustedBalance)
      
      if(way.initialValue == 0){
        way.initialValue = way.initialValueTemp
      }
    } catch (error) {
      console.log(error)
    }
  }

}
const simulateTrades = async (groupedWays) => {
  
  const response = await api.getBalance(groupedWays[0][0].startExchange, 'BTC')
  let { result } = response.data
  currentBalance = result[0].Available
  socket.emit('balance', currentBalance);
  if(groupedWays.length > 0){
    while (1 && canRun) {
      for (let i = 0; i < groupedWays.length; i++) {
        await goThroughGroupedWays(groupedWays[i])
      }
      console.log('Recalculando Saldo')
    }
  }
}
const makeTrades = async (trades, way) =>{
    const { spread, startExchange } = way
    const first = trades[0]
    const last = trades[trades.length - 1]
    let message = ""
    const reset = '\u001b[0m'
    for(let i = 0; i< trades.length; i++){
      const market = "\033[33m" +  trades[i].market + reset
      const exchange = trades[i].exchange.name
      message += market + " " + exchange + " "
    }

    let podeExecutar = process.argv[2] != 'nexec'

    message = podeExecutar ? message : message += '\033[34mNÃO EXECUTA' + reset
    const doTrade = last[last[last.Gain]] > first[first[first.Balance]]
    const resultTrade = last[last[last.Gain]] + "\033[34m" + " > " + reset + first[first[first.Balance]]
    const color = !doTrade ? "\033[31m" : "\033[32m"
    const socketMessage = reset + "\033[35m" + message + "\n" + resultTrade + color + " " + doTrade + reset
    if(doTrade || (process.argv[4] && process.argv[4] == 'p')){
      console.log(socketMessage)
    }else {
      socket.emit('message', socketMessage)
      process.stdout.write('.')
    }
    socket.emit('rodando', currentBalance)
    
    const lastConverted = new Decimal(last[last[last.Gain]])
    const spreadConverted = new Decimal(spread)
    const spreadEncontrado = lastConverted.minus(first[first[first.Balance]])
    const spreadOK = spreadEncontrado.greaterThan(spreadConverted)
    
    if(last[last[last.Gain]] > first[first[first.Balance]] && podeExecutar && spreadOK ){
      const onlyTrades = trades.map((trade) => { return {Rate: trade.Rate, Quantity: trade.Quantity,Total: trade.Total} })
      console.log(onlyTrades)
      const orders = trades.map((trade) => { return trade.orders })
      console.log(orders)
      if(spreadOK){
        socket.emit('message', socketMessage)
        console.log(socketMessage)
        await executeTrade(trades, startExchange)
      }
    }
}


const executeTrade  = async (trades, startExchange) => {
  console.log('Executando trades: ')
    try {
        for(let i = 0; i < trades.length; i++){
          const trade = trades[i]
          if(i == 0){
            if(trade.exchange.id != startExchange.id) {
              console.log(`Transferiando ${trade.Balance} da ${startExchange.name} para ${trade.exchange.name}`)
              const direct = await api.directTransfer(startExchange, trade.exchange.id, trade.Balance, trade[trade[trade.Balance]])
              console.log(direct.data)
              const response = await api.getBalance(trade.exchange, trade.Balance)
              let { result } = response.data
              console.log('Balance: ', result[0])
              let [ r ] = result

              trade[trade[trade.Balance]] = r.Available
              trade[trade[trade.Gain]] = handler[trade[trade.Gain]](trade, trade.exchange.fee, trade.Type)
              trade[trade[trade.Gain]] = truncValue(trade[trade[trade.Gain]])
            }
            
            console.log(`Criando Ordem: Qtd: ${trade.Quantity} Preço: ${trade.Rate} Total: ${trade.Total}`)
            const createdOrder = await api.createOrder(trade)
            console.log('Criada: ', createdOrder.data)
          }else {
            const prevTrade = trades[i-1]
            const response = await api.getBalance(prevTrade.exchange, prevTrade.Gain)
            let { result } = response.data
            console.log('Balance: ', result[0])
            if(prevTrade.exchange.id != trade.exchange.id){
              console.log(`Transferiando ${prevTrade.Gain} da ${prevTrade.exchange.name} para ${trade.exchange.name}`)
              const direct = await api.directTransfer(prevTrade.exchange, trade.exchange.id, prevTrade.Gain, result[0].Available)
              console.log(direct.data)
            }    

            let [ r ] = result
            trade[trade[trade.Balance]] = r.Available
            trade[trade[trade.Gain]] = handler[trade[trade.Gain]](trade, trade.exchange.fee, trade.Type)
            trade[trade[trade.Gain]] = truncValue(trade[trade[trade.Gain]])
            console.log(`Criando Ordem: Qtd: ${trade.Quantity} Preço: ${trade.Rate} Total: ${trade.Total}`)
            const createdOrder = await api.createOrder(trade)
            console.log('Criada: ', createdOrder.data)
          }
        }
        lastTrade = trades[trades.length - 1]
        if(lastTrade.exchange.id != 1){
          const response = await api.getBalance(lastTrade.exchange, lastTrade.Gain)
          let { result } = response.data
          console.log(`Transferiando ${lastTrade.Gain} da ${lastTrade.exchange.name} para ${startExchange.name}`)
          await api.directTransfer(lastTrade.exchange, startExchange.id, lastTrade.Gain, result[0].Available)
          console.log('Última transferencia OK')
        }

        const response = await api.getBalance(startExchange, 'BTC')
        let { result } = response.data
        if(result[0].Available < currentBalance){
          process.exit(0)
        }
        currentBalance = result[0].Available
        socket.emit('balance', currentBalance)
        socket.emit('message', 'Balance: ' + result[0].Available)
        
    } catch (error) {
      console.log('Erro executando os trades')
        canRun = false
        console.log(error)
        process.exit(0)
    }
}

const getTotalValue = (order, fee, tradeType) => {
    if (tradeType === 'BUY') {
        return payedValue(order, fee)
    } else {
        return receivedValue(order, fee)
    }
}
const handler = {
    Total: (order, fee, tradeType) => {
        return getTotalValue(order, fee, tradeType)
    },
    Quantity: (order, fee, tradeType) => {
        return getQuantityValue(order, fee, tradeType)
    }
}
const getQuantityValue = (order, fee, tradeType) => {
    let feeCalc = tradeType === 'BUY' ? 1 + fee / 100 : 1 - fee / 100
    let quantity = order.Total / (feeCalc * order.Rate)
    return quantity
}

exports.simulateTrades = simulateTrades