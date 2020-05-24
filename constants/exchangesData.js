require('dotenv').config()
const exchanges = {
    bleuTrade: {
        id: 1,
        name: 'bleuTrade',
        baseUrl: "https://bleutrade.com/api/v3",
        exchangeUrl: "https://bleutrade.com",
        apiKey: process.env.BLEU_APIKEY,
        apiSecret: process.env.BLEU_APISECRET,
        minTradeSize: 0.001,
        defaultTakerFee: 0.25
    },
    excCripto: {
        id: 2,
        name: 'excCripto',
        baseUrl: "https://trade.exccripto.com/api/v3",
        exchangeUrl: "https://trade.exccripto.com",
        apiKey: process.env.EXC_APIKEY,
        apiSecret: process.env.EXC_APISECRET,
        minTradeSize: 0.0001,
        defaultTakerFee: 0.25
    },
    bitRecife: {
        id: 3,
        name: 'bitRecife',
        baseUrl: "https://exchange.bitrecife.com.br/api/v3",
        exchangeUrl: "https://exchange.bitrecife.com.br",
        apiKey: process.env.BITRECIFE_APIKEY,
        apiSecret: process.env.BITRECIFE_APISECRET,
        minTradeSize: 5,
        defaultTakerFee: 0.4
    },
    bomespGlobal: {
        id: 7,
        name: 'bomespGlobal',
        baseUrl: "https://exchange.bomesp.com/api/v3",
        exchangeUrl: "https://exchange.bomesp.com",
        apiKey: process.env.BOMESPGLOBAL_APIKEY,
        apiSecret: process.env.BOMESPGLOBAL_APISECRET,
        defaultTakerFee: 0.3,
        minTradeSize: 0.0001,
    },
    bullGain: {
        id: 9,
        name: 'bullGain',
        baseUrl: "https://trade.bullgain.com/api/v3",
        exchangeUrl: "https://trade.bullgain.com",
        apiKey: process.env.BULLGAIN_APIKEY,
        apiSecret: process.env.BULLGAIN_APISECRET,
        minTradeSize: 5,
        defaultTakerFee: 0.35
    },
}
exports.exchanges = exchanges