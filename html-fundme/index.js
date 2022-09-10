import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");

connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

console.log(ethers);

async function connect() {
  if (typeof window.ethereum != "undefined") {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    console.log("connected to metamask!");

    // listen for tx to be mined
    connectButton.innerHTML = "connected";
  } else {
    console.log("no metamask detected!");
    connectButton.innerHTML = "pelase install Metamask";
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`mining ${transactionResponse.hash}`);

  // listen for this transaction to finish

  return new Promise(function (resolve, reject) {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log("completed with ", transactionReceipt.confirmations);
      resolve();
    });
  });

  // create a listener for the blockchain
}

// fund function

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value;
  console.log("funding with ", ethAmount);
  if (typeof window.ethereum != "undefined") {
    // we need!
    // provider -- to conntect to the blockchain
    // signoer / wallet / some one with some gad
    // contract that we are interacting with

    const provider = new ethers.providers.Web3Provider(window.ethereum); // this is injecting metamask to ethers
    const signer = provider.getSigner();

    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      await listenForTransactionMine(transactionResponse, provider);
      console.log("done funding!");
    } catch (error) {
      console.log(error);
    }
  }
}

async function getBalance() {
  if (typeof window.ethereum != "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(ethers.utils.formatEther(balance));
  }
}

async function withdraw() {
  if (typeof window.ethereum != "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
      console.log("withdrawing");
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
      console.log("done withdrawing!");
    } catch (error) {
      console.log(error);
    }
  }
}
