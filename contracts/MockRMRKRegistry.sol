// SPDX-License-Identifier: MIT

pragma solidity ^0.8.21;    

// So typechain gets them:
import "@rmrk-team/evm-contracts/contracts/RMRK/utils/RMRKEquipRenderUtils.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/utils/RMRKCatalogUtils.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/utils/RMRKCollectionUtils.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/utils/RMRKBulkWriter.sol";

// Mock RMRK Registry to expose addExternalCollection function.
contract MockRMRKRegistry {
    function addExternalCollection(
        address collection,
        string memory collectionMetadata
    ) external {}
}
