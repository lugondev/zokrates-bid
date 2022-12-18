// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IVerifier.sol";

contract ZkBid is Ownable {
    mapping(address => uint256) public bidHashes;
    mapping(address => uint256) public bidValues;

    IVerifier public verifier;
    bool public biddingOpen;
    bool public biddingEnd;

    constructor(address _verifier)
    {
        require(_verifier != address(0), "Verifier address cannot be 0x");
        verifier = IVerifier(_verifier);

        biddingOpen = false;
        biddingEnd = false;
    }

    modifier onlyBiddingOpen {
        require(biddingOpen, "Bidding is closed");
        _;
    }

    modifier onlyBiddingEnd {
        require(biddingEnd, "Bidding is not ended");
        _;
    }

    function startBidding() public onlyOwner {
        biddingOpen = true;
    }

    function endBidding() public onlyOwner onlyBiddingOpen {
        biddingOpen = false;
        biddingEnd = true;
    }

    function bid(IVerifier.Proof memory proofBid, uint256 hash) public onlyBiddingOpen {
        require(bidHashes[_msgSender()] == 0, "You are already bidding");
        uint256[3] memory input = [0, hash, 1];
        require(verifier.verifyTx(proofBid, input), "Proof is not correct");

        bidHashes[_msgSender()] = hash;
    }

    function revealBid(IVerifier.Proof memory proofBid, uint256 bid) public onlyBiddingEnd {
        require(bidValues[_msgSender()] == 0, "You have already revealed your bid");
        uint256[3] memory input = [bid, bidHashes[_msgSender()], 1];

        require(verifier.verifyTx(proofBid, input), "Proof is not correct");
        bidValues[_msgSender()] = bid;
    }

    function checkBid(IVerifier.Proof memory proofBid, address user) public view returns (bool) {
        uint256 hash = bidHashes[user];
        if (hash == 0) return false;

        uint[3] memory input = [0, hash, 1];
        return verifier.verifyTx(proofBid, input);
    }
}
