// 引入ethers contracts

const { ethers } = require("hardhat");

async function main() {
  const [firstAccount, secoundAccount] = await ethers.getSigners();

  console.log(`your contracts deploying ...`);

  const fundMeFactory = await ethers.getContractFactory("FundMe");
  const fundMe = await fundMeFactory.deploy(300);

  await fundMe.waitForDeployment();
  console.log(`contracts has been deployed ,address is ${fundMe.target}`);

  if (hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_APIKEY) {
    console.log(`wait for 5 block `);
    await fundMe.deploymentTransaction().wait(5);

    //verify FundMe
    await hre.run("verify:verify", {
      address: fundMe.target,
      constructorArguments: [300],
    });
  } else {
    console.log(`network is local ,verify is skipped...`);
  }
  //第一次fund
  const fundTx = await fundMe.fund({ value: ethers.parseEther("0.01") });
  await fundTx.wait();
  const contractBalance = await ethers.provider.getBalance(fundMe.target);
  console.log(
    `address: ${firstAccount.address} has called fund ,this contracts banlance is: ${contractBalance}`
  );
  //第二次fund
  const fundSecountAccTx = await fundMe.connect(secoundAccount).fund({
    value: ethers.parseEther("0.02"),
  });
  await fundSecountAccTx.wait();
  const contractBalance02 = await ethers.provider.getBalance(fundMe.target);
  console.log(
    `address: ${secoundAccount.address} has called fund ,this contracts banlance is: ${contractBalance02}`
  );

  //check mapping
  const firstAccountBal = await fundMe.fundersMapping(firstAccount.address);
  const secoundAccountBal = await fundMe.fundersMapping(secoundAccount.address);
  console.log(`${firstAccount.address}balance is :${firstAccountBal}`);
  console.log(`${secoundAccount.address}balance is :${secoundAccountBal}`);
}

main()
  .then()
  .catch((error) => {
    console.error(error);
    process.exit(0);
  });
