import Head from "next/head";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import * as anchor from "@project-serum/anchor";
import { Program, Provider, BN } from "@project-serum/anchor";
import poseidonIDL from "../../target/idl/poseidon.json";
import { PublicKey, ConfirmOptions } from "@solana/web3.js";
import {
  Token,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  u64,
} from "@solana/spl-token";
import { useAnchorWallet } from "@solana/wallet-adapter-react";

import Bg from "../public/images/bg.gif";
import arrows from "../public/images/arrows1.png";

import { useState, useEffect, useRef } from "react";
type psdnState = {
  program: any;
  connection: any;
  poseidon: any;
  trtnToken: any;
  psdnTrtnAccount: any;
  usdcToken: any;
  psdnUsdcAccount: any;
  // shellToken: any;
  psdnShellAccount: any;
  walletTrtnAccount: any;
  walletUsdcAccount: any;
  walletShellAccount: any;
};

export default function Home() {
  const wallet = useAnchorWallet();

  const [psdnState, setPsdnState] = useState({} as psdnState);
  const [psdnStats, setPsdnStats] = useState({} as any);
  const [psdnRatio, setPsdnRatio] = useState(0);
  const [swapAmounts, setSwapAmounts] = useState({
    trtn: 1.0,
    usdc: 0.0,
    type: "trtn",
  });

  const [infoState, setInfoState] = useState(false);
  const [lpState, setLpState] = useState(false);

  const loaderRef = useRef<HTMLAnchorElement>(null);
  const modalRef = useRef<HTMLAnchorElement>(null);
  const [loader, setLoader] = useState(0);

  const txTimeout = 10000;

  const refresh = async () => {
    setLoader(0);
    loaderRef?.current?.click();
    const downloadTimer = setInterval(() => {
      if (loader >= 5000) {
        clearInterval(downloadTimer);
      }
      setLoader((prevLoader) => prevLoader + 10);
    }, 10);
    setTimeout(() => {
      modalRef?.current?.click();
      // forceUpdate();
      // setRefreshStateCounter(refreshStateCounter + 1);
      window.location.reload();
      // refreshData();
    }, txTimeout + 10);
  };

  const TOKEN_MULTIPLIER = 1e6;
  const psdnIdl = poseidonIDL as anchor.Idl;
  const setupPoseidon = async () => {
    const opts = {
      preflightCommitment: "processed" as ConfirmOptions,
    };
    const endpoint =
      "https://bold-withered-pond.solana-mainnet.quiknode.pro/608c8586df23a01f2bdbfd77fd8d54b5f87f3211/";
    const connection = new anchor.web3.Connection(
      endpoint,
      opts.preflightCommitment
    );
    const aWallet = wallet as typeof anchor.Wallet;
    const provider = new Provider(
      connection,
      aWallet,
      opts.preflightCommitment
    );
    const Poseidon = new anchor.web3.PublicKey(
      "H2Z5eh9ddxcdLkEzpmzcVMKB5gD7H1A8EZ4B3dqbVSZN"
    );

    const program = new Program(psdnIdl, Poseidon, provider);

    // log wallet

    // console.log(
    //   "wallet pulbic key",
    //   program.provider.wallet.publicKey.toString()
    // );

    // main data account generation (pda)
    const [poseidon, psdnBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("psdn_config")],
      program.programId
    );

    // console.log("poseidon", poseidon.toBase58());
    // console.log("psdnBump", psdnBump);

    // Get PDA accounts for triton
    const trtnToken = new PublicKey(
      "8rDACnycUMGFvndX74ZM9sxjEbR3gUpVHDjDbL4qW6Zf"
    );

    const [psdnTrtnAccount, psdnTrtnBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [poseidon.toBuffer(), Buffer.from("psdn_trtn_account")],
        program.programId
      );
    // console.log("psdnTrtnAccount", psdnTrtnAccount.toBase58());
    // console.log("psdnTrtnBump", psdnTrtnBump);

    const walletTrtnAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      trtnToken,
      program.provider.wallet.publicKey
    );
    // console.log("walletTrtnAccount", walletTrtnAccount.toBase58());

    // Get PDA accounts for usdc
    // offical usdc token on mainnet: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
    // mock usdc on devnet: DM5nx4kDo7E2moAkie97C32FSaZUCx9rTx1rwwRfm9VM
    const usdcToken = new PublicKey(
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
    );

    const [psdnUsdcAccount, psdnUsdcBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [poseidon.toBuffer(), Buffer.from("psdn_usdc_account")],
        program.programId
      );
    // console.log("psdnUsdcAccount", psdnUsdcAccount.toBase58());
    // console.log("psdnUsdcBump", psdnUsdcBump);

    const walletUsdcAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      usdcToken,
      program.provider.wallet.publicKey
    );
    // console.log("walletUsdcAccount", walletUsdcAccount.toBase58());

    // Get PDA accounts for shell
    // offical shell token on mainnet:
    // mock shell on devnet: FT5uQVjDVMrYh5jXfinLSns15SHjvdPVnyjC7Hitv54j
    // const shellToken = new PublicKey(
    //   "FT5uQVjDVMrYh5jXfinLSns15SHjvdPVnyjC7Hitv54j"
    // );

    const [psdnShellAccount, psdnShellBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [poseidon.toBuffer(), Buffer.from("psdn_shell_account")],
        program.programId
      );
    // console.log("psdnShellAccount", psdnShellAccount.toBase58());
    // console.log("psdnShellBump", psdnShellBump);

    const walletShellAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      psdnShellAccount,
      program.provider.wallet.publicKey
    );
    // console.log("walletShellAccount", walletShellAccount.toBase58());

    setPsdnState({
      program,
      connection,
      poseidon,
      trtnToken,
      psdnTrtnAccount,
      usdcToken,
      psdnUsdcAccount,
      // shellToken,
      psdnShellAccount,
      walletTrtnAccount,
      walletUsdcAccount,
      walletShellAccount,
    });
  };
  const getPsdnStats = async () => {
    const psdnAccount = await psdnState.program.account.config.fetch(
      psdnState.poseidon
    );

    // console.log("psdnAccount", psdnAccount);
    // console.log("constant", psdnAccount.poolConstant.toNumber());
    // console.log(
    //   "amount owed",
    //   parseFloat(psdnAccount.usdcAmount.toNumber() + 1.5) /
    //     parseFloat(psdnAccount.poolConstant.toString())
    // );

    // const real_x = psdnAccount.trtnAmount.toNumber();
    // const real_y = psdnAccount.usdcAmount.toNumber();
    // const real_k = real_x * real_y;

    // const real_new_x = real_x + 1 * 1e6;
    // const real_new_y = real_k / real_new_x;

    // const real_amount_owed = (real_y - real_new_y) / 1e6;

    // console.log("real_trtn", real_x);
    // console.log("real_usdc", real_y);
    // console.log("real_k", real_k);
    // console.log("real_new_x", real_new_x);
    // console.log("real_new_y", real_new_y);
    // console.log("real_amount_owed", real_amount_owed);

    // const x = 8000 * 1e6;
    // const y = 12001.5 * 1e6;
    // const k = x * y;

    // const newX = x + 1 * 1e6;
    // const newY = k / newX;
    // const amountOwed = (y - newY) / 1e6;

    // console.log("x", x);
    // console.log("y", y);
    // console.log("k", k);
    // console.log("newX", newX);
    // console.log("newY", newY);
    // console.log("amountOwed", amountOwed);

    // console.log("psdnAccount.usdcAmount", psdnAccount.usdcAmount.toNumber());
    // console.log("psdnAccount.trtnAmount", psdnAccount.trtnAmount.toNumber());

    const psdnRatio =
      psdnAccount.usdcAmount.toNumber() / psdnAccount.trtnAmount.toNumber();
    // console.log("psdnqRatio", psdnRatio);
    setPsdnRatio(psdnRatio);
    setPsdnStats(psdnAccount);
  };

  const calculateSwap = (_trtnAmount?: any, _usdcAmount?: any) => {
    // console.log("_trtnAmount", _trtnAmount);
    if (_trtnAmount) {
      // console.log("triton swap");
      const usdcAmount = _trtnAmount * psdnRatio;
      setSwapAmounts({
        ...swapAmounts,
        trtn: _trtnAmount as any,
        usdc: usdcAmount as any,
      });
    } else if (_usdcAmount) {
      // console.log("usdc swap");
      const trtnAmount = _usdcAmount / psdnRatio;
      setSwapAmounts({
        ...swapAmounts,
        trtn: trtnAmount as any,
        usdc: _usdcAmount as any,
      });
    }
  };

  const changeSwapType = () => {
    if (swapAmounts.type === "trtn") {
      setSwapAmounts({ ...swapAmounts, type: "usdc" });
    } else if (swapAmounts.type === "usdc") {
      setSwapAmounts({ ...swapAmounts, type: "trtn" });
    }
  };

  const provideLiquidity = async () => {
    await getPsdnStats();
    const trtn = new BN(swapAmounts.trtn * TOKEN_MULTIPLIER);
    const usdc = new BN(swapAmounts.usdc * TOKEN_MULTIPLIER);
    console.log("trtn", trtn.toNumber());
    console.log("usdc", usdc.toNumber());
    await psdnState.program.rpc.provideLiquidity(trtn, usdc, {
      accounts: {
        config: psdnState.poseidon,
        authority: psdnState.program.provider.wallet.publicKey,
        usdcAccount: psdnState.psdnUsdcAccount,
        trtnAccount: psdnState.psdnTrtnAccount,
        usdcMint: psdnState.usdcToken,
        trtnMint: psdnState.trtnToken,
        shellMint: psdnState.psdnShellAccount,
        authUsdcAccount: psdnState.walletUsdcAccount,
        authTrtnAccount: psdnState.walletTrtnAccount,
        authShellAccount: psdnState.walletShellAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
    });
  };

  const removeLiquidity = async () => {
    await getPsdnStats();
    console.log("psdnStats", psdnStats);
    console.log(
      "psdnStats.shellAmount.toNumber()",
      psdnStats.shellAmount.toNumber() / TOKEN_MULTIPLIER
    );

    const authShellBalance =
      await psdnState.program.provider.connection.getTokenAccountBalance(
        psdnState.walletShellAccount
      );
    const shell = new BN(authShellBalance.value.amount);
    console.log("shell", shell.toNumber() / TOKEN_MULTIPLIER);
    await psdnState.program.rpc.removeLiquidity(shell, {
      accounts: {
        config: psdnState.poseidon,
        authority: psdnState.program.provider.wallet.publicKey,
        usdcAccount: psdnState.psdnUsdcAccount,
        trtnAccount: psdnState.psdnTrtnAccount,
        usdcMint: psdnState.usdcToken,
        trtnMint: psdnState.trtnToken,
        shellMint: psdnState.psdnShellAccount,
        authUsdcAccount: psdnState.walletUsdcAccount,
        authShellAccount: psdnState.walletShellAccount,
        authTrtnAccount: psdnState.walletTrtnAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
    });
    await getPsdnStats();
    console.log("psdnStats", psdnStats);
    console.log(
      "psdnStats.shellAmount.toNumber()",
      psdnStats.shellAmount.toNumber() / TOKEN_MULTIPLIER
    );
  };

  const swap = async () => {
    if (swapAmounts.type === "usdc") {
      console.log("swapping usdc to trtn");
      const usdcToSwap = new BN(swapAmounts.usdc * TOKEN_MULTIPLIER);
      console.log("usdcToSwap", usdcToSwap.toNumber());
      const events = await psdnState.program.simulate.swapToTriton(usdcToSwap, {
        accounts: {
          config: psdnState.poseidon,
          authority: psdnState.program.provider.wallet.publicKey,
          usdcAccount: psdnState.psdnUsdcAccount,
          trtnAccount: psdnState.psdnTrtnAccount,
          usdcMint: psdnState.usdcToken,
          trtnMint: psdnState.trtnToken,
          authTrtnAccount: psdnState.walletTrtnAccount,
          authUsdcAccount: psdnState.walletUsdcAccount,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
      });
      console.log("events", events);
    } else if (swapAmounts.type === "trtn") {
      console.log("swapping triton to usdc");
      const trtnToSwap = new BN(swapAmounts.trtn * TOKEN_MULTIPLIER);
      console.log("trtnToSwap", trtnToSwap.toNumber());
      await psdnState.program.simulate.swapToUsdc(trtnToSwap, {
        accounts: {
          config: psdnState.poseidon,
          authority: psdnState.program.provider.wallet.publicKey,
          usdcAccount: psdnState.psdnUsdcAccount,
          trtnAccount: psdnState.psdnTrtnAccount,
          usdcMint: psdnState.usdcToken,
          trtnMint: psdnState.trtnToken,
          authUsdcAccount: psdnState.walletUsdcAccount,
          authTrtnAccount: psdnState.walletTrtnAccount,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
      });
    }
  };

  useEffect(() => {
    if (wallet?.publicKey) {
      setupPoseidon();
    }
  }, [wallet]);
  useEffect(() => {
    if (psdnState.poseidon) {
      getPsdnStats();
    }
  }, [psdnState]);

  useEffect(() => {
    if (psdnRatio > 0) {
      if (swapAmounts.type === "trtn") {
        calculateSwap(swapAmounts.trtn, null);
      } else if (swapAmounts.type === "usdc") {
        calculateSwap(null, swapAmounts.usdc);
      }
    }
  }, [psdnRatio]);

  // function Modal({usd, trtn}){
  //   return(

  //     <div className="">
  //     <div className="modal-box stat">
  //       <div className="stat-desc max-w-[90%]">
  //         <p>Do you want to confirm the transaction for usd to trtn</p>
  //       </div>
  //       <div>
  //         <button
  //           className="btn bg-[#0E3755] border-[#0E3755] hover:bg-transparent hover:text-[#0E3755] hover:border-[#0E3755] font-[Montserrat] focus:animate-bounce text-white"
  //           style={{ fontSize: "12px" }}
  //           onClick={async () => {
  //             await swap();
  //             await refresh();
  //           }}
  //         >
  //           confirm
  //         </button>
  //         </div>
  //     </div>
  //   </div>
  //   )
  // }

  return (
    <div>
      <Head>
        <title>Poseidon Liquidity Pool</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main
        style={{ backgroundImage: `url(${Bg.src})` }}
        className="justify-center bg-no-repeat bg-cover"
      >
        {/* <Modal /> */}

        <div className="grid grid-cols-1 min-h-screen mx-auto">
          <div className="text-center hero-content mx-auto block">
            <div>
              {/* Loading Modal */}
              <a
                href="#loader"
                className="btn btn-primary hidden text-[Montserrat]"
                ref={loaderRef}
              >
                open loader
              </a>
              <div id="loader" className="modal">
                <div className="modal-box stat">
                  <div className="stat-figure text-primary text-[Montserrat]">
                    <button className="btn loading btn-circle btn-lg bg-base-200 btn-ghost"></button>
                  </div>
                  <p style={{ fontFamily: "Montserrat" }}>Loading...</p>
                  <div className="stat-desc max-w-[90%]">
                    <progress
                      value={loader}
                      max="5000"
                      className="progress progress-black"
                    ></progress>
                  </div>
                  <a
                    href="#"
                    style={{ fontFamily: "Montserrat" }}
                    className="btn hidden"
                    ref={modalRef}
                  >
                    Close
                  </a>
                </div>
              </div>
              <h1
                className="font-[Jangkuy] text-4xl my-5"
                style={{ color: "#0E3755", textShadow: "white 1px 0 30px" }}
              >
                Poseidon LP
              </h1>
              <div
                className="lpsize mx-auto  border-primary align-middle py-4 bg-sky-900/[0.9] rounded-md"
                style={{
                  color: "white",
                  width: "478px",
                  fontFamily: "Jangkuy",
                }}
              >
                <p className="text-center">
                  {wallet?.publicKey
                    ? `TRTN: ${(psdnStats.trtnAmount / 1e6).toFixed(
                        0
                      )} | USDC: ${(psdnStats.usdcAmount / 1e6).toFixed(
                        0
                      )} | SHELL: ${(psdnStats.shellAmount / 1e6).toFixed(0)}`
                    : `Connect Wallet Below`}
                </p>
              </div>
              <div className="border-primary align-middle">
                <div className="display flex">
                  <div
                    className={`modal-box ${infoState ? "" : "hidden"}`}
                    style={{
                      backgroundColor: "#3DB489",
                      maxHeight: "600px",
                      marginTop: "-1.5rem",
                    }}
                  >
                    <div className="flex justify-around">
                      <h4
                        className="text-center text-xl font-bold mt-6"
                        style={{ fontFamily: "Jangkuy", color: "white" }}
                      >
                        ADD LIQUIDITY
                      </h4>
                    </div>
                    <div className="align-left">
                      <p
                        className="font-extralight text-sm py-2 text-justify"
                        style={{ fontFamily: "Montserrat", color: "white" }}
                      >
                        By depositing USDC and Triton liquidity with Poseidon
                        LP, you acknowledge that you understand the risks
                        associated with providing liquidity and impermanent
                        loss. For more detail, please see{" "}
                        <a
                          className="inline underline"
                          target="_blank"
                          href={
                            "https://medium.com/coinmonks/understanding-impermanent-loss-9ac6795e5baa"
                          }
                        >
                          Medium Article
                        </a>{" "}
                        and{" "}
                        <a
                          className="inline underline"
                          target="_blank"
                          href={
                            "https://academy.binance.com/en/articles/impermanent-loss-explained"
                          }
                        >
                          Binance Academy
                        </a>
                      </p>
                      <p
                        className="font-extralight text-sm py-2 text-justify"
                        style={{ fontFamily: "Montserrat", color: "white" }}
                      >
                        Once you have deposited funds, you will begin earning a
                        portion of the 1% fee charged on every swap performed in
                        the pool. Your share of the fee is proportional to your
                        share of the pool liquidity. So if you deposited $100
                        USDC and 100 $TRTN, and the pool had $1000 USDC and 1000
                        $TRTN in total, you would receive 10% of the fee, or
                        0.1% of every single swap executed in the pool. These
                        fees simply accrue in your pool and will be collected
                        automatically when you withdraw your funds, you do not
                        need to claim them separately.
                      </p>
                      <p
                        className="font-extralight text-sm py-2 text-justify"
                        style={{ fontFamily: "Montserrat", color: "white" }}
                      >
                        Tide Pool Shell Farm will be launching soon! Stake your
                        $SHELL token for more $TRTN rewards!
                      </p>

                      <button
                        style={{ fontSize: "12px" }}
                        className="btn bg-[#ff5723] border-[#ff5723] hover:bg-transparent hover:text-[#ff5723] hover:border-[#ff5723] font-[Montserrat] focus:animate-bounce my-8 text-white"
                        onClick={async () => {
                          await provideLiquidity();
                          await refresh();
                        }}
                      >
                        confirm staking
                      </button>
                    </div>
                  </div>
                  <div
                    className="artboard mx-8 mt-4 bg-sky-900/[0.9] phone-3 artboard-demo px-4"
                    style={{ height: "600px" }}
                  >
                    <div className="navbar pb-5 shadow-xs bg-transparent text-neutral-content rounded-box relative min-w-full justify-center">
                      {/* <div className="px-2 mx-2 navbar-start">
                        <span className="text-lg font-bold">Poseidon</span>
                      </div> */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="btn gap-4 m-0 p-0 bg-transparent hover:bg-transparent border-0 w-auto text-sm">
                          <WalletMultiButton
                            style={{
                              all: "unset",
                              height: "100%",
                              width: "auto",
                              zIndex: "10",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              justifyItems: "center",
                            }}
                          />
                        </div>
                        <div className="btn hover:bg-transparent gap-4 m-0 p-0 bg-transparent border-0 w-auto">
                          <WalletDisconnectButton
                            style={{
                              all: "unset",
                              height: "100%",
                              width: "100%",
                              zIndex: "10",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <span
                      className="badge badge-ghost badge-lg mt-4 w-auto bg-transparent border-0 font-[Jangkuy] shadow-xs"
                      style={{
                        fontSize: "1rem",
                        letterSpacing: "1px",
                        color: "white",
                      }}
                    >
                      {wallet?.publicKey
                        ? `TRITON: $${psdnRatio.toFixed(6)}`
                        : `Connect Wallet Above`}
                    </span>
                    {/* swap section */}
                    <div className="flex flex-row w-full h-[28rem] py-4">
                      <div className="grid flex-grow h-full card bg-base-300 rounded-box place-items-center shadow-md">
                        {swapAmounts.type === "trtn" ? (
                          <div>
                            <label className="input-group input-group-md">
                              <input
                                type="number"
                                step="0.000001"
                                value={swapAmounts.trtn}
                                onChange={(e) => {
                                  const amount = parseFloat(e.target.value);
                                  if (amount > 0) {
                                    calculateSwap(amount, null);
                                  } else {
                                    calculateSwap(0.000001, null);
                                  }
                                }}
                                className="input input-bordered input-md focus:input-primary"
                              />
                              <span className="bg-stone-300 font-[Jangkuy]">
                                TRTN
                              </span>
                            </label>
                            <div className="divider">
                              <button
                                className="btn btn-outline btn-circle btn-sm"
                                onClick={() => {
                                  changeSwapType();
                                }}
                              >
                                <img
                                  src={arrows.src}
                                  className="h-[17px] w-[17px]"
                                ></img>
                              </button>
                            </div>
                            <label className="input-group input-group-md">
                              <input
                                type="number"
                                step="0.000001"
                                value={swapAmounts.usdc}
                                onChange={(e) => {
                                  const amount = parseFloat(e.target.value);
                                  if (amount > 0) {
                                    calculateSwap(null, amount);
                                  } else {
                                    calculateSwap(null, 0.000001);
                                  }
                                }}
                                className="input input-bordered input-md focus:input-primary"
                              />
                              <span className="bg-stone-300 font-[Jangkuy]">
                                USDC
                              </span>
                            </label>
                            <div className="grid mt-4">
                              <button
                                className="btn border-[#3DB489] text-white bg-[#3DB489] hover:bg-transparent hover:text-[#3DB489] hover:border-[#3DB489] font-[Montserrat] focus:animate-bounce"
                                style={{ fontSize: "12px" }}
                                onClick={async () => {
                                  await swap();
                                  await refresh();
                                }}
                              >
                                swap
                              </button>
                            </div>
                            <div className="divider mt-6" />
                            <h3 className="mt-4 font-[Montserrat] ">
                              Add / Remove Liquidity
                            </h3>
                            <div className="grid grid-cols-2 mt-4 gap-2">
                              <button
                                className="btn border-[#deb42c] text-white bg-[#deb42c] hover:bg-transparent hover:text-[#deb42c] hover:border-[#deb42c] font-[Montserrat]"
                                style={{ fontSize: "12px" }}
                                onClick={() => {
                                  setInfoState(!infoState);
                                  if (lpState) setLpState(!lpState);
                                }}
                              >
                                stake
                              </button>
                              <button
                                className="btn bg-[#deb42c] border-[#deb42c] hover:bg-transparent hover:text-[#deb42c] hover:border-[#deb42c] font-[Montserrat] text-white"
                                style={{ fontSize: "12px" }}
                                onClick={() => {
                                  setLpState(!lpState);
                                  if (infoState) setInfoState(!infoState);
                                }}
                              >
                                unstake
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label className="input-group input-group-md">
                              <input
                                type="number"
                                step="0.000001"
                                value={swapAmounts.usdc}
                                onChange={(e) => {
                                  const amount = parseFloat(e.target.value);
                                  if (amount > 0) {
                                    calculateSwap(null, amount);
                                  } else {
                                    calculateSwap(null, 0.000001);
                                  }
                                }}
                                className="input input-bordered input-md focus:input-primary"
                              />
                              <span className="bg-stone-300 font-[Jangkuy]">
                                USDC
                              </span>
                            </label>
                            <div className="divider">
                              <button
                                className="btn btn-outline btn-circle btn-sm"
                                onClick={() => {
                                  changeSwapType();
                                }}
                              >
                                <img
                                  src={arrows.src}
                                  className="h-[17px] w-[17px]"
                                ></img>
                              </button>
                            </div>
                            <label className="input-group input-group-md">
                              <input
                                type="number"
                                step="0.000001"
                                value={swapAmounts.trtn}
                                onChange={(e) => {
                                  const amount = parseFloat(e.target.value);
                                  if (amount > 0) {
                                    calculateSwap(amount, null);
                                  } else {
                                    calculateSwap(0.000001, null);
                                  }
                                }}
                                className="input input-bordered input-md focus:input-primary"
                              />
                              <span className="bg-stone-300 font-[Jangkuy]">
                                TRTN
                              </span>
                            </label>
                            <div className="grid mt-4">
                              <button
                                className="btn border-[#3DB489] text-white bg-[#3DB489] hover:bg-transparent hover:text-[#3DB489] hover:border-[#3DB489] font-[Montserrat] focus:animate-bounce"
                                style={{ fontSize: "12px" }}
                                onClick={async () => {
                                  await swap();
                                  // await refresh();
                                }}
                              >
                                swap
                              </button>
                            </div>
                            <div className="divider mt-6" />
                            <h3 className="mt-4 font-[Montserrat]">
                              Add / Remove Liquidity
                            </h3>
                            <div className="grid grid-cols-2 mt-4 gap-2">
                              <button
                                className="btn bg-[#deb42c] border-[#deb42c] hover:bg-transparent hover:text-[#deb42c] hover:border-[#deb42c] font-[Montserrat] text-white"
                                style={{ fontSize: "12px" }}
                                onClick={() => {
                                  setInfoState(!infoState);
                                  if (lpState) setLpState(!lpState);
                                }}
                              >
                                stake
                              </button>
                              <button
                                className="btn bg-[#deb42c] border-[#deb42c] hover:bg-transparent hover:text-[#deb42c] hover:border-[#deb42c] font-[Montserrat] text-white"
                                style={{ fontSize: "12px" }}
                                onClick={() => {
                                  setLpState(!lpState);
                                  if (infoState) setInfoState(!infoState);
                                }}
                              >
                                unstake
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`modal-box ${lpState ? "" : "hidden"}`}
                    style={{
                      backgroundColor: "#0aafc1",
                      maxHeight: "600px",
                      marginTop: "-1.5rem",
                    }}
                  >
                    <div className="flex justify-around my-8">
                      <h4
                        className="text-center text-xl font-bold"
                        style={{ fontFamily: "Jangkuy", color: "white" }}
                      >
                        Remove Liquidity
                      </h4>
                    </div>
                    <div className="align-left">
                      <p
                        className="font-extralight text-sm py-2 text-justify"
                        style={{ fontFamily: "Montserrat", color: "white" }}
                      >
                        Clicking unstake below will burn all your shell tokens
                        and give you back the amount of TRITON and USDC you own
                        in the pool. This includes your share of the 1% trading
                        fee charged on all swaps since you deposited.
                      </p>
                      {/* <p
                        className="font-extralight text-sm py-2 text-justify"
                        style={{ fontFamily: "Montserrat", color: "white" }}
                      >
                        Please note may have suffered impermanence loss. You can
                        learn more about impermanence loss by clicking the info
                        button.
                      </p> */}
                      <button
                        style={{ fontSize: "12px" }}
                        className="btn bg-[#ff5723] border-[#ff5723] hover:bg-transparent hover:text-[#ff5723] hover:border-[#ff5723] font-[Montserrat] focus:animate-bounce my-8 text-white"
                        onClick={async () => {
                          await removeLiquidity();
                          await refresh();
                        }}
                      >
                        confirm unstaking
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
