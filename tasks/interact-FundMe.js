const { task } = require("hardhat/config");
const { LOCK_TIME, networksConfig } = require("../helper-hardhat-config");
task("interact-FundMe", "调用fundMe 的 函数")
  .addParam("addr", "fundMe contracts address")
  .setAction(async (taskArg, hre) => {
    const [firstAccount, secoundAccount] = await ethers.getSigners();
    const fundMeFactory = await ethers.getContractFactory("FundMe");
    const fundMe = (await fundMeFactory).attach(taskArg.addr);

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
    const secoundAccountBal = await fundMe.fundersMapping(
      secoundAccount.address
    );
    console.log(`${firstAccount.address}balance is :${firstAccountBal}`);
    console.log(`${secoundAccount.address}balance is :${secoundAccountBal}`);
  });

module.exports = {};
