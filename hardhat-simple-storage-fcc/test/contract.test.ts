import { expect } from "chai";
import { ethers } from "hardhat";
import { SimpleStorage, SimpleStorage__factory } from "../typechain-types";

describe("SimpleStorage", () => {
  let simpleStorage: SimpleStorage,
    simpleStorageFactory: SimpleStorage__factory;

  beforeEach(async () => {
    simpleStorageFactory = (await ethers.getContractFactory(
      "SimpleStorage"
    )) as SimpleStorage__factory;
    simpleStorage = await simpleStorageFactory.deploy();
  });

  it("should start with a fav num as 0", async () => {
    const favNum = await simpleStorage.returnFavNum();
    expect(favNum).equal(0);
  });

  it("should store a new value", async () => {
    const transactionResponse = await simpleStorage.store(42);
    await transactionResponse.wait(1);
    const newValue = await simpleStorage.returnFavNum();
    expect(newValue).equal(42);
  });

  it("should add a new person", async () => {
    const transactionResponse = await simpleStorage.addPerson("John Doe", 9);
    await transactionResponse.wait(1);

    const firstPerson = await simpleStorage.people(0);
    const nameToFavNum = await simpleStorage.nameToFavNum("John Doe");

    expect(firstPerson[0]).equal(9);
    expect(nameToFavNum).equal(9);
    expect(firstPerson[1]).equal("John Doe");
  });
});
