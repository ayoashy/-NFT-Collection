// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "./IWhitelist.sol";

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CrptoDevs is ERC721Enumerable, Ownable {
    string baseTokenURI;
    IWhitelist whitelist;
    bool public presaleStarted;
    uint256 public presaleEnded;
    uint256 public maxTokenIds = 20;
    uint256 public tokenIds;
    uint256 public publicPrice = 0.01 ether;
    uint256 public presalePrice = 0.005 ether;
    bool public _paused;

    modifier onlyWhenNotPaused() {
        require(!_paused, "Contrac currently paused!");
        _;
    }

    constructor(
        string memory baseURI,
        address whitelistContract
    ) ERC721("Crpto Devs", "CD") {
        baseTokenURI = baseURI;
        whitelist = IWhitelist(whitelistContract);
    }

    function startPresale() public onlyOwner {
        presaleStarted = true;
        presaleEnded = block.timestamp + 5 minutes;
    }

    // function getTokenMinted() public view returns (uint256) {
    //     return tokenIds;
    // }

    function presaleMint() public payable onlyWhenNotPaused {
        require(presaleStarted, "Presale has not started!");
        require(
            presaleStarted && block.timestamp < presaleEnded,
            "Presale ended!"
        );

        require(
            whitelist.whiteListedAddresses(msg.sender),
            "you are not whitelisted"
        );

        require(tokenIds < maxTokenIds, "Limit reached!");

        require(msg.value >= presalePrice, "Ether sent not correct");

        tokenIds++;
        _safeMint(msg.sender, tokenIds);
    }

    function mint() public payable onlyWhenNotPaused {
        require(
            presaleStarted && block.timestamp >= presaleEnded,
            "presale has not ended"
        );
        require(tokenIds < maxTokenIds, "Limit reached");
        require(msg.value >= publicPrice, "Ether sent not correct");
        tokenIds++;
        _safeMint(msg.sender, tokenIds);
    }

    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }

    function setPaused(bool val) public {
        _paused = val;
    }

    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent, ) = _owner.call{value: amount}("");
        require(sent, "fail to send ether");
    }

    receive() external payable {}

    fallback() external payable {}
}
