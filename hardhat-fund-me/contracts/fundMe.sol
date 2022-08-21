// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Import this file to use console.log
import "hardhat/console.sol";
import "../utility/PriceConverter.sol";

error NotOwner();

contract FundMe {
    using PriceConverter for uint256;

    uint256 public constant MIN_USD = 50 * 1e18;
    address[] public funders;
    mapping(address => uint256) public addressToAmountFunded;
    address public immutable i_owner;

    AggregatorV3Interface public priceFeed;

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function fund() public payable {
        // want to be able to set a minimum fund amount in USD

        // when a function is made payable, we can acees the value like below

        // require keyword is a checker, if check did not pass, show error and revert
        require(
            msg.value.getConversionRate(priceFeed) >= MIN_USD,
            "you need to send at least one Ether!"
        ); // 1e18 = 1* 10 ** 18 = 1000000000000000000
        // msg.sender is always available. is the address of the wallet
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] = msg.value;
        // what is reverting ?
        // undo any action before, and send remaining gas back
    }

    function withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }
        // resetting the array . 0 says 0 elements to start in the array.
        funders = new address[](0);

        // withdraw the funds (3 ways)

        // transfer -- if fails, revert transaction and throw error
        // need to type cast the msg.sender to payable
        // payable(msg.sender).transfer(address(this).balance);

        // send -- if fails, returns false, only reverts transaction
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed")

        // call
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "call failed");
    }

    // we can use modifiers to re-use the same logic for other functions.
    modifier onlyOwner() {
        require(msg.sender == i_owner, "sender is not an owner");
        // below means execute rest of the code.
        if (msg.sender != i_owner) {
            revert NotOwner();
        }
        _;
    }

    // what happens if ppl send ETH to the smart contract without calling the fund function ?

    // there is a way for a code to be executed in this situation
    // --> receive()
    // --> fallback()

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }
}
