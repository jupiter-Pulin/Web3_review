const { task } = require("hardhat/config");
const { LOCK_TIME, networksConfig } = require("../helper-hardhat-config");

task("deploy-FundMe", "部署fundMe合约").setAction(async (taskArg, hre) => {
  console.log(`your contracts deploying ...`);

  const fundMeFactory = await ethers.getContractFactory("FundMe");
  let dateFeedAddr;
  dateFeedAddr = networksConfig[network.config.chainId].ethToUsdAddr;
  const fundMe = await fundMeFactory.deploy(LOCK_TIME, dateFeedAddr);

  await fundMe.waitForDeployment();
  console.log(`contracts has been deployed ,address is ${fundMe.target}`);

  if (hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_APIKEY) {
    console.log(`wait for 5 block `);
    await fundMe.deploymentTransaction().wait(5);

    //verify FundMe
    await hre.run("verify:verify", {
      address: fundMe.target,
      constructorArguments: [LOCK_TIME, dateFeedAddr],
    });
  } else {
    console.log(`network is local ,verify is skipped...`);
  }
});

module.exports = {};
