// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// 导入 dateFeed 合约，转换 ETH
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract FundMe {
    AggregatorV3Interface public dateFeedsAddr;
    uint256 LOCK_TIME;
    uint256 deployBlockTime;
    mapping (address => uint256) public fundersMapping;
    uint256 constant MIN_VALUE = 1 * 10 ** 18;
    address public owner;
    uint256 constant TARGET = 100 * 10 ** 18;
    address fundMeTokenAddr;
    bool public getEthToOwnerSucess=false;
    
    //写个事件
    event getEthtoOwnerEvent(uint256);
    event getEthToFunderEvent(address,uint256);

    constructor(uint256 _lockTime,address _dateFeedsAddr) {
        LOCK_TIME = _lockTime;
        deployBlockTime = block.timestamp;
        owner = msg.sender;
        dateFeedsAddr = AggregatorV3Interface(_dateFeedsAddr);
    }

    // 创建一个收款函数，让参与者在限定时间内募款,且有最小值
    function fund() public payable {
        require(block.timestamp < deployBlockTime + LOCK_TIME, "payable is out of time");
        require(EthToUsd(msg.value) >= MIN_VALUE, "send more ETH");
        fundersMapping[msg.sender] += msg.value;
    }

    // 设定一个目标值，使达到目标且到达规定时间后 权限者能够提款
    function getEthToOwner() external  onlyOwner {
        require(block.timestamp > deployBlockTime + LOCK_TIME, "payable is not on time");
        require(EthToUsd(address(this).balance) >= TARGET, "not fund enough money");
        uint256 balanceOf=address(this).balance;
        bool success;
        (success, ) = payable(msg.sender).call{value: balanceOf}("");
        
        require(success, "Transfer failed.");
        getEthToOwnerSucess=true;
        emit getEthtoOwnerEvent(balanceOf);
    }

    // 未到目标，且到达规定时间，参与者自行提款
    function getEthToFunder() external {
    require(block.timestamp > deployBlockTime + LOCK_TIME, "payable is not on time");
    require(EthToUsd(address(this).balance) <= TARGET, "fund enough money on target,pleace wait owner use");
    require(fundersMapping[msg.sender] != 0, "your balance is 0");
    
    uint256 amount = fundersMapping[msg.sender];
    fundersMapping[msg.sender] = 0;
    
    (bool success, ) = payable(msg.sender).call{value: amount}("");
    require(success, "Transfer failed.");

    emit getEthToFunderEvent(msg.sender,fundersMapping[msg.sender]);
}


    // 更换地址拥有权
    function tranferOwnership(address newOwner) public onlyOwner {
        owner = newOwner;
    }

    // eth/美元的实时价格
    function getChainlinkDataFeedLatestAnswer() public view returns (int) {
        (
            , // uint80 roundID
            int answer,
            , // uint startedAt
            , // uint timeStamp
            // uint80 answeredInRound
        ) = dateFeedsAddr.latestRoundData();
        return answer;
    }

    // 将单位转为美元而不是 wei
    function EthToUsd(uint256 _amount) internal view returns (uint256) {
        uint256 EthPrice = uint256(getChainlinkDataFeedLatestAnswer());
        return _amount * EthPrice / 10 ** 8;
    }

    //在锻造mint后，fundersMapping需要相对应减少，且只能fundMeToken这个合约才有资格调用
    function adjustFundersMapping (address funder,uint256 _amount) external{
      require(msg.sender==fundMeTokenAddr,"you don't have premisson");
      fundersMapping[funder]-=_amount;
    }
    
    function setFundMeTokenAddr(address _fundMeTokenAddr) public onlyOwner{
        fundMeTokenAddr=_fundMeTokenAddr;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "you are not owner");
        _;
    }
}
