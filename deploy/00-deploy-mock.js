const {
  decimals,
  localChianId,
  _initialAnswer,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { firstAccount } = await getNamedAccounts();
  if (localChianId.includes(network.name)) {
    await deploy("MockV3Aggregator", {
      from: firstAccount,
      args: [decimals, _initialAnswer],
      log: true,
    });
  } else {
    console.log(`Not in local ,the mockContract is skipeed...`);
  }
};

module.exports.tags = ["all"];
