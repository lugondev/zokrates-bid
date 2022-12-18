const fs = require('fs')
const path = require("path")

function readFile(path) {
    const isExists = fs.existsSync(path)
    if (!isExists) {
        console.log(`File ${path} does not exist`)
        return ""
    }
    return fs.readFileSync(path, 'utf8')
}

function readFileBuffer(path) {
    const isExists = fs.existsSync(path)
    if (!isExists) return []
    const content = fs.readFileSync(path)
    return new Uint8Array(content)
}

function readZok() {
    const pathZok = path.join(__dirname, "../zokrates/bid.zok")
    return readFile(pathZok)
}

function readProvingKey() {
    const pathKey = path.join(__dirname, "../zokrates/proving.key")
    return readFileBuffer(pathKey)
}

function readVerificationKey() {
    const pathKey = path.join(__dirname, "../zokrates/verification.key")
    const content = readFile(pathKey)
    return JSON.parse(content)
}


module.exports = {
    readZok,
    readProvingKey,
    readVerificationKey,
}

