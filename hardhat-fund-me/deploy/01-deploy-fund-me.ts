import { network } from "hardhat";
import { developmentChains, networkConfig } from "../helper-hardhat-config";

module.exports = async (hre: any) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId?.toString()!;

  let ethUsdPriceFeedAddress;

  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = (networkConfig as any)[chainId].ethUsdPriceFeed;
  }
  log("Deploying FundMe and waiting for confirmations...");

  // when going to test on localhost, we want to use a mock.
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [ethUsdPriceFeedAddress], // put priceFeed address
    log: true,
  });
  log("FundMe deployed!");
  log("----------------------------------------------------------------");
};

module.exports.tags = ["all"];
