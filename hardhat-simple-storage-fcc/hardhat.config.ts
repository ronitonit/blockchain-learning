import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
import "@nomiclabs/hardhat-etherscan";
import "./tasks/block-number";
import "solidity-coverage";
import "@typechain/hardhat";

const RINKEBY_ALCHEMY_URL =
  process.env.RINKEBY_ALCHEMY_URL || "https://api-rinkeby.alchemy.dev/";
const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY! || "";
const COSTON_PRIVATE_KEY = process.env.COSTON_PRIVATE_KEY! || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "key";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "key";

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  defaultNetwork: "hardhat", // is used if we dont provide a network outselved in the config
  networks: {
    conston: {
      url: RINKEBY_ALCHEMY_URL,
      accounts: [COSTON_PRIVATE_KEY],
      chainId: 16,
    },
    rinkeby: {
      url: RINKEBY_ALCHEMY_URL,
      accounts: [RINKEBY_PRIVATE_KEY],
      chainId: 4,
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      // accounts -- no need to provide as hardhat does that for us
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-reporter.txt",
    currency: "USD",
    noColors: true,
    coinmarketcap: COINMARKETCAP_API_KEY,
    token: "matic",
  },
};

export default config;
