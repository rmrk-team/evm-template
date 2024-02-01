// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import {
    RMRKEquippableLazyMintNative
} from "@rmrk-team/evm-contracts/contracts/implementations/lazyMintNative/RMRKEquippableLazyMintNative.sol";

contract SimpleEquippable is RMRKEquippableLazyMintNative {
    constructor(
        string memory collectionMetadata,
        string memory baseTokenURI,
        InitData memory data
    )
        RMRKEquippableLazyMintNative(
            "SimpleEquippable",
            "SE",
            collectionMetadata,
            baseTokenURI,
            data
        )
    {}
}
