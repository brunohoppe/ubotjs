const getNonce = () => {
    return new Date().getTime()
}

exports.getNonce = getNonce;