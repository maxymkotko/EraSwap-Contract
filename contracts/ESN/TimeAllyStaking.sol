// SPDX-License-Identifier: MIT

pragma solidity ^0.6.10;
pragma experimental ABIEncoderV2;

import "../lib/SafeMath.sol";
import "./NRTManager.sol";
import "./TimeAllyManager.sol";
import "./ValidatorManager.sol";
import "./PrepaidEs.sol";
import "./PrepaidEsReceiver.sol";

contract TimeAllyStaking is PrepaidEsReceiver {
    using SafeMath for uint256;

    struct Delegation {
        address platform;
        address delegatee;
        uint256 amount;
    }

    NRTManager public nrtManager;
    TimeAllyManager public timeAllyManager;
    ValidatorManager public validatorManager;

    address public owner;
    uint256 public timestamp; // TODO is this required?
    uint256 public startMonth;
    uint256 public endMonth;
    uint256 public issTimeLimit;
    uint256 public issTimeTimestamp;
    uint256 public issTimeTakenValue;
    uint256 public lastIssTimeMonth;

    mapping(uint256 => uint256) topups; // @dev topups will be applicable since next month
    mapping(uint256 => bool) claimedMonths;
    mapping(uint256 => Delegation[]) delegations;

    event Topup(uint256 amount, address benefactor);
    event Claim(uint256 month, uint256 amount, TimeAllyManager.RewardType rewardType);

    modifier onlyOwner() {
        require(msg.sender == owner, "TAStaking: Only staker can call");
        _;
    }

    constructor(address _owner, bool[] memory _claimedMonths) public payable {
        timeAllyManager = TimeAllyManager(msg.sender);

        // TODO: Switch to always querying the contract address from
        //       parent to enable a possible migration.
        nrtManager = NRTManager(timeAllyManager.nrtManager());
        validatorManager = ValidatorManager(timeAllyManager.validatorManager());

        owner = _owner;
        timestamp = now;

        uint256 _currentMonth = nrtManager.currentNrtMonth();
        startMonth = _currentMonth + 1;

        uint256 _defaultMonths = timeAllyManager.defaultMonths();
        if (_claimedMonths.length > _defaultMonths) {
            _defaultMonths = _claimedMonths.length;
        }
        endMonth = startMonth + _defaultMonths - 1;

        for (uint256 i = 0; i < _claimedMonths.length; i++) {
            if (_claimedMonths[i]) {
                claimedMonths[startMonth + i] = _claimedMonths[i];
            }
        }

        topups[_currentMonth] = msg.value;
    }

    receive() external payable {
        _stakeTopUp(msg.value);
    }

    function prepaidFallback(address, uint256 _value) public override returns (bool) {
        PrepaidEs prepaidEs = timeAllyManager.prepaidEs();
        require(msg.sender == address(prepaidEs), "TAStaking: Only prepaidEs contract can call");
        prepaidEs.transfer(address(timeAllyManager), _value);

        return true;
    }

    function delegate(
        address _platform,
        address _delegatee,
        uint256 _amount,
        uint256[] memory _months
    ) public onlyOwner {
        require(_platform != address(0), "TAStaking: Cant delegate on zero");
        require(_delegatee != address(0), "TAStaking: Cant delegate to zero");
        uint256 _currentMonth = nrtManager.currentNrtMonth();

        for (uint256 i = 0; i < _months.length; i++) {
            require(_months[i] > _currentMonth, "TAStaking: Only future months");

            Delegation[] storage monthlyDelegation = delegations[_months[i]];
            uint256 _alreadyDelegated;

            uint256 _delegationIndex;
            for (; _delegationIndex < monthlyDelegation.length; _delegationIndex++) {
                _alreadyDelegated = _alreadyDelegated.add(
                    monthlyDelegation[_delegationIndex].amount
                );
                if (
                    _platform == monthlyDelegation[_delegationIndex].platform &&
                    _delegatee == monthlyDelegation[_delegationIndex].delegatee
                ) {
                    break;
                }
            }
            require(
                _amount.add(_alreadyDelegated) <= getPrincipalAmount(_months[i]),
                "TAStaking: delegate overflow"
            );
            if (_delegationIndex == monthlyDelegation.length) {
                monthlyDelegation.push(
                    Delegation({ platform: _platform, delegatee: _delegatee, amount: _amount })
                );
            } else {
                monthlyDelegation[_delegationIndex].amount = monthlyDelegation[_delegationIndex]
                    .amount
                    .add(_amount);
            }

            validatorManager.addDelegation(_months[i], _delegationIndex, _amount);
        }
    }

    function withdrawMonthlyNRT(uint256[] memory _months, TimeAllyManager.RewardType _rewardType)
        public
        onlyOwner
    {
        uint256 _currentMonth = nrtManager.currentNrtMonth();

        uint256 _unclaimedReward;

        for (uint256 i = 0; i < _months.length; i++) {
            uint256 _month = _months[i];
            require(_month <= _currentMonth, "TAStaking: NRT for the month is not released");
            require(_month <= endMonth, "TAStaking: Month cannot be higher than end of staking");
            require(_month >= startMonth, "TAStaking: Month cannot be lower than start of staking");
            require(!claimedMonths[_month], "TAStaking: Month is already claimed");

            if (_month == _currentMonth) {
                require(issTimeTimestamp == 0, "TAStaking: Cannot withdraw when IssTime active");
            }

            claimedMonths[_month] = true;
            uint256 _reward = getMonthlyReward(_month);
            _unclaimedReward = _unclaimedReward.add(_reward);

            emit Claim(_month, _reward, _rewardType);
        }

        // communicate TimeAlly manager to process _unclaimedReward
        timeAllyManager.processNrtReward(_unclaimedReward, _rewardType);
    }

    function increaseIssTime(uint256 _increaseValue) external {
        require(
            msg.sender == address(timeAllyManager),
            "TAStaking: Only TimeAlly Manager can call"
        );

        issTimeLimit = issTimeLimit.add(_increaseValue);
    }

    function startIssTime(uint256 _value, bool _destroy) public onlyOwner {
        require(_value > 0, "TAStaking: Loan amount should be non-zero");
        require(_value <= getTotalIssTime(_destroy), "TAStaking: Value exceeds IssTime Limit");
        uint256 _currentMonth = nrtManager.currentNrtMonth();
        require(!claimedMonths[_currentMonth], "TAStaking: Can't IssTime if current month claimed");
        require(issTimeTimestamp == 0, "TAStaking: IssTime already started");
        require(
            lastIssTimeMonth < _currentMonth,
            "TAStaking: Cannot IssTime twice in single month"
        );
        if (!_destroy) {
            require(
                _currentMonth < endMonth,
                "TAStaking: Cannot IssTime without destroying on and after endMonth"
            );
        }

        issTimeTimestamp = now;
        issTimeTakenValue = _value;
        lastIssTimeMonth = _currentMonth;

        (bool _success, ) = owner.call{ value: _value }("");
        require(_success, "TAStaking: IssTime liquid transfer is failing");

        if (_destroy) {
            _destroyStaking();
        }
    }

    function submitIssTime() public payable {
        uint256 _interest = getIssTimeInterest();
        uint256 _submitValue = issTimeTakenValue.add(_interest);
        require(msg.value >= _submitValue, "TAStaking: Insufficient IssTime submit value");
        uint256 _currentMonth = nrtManager.currentNrtMonth();
        require(
            lastIssTimeMonth == _currentMonth,
            "TAStaking: Cannot submit IssTime after NRT release"
        );

        issTimeTimestamp = 0;
        issTimeTakenValue = 0;

        uint256 _exceedValue = _submitValue.sub(msg.value);
        if (_exceedValue > 0) {
            (bool _success, ) = msg.sender.call{ value: _exceedValue }("");
            require(_success, "TAStaking: Exceed value transfer is failing");
        }
    }

    function reportIssTime() public {
        require(issTimeTimestamp != 0, "TAStaking: IssTime not started");
        if (msg.sender != owner) {
            uint256 _currentMonth = nrtManager.currentNrtMonth();
            require(_currentMonth > lastIssTimeMonth, "TAStaking: Month not elapsed for reporting");
        }

        uint256 _principal = getPrincipalAmount(lastIssTimeMonth + 1);
        uint256 _incentive = _principal.div(100);

        /// @dev To prevent re-entrancy
        issTimeTimestamp = 0;

        {
            (bool _success, ) = msg.sender.call{ value: _incentive }("");
            require(_success, "TAStaking: Incentive transfer is failing");
        }

        _destroyStaking();
    }

    function _destroyStaking() private {
        uint256 _balance = address(this).balance;
        if (_balance > 0) {
            nrtManager.addToBurnPool{ value: _balance }();
        }
        // @TODO: subtract months from timeally total stakings
        timeAllyManager.emitStakingTransfer(owner, address(0));
        selfdestruct(address(0));
    }

    function transferOwnership(address _newOwner) public onlyOwner {
        address _oldOwner = owner;
        owner = _newOwner;
        timeAllyManager.emitStakingTransfer(_oldOwner, _newOwner);
    }

    function getMonthlyReward(uint256 _month) public view returns (uint256) {
        uint256 _totalActiveStaking = timeAllyManager.getTotalActiveStaking(_month);
        uint256 _timeallyNrtReleased = timeAllyManager.getTimeAllyMonthlyNRT(_month);

        return getPrincipalAmount(_month).mul(_timeallyNrtReleased).div(_totalActiveStaking);
    }

    function _stakeTopUp(uint256 _topupAmount) private {
        uint256 _currentMonth = nrtManager.currentNrtMonth();
        topups[_currentMonth] += _topupAmount;

        emit Topup(_topupAmount, msg.sender);
        timeAllyManager.increaseActiveStaking(_topupAmount, endMonth);
    }

    function getPrincipalAmount(uint256 _month) public view returns (uint256) {
        if (_month > endMonth) {
            return 0;
        }

        uint256 _principalAmount;

        for (uint256 i = startMonth - 1; i < _month; i++) {
            _principalAmount += topups[i];
        }

        return _principalAmount;
    }

    function nextMonthPrincipalAmount() public view returns (uint256) {
        uint256 _currentMonth = nrtManager.currentNrtMonth();
        return getPrincipalAmount(_currentMonth + 1);
    }

    function isMonthClaimed(uint256 _month) public view returns (bool) {
        return claimedMonths[_month];
    }

    function getDelegations(uint256 _month) public view returns (Delegation[] memory) {
        return delegations[_month];
    }

    function getDelegation(uint256 _month, uint256 _delegationIndex)
        public
        view
        returns (Delegation memory)
    {
        return delegations[_month][_delegationIndex];
    }

    function getTotalIssTime(bool _destroy) public view returns (uint256) {
        uint256 _limit = issTimeLimit;
        // @TODO add percentage from the dayswapper, apply it to contract balance

        uint256 _cap = address(this).balance;
        if (!_destroy) {
            _cap = _cap.mul(97).div(100);
        }

        if (_limit > _cap) {
            _limit = _cap.mul(97).div(100);
        }

        return _limit;
    }

    function getIssTimeInterest() public view onlyOwner returns (uint256) {
        require(issTimeTimestamp != 0, "TAStaking: IssTime not started");

        uint256 _daysCount = ((now - issTimeTimestamp) % 1 days) + 1;
        return issTimeTakenValue.div(1000).mul(_daysCount);
    }
}
