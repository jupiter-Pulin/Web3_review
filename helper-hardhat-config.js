const LOCK_TIME = 180;
const localChianId = ["hardhat", "local"];
const decimals = 8;
const _initialAnswer = 379900000000;
const CONFIRMATION = 5; //等待的区块个数
networksConfig = {
  11155111: {
    ethToUsdAddr: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
  },
  80002: {
    ethToUsdAddr: "0xF0d50568e3A7e8259E16663972b11910F89BD8e7",
  },
};
module.exports = {
  LOCK_TIME,
  localChianId,
  networksConfig,
  decimals,
  _initialAnswer,
  CONFIRMATION,
};
