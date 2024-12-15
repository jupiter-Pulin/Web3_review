const { assert, expect } = require("chai");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const { LOCK_TIME, localChianId } = require("../helper-hardhat-config");

!localChianId.includes(network.name)
  ? describe.skip
  : describe("测试全局变量", async function () {
      let FundMe;
      let firstAccount;
      let MockV3Aggregator;
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

        MockV3Aggregator = await deployments.get("MockV3Aggregator");
      });
      it("test dateFeedAddr is equal with local dateFeedAddr", async function () {
        assert.equal(await FundMe.dateFeedsAddr(), MockV3Aggregator.address);
        // expect(FundMe.dateFeedsAddr()).to.equal(MockV3Aggregator.address);
      });
      it("test msg.sender is owner", async function () {
        assert.equal(await FundMe.owner(), firstAccount);
      });

      //fund 函数
      it("fund ETH is less than system require", async function () {
        await expect(
          FundMe.fund({ value: ethers.parseEther("0.00000000000001") })
        ).to.be.revertedWith("send more ETH");
      });

      it("window is closed ,but still fund ETH", async function () {
        await helpers.time.increase(LOCK_TIME + 1);
        await helpers.mine();
        await expect(
          FundMe.fund({ value: ethers.parseEther("0.0003") })
        ).to.be.revertedWith("payable is out of time");
      });
      it("检查fundersMapping是否已经更新", async function () {
        await FundMe.fund({ value: ethers.parseEther("0.3") });
        assert(
          await FundMe.fundersMapping(firstAccount),
          ethers.parseEther("0.3")
        );
      });

      //getEthToOwner 函数
      it("msg.sender is not contract owner", async function () {
        await FundMe.connect(await ethers.getSigner(secoundAccount)).fund({
          value: ethers.parseEther("1"),
        });
        await helpers.time.increase(LOCK_TIME + 1);
        await helpers.mine();

        await expect(
          FundMe.connect(await ethers.getSigner(secoundAccount)).getEthToOwner()
        ).to.be.revertedWith("you are not owner");
      });
      it("called getEthToOwner when fund function is still working..", async function () {
        await FundMe.fund({ value: ethers.parseEther("0.0003") });
        await expect(FundMe.getEthToOwner()).to.be.revertedWith(
          "payable is not on time"
        );
      });
      it("fund money is not on target", async function () {
        await FundMe.fund({ value: ethers.parseEther("0.003") });

        await helpers.time.increase(LOCK_TIME + 1);
        await helpers.mine();

        await expect(FundMe.getEthToOwner()).to.be.revertedWith(
          "not fund enough money"
        );
      });
      it("检查权限者是否收到提款额", async function () {
        await FundMe.fund({ value: ethers.parseEther("0.3") });

        await helpers.time.increase(LOCK_TIME + 1);
        await helpers.mine();

        expect(await FundMe.getEthToOwner())
          .to.emit(FundMe, "getEthtoOwnerEvent")
          .withArgs(ethers.parseEther("0.3"));
      });

      //getEthToFunder 函数
      it("called getEthToFunder when fund function is still working..", async function () {
        await FundMe.fund({ value: ethers.parseEther("0.0003") });
        await expect(FundMe.getEthToFunder()).to.be.revertedWith(
          "payable is not on time"
        );
      });
      it("fund money is on target,but still call getEthToFunder function ", async function () {
        await FundMe.fund({ value: ethers.parseEther("3") });

        await helpers.time.increase(LOCK_TIME + 1);
        await helpers.mine();

        await expect(FundMe.getEthToFunder()).to.be.revertedWith(
          "fund enough money on target,pleace wait owner use"
        );
      });
      it("check msg.sender mapping is not 0", async function () {
        await FundMe.connect(await ethers.getSigner(secoundAccount)).fund({
          value: ethers.parseEther("0.001"),
        });
        await helpers.time.increase(LOCK_TIME + 1);
        await helpers.mine();

        await expect(FundMe.getEthToFunder()).to.be.revertedWith(
          "your balance is 0"
        );
      });
      it("看看最终funderMapping函数是否清零", async function () {
        await FundMe.fund({ value: ethers.parseEther("0.003") });
        await helpers.time.increase(LOCK_TIME + 1);
        await helpers.mine();

        expect(await FundMe.getEthToFunder())
          .to.emit(FundMe, "getEthToFunderEvent")
          .withArgs(firstAccount, FundMe.fundersMapping(firstAccount));
      });
    });
