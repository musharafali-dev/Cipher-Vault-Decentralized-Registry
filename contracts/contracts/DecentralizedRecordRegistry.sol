// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DecentralizedRecordRegistry
 * @dev Secure, gas-optimized smart contract for managing decentralized record metadata and IPFS content hashes.
 * Implements OpenZeppelin Ownable for access management and ReentrancyGuard for transactional safety.
 */
contract DecentralizedRecordRegistry is Ownable, ReentrancyGuard {
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

    // Custom Errors for Gas Optimization & Explicit Failures
    error RecordNotFound(bytes32 recordId);
    error NotRecordOwner(bytes32 recordId, address caller);
    error InvalidInput(string parameterName);
    error RecordAlreadyExists(bytes32 recordId);
    error RecordIsInactive(bytes32 recordId);

    // State Variables
    mapping(bytes32 => Record) private _records;
    mapping(address => bytes32[]) private _userRecordIds;
    mapping(bytes32 => uint256) private _userRecordIndex;
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

    /**
     * @dev Initializes contract setting deployer as initial owner.
     */
    constructor() Ownable(msg.sender) {}

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
    ) external nonReentrant {
        if (id == bytes32(0)) revert InvalidInput("id");
        if (bytes(title).length == 0) revert InvalidInput("title");
        if (bytes(contentHash).length == 0) revert InvalidInput("contentHash");
        if (_records[id].id != bytes32(0)) revert RecordAlreadyExists(id);

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
     * @notice Update an existing decentralized record owned by the caller
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
    ) external nonReentrant {
        Record storage record = _records[id];

        if (record.id == bytes32(0)) revert RecordNotFound(id);
        if (!record.isActive) revert RecordIsInactive(id);
        if (record.owner != msg.sender) revert NotRecordOwner(id, msg.sender);
        if (bytes(title).length == 0) revert InvalidInput("title");
        if (bytes(contentHash).length == 0) revert InvalidInput("contentHash");

        record.title = title;
        record.contentHash = contentHash;
        record.category = category;
        record.updatedAt = block.timestamp;

        emit RecordUpdated(id, msg.sender, title, category, block.timestamp);
    }

    /**
     * @notice Soft-delete a record owned by the caller
     * @param id Unique 32-byte identifier of the record
     */
    function deleteRecord(bytes32 id) external nonReentrant {
        Record storage record = _records[id];

        if (record.id == bytes32(0)) revert RecordNotFound(id);
        if (!record.isActive) revert RecordIsInactive(id);
        if (record.owner != msg.sender && owner() != msg.sender) {
            revert NotRecordOwner(id, msg.sender);
        }

        record.isActive = false;
        record.updatedAt = block.timestamp;

        emit RecordDeleted(id, msg.sender, block.timestamp);
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
