import { ethers, run, network } from "hardhat";

async function main() {
  // const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  // const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  // const unlockTime = currentTimestampInSeconds + ONE_YEAR_IN_SECS;

  // const lockedAmount = ethers.utils.parseEther("1");

  // const Lock = await ethers.getContractFactory("Lock");
  // const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

  // await lock.deployed();

  // console.log(`Lock with 1 ETH and unlock timestamp ${unlockTime} deployed to ${lock.address}`);

  const SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
  console.log("deploying SimpleStorage contract ... ");

  const simpleStorage = await SimpleStorageFactory.deploy();

  await simpleStorage.deployed();
  console.log(`SimpleStorage deployed to ${simpleStorage.address}`);

  console.log(network.config);

  if (network.config.chainId !== 31337) {
    console.log("waiting for block txes ... ");
    await simpleStorage.deployTransaction.wait(6);
    await verify(simpleStorage.address, []);
  }

  const currentValue = await simpleStorage.returnFavNum();
  console.log(`current value is ${currentValue}`);

  // update current value
  const transactionResponse = await simpleStorage.store(42);
  await transactionResponse.wait(1);
  const newValue = await simpleStorage.returnFavNum();
  console.log(`new value is ${newValue}`);
}

async function verify(contractAddress: string, args: any[]) {
  console.log("verifying contract ...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (error: any) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("verification failed");
      process.exit(1);
    } else {
      console.log(error);
    }
  }
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
