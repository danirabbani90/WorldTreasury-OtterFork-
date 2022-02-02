const { ethers } = require("hardhat");
const hre = require("hardhat");
​
async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account: " + deployer.address);
​
    // const authority = {address: ''};
    const timelock = "1";
    const epochLength = "2200";
    const firstEpochNumber = "550";
    const firstEpochTime = "1641903281";
    const index = "1";
    const chainID = "4";
    const warmupPeriod = "9";
​
    const Authority = await ethers.getContractFactory("OlympusAuthority");
    const authority = await Authority.deploy(
        deployer.address,
        deployer.address,
        deployer.address,
        deployer.address
    );
    await authority.deployed();
    console.log("authority: ", authority.address);
​
    const BLKD = await ethers.getContractFactory("OlympusERC20Token");
    const blkd = await BLKD.deploy(authority.address);
    await blkd.deployed();
    console.log("blkd: ", blkd.address);
​
    const SBLKD = await ethers.getContractFactory("sOlympus");
    const sblkd = await SBLKD.deploy();
    await sblkd.deployed();
    console.log("sblkd: ", sblkd.address);
​
    const Treasury = await ethers.getContractFactory("OlympusTreasury");
    const treasury = await Treasury.deploy(blkd.address, timelock, authority.address);
    await treasury.deployed();
    console.log("treasury: ", treasury.address);
​
    const GBLKD = await ethers.getContractFactory("gOHM");
    const gblkd = await GBLKD.deploy(deployer.address, sblkd.address);
    await gblkd.deployed();
    console.log("gblkd: ", gblkd.address);
​
    const Staking = await ethers.getContractFactory("OlympusStaking");
    const staking = await Staking.deploy(
        blkd.address,
        sblkd.address,
        gblkd.address,
        epochLength,
        firstEpochNumber,
        firstEpochTime,
        authority.address
    );
    await staking.deployed();
    console.log("staking: ", staking.address);
​
    const Distributor = await ethers.getContractFactory("Distributor");
    const distributor = await Distributor.deploy(
        treasury.address,
        blkd.address,
        staking.address,
        authority.address
    );
    await distributor.deployed();
    console.log("distributor: ", distributor.address);
​
    const BondingCalculator = await ethers.getContractFactory("OlympusBondingCalculator");
    const bondingCalculator = await BondingCalculator.deploy(blkd.address);
    await bondingCalculator.deployed();
    console.log("bondingCalculator: ", bondingCalculator.address);
​
    const BondDepository = await ethers.getContractFactory("OlympusBondDepositoryV2");
    const bondDepository = await BondDepository.deploy(
        authority.address,
        blkd.address,
        gblkd.address,
        staking.address,
        treasury.address
    );
    await bondDepository.deployed();
    console.log("bondDepository: ", bondDepository.address);
​
    const DAI = await ethers.getContractFactory("DAI");
    const dai = await DAI.deploy(chainID);
    await dai.deployed();
    console.log("DAI: ", dai.address);
​
    const FRAX = await ethers.getContractFactory("FRAX");
    const frax = await FRAX.deploy(chainID);
    await frax.deployed();
    console.log("FRAX: ", frax.address);
​
    const YieldDirector = await ethers.getContractFactory("YieldDirector");
    const yieldDirector = await YieldDirector.deploy(
        sblkd.address,
        authority.address
    );
    await yieldDirector.deployed();
    console.log("yieldDirector: ", yieldDirector.address);
​
    ////////////////////////////////////////////////////////////////
​
    await sblkd.setIndex(index);
    console.log("set Index");
​
    await sblkd.setgOHM(gblkd.address);
    console.log("set gblkd in sblkd");
​
    await sblkd.initialize(staking.address, treasury.address);
    console.log("initialize sblkd");
​
    await blkd.mint(deployer.address, "10000000000000000000000000");
    console.log("Minted BLKD: ", 10000000);
​
    await gblkd.mint(deployer.address, "10000000000000000000000000");
    console.log("Minted gBLKD: ", 10000000);
​
    await gblkd.migrate(staking.address, sblkd.address);
    console.log("migrate gblkd is done");
​
    await staking.setDistributor(distributor.address);
    console.log("setDistributor for Staking:", distributor.address);
​
    await staking.setWarmupLength(warmupPeriod);
    console.log("setDistributor for Staking:", warmupPeriod);
​
    await dai.mint(deployer.address, "10000000000000000000000000000000000000000000000000")
    console.log("Minted DAI: ", "10000000000000000000000000000000");
​
    await frax.mint(deployer.address, "10000000000000000000000000000000000000000000000000")
    console.log("Minted FRAX: ", "10000000000000000000000000000000");
​
    await distributor.setBounty("100000000");
    console.log("Distributor Bounty Set: ", 100000000);
​
    await distributor.addRecipient(staking.address, "4000");
    console.log("Distributor Add Recipient:", 4000);
    
    ////////////////////////////////////////////////////////////////////////////////
