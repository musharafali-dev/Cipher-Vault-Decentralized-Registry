// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DecentralizedRecordRegistry
 * @dev Enterprise-grade, gas-optimized and security-hardened smart contract for managing decentralized record metadata.
 * Implements OpenZeppelin AccessControl, Pausable circuit-breakers, ReentrancyGuard, and DoS input boundary protections.
 */
contract DecentralizedRecordRegistry is Ownable, AccessControl, Pausable, ReentrancyGuard {
    // Access Control Roles
    bytes32 public constant SECURITY_ADMIN_ROLE = keccak256("SECURITY_ADMIN_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    // Input Boundary Safety Limits to Prevent Gas Griefing / DoS Attacks
    uint256 public constant MAX_TITLE_LENGTH = 128;
    uint256 public constant MAX_CATEGORY_LENGTH = 64;
    uint256 public constant MAX_CONTENT_HASH_LENGTH = 256;
    uint256 public constant COOLDOWN_PERIOD = 3 seconds;

    /// @notice Record data structure stored on-chain
    struct Record {
        bytes32 id;
        address owner;
        string title;
        string contentHash;
        string category;
        uint256 createdAt;
        uint256 updatedAt;
        bool isActive;
    }

    /// @notice Temporary Access Delegation struct
    struct Delegation {
        address delegatee;
        uint256 expiresAt;
        bool canModify;
    }

    // Custom Errors for Gas Optimization & Explicit Failures
    error RecordNotFound(bytes32 recordId);
    error NotRecordOwner(bytes32 recordId, address caller);
    error InvalidInput(string parameterName);
    error RecordAlreadyExists(bytes32 recordId);
    error RecordIsInactive(bytes32 recordId);
    error InputExceedsLimit(string parameterName, uint256 maxLength);
    error RateLimitExceeded(address caller, uint256 nextAllowedTime);
    error DelegationExpired(bytes32 recordId, address delegatee);
    error UnauthorizedAccess(bytes32 recordId, address caller);

    // State Variables
    mapping(bytes32 => Record) private _records;
    mapping(address => bytes32[]) private _userRecordIds;
    mapping(bytes32 => uint256) private _userRecordIndex;
    mapping(address => uint256) private _lastActionTimestamp;
    mapping(bytes32 => mapping(address => Delegation)) private _recordDelegations;
    bytes32[] private _allRecordIds;

    // Events
    event RecordCreated(
        bytes32 indexed id,
        address indexed owner,
        string title,
        string category,
        uint256 timestamp
    );

    event RecordUpdated(
        bytes32 indexed id,
        address indexed owner,
        string title,
        string category,
        uint256 timestamp
    );

    event RecordDeleted(
        bytes32 indexed id,
        address indexed owner,
        uint256 timestamp
    );

    event AccessDelegated(
        bytes32 indexed recordId,
        address indexed delegatee,
        uint256 expiresAt,
        bool canModify
    );

    event AccessRevoked(
        bytes32 indexed recordId,
        address indexed delegatee
    );

    event SecurityAlert(
        string alertType,
        address indexed triggerer,
        uint256 timestamp
    );

    /**
     * @dev Initializes contract setting deployer as initial owner and super admin.
     */
    constructor() Ownable(msg.sender) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(SECURITY_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(AUDITOR_ROLE, msg.sender);
    }

    /**
     * @notice Emergency Circuit Breaker: Pause contract operations
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
        emit SecurityAlert("CONTRACT_PAUSED", msg.sender, block.timestamp);
    }

    /**
     * @notice Emergency Circuit Breaker: Unpause contract operations
     */
    function unpause() external onlyRole(SECURITY_ADMIN_ROLE) {
        _unpause();
        emit SecurityAlert("CONTRACT_UNPAUSED", msg.sender, block.timestamp);
    }

    /**
     * @notice Create a new decentralized record
     * @param id Unique 32-byte identifier for the record
     * @param title Title or headline of the record
     * @param contentHash IPFS CID or cryptographic hash of the record data
     * @param category Category classification (e.g. "Legal", "Medical", "Financial", "General")
     */
    function createRecord(
        bytes32 id,
        string calldata title,
        string calldata contentHash,
        string calldata category
    ) external whenNotPaused nonReentrant {
        if (id == bytes32(0)) revert InvalidInput("id");
        if (bytes(title).length == 0) revert InvalidInput("title");
        if (bytes(title).length > MAX_TITLE_LENGTH) revert InputExceedsLimit("title", MAX_TITLE_LENGTH);
        if (bytes(contentHash).length == 0) revert InvalidInput("contentHash");
        if (bytes(contentHash).length > MAX_CONTENT_HASH_LENGTH) revert InputExceedsLimit("contentHash", MAX_CONTENT_HASH_LENGTH);
        if (bytes(category).length > MAX_CATEGORY_LENGTH) revert InputExceedsLimit("category", MAX_CATEGORY_LENGTH);
        if (_records[id].id != bytes32(0)) revert RecordAlreadyExists(id);

        if (block.timestamp < _lastActionTimestamp[msg.sender] + COOLDOWN_PERIOD) {
            revert RateLimitExceeded(msg.sender, _lastActionTimestamp[msg.sender] + COOLDOWN_PERIOD);
        }

        _lastActionTimestamp[msg.sender] = block.timestamp;

        Record memory newRecord = Record({
            id: id,
            owner: msg.sender,
            title: title,
            contentHash: contentHash,
            category: category,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            isActive: true
        });

        _records[id] = newRecord;
        _allRecordIds.push(id);
        _userRecordIndex[id] = _userRecordIds[msg.sender].length;
        _userRecordIds[msg.sender].push(id);

        emit RecordCreated(id, msg.sender, title, category, block.timestamp);
    }

    /**
     * @notice Update an existing decentralized record owned by the caller or authorized delegatee
     * @param id Unique 32-byte identifier of the record
     * @param title New title
     * @param contentHash New content hash or IPFS CID
     * @param category New category classification
     */
    function updateRecord(
        bytes32 id,
        string calldata title,
        string calldata contentHash,
        string calldata category
    ) external whenNotPaused nonReentrant {
        Record storage record = _records[id];

        if (record.id == bytes32(0)) revert RecordNotFound(id);
        if (!record.isActive) revert RecordIsInactive(id);
        
        bool isOwner = (record.owner == msg.sender);
        Delegation memory del = _recordDelegations[id][msg.sender];
        bool isDelegateValid = (del.delegatee == msg.sender && del.canModify && del.expiresAt > block.timestamp);

        if (!isOwner && !isDelegateValid) {
            revert NotRecordOwner(id, msg.sender);
        }

        if (bytes(title).length == 0) revert InvalidInput("title");
        if (bytes(title).length > MAX_TITLE_LENGTH) revert InputExceedsLimit("title", MAX_TITLE_LENGTH);
        if (bytes(contentHash).length == 0) revert InvalidInput("contentHash");
        if (bytes(contentHash).length > MAX_CONTENT_HASH_LENGTH) revert InputExceedsLimit("contentHash", MAX_CONTENT_HASH_LENGTH);
        if (bytes(category).length > MAX_CATEGORY_LENGTH) revert InputExceedsLimit("category", MAX_CATEGORY_LENGTH);

        record.title = title;
        record.contentHash = contentHash;
        record.category = category;
        record.updatedAt = block.timestamp;

        emit RecordUpdated(id, record.owner, title, category, block.timestamp);
    }

    /**
     * @notice Soft-delete a record owned by the caller or admin
     * @param id Unique 32-byte identifier of the record
     */
    function deleteRecord(bytes32 id) external whenNotPaused nonReentrant {
        Record storage record = _records[id];

        if (record.id == bytes32(0)) revert RecordNotFound(id);
        if (!record.isActive) revert RecordIsInactive(id);
        if (record.owner != msg.sender && owner() != msg.sender && !hasRole(SECURITY_ADMIN_ROLE, msg.sender)) {
            revert NotRecordOwner(id, msg.sender);
        }

        record.isActive = false;
        record.updatedAt = block.timestamp;

        emit RecordDeleted(id, record.owner, block.timestamp);
    }

    /**
     * @notice Delegate temporary modification or read access for a record to a delegatee address
     * @param id Record identifier
     * @param delegatee Address being granted access
     * @param durationSeconds Duration of delegation validity in seconds
     * @param canModify Whether delegatee can modify record details
     */
    function grantTemporaryAccess(
        bytes32 id,
        address delegatee,
        uint256 durationSeconds,
        bool canModify
    ) external whenNotPaused nonReentrant {
        Record storage record = _records[id];
        if (record.id == bytes32(0)) revert RecordNotFound(id);
        if (record.owner != msg.sender) revert NotRecordOwner(id, msg.sender);
        if (delegatee == address(0)) revert InvalidInput("delegatee");

        uint256 expiresAt = block.timestamp + durationSeconds;
        _recordDelegations[id][delegatee] = Delegation({
            delegatee: delegatee,
            expiresAt: expiresAt,
            canModify: canModify
        });

        emit AccessDelegated(id, delegatee, expiresAt, canModify);
    }

    /**
     * @notice Revoke temporary access for a delegatee address
     */
    function revokeTemporaryAccess(bytes32 id, address delegatee) external whenNotPaused nonReentrant {
        Record storage record = _records[id];
        if (record.id == bytes32(0)) revert RecordNotFound(id);
        if (record.owner != msg.sender) revert NotRecordOwner(id, msg.sender);

        delete _recordDelegations[id][delegatee];
        emit AccessRevoked(id, delegatee);
    }

    /**
     * @notice Check delegation validity for a given record and address
     */
    function checkDelegation(bytes32 id, address delegatee) external view returns (bool isValid, bool canModify, uint256 expiresAt) {
        Delegation memory del = _recordDelegations[id][delegatee];
        if (del.delegatee == delegatee && del.expiresAt > block.timestamp) {
            return (true, del.canModify, del.expiresAt);
        }
        return (false, false, 0);
    }

    /**
     * @notice Retrieve record details by ID
     * @param id Unique 32-byte identifier of the record
     * @return Record struct containing record details
     */
    function getRecord(bytes32 id) external view returns (Record memory) {
        Record memory record = _records[id];
        if (record.id == bytes32(0)) revert RecordNotFound(id);
        return record;
    }

    /**
     * @notice Get all record IDs created by a specific wallet address
     * @param user Target wallet address
     * @return Array of record bytes32 IDs
     */
    function getUserRecords(address user) external view returns (bytes32[] memory) {
        return _userRecordIds[user];
    }

    /**
     * @notice Fetch all full Record structs belonging to a specific user
     * @param user Target wallet address
     * @return Array of Record structs
     */
    function getUserRecordsDetailed(address user) external view returns (Record[] memory) {
        bytes32[] memory ids = _userRecordIds[user];
        uint256 activeCount = 0;

        for (uint256 i = 0; i < ids.length; i++) {
            if (_records[ids[i]].isActive) {
                activeCount++;
            }
        }

        Record[] memory userRecs = new Record[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            if (_records[ids[i]].isActive) {
                userRecs[index] = _records[ids[i]];
                index++;
            }
        }

        return userRecs;
    }

    /**
     * @notice Fetch all active records stored in the registry
     * @return Array of active Record structs
     */
    function getAllRecords() external view returns (Record[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < _allRecordIds.length; i++) {
            if (_records[_allRecordIds[i]].isActive) {
                activeCount++;
            }
        }

        Record[] memory activeRecords = new Record[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < _allRecordIds.length; i++) {
            if (_records[_allRecordIds[i]].isActive) {
                activeRecords[index] = _records[_allRecordIds[i]];
                index++;
            }
        }

        return activeRecords;
    }

    /**
     * @notice Get total count of all records created (including inactive ones)
     * @return Total count of record IDs stored
     */
    function getRecordCount() external view returns (uint256) {
        return _allRecordIds.length;
    }
}
