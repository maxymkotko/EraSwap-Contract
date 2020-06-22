// SPDX-License-Identifier: MIT

pragma solidity ^0.6.10;

import "./ERC20.sol";
import "../lib/EthParser.sol";
import "../lib/ECVerify.sol";
import "../lib/RLP.sol";
import "../lib/RLPEncode.sol";
import "../lib/Merkle.sol";
import "../lib/MerklePatriciaProof.sol";
import "../lib/BytesLib.sol";
import "../lib/SafeMath.sol";

// this contract will store block headers
contract PlasmaManager {
    using RLP for bytes;
    using RLP for RLP.RLPItem;

    using SafeMath for uint256;

    struct BunchHeader {
        uint256 startBlockNumber;
        uint256 bunchDepth; // number of blocks in bunch is 2^bunchDepth
        bytes32 transactionsMegaRoot;
        bytes32 receiptsMegaRoot;
        bytes32 lastBlockHash;
    }

    /// @dev keeping deployer private since this wallet will be used for onetime
    ///     calling setInitialValues method, after that it has no special role.
    ///     Hence it doesn't make sence creating a method by marking it public.
    address private deployer;

    mapping(address => bool) public isValidator;
    mapping(bytes32 => bool) public processedWithdrawals;
    address[] public validators;
    address[] public signers;
    BunchHeader[] public bunches;

    /// @dev EIP-191 Prepend byte + Version byte
    bytes constant PREFIX = hex"1997";

    /// @dev ESN Testnet ChainID
    bytes32 constant DOMAIN_SEPERATOR = hex"6f3a1e66e989a1cf337b9dd2ce4c98a5e78763cf9f9bdaac5707038c66a4d74e";
    uint256 constant CHAIN_ID = 0x144c;

    /// @dev ESN Mainnet ChainID
    // bytes32 constant DOMAIN_SEPERATOR = hex"e46271463d569b31951a3c222883dd59f9b6ab2887f2ff847aa230eca6d341ae";
    // uint256 constant CHAIN_ID = 0x144d;

    ERC20 public token;

    event NewBunchHeader(uint256 _startBlockNumber, uint256 _bunchDepth, uint256 _bunchIndex);

    constructor() public {
        deployer = msg.sender;
    }

    function setInitialValues(address _token, address[] memory _validators) public {
        require(msg.sender == deployer, "PLASMA: Only deployer can call");

        if (_token != address(0)) {
            require(address(token) == address(0), "PLASMA: Token adrs already set");

            token = ERC20(_token);
        }

        if (_validators.length > 0) {
            require(validators.length == 0, "PLASMA: Validators already set");

            for (uint256 _i = 0; _i < _validators.length; _i++) {
                isValidator[_validators[_i]] = true;
            }
            validators = _validators;
        }
    }

    function getAllValidators() public view returns (address[] memory) {
        return validators;
    }

    function getAllSigners() public view returns (address[] memory) {
        return signers;
    }

    function lastBunchIndex() public view returns (uint256) {
        return bunches.length;
    }

    function submitBunchHeader(bytes memory _signedHeader) public {
        RLP.RLPItem[] memory _fullList = _signedHeader.toRLPItem().toList();
        RLP.RLPItem[] memory _headerArray = _fullList[0].toList();
        require(_headerArray.length == 5, "PLASMA: invalid proposal");

        BunchHeader memory _bunchHeader = BunchHeader({
            startBlockNumber: _headerArray[0].toUint(),
            bunchDepth: _headerArray[1].toUint(),
            transactionsMegaRoot: _headerArray[2].toBytes32(),
            receiptsMegaRoot: _headerArray[3].toBytes32(),
            lastBlockHash: _headerArray[4].toBytes32()
        });

        require(
            _bunchHeader.startBlockNumber == getNextStartBlockNumber(),
            "PLASMA: invalid start block no."
        );

        bytes memory _headerRLP = _fullList[0].toRLPBytes();

        bytes32 _digest = keccak256(abi.encodePacked(PREFIX, DOMAIN_SEPERATOR, _headerRLP));

        uint256 _numberOfValidSignatures;

        for (uint256 i = 1; i < _fullList.length; i++) {
            bytes memory _signature = _fullList[i].toBytes();

            (bool _success, address _signer) = ECVerify.ecrecovery(_digest, _signature);

            require(_success, "PLASMA: ecrecover should success");

            require(isValidator[_signer], "PLASMA: invalid validator sig");

            _numberOfValidSignatures++;
        }

        require(
            _numberOfValidSignatures.mul(3) > validators.length.mul(2),
            "PLASMA: not 66% validators"
        );

        uint256 _bunchIndex = bunches.length;

        bunches.push(_bunchHeader);

        emit NewBunchHeader(_bunchHeader.startBlockNumber, _bunchHeader.bunchDepth, _bunchIndex);
    }

    function getNextStartBlockNumber() public view returns (uint256) {
        if (bunches.length == 0) return 0;
        return
            bunches[bunches.length - 1].startBlockNumber +
            2**bunches[bunches.length - 1].bunchDepth;
    }
}
