import { network } from "hardhat";
import {
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
} from "../helper-hardhat-config";

module.exports = async (hre: any) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId?.toString()!;

  if (developmentChains.includes(network.name)) {
    log("local network detected! ... deploying mocks ...");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ANSWER],
    });
    log("Mocks deployed!");
    log("----------------------------------------------------------------");
  }
};

module.exports.tags = ["all", "mocks"];
