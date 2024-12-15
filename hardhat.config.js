require("@nomicfoundation/hardhat-toolbox");
require("@chainlink/env-enc").config();
require("@nomicfoundation/hardhat-verify");
require("./tasks");
require("hardhat-deploy");
const SEPOLIA_URL = process.env.SEPOLIA_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_APIKEY = process.env.ETHERSCAN_APIKEY;
const PRIVATE_KEY_1 = process.env.PRIVATE_KEY_1;
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  mocha: {
    timeout: 400000,
  },
  networks: {
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [PRIVATE_KEY, PRIVATE_KEY_1],
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_APIKEY,
    },
  },
  namedAccounts: {
    firstAccount: {
      default: 0,
    },
    secoundAccount: {
      default: 1,
    },
  },
  gasReporter: {
    enabled: false,
  },
};
