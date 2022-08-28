import { network } from "hardhat";
import { developmentChains, networkConfig } from "../helper-hardhat-config";
import { verify } from "../utility/verify";

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
  const args = [ethUsdPriceFeedAddress]; // put priceFeed address
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args,
    log: true,
    // we need to wait if on a live network so we can verify properly
    // @ts-ignore

    waitConfirmation: network.config.blockConfirmations || 1,
  });
  log("FundMe deployed!");
  log("----------------------------------------------------------------");

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, args);
  }
};

module.exports.tags = ["all", "fundme"];
