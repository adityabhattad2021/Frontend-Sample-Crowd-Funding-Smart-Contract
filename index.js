// In nodejs
// We use require()

// In Fronted Javascrit we cannot use require()
// we use import keyword instead.
import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";


if (typeof window.ethereum !== undefined) {
	console.log("Metamask wallet detected!");
} else {
	console.log("Metamask wallet not detected!");
}

const connectBtn = document.getElementById("connect");
const fundBtn = document.getElementById("fund");
const withdrawBtn = document.getElementById("withdraw");
const amt = document.getElementById("fundamt");
const getBalanceBtn = document.getElementById("getbalance");

connectBtn.addEventListener("click", async () => {
	connectWallet();
});

fundBtn.addEventListener("click", async () => {
	fund();
});

getBalanceBtn.addEventListener("click", async () => {
	getBalance();
});

withdrawBtn.addEventListener("click", async () => {
	withdraw();
});



async function connectWallet() {
	try {
		await window.ethereum.request({ method: "eth_requestAccounts" });
		connectBtn.innerHTML = "Connected";
	} catch (error) {
		console.log(error);
		connectBtn.innerHTML = "Not Connected";
	}
}

async function fund() {
	const ethAmt = amt.value;
	fundBtn.disabled = true;
	console.log(`Funding with ${amt.value} WEI`);
	if (typeof window.ethereum !== "undefined") {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const signer = provider.getSigner();
		const contract = new ethers.Contract(contractAddress, abi, signer);
		const transectionResponse = await contract.fundInWEI({
			value: ethers.utils.parseEther(ethAmt),
		});
		await listenforTransectionMine(transectionResponse, provider);
		console.log("Done!");
		fundBtn.innerHTML = "Funded Successfully";
		fundBtn.disabled = false;
	}
	amt.value = "";
}

async function withdraw() {
	console.log("Withdrawing Initiated...");
	if (typeof window.ethereum !== "undefined") {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const signer = provider.getSigner();
		const contract = new ethers.Contract(contractAddress, abi, signer);
		try {
			const transectionResponse = await contract.effectiveWithdraw();
			await listenforTransectionMine(transectionResponse, provider);
		} catch (error) {
			console.log(error);
		}
	}
	withdrawBtn.innerHTML='Withdraw Successfull'
}

async function getBalance() {
	if (typeof window.ethereum !== "undefined") {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const balance = await provider.getBalance(contractAddress);
		console.log(ethers.utils.formatEther(balance));
		getBalanceBtn.innerHTML = `Current balance ${ethers.utils.formatEther(
			balance
		)} ETH (Click to refresh)`;
	}
}

async function listenforTransectionMine(transectionResponse, provider) {
	console.log(`Mining ${transectionResponse.hash}...`);
	return new Promise((resolve, reject) => {
		provider.once(transectionResponse.hash, (transectionReciept) => {
			console.log(
				`Completed with ${transectionReciept.confirmations} confirmations`
			);
			resolve();
		});
	});
}
