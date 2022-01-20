import Head from "next/head";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import * as anchor from "@project-serum/anchor";
import { Program, Provider } from "@project-serum/anchor";
import poseidonIDL from "../../target/idl/poseidon.json";
import { PublicKey, ConfirmOptions } from "@solana/web3.js";
import {
  Token,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useAnchorWallet } from "@solana/wallet-adapter-react";

import { useState, useEffect } from "react";
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
};

export default function Home() {
  const TOKEN_MULTIPLIER = 1e6;
  const wallet = useAnchorWallet();
  const [psdnState, setPsdnState] = useState({} as psdnState);
  const [psdnStats, setPsdnStats] = useState({} as any);
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

    // const walletShellAccount = await Token.getAssociatedTokenAddress(
    //   ASSOCIATED_TOKEN_PROGRAM_ID,
    //   TOKEN_PROGRAM_ID,
    //   shellToken,
    //   program.provider.wallet.publicKey
    // );
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
    });
  };
  const getPsdnStats = async () => {
    const psdnAccount = await psdnState.program.account.config.fetch(
      psdnState.poseidon
    );
    console.log("psdnAccount", psdnAccount);
    console.log("psdnAccount.usdcAmount", psdnAccount.usdcAmount.toNumber());
    console.log("psdnAccount.trtnAmount", psdnAccount.trtnAmount.toNumber());
    setPsdnStats(psdnAccount);
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
  return (
    <div>
      <Head>
        <title>Poseidon Liquidity Pool</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="grid grid-cols-1 min-h-screen bg-base-200">
          <div className="text-center hero-content">
            <div className="max-w-xl">
              <div className="mockup-phone border-primary">
                <div className="camera"></div>
                <div className="display">
                  <div
                    className="artboard phone-3 artboard-demo px-4"
                    style={{ height: "420px" }}
                  >
                    <div className="grid grid-cols-3 gap-2 w-full h-8">
                      <div className="col-span-2"></div>
                      <div className="badge badge-ghost badge-lg  shadow-md">
                        {`TRITON: ${
                          psdnStats?.usdcAmount?.toNumber() /
                          psdnStats?.trtnAmount?.toNumber()
                        }$`}
                      </div>
                    </div>
                    <div className="navbar mb-2 shadow-lg bg-base-200 text-neutral-content rounded-box relative min-w-full justify-center">
                      {/* <div className="px-2 mx-2 navbar-start">
                        <span className="text-lg font-bold">Poseidon</span>
                      </div> */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="btn gap-4 hover:bg-transparent hover:border-0 p-0">
                          <WalletMultiButton
                            style={{
                              all: "unset",
                              height: "100%",
                              width: "100%",
                              zIndex: "10",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              fontFamily: "Montserrat",
                            }}
                          />
                        </div>
                        <div className="btn gap-4 hover:bg-transparent hover:border-0 p-0">
                          <WalletDisconnectButton
                            style={{
                              all: "unset",
                              height: "100%",
                              width: "100%",
                              zIndex: "10",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              fontFamily: "Montserrat",
                              padding: "0px !important",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    {/* swap section */}
                    <div className="flex flex-row w-full h-[16rem]">
                      <div className="grid flex-grow h-full card bg-base-300 rounded-box place-items-center">
                        <div>
                          <label className="input-group input-group-md">
                            <input
                              type="text"
                              readOnly
                              value="0.099"
                              className="input input-bordered input-md"
                            />
                            <span className="bg-base-200">TRTN</span>
                          </label>
                          <div className="divider"></div>
                          <label className="input-group input-group-md">
                            <input
                              type="text"
                              readOnly
                              value="0.099"
                              className="input input-bordered input-md"
                            />
                            <span className="bg-base-200">USDC</span>
                          </label>
                          <div className="grid grid-cols-2 mt-4 gap-2">
                            <button className="btn btn-outline focus:animate-bounce ">
                              swap
                            </button>
                            <button className="btn btn-primary focus:animate-bounce text-white">
                              stake
                            </button>
                          </div>
                        </div>
                      </div>
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
