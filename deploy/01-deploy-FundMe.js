const { network } = require("hardhat");
const {
  LOCK_TIME,
  networksConfig,
  localChianId,
  CONFIRMATION,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { firstAccount } = await getNamedAccounts();
  let dateFeedsAddr;
  let confirmation;
  if (localChianId.includes(network.name)) {
    const mockDevelopment = await deployments.get("MockV3Aggregator");
    dateFeedsAddr = mockDevelopment.address;
    confirmation = 0;
  } else {
    dateFeedsAddr = networksConfig[network.config.chainId].ethToUsdAddr;
    confirmation = CONFIRMATION;
    console.log;
  }

  const fundMe = await deploy("FundMe", {
    from: firstAccount,
    args: [LOCK_TIME, dateFeedsAddr],
    log: true,
    waitForConfirmation: confirmation,
  });
  if (hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_APIKEY) {
    // 等待几秒钟后再验证
    console.log(`wait etherscan 收到api调用,我们等待60s`);
    await new Promise((resolve) => setTimeout(resolve, 60000)); // 等待60秒

    // 验证合约
    await hre.run("verify:verify", {
      address: fundMe.address,
      constructorArguments: [LOCK_TIME, dateFeedsAddr],
    });
  } else {
    console.log(`network is not Ethereum network, verify is skipped...`);
  }
};

module.exports.tags = ["all"];
