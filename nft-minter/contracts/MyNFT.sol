// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MyNFT is ERC721URIStorage {
    uint256 private _tokenIds;

    constructor() ERC721("MyNFT", "MNFT") {}

    function safeMint(
        address recipient,
        string memory tokenURI
    ) public returns (uint256) {
        uint256 newItemId = _tokenIds;
        _safeMint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);
        _tokenIds += 1;
        return newItemId;
    }
}
