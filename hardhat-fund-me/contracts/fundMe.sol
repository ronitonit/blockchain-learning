// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Import this file to use console.log
import "hardhat/console.sol";
import "../utility/PriceConverter.sol";

// Error codes
error FundMe__NotOwner();

// if interfaces or libraries, add here

/** @title A contract for crowd funding
 * @author ronitonit
 * @dev this implements price feeds as our library
 */
contract FundMe {
    // Type Declarations
    using PriceConverter for uint256;

    // State Variables!
    uint256 public constant MIN_USD = 50 * 1e18;
    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmountFunded;
    address private immutable i_owner;
    AggregatorV3Interface private s_priceFeed;

    // Modifiers
    // we can use modifiers to re-use the same logic for other functions.
    modifier onlyOwner() {
        require(msg.sender == i_owner, "sender is not an owner");
        // below means execute rest of the code.
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
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

    function fund() public payable {
        // want to be able to set a minimum fund amount in USD

        // when a function is made payable, we can acees the value like below

        // require keyword is a checker, if check did not pass, show error and revert
        require(
            msg.value.getConversionRate(s_priceFeed) >= MIN_USD,
            "you need to send at least one Ether!"
        ); // 1e18 = 1* 10 ** 18 = 1000000000000000000
        // msg.sender is always available. is the address of the wallet
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] = msg.value;
        // what is reverting ?
        // undo any action before, and send remaining gas back
    }

    function withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        // resetting the array . 0 says 0 elements to start in the array.
        s_funders = new address[](0);

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

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory funders = s_funders;
        // mappings cant be in momery!
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "call failed");
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(address funder)
        public
        view
        returns (uint256)
    {
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
