const chai = require("chai")
const { expect } = require("chai")
const chaiAsPromised = require("chai-as-promised")
const { ethers } = require("hardhat")
const { getProofBid } = require("../scripts/zk")

chai.use(chaiAsPromised)

describe("Bid By ZK", () => {
    let signers
    let zkBid, verifier

    beforeEach(async () => {
        signers = await ethers.getSigners();

        const ZkBid = await ethers.getContractFactory("ZkBid");
        const Verifier = await ethers.getContractFactory("Verifier");

        verifier = await Verifier.deploy();
        await verifier.deployed();

        zkBid = await ZkBid.deploy(verifier.address);
        await zkBid.deployed();
    });

    describe("ZK Bid", function () {
        it("should deployed contract", async function () {
            const [ biddingOpen, owner, verifierBid ] = await Promise.all([ zkBid.biddingOpen(), zkBid.owner(), zkBid.verifier() ])

            expect(verifierBid).to.equal(verifier.address);
            expect(owner).to.equal(signers[0].address);
            expect(biddingOpen).to.equal(false);
        });

        it('should bid and check', async function () {

            const [ user1 ] = signers;
            let bidValue1 = 21;
            // user must generate proof before deposit
            let proofToBid1 = await getProofBid(bidValue1)
            // console.log(proofToBid1)

            // bid with proof generated
            await expect(zkBid.bid(proofToBid1.proofArray, proofToBid1.hashAfter))
                .to.be.revertedWith("Bidding is closed");
            await zkBid.startBidding()
            await zkBid.bid(proofToBid1.proofArray, proofToBid1.hashAfter)

            // checking
            expect(await zkBid.bidHashes(user1.address)).to.equal(proofToBid1.hashAfter);
            await zkBid.endBidding()
            expect(await zkBid.biddingOpen()).to.equal(false);

            let proofToBidReveal = await getProofBid(bidValue1, true)
            await zkBid.revealBid(proofToBidReveal.proofArray, bidValue1)

            expect(await zkBid.bidValues(user1.address)).to.equal(bidValue1)
        });
    });
});
