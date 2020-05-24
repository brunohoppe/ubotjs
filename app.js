const { simulateTrades } = require('./ubot.js')
const {configureBot} = require('./config/index2')

const main = async () => {
    try {
        await run()
    } catch (error) {
        // Error here or is an error of syntax or an error occurred in api
        console.log(error)
    }

}
const run = async () => {
    const ways = await configureBot()
    if(ways.length > 0){
        await simulateTrades(ways)
    }
}
main()