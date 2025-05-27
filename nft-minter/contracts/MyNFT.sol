// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MyNFT is ERC721URIStorage {
    uint256 private _tokenIds = 1;

    // 添加一个明确的事件来记录铸造的 tokenId
    // event NFTMinted(address indexed recipient, uint256 indexed tokenId, string tokenURI);

    constructor() ERC721("MyNFT", "MNFT") {}

    function safeMint(
        address recipient,
        string memory tokenURI
    ) public returns (uint256) {
        uint256 newItemId = _tokenIds;
        _safeMint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);

        // 触发事件
        // emit NFTMinted(recipient, newItemId, tokenURI);
        
        _tokenIds += 1;

        return newItemId;
    }
}
