const { assert, expect } = require("chai");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const { localChianId } = require("../../helper-hardhat-config");

localChianId.includes(network.name)
  ? describe.skip
  : describe("测试几个payable函数的正常使用", async function () {
      let FundMe;
      let firstAccount;
      let secoundAccount;

      beforeEach(async function () {
        await deployments.fixture(["all"]);
        firstAccount = (await getNamedAccounts()).firstAccount;
        secoundAccount = (await getNamedAccounts()).secoundAccount;

        const fundmeDeployments = await deployments.get("FundMe");
        FundMe = await ethers.getContractAt(
          "FundMe",
          fundmeDeployments.address
        );
      });
      it("fund and getEthToOwner", async function () {
        await FundMe.fund({ value: ethers.parseEther("0.3") });
        await new Promise((resolve) => setTimeout(resolve, 181 * 1000));

        const getOwnerTx = await FundMe.getEthToOwner();
        const getOwnerReceipt = await getOwnerTx.wait();

        expect(getOwnerReceipt)
          .to.emit(FundMe, "getEthtoOwnerEvent")
          .withArgs(ethers.parseEther("0.3"));
      });

      it("fund and getEthToFunder", async function () {
        await FundMe.connect(await ethers.getSigner(secoundAccount)).fund({
          value: ethers.parseEther("0.0001"),
        });
        await new Promise((resolve) => setTimeout(resolve, 181 * 1000));

        const getFunderTx = await FundMe.connect(
          await ethers.getSigner(secoundAccount)
        ).getEthToFunder();
        const getFunderReceipt = await getFunderTx.wait();

        expect(getFunderReceipt)
          .to.emit(FundMe, "getEthToFunderEvent")
          .withArgs(secoundAccount, ethers.parseEther("0.001"));
      });
    });
