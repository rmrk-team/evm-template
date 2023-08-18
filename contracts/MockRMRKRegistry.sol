// SPDX-License-Identifier: MIT

pragma solidity ^0.8.21;

// Mock RMRK Registry to expose addExternalCollection function.
contract MockRMRKRegistry {
    function addExternalCollection(
        address collection,
        string memory collectionMetadata
    ) external {}
}
