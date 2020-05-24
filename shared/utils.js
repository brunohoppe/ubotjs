async function init() {
    process.on('exit', exitHandler.bind());

    //catches ctrl+c event
    process.on('SIGINT', exitHandler.bind());

    // catches "kill pid" (for example: nodemon restart)
    process.on('SIGUSR1', exitHandler.bind());
    process.on('SIGUSR2', exitHandler.bind());

    //catches uncaught exceptions
    process.on('uncaughtException', exitHandler.bind());
    try {
        database = await MongoClient.connect("mongodb://ubot:kuro3598@ds051943.mlab.com:51943/illpaydb", { useNewUrlParser: true, useUnifiedTopology: true });
        let db = database.db('illpaydb')
        let nonceArr = await db.collection('nonce').find().toArray();

        return nonceArr[0].nonceId

    } catch (e) {
        console.log(e)
    }

}
async function updateNonce() {
    try {
        let db = database.db('illpaydb')
        await db.collection('nonce').updateOne({ "nonceId": currentNonce }, { $inc: { "nonceId": 1 } })
        currentNonce += 1;
    } catch (error) {
        console.log(error)
    }
}
const exitHandler = () => {
    database.close()
    console.log('EXIT')
    process.exit();
}