// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./IVerifier.sol";

contract ZkBid is Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;

    mapping(address => uint256) public bidHashes;
    mapping(address => uint256) public bidValues;
    EnumerableSet.AddressSet private users;

    IVerifier public verifier;
    bool public biddingOpen;
    uint256 public revealed;
    uint256 public timeReveal;
    uint256 public deadlineReveal;

    constructor(address _verifier) {
        require(_verifier != address(0), "Verifier address cannot be 0x");
        verifier = IVerifier(_verifier);

        biddingOpen = false;
        deadlineReveal = 1 hours;
    }

    modifier onlyBiddingOpen() {
        require(biddingOpen, "Bidding is closed");
        _;
    }

    modifier onlyRevealTime() {
        require(
            block.timestamp <= timeReveal + deadlineReveal,
            "Reveal time has not started"
        );
        _;
    }

    function setTimeToReveal(uint256 _newTime) public onlyOwner {
        deadlineReveal = _newTime;
    }

    function startBidding() public onlyOwner {
        require(!biddingOpen, "Bidding is already open");
        biddingOpen = true;
    }

    function endBidding() public onlyOwner onlyBiddingOpen {
        require(timeReveal == 0, "Bidding is already ended");
        biddingOpen = false;
        timeReveal = block.timestamp;
    }

    function bid(IVerifier.Proof memory proofBid, uint256 hash)
        public
        onlyBiddingOpen
    {
        require(bidHashes[_msgSender()] == 0, "You are already bidding");
        uint256[3] memory input = [0, hash, 1];
        require(verifier.verifyTx(proofBid, input), "Proof is not correct");

        bidHashes[_msgSender()] = hash;
        users.add(_msgSender());
    }

    function revealBid(IVerifier.Proof memory proofBid, uint256 bidValue)
        public
        onlyRevealTime
    {
        require(bidHashes[_msgSender()] != 0, "You are not bidding");
        require(
            bidValues[_msgSender()] == 0,
            "You have already revealed your bid"
        );
        uint256[3] memory input = [bidValue, bidHashes[_msgSender()], 1];

        require(verifier.verifyTx(proofBid, input), "Proof is not correct");

        bidValues[_msgSender()] = bidValue;
        revealed++;
    }

    function checkBid(IVerifier.Proof memory proofBid, address user)
        public
        view
        returns (bool)
    {
        uint256 hash = bidHashes[user];
        if (hash == 0) return false;

        uint256[3] memory input = [0, hash, 1];
        return verifier.verifyTx(proofBid, input);
    }

    function getUserByIndex(uint256 index) public view returns (address) {
        return users.at(index);
    }

    function totalUsersBidding() public view returns (uint256) {
        return users.length();
    }
}
