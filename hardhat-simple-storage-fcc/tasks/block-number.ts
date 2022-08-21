import { task } from "hardhat/config";

export default task("block-number", "Get the current block number").setAction(
  async (taskArgs, hre) => {
    // const { deployments } = hre;
    // const { blockNumber } = await deployments.getNetwork();
    const blockNumber = await hre.ethers.provider.getBlockNumber();
    console.log(blockNumber);
  }
);
