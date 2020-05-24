class Exchange {
    id
    name
    apiKey
    apiSecret
    baseUrl
    fee
    minTradeSize
    
    constructor(){
        this.id = 0
        this.name = ''
        this.apiKey = ''
        this.apiSecret = ''
        this.baseUrl = ''
        this.fee = 0.0025
    }
    build(id, name, apiKey, apiSecret, baseUrl, fee, minTradeSize){
        this.id = id
        this.name = name
        this.apiKey = apiKey
        this.apiSecret = apiSecret
        this.baseUrl = baseUrl
        this.fee = fee
        this.minTradeSize = minTradeSize
        return this
    }
}
module.exports = Exchange;