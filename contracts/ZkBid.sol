// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IVerifier.sol";

contract ZkBid is Ownable {
    mapping(address => IVerifier.Proof) public userProofs;
    mapping(address => bool) public bidding;

    IVerifier public verifier;
    bool public biddingOpen;

    constructor(address _verifier)
    {
        require(_verifier != address(0), "Verifier address cannot be 0x");
        verifier = IVerifier(_verifier);

        biddingOpen = false;
    }

    modifier onlyBiddingOpen {
        require(biddingOpen, "Bidding is not open");
        _;
    }

    function openBidding() public onlyOwner {
        biddingOpen = true;
    }

    function bid(IVerifier.Proof memory proofBid) public onlyBiddingOpen {
        require(!bidding[msg.sender], "You are already bidding");
        userProofs[_msgSender()] = proofBid;
        bidding[_msgSender()] = true;
    }

    function checkBid(address user) public view returns (bool) {
        uint8[1] memory input = [0];
        return verifier.verifyTx(userProofs[user], input);
    }
}
