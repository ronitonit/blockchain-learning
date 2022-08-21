// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Import this file to use console.log
import "hardhat/console.sol";

contract SimpleStorage {
    // this gets initialized to 0
    uint256 public favNum;

    //struct <-- creating a new type
    struct People {
        uint256 favNum;
        string name;
    }

    People public person = People({favNum: 2, name: "Ronit"});
    People public person2 = People({favNum: 3, name: "Paru"});

    // dynamic ARRAY
    People[] public people;

    // static ARRAY -- will only hold 3
    People[3] peopleThree;

    // MAPPING -- like a dictionairy
    mapping(string => uint256) public nameToFavNum;

    function store(uint256 _favNum) public virtual {
        favNum = _favNum;
    }

    //there are six places you can store data
    // 1. stack
    // 2. memory -- var only exists temporarily
    // 3. Storage --  var exists outside the function executing.
    // 4. calldata -- var only exists temporarily, var cannot be re-assigned
    // 5. Code
    // 6. Logs

    function addPerson(string calldata _name, uint256 _favNum) public {
        People memory newPerson = People({favNum: _favNum, name: _name});
        people.push(newPerson);
        nameToFavNum[_name] = _favNum;

        // can also push like below without specifying the key but need to be in the order in the type
        //people.push(People(_favNum, _name));
    }

    // view and pure functions does not have to spend gas to run
    // pure function also disallows READING from the blockchain
    function returnFavNum() public view returns (uint256) {
        return favNum;
    }
}
