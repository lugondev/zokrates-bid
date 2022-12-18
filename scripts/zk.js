const { initialize } = require('zokrates-js')
const { readZok, readProvingKey, readVerificationKey } = require("./util")

function getArtifacts(zokratesProvider) {
    const source = readZok()
    return zokratesProvider.compile(source)
}

const getComputationValue = (value) => initialize().then((zokratesProvider) => {
    if (value.toString().startsWith("0") && value != 0) {
        value = value.toString().substring(1)
    }
    // console.log("computation value:", value)
    const source = `import "hashes/sha256/512bitPacked" as sha256packed;
        def main(private field a, private field b,private field c, private field d) -> field[2] {
    return sha256packed([a, b, c, d]);
    }`;
    const artifacts = zokratesProvider.compile(source)
    const { witness } = zokratesProvider.computeWitness(artifacts, [ "0", "0", "0", `${value}` ])
    const [ w1, w0 ] = witness.split("\n")
    // console.log({ w1, w0 })
    const [ , w1Value ] = w1.split(" ")
    const [ , w0Value ] = w0.split(" ")
    return [ w0Value, w1Value ]
})

function getProofBid(bidValue, isReveal = false) {
    return initialize().then(async (zokratesProvider) => {
        const artifacts = getArtifacts(zokratesProvider)
        const computationValueHash = await getComputationValue(bidValue)
        const { witness } = zokratesProvider.computeWitness(artifacts, [ `${bidValue}`, isReveal ? `${bidValue}` : "0", `${computationValueHash[0]}` ]);
        // generate proof
        const proof = zokratesProvider.generateProof(artifacts.program, witness, readProvingKey());
        // or verify off-chain
        const isVerified = zokratesProvider.verify(readVerificationKey(), proof);

        if (isVerified) {
            return {
                proofArray: Object.values(proof.proof),
                proofObject: proof.proof,
                inputs: proof.inputs,
                proofString: JSON.stringify(Object.values(proof.proof)),
                hashAfter: computationValueHash[0],
            }
        }
        return {
            message: "Proof is not verified",
        }
    });
}

module.exports = {
    getProofBid,
}
