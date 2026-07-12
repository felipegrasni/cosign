// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CoSignRegistry {
    uint8 public constant MAX_KIND = 4;
    uint256 public constant MAX_CONTEXT_BYTES = 48;
    uint256 public constant MAX_NOTE_BYTES = 160;
    uint64 public constant MIN_EXPIRY_DELAY = 1 hours;
    uint64 public constant MAX_EXPIRY_DELAY = 30 days;

    struct Handshake {
        uint256 id;
        address creator;
        address signer;
        address intendedSigner;
        uint8 kind;
        string context;
        string note;
        uint64 createdAt;
        uint64 expiresAt;
        uint64 completedAt;
        bool cancelled;
    }

    error InvalidKind();
    error InvalidContext();
    error InvalidNote();
    error InvalidExpiry();
    error SelfTarget();
    error NotFound();
    error NotCreator();
    error SelfSign();
    error WrongSigner();
    error AlreadyCompleted();
    error AlreadyCancelled();
    error Expired();

    event HandshakeCreated(
        uint256 indexed id,
        address indexed creator,
        address indexed intendedSigner,
        uint8 kind,
        uint64 expiresAt
    );
    event HandshakeCosigned(
        uint256 indexed id,
        address indexed creator,
        address indexed signer,
        uint64 completedAt
    );
    event HandshakeCancelled(uint256 indexed id, address indexed creator);

    uint256 public totalHandshakes;
    mapping(uint256 => Handshake) private handshakes;
    mapping(address => uint256) private createdCounts;
    mapping(address => uint256) private signedCounts;
    mapping(address => mapping(uint256 => uint256)) private createdIds;
    mapping(address => mapping(uint256 => uint256)) private signedIds;

    function createHandshake(
        uint8 kind,
        string calldata context,
        string calldata note,
        address intendedSigner,
        uint64 expiresAt
    ) external returns (uint256 id) {
        if (kind > MAX_KIND) revert InvalidKind();
        uint256 contextLength = bytes(context).length;
        if (contextLength == 0 || contextLength > MAX_CONTEXT_BYTES || !_isPrintableAscii(bytes(context))) {
            revert InvalidContext();
        }
        uint256 noteLength = bytes(note).length;
        if (noteLength == 0 || noteLength > MAX_NOTE_BYTES || !_isPrintableAscii(bytes(note))) {
            revert InvalidNote();
        }
        if (
            expiresAt < block.timestamp + MIN_EXPIRY_DELAY ||
            expiresAt > block.timestamp + MAX_EXPIRY_DELAY
        ) revert InvalidExpiry();
        if (intendedSigner == msg.sender) revert SelfTarget();

        id = ++totalHandshakes;
        handshakes[id] = Handshake({
            id: id,
            creator: msg.sender,
            signer: address(0),
            intendedSigner: intendedSigner,
            kind: kind,
            context: context,
            note: note,
            createdAt: uint64(block.timestamp),
            expiresAt: expiresAt,
            completedAt: 0,
            cancelled: false
        });
        uint256 index = createdCounts[msg.sender]++;
        createdIds[msg.sender][index] = id;

        emit HandshakeCreated(id, msg.sender, intendedSigner, kind, expiresAt);
    }

    function cosign(uint256 id) external returns (uint64 completedAt) {
        Handshake storage handshake = _get(id);
        if (handshake.cancelled) revert AlreadyCancelled();
        if (handshake.signer != address(0)) revert AlreadyCompleted();
        if (block.timestamp >= handshake.expiresAt) revert Expired();
        if (msg.sender == handshake.creator) revert SelfSign();
        if (handshake.intendedSigner != address(0) && msg.sender != handshake.intendedSigner) {
            revert WrongSigner();
        }

        completedAt = uint64(block.timestamp);
        handshake.signer = msg.sender;
        handshake.completedAt = completedAt;
        uint256 index = signedCounts[msg.sender]++;
        signedIds[msg.sender][index] = id;

        emit HandshakeCosigned(id, handshake.creator, msg.sender, completedAt);
    }

    function cancelHandshake(uint256 id) external {
        Handshake storage handshake = _get(id);
        if (msg.sender != handshake.creator) revert NotCreator();
        if (handshake.cancelled) revert AlreadyCancelled();
        if (handshake.signer != address(0)) revert AlreadyCompleted();
        if (block.timestamp >= handshake.expiresAt) revert Expired();
        handshake.cancelled = true;
        emit HandshakeCancelled(id, msg.sender);
    }

    function getHandshake(uint256 id) external view returns (Handshake memory) {
        return _getView(id);
    }

    function getCreatedCount(address account) external view returns (uint256) {
        return createdCounts[account];
    }

    function getSignedCount(address account) external view returns (uint256) {
        return signedCounts[account];
    }

    function getCreatedId(address account, uint256 index) external view returns (uint256) {
        if (index >= createdCounts[account]) revert NotFound();
        return createdIds[account][index];
    }

    function getSignedId(address account, uint256 index) external view returns (uint256) {
        if (index >= signedCounts[account]) revert NotFound();
        return signedIds[account][index];
    }

    function _get(uint256 id) private view returns (Handshake storage handshake) {
        if (id == 0 || id > totalHandshakes) revert NotFound();
        handshake = handshakes[id];
    }

    function _getView(uint256 id) private view returns (Handshake memory handshake) {
        if (id == 0 || id > totalHandshakes) revert NotFound();
        handshake = handshakes[id];
    }

    function _isPrintableAscii(bytes calldata value) private pure returns (bool) {
        for (uint256 index = 0; index < value.length; index++) {
            if (value[index] < 0x20 || value[index] > 0x7e) return false;
        }
        return true;
    }
}