​
    await authority.pushVault(treasury.address, true);
    console.log("Authority Vault Pushed: ", treasury.address);
​
    await treasury.enable(8, distributor.address, "0x0000000000000000000000000000000000000000"); // Allows distributor to mint BLKD.
    console.log("Treasury.enable(8):  distributor enabled to mint ohm on treasury");
​
    // Treasury Actions
    await treasury.enable(0, deployer.address, "0x0000000000000000000000000000000000000000"); // Enable the deployer to deposit reserve tokens
    console.log("Deployer Enabled on Treasury(0): ", deployer.address);
    await treasury.enable(2, dai.address, "0x0000000000000000000000000000000000000000"); // Enable DAI as a reserve Token
    console.log("DAI Enabled on Treasury(2) as reserve: ", dai.address);
    await treasury.enable(2, frax.address, "0x0000000000000000000000000000000000000000"); // Enable FRAX as a reserve Token
    console.log("FRAX Enabled on Treasury(2) as reserve: ", frax.address);
​
    // Deposit and Mint blkd
    const daiAmount = "100000000000000000000000000000000"
    await dai.approve(treasury.address, daiAmount); // Approve treasury to use the DAI
    console.log("DAI Approved to treasury :", daiAmount);
    await treasury.deposit(daiAmount, dai.address, 0); // Deposit DAI into treasury
    console.log("DAI Deposited in treasury :", daiAmount);
    const blkdMintedAgainstDai = await blkd.balanceOf(deployer.address);
    console.log("BLKD minted against DAI: ", blkdMintedAgainstDai.toString());
​
    const fraxAmount = "100000000000000000000000000000000"
    await dai.approve(treasury.address, fraxAmount); // Approve treasury to use the FRAX
    console.log("FRAX Approved to treasury :", fraxAmount);
    await treasury.deposit(fraxAmount, dai.address, 0); // Deposit FRAX into treasury
    console.log("FRAX Deposited in treasury :", fraxAmount);
    const blkdMintedAgainstFrax = await blkd.balanceOf(deployer.address);
    console.log("BLKD minted against FRAX: ", blkdMintedAgainstFrax.toString());
​
    // 
​
    await bondDepository.create(
        dai.address,
        [10000,1000000000,100],
        [false,false],
        [1643624367,1653624364],
        [604800,86400]
    )
    console.log("DAI BOND CREATED")
​
    await bondDepository.create(
        frax.address,
        [10000,1000000000,100],
        [false,false],
        [1643624367,1653624364],
        [604800,86400]
    )
    console.log("FRAX BOND CREATED")
​
    /////////////////////////////////////////////////////////////////////////////////
​
    try {
        await hre.run("verify:verify", {
            address: authority.address,
            constructorArguments: [
                deployer.address,
                deployer.address,
                deployer.address,
                deployer.address,
            ],
        });
    } catch (error) {}
​
    try {
        await hre.run("verify:verify", {
            address: blkd.address,
            constructorArguments: [authority.address],
        });
    } catch (error) {}
​
    try {
        await hre.run("verify:verify", {
            address: sblkd.address,
            constructorArguments: [],
        });
    } catch (error) {}
​
    try {
        await hre.run("verify:verify", {
            address: treasury.address,
            constructorArguments: [blkd.address, timelock, authority.address],
        });
    } catch (error) {}
​
    try {
        await hre.run("verify:verify", {
            address: gblkd.address,
            constructorArguments: [deployer.address, sblkd.address],
        });
    } catch (error) {}
​
    try {
        await hre.run("verify:verify", {
            address: staking.address,
            constructorArguments: [
                blkd.address,
                sblkd.address,
                gblkd.address,
                epochLength,
                firstEpochNumber,
                firstEpochTime,
                authority.address
            ],
        });
    } catch (error) {}
​
    try {
        await hre.run("verify:verify", {
            address: distributor.address,
            constructorArguments: [
                treasury.address,
                blkd.address,
                staking.address,
                authority.address
            ],
        });
    } catch (error) {}
​
    try {
        await hre.run("verify:verify", {
            address: bondingCalculator.address,
            constructorArguments: [blkd.address],
        });
    } catch (error) {}
​
    try {
        await hre.run("verify:verify", {
            address: bondDepository.address,
            constructorArguments: [
                authority.address,
                blkd.address,
                gblkd.address,
                staking.address,
                treasury.address
            ],
        });
    } catch (error) {}
​
    try {
        await hre.run("verify:verify", {
            address: dai.address,
            constructorArguments: [
                chainID
            ],
        });
    } catch (error) {}
​
    try {
        await hre.run("verify:verify", {
            address: frax.address,
            constructorArguments: [
                chainID
            ],
        });
    } catch (error) {}
​
    try {
        await hre.run("verify:verify", {
            address: yieldDirector.address,
            constructorArguments: [
                sblkd.address,
                authority.address
            ],
        });
    } catch (error) {}
​
    console.log("All contracts deployed successfully");
}
​
main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });