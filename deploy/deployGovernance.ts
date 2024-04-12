import { HardhatRuntimeEnvironment } from "hardhat/types";

// load env file
import dotenv from "dotenv";
import { ethers, getNamedAccounts } from "hardhat";
import { ZERO_ADDRESS, supply } from "../test/fixtures/utils";
import { parseEther } from "ethers";
dotenv.config();

// load wallet private key from env file
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";

const deployGovernance = async function (hre: HardhatRuntimeEnvironment) {
  const [deployer, ant, whale] = await hre.ethers.getSigners();
  
  // Deploy contracts
  const EarlyZERO = await hre.ethers.getContractFactory("EarlyZERO");
  const EarlyZEROVesting = await hre.ethers.getContractFactory(
    "EarlyZEROVesting"
  );
  const ZeroLendToken = await hre.ethers.getContractFactory("ZeroLend");
  const VestedZeroNFT = await hre.ethers.getContractFactory("VestedZeroNFT");
  const StakingBonus = await hre.ethers.getContractFactory("StakingBonus");
  const OmnichainStaking = await hre.ethers.getContractFactory(
    "OmnichainStaking"
  );
  const LockerToken = await hre.ethers.getContractFactory("LockerToken");
  const stakingBonus = await StakingBonus.deploy();
  const omnichainStaking = await OmnichainStaking.deploy();
  const lockerToken = await LockerToken.deploy();
  const lockerLP = await LockerToken.deploy();
  const earlyZERO = await EarlyZERO.deploy();
  const earlyZEROVesting = await EarlyZEROVesting.deploy();
  const zero = await ZeroLendToken.deploy();
  const vestedZeroNFT = await VestedZeroNFT.deploy();
  
  // init contracts
  await vestedZeroNFT.init(zero.target, stakingBonus.target);
  await stakingBonus.init(
    zero.target,
    lockerToken.target,
    vestedZeroNFT.target,
    2000
  );
  await lockerToken.init(
    zero.target,
    omnichainStaking.target,
    stakingBonus.target
  );
  await earlyZEROVesting.init(
    earlyZERO.target,
    lockerToken.target,
    stakingBonus.target
  );
  // TODO use lp tokens
  await lockerLP.init(
    zero.target,
    omnichainStaking.target,
    stakingBonus.target
  );
  await omnichainStaking.init(
    ZERO_ADDRESS,
    lockerToken.target,
    lockerLP.target
  );
  // unpause zero
  await zero.togglePause(false);
  // give necessary approvals
  await zero.approve(vestedZeroNFT.target, 100n * supply);
  await earlyZERO.addwhitelist(earlyZEROVesting.target, true);



  const PoolVoter = await hre.ethers.getContractFactory("PoolVoter");
  const poolVoter = await PoolVoter.deploy();
  await poolVoter.init(omnichainStaking.target, zero.target);

  //Deploying Gauges

  console.log("stakingBonus", stakingBonus.target);
  console.log("omnichainStaking", omnichainStaking.target);
  console.log("lockerToken", lockerToken.target);
  console.log("lockerLP", lockerLP.target);
  console.log("earlyZERO", earlyZERO.target);
  console.log("earlyZEROVesting", earlyZEROVesting.target);
  console.log("zero", zero.target);
  console.log("vestedZeroNFT", vestedZeroNFT.target);
  console.log("poolVoter", poolVoter.target);
};

deployGovernance.tags = ["DeployGovernance"];
export default deployGovernance;