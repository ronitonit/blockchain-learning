import { assert, expect } from "chai";
import { Contract } from "ethers";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { developmentChains } from "../../helper-hardhat-config";

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async () => {
      let fundMe: Contract;
      let deployer: any;
      let mockV3Aggregator: Contract;
      const sendValue = ethers.utils.parseEther("1"); // "1000000000000000000"; // 1 eth
      beforeEach(async () => {
        // deploy our fundMe contract
        // using hardhat-deploy
        // const accounts = await ethers.getSigners();
        // const accZero = accounts[0];
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator");
      });

      describe("contructor", async () => {
        it("sets the aggregator address correctly", async () => {
          const response = await fundMe.getPriceFeed();
          assert.equal(response, mockV3Aggregator.address);
        });
      });

      describe("fund", async () => {
        it("fails if not enough ETH is being sent", async () => {
          await expect(fundMe.fund()).to.be.revertedWith(
            "you need to send at least one Ether!"
          );
        });

        it("updated the amount funded data structure", async () => {
          await fundMe.fund({ value: sendValue });
          const res = await fundMe.getAddressToAmountFunded(deployer);
          assert.equal(res.toString(), sendValue.toString());
        });

        it("adds funder to array of funders", async () => {
          await fundMe.fund({ value: sendValue });
          const res = await fundMe.getFunder(0);
          assert.equal(res, deployer);
        });
      });

      describe("withdraw", async () => {
        beforeEach(async () => {
          await fundMe.fund({ value: sendValue });
        });
        it("can withdraw ETH from a single founder", async () => {
          // Arrange
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          // Act
          const transactionRes = await fundMe.withdraw();
          const transactionReceipt = await transactionRes.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const totalGasCost = gasUsed.mul(effectiveGasPrice);
          const endingFundMeBal = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBal = await fundMe.provider.getBalance(deployer);

          // Assert
          assert.equal(endingFundMeBal.toString(), "0");
          //   assert.equal(endingDeployerBal.toString(), sendValue.toString());
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBal.add(totalGasCost).toString()
          );
        });

        it("allows us to withdraw with multiple funders", async () => {
          // Arrange
          const accounts = await ethers.getSigners(); // gets fake accounts from hardhat
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            await fundMeConnectedContract.fund({
              value: ethers.utils.parseEther("2"),
            });
          }
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          // Act
          const transactionRes = await fundMe.cheaperWithdraw();
          const transactionReceipt = await transactionRes.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const totalGasCost = gasUsed.mul(effectiveGasPrice);
          console.log(`GasCost: ${totalGasCost}`);
          console.log(`GasUsed: ${gasUsed}`);
          console.log(`GasPrice: ${effectiveGasPrice}`);
          const endingFundMeBal = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBal = await fundMe.provider.getBalance(deployer);
          // Assert
          assert.equal(endingFundMeBal.toString(), "0");

          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBal.add(totalGasCost).toString()
          );

          await expect(fundMe.getFunder(0)).to.be.reverted;

          for (let i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            );
          }
        });

        it("only allows the owner to withdraw an amount", async () => {
          const accounts = await ethers.getSigners();
          const attacker = accounts[1];
          const attackerConnectedContract = await fundMe.connect(attacker);
          await expect(attackerConnectedContract.withdraw()).to.be.revertedWith(
            "sender is not an owner"
          );
        });
      });
    });
