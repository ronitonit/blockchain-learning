import { assert, expect } from "chai";
import { BigNumber } from "ethers";
import { network, ethers, getNamedAccounts } from "hardhat";
import { developmentChains } from "../../helper-hardhat-config";
import { Raffle } from "../../typechain-types";

developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle Unit Tests", function () {
      let raffle: Raffle;
      let raffleContract: Raffle;
      let raffleEntranceFee: BigNumber;
      let deployer;

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        raffleContract = await ethers.getContract("Raffle", deployer);
        raffleEntranceFee = await raffle.getEntranceFee();
      });

      describe("fulfillRandomWords", () => {
        it("works with live chainlink keepers and chainlink VRF, we get a random winner", async () => {
          // enter the raffle;
          const startingTimeStamp = await raffle.getLastTimeStamp();
          const accounts = await ethers.getSigners();

          // setup listener before we enter the raffle
          await new Promise<void>(async (resolve, reject) => {
            raffle.once("WinnerPicked", async () => {
              console.log("winner picked event fired!");

              try {
                // add asserts here
                const recentWinner = await raffle.getRecentWinner();
                const raffleState = await raffle.getRaffleState();
                const winnerEndingBalance = await accounts[0].getBalance();
                const endingTimeStamp = await raffle.getLastTimeStamp();

                await expect(raffle.getPlayer(0)).to.be.reverted;
                assert.equal(recentWinner.toString(), accounts[0].address);
                assert.equal(raffleState, 0);
                assert.equal(
                  winnerEndingBalance.toString(),
                  winnerStartingBalance.add(raffleEntranceFee).toString()
                );
                assert(endingTimeStamp > startingTimeStamp);
                resolve();
              } catch (error) {
                reject(error);
              }
            });

            await raffle.enterRaffle({ value: raffleEntranceFee });
            const winnerStartingBalance = await accounts[0].getBalance();
          });
        });
      });
    });
