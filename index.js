const { getProofBid } = require("./scripts/zk")

getProofBid(22)
    .then(console.log)
    .catch(console.log)
