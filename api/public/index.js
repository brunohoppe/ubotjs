const nonce = require('../../shared/nonce.js')
const axios = require('axios');
const crypto = require('crypto')
const getOrderBook = (exchange, options) => {
    const url = `${exchange.baseUrl}/public/getorderbook`
    const params = options || "";
    return axios.get(url, {params});
}
const getConfig = (exchange) => {
    const url = `${exchange.exchangeUrl}/config`
    return axios.get(url)
}

const getBalance = (exchange, asset) => {
    const url = `${exchange.baseUrl}/private/getbalance`
    const thisNonce = nonce.getNonce()
    const hmacURL = `${url}?apikey=${exchange.apiKey}&nonce=${thisNonce}&asset=${asset}`;
    const apisign = crypto.createHmac('sha512', exchange.apiSecret).update(hmacURL).digest('hex');
    axios.defaults.headers.post['apisign'] = apisign;
    return axios.post(hmacURL)
}
const directTransfer = (exchange, exchangeTo, directTransferAsset, quantity) => {
    const url = `${exchange.baseUrl}/private/directtransfer`
    const thisNonce = nonce.getNonce()
    const hmacURL = `${url}?apikey=${exchange.apiKey}&nonce=${thisNonce}&asset=${directTransferAsset}&quantity=${quantity}&exchangeto=${exchangeTo}&accountto=0hoppe0@gmail.com`;
    const apisign = crypto.createHmac('sha512', exchange.apiSecret).update(hmacURL).digest('hex');
    axios.defaults.headers.post['apisign'] = apisign;
    return axios.post(hmacURL)
    // return Promise.resolve(true)

}
const createOrder = (trade) => {
    const { exchange, market, Rate, Quantity, Type } = trade
    const { baseUrl, apiKey, apiSecret} = exchange
    const url = `${baseUrl}/private/`
    const thisNonce = nonce.getNonce()
    const uri = Type === 'BUY' ? `${url}buylimit` : `${url}selllimit`
    const hmacURL = `${uri}?apikey=${apiKey}&nonce=${thisNonce}&market=${market}&rate=${Rate}&quantity=${Quantity}`;
    const apisign = crypto.createHmac('sha512', apiSecret).update(hmacURL).digest('hex');
    axios.defaults.headers.post['apisign'] = apisign;
    return axios.post(hmacURL)
    // return Promise.resolve(true)

}
const privateApi = (url, apisign) => {
    axios.defaults.headers.post['apisign'] = apisign;
    return axios.post(url)
}
exports.getOrderBook = getOrderBook;
exports.getConfig = getConfig;
exports.createOrder = createOrder;
exports.getBalance = getBalance;
exports.privateApi = privateApi;
exports.directTransfer = directTransfer;