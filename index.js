const { getProofBid } = require("./scripts/zk")

getProofBid(19)
    .then(console.log)
    .catch(console.log)
