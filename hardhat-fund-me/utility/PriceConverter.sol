// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getEtherPrice(AggregatorV3Interface priceFeed)
        internal
        view
        returns (uint256)
    {
        // here we get the price from Chainlink oracle system. for this we need -->

        // ABI
        // Address 0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
        //(uint80 roundID, int price, uint startedAt, uint timeStamp, uint80 answeredInRound) =   priceFeed.latestRoundData();

        // if we dont need all the value we can remove them and leave the commas
        (, int price, , , ) = priceFeed.latestRoundData();
        return uint256(price * 1e10);
    }

    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getEtherPrice(priceFeed);
        uint256 ethAmtInUsd = (ethPrice * ethAmount) / 1e18;
        return ethAmtInUsd;
    }
}
