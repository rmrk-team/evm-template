// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.21;

import "@rmrk-team/evm-contracts/contracts/implementations/lazyMintNative/RMRKEquippableLazyMintNative.sol";

contract SimpleEquippable is RMRKEquippableLazyMintNative {
    constructor(
        string memory name,
        string memory symbol,
        string memory collectionMetadata,
        string memory baseTokenURI,
        InitData memory data
    )
        RMRKEquippableLazyMintNative(
            name,
            symbol,
            collectionMetadata,
            baseTokenURI,
            data
        )
    {}
}
