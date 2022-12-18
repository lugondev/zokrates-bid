import { initialize, ZoKratesProvider } from "zokrates-js"

function getArtifacts(zokratesProvider: ZoKratesProvider) {
    const source = `import "hashes/sha256/512bitPacked" as sha256packed;
const field MIN_PRICE = 20;

def checkHashValue( field value, field hash) -> field {
    field[2] valueHash = sha256packed([0, 0, 0, value]);
    return (value <= MIN_PRICE || valueHash[0] != hash) ? 0 : 1;
}

def main(private field value, field revealValue, field hash) -> field {
    return if revealValue != 0 {
      (value != revealValue) ? 0 : checkHashValue(value, hash)
    } else { checkHashValue(value, hash) };
}
`
    return zokratesProvider.compile(source)
}

const getComputationValue = (value: string) => initialize().then((zokratesProvider) => {
    if (value.toString().startsWith("0") && value != "0") {
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

export function getProofBid(bidValue: string, provingKey: Uint8Array, isReveal = false) {
    return initialize().then(async (zokratesProvider) => {
        const artifacts = getArtifacts(zokratesProvider)
        const computationValueHash = await getComputationValue(bidValue)
        const { witness } = zokratesProvider.computeWitness(artifacts, [ `${bidValue}`, isReveal ? `${bidValue}` : "0", `${computationValueHash[0]}` ]);
        // generate proof
        const proof = zokratesProvider.generateProof(artifacts.program, witness, provingKey);

        return {
            proofArray: Object.values(proof.proof),
            proofObject: proof.proof,
            inputs: proof.inputs,
            proofString: JSON.stringify(Object.values(proof.proof)),
            hashAfter: computationValueHash[0],
        }
    });
}
