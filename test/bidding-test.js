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
        it("deployed contract", async function () {
            const [ biddingOpen, owner, verifierBid ] = await Promise.all([
                zkBid.biddingOpen(),
                zkBid.owner(),
                zkBid.verifier(),
            ])

            expect(verifierBid).to.equal(verifier.address);
            expect(owner).to.equal(signers[0].address);
            expect(biddingOpen).to.equal(false);
        });

        it('should bid and check', async function () {

            const [ user1, user2 ] = signers;
            let bidValue1 = 21;
            // user must generate proof before deposit
            let proofToBid1 = await getProofBid(bidValue1)

            // deposit with proof generated
            await zkBid.bid(proofToClaim.proofValues, proofToClaim.params.hashAfter, { value: amountDeposit });

            // checking
            expect(await ethers.provider.getBalance(zkPrivacyPayment.address)).to.equal(amountDeposit);
            expect(await zkPrivacyPayment.balanceHashes(user1.address)).to.equal(proofToClaim.params.hashAfter);

            // transfer balance to user2
            // this action requires both user1 and user2 to generate proof
            let amountWillSent = ethers.utils.parseEther("3");
            // user1 generate proof for zokrates
            let proofToSender = await getProofSender(ethers.utils.formatUnits(amountDeposit, "wei"), ethers.utils.formatUnits(amountWillSent, "wei"))
            // user2 generate proof for receiver: flag isDeposit only use for Deposit action
            let proofToReceiver = await getProofReceiver(0, ethers.utils.formatUnits(amountWillSent, "wei"))

            // transfer
            await zkPrivacyPayment.transferPrivacy(user2.address, proofToSender.proofValues, proofToSender.params.hashAfter, proofToReceiver.proofValues, proofToReceiver.params.hashAfter);

            // checking
            expect(await zkPrivacyPayment.balanceHashes(user1.address)).to.equal(proofToSender.params.hashAfter);
            expect(await zkPrivacyPayment.balanceHashes(user2.address)).to.equal(proofToReceiver.params.hashAfter);

            let amountWillWithdrawal = ethers.utils.parseEther("3");
            // withdraw. Note: need flag isWithdrawal = true to generate proof
            let proofToWithdrawal = await getProofSender(amountWillSent, ethers.utils.formatUnits(amountWillWithdrawal, "wei"), true)
            await zkPrivacyPayment.connect(user2).withdraw(amountWillWithdrawal, proofToWithdrawal.proofValues, proofToWithdrawal.params.hashAfter);

            // checking
            expect(await zkPrivacyPayment.balanceHashes(user2.address)).to.equal(proofToWithdrawal.params.hashAfter);
            expect(await ethers.provider.getBalance(zkPrivacyPayment.address)).to.equal(amountDeposit.sub(amountWillWithdrawal));
        });
    });
});
