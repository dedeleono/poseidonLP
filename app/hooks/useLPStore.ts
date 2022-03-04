import create from "zustand";
import poseidonIDL from "../../target/idl/poseidon.json";
import tideIDL from "../../target/idl/tide_pool.json";
import * as anchor from "@project-serum/anchor";
import { ConfirmOptions, Connection, PublicKey } from "@solana/web3.js";
import { BN, Program, Provider } from "@project-serum/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { AnchorWallet } from "@solana/wallet-adapter-react";

type TideState = {
  program: PublicKey;
  connection: PublicKey;
  tide: PublicKey;
  stake: PublicKey;
  trtnToken: PublicKey;
  tideTrtnAccount: PublicKey;
  shellToken: PublicKey;
  tideShellAccount: PublicKey;
  walletShellAccount: PublicKey;
  walletTrtnAccount: PublicKey;
};

type TideStats = {
  tideAccount: PublicKey;
  stakeAccount: PublicKey;
};

type PsdnState = {
  program: any;
  connection: Connection;
  poseidon: PublicKey;
  trtnToken: PublicKey;
  psdnTrtnAccount: PublicKey;
  usdcToken: PublicKey;
  psdnUsdcAccount: PublicKey;
  // shellToken: any;
  psdnShellAccount: PublicKey;
  walletTrtnAccount: PublicKey;
  walletUsdcAccount: PublicKey;
  walletShellAccount: PublicKey;
};

type PsdnStats = {
  authority: PublicKey;
  poolConstant: BN;
  poolInit: boolean;
  psdnBump: number;
  shellAmount: BN;
  shellBump: number;
  trtnAmount: BN;
  trtnBump: number;
  usdcAmount: BN;
  usdcBump: number;
};

type AccountStats = {
  trtnBalance: number;
  shellBalance: number;
  usdcBalance: number;
};

const TOKEN_MULTIPLIER = 1e6;

const useLPStore = create((set: any, get: any) => ({
  tideState: {} as TideState,
  tideStats: {} as TideStats,
  psdnState: {} as PsdnState,
  psdnStats: {} as PsdnStats,
  psdnRatio: 0 as number,
  accountStats: {} as AccountStats,
  setupPoseidon: async (wallet: AnchorWallet) => {
    const psdnIdl = poseidonIDL as anchor.Idl;
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

    set({
      psdnState: {
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
      },
    });
  },
  setupTide: async (wallet: AnchorWallet) => {
    const tideIdl = tideIDL as anchor.Idl;
    const opts = {
      preflightCommitment: "processed" as ConfirmOptions,
    };
    const endpoint = "https://api.devnet.solana.com";
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
    const TideProgram = new anchor.web3.PublicKey(
      "TideNjRo78A11YtA4QV3BiH43SBqWASWaCJxrvTAGwo"
    );

    const program = new Program(tideIdl, TideProgram, provider);

    // main data account generation (pda)
    const [tide, _tideBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("tide_config")],
      program.programId
    );

    // console.log("tide", tide.toString());

    // stake data account generation (pda)
    const [stake, _stakeBump] = await anchor.web3.PublicKey.findProgramAddress(
      [wallet.publicKey.toBuffer(), Buffer.from("stake")],
      program.programId
    );

    // console.log("stake", stake.toString());

    // Get PDA accounts for triton
    // const trtnToken = new anchor.web3.PublicKey(
    //   "8rDACnycUMGFvndX74ZM9sxjEbR3gUpVHDjDbL4qW6Zf"
    // );
    // devnet
    const trtnToken = new anchor.web3.PublicKey(
      "7RDibaGCRPSNBecU34AQPDioVYtgz1adYzPVaF4uryd9"
    );

    const [tideTrtnAccount, tideTrtnBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [tide.toBuffer(), Buffer.from("tide_trtn_account")],
        program.programId
      );
    // const tideTrtnAccount = await Token.getAssociatedTokenAddress(
    //   ASSOCIATED_TOKEN_PROGRAM_ID,
    //   TOKEN_PROGRAM_ID,
    //   trtnToken,
    //   program.programId
    // );
    // console.log("tideTrtnAccount", tideTrtnAccount.toString());
    // console.log("tideTrtnBump", tideTrtnBump);

    // const tideTrtnAccountBalance =
    //   await program.provider.connection.getTokenAccountBalance(tideTrtnAccount);
    // console.log("tideTrtnAccountBalance", tideTrtnAccountBalance);

    const walletTrtnAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      trtnToken,
      program.provider.wallet.publicKey
    );
    // console.log("walletTrtnAccount", walletTrtnAccount.toString());

    // Get PDA accounts for shell
    // offical shell token on mainnet:
    // mock shell on devnet: CJGjnKBx1E5dWUhDUn2J2HHAse5qGBDtd2wKAAN4s1M8
    const shellToken = new anchor.web3.PublicKey(
      "CJGjnKBx1E5dWUhDUn2J2HHAse5qGBDtd2wKAAN4s1M8"
    );

    const [tideShellAccount, _tideShellBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [tide.toBuffer(), Buffer.from("tide_shell_account")],
        program.programId
      );

    // console.log("tideShellAccount", tideShellAccount.toString());

    // const tideShellAccount = await Token.getAssociatedTokenAddress(
    //   ASSOCIATED_TOKEN_PROGRAM_ID,
    //   TOKEN_PROGRAM_ID,
    //   shellToken,
    //   program.programId
    // );
    // console.log("tideShellAccount", tideShellAccount.toString());
    // console.log("tideShellBump", tideShellBump);

    const walletShellAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      tideShellAccount,
      program.provider.wallet.publicKey
    );
    // console.log("walletShellAccount", walletShellAccount.toString());
    set({
      tideState: {
        program,
        connection,
        tide,
        stake,
        trtnToken,
        tideTrtnAccount,
        shellToken,
        tideShellAccount,
        walletShellAccount,
        walletTrtnAccount,
      },
    });
  },
  stakeDeposit: async (shellAmount: number) => {
    await get().getTideStats();
    const _tideState = get().tideState;
    const _tideStats = get().tideStats;
    const _shell = new BN(shellAmount * TOKEN_MULTIPLIER);
    const config = {
      accounts: {
        config: _tideState.tide,
        stake: _tideState.stake,
        authority: _tideState.program.provider.wallet.publicKey,
        authShellAccount: _tideState.walletShellAccount,
        tideShellAccount: _tideState.tideShellAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
    };
    let stakeDeposit = null;
    if(_tideStats.stakeAccount) {
      stakeDeposit = await _tideState.program.rpc.stakeDeposit(_shell, config);
      console.log("stakeDeposit", stakeDeposit);
    } else {
      stakeDeposit = await _tideState.program.rpc.stakeInit(_shell, config);
      console.log("stakeInit", stakeDeposit);
    }
  },
  stakeRedeem: async () => {
    await get().getTideStats();
    const _tideState = get().tideState;
    const stakeRedeem = await _tideState.program.rpc.stakeRedeem({
      accounts: {
        config: _tideState.tide,
        stake: _tideState.stake,
        authority: _tideState.program.provider.wallet.publicKey,
        authTrtnAccount: _tideState.walletTrtnAccount,
        tideTrtnAccount: _tideState.tideTrtnAccount,
        trtnMint: _tideState.trtnToken,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
    });
    console.log("stakeRedeem", stakeRedeem);
  },
  stakeWithdraw: async () => {
    await get().getTideStats();
    const _tideState = get().tideState;
    const stakeWithdraw = await _tideState.program.rpc.stakeWithdraw({
      accounts: {
        config: _tideState.tide,
        stake: _tideState.stake,
        authority: _tideState.program.provider.wallet.publicKey,
        authShellAccount: _tideState.walletShellAccount,
        tideShellAccount: _tideState.tideShellAccount,
        shellMint: _tideState.shellToken,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
    });
    console.log("stakeWithdraw", stakeWithdraw);
  },
  provideLiquidity: async (trtn: number, usdc: number) => {
    await get().getPsdnStats();
    const _trtn = new BN(trtn * TOKEN_MULTIPLIER);
    const _usdc = new BN(usdc * TOKEN_MULTIPLIER);
    // console.log("trtn", trtn.toNumber());
    // console.log("usdc", usdc.toNumber());
    // console.log("run simulate");
    const _psdnState = get().psdnState;
    const events = await _psdnState.program.rpc.provideLiquidity(_trtn, _usdc, {
      accounts: {
        config: _psdnState.poseidon,
        authority: _psdnState.program.provider.wallet.publicKey,
        usdcAccount: _psdnState.psdnUsdcAccount,
        trtnAccount: _psdnState.psdnTrtnAccount,
        usdcMint: _psdnState.usdcToken,
        trtnMint: _psdnState.trtnToken,
        shellMint: _psdnState.psdnShellAccount,
        authUsdcAccount: _psdnState.walletUsdcAccount,
        authTrtnAccount: _psdnState.walletTrtnAccount,
        authShellAccount: _psdnState.walletShellAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
    });
    console.log("events", events);
  },
  removeLiquidity: async () => {
    await get().getPsdnStats();
    let _psdnStats = get().psdnStats;
    const _psdnState = get().psdnState;
    console.log("psdnStats", _psdnStats);
    console.log(
      "psdnStats.shellAmount.toNumber()",
      _psdnStats.shellAmount.toNumber() / TOKEN_MULTIPLIER
    );

    const authShellBalance =
      await _psdnState.program.provider.connection.getTokenAccountBalance(
        _psdnState.walletShellAccount
      );
    const shell = new BN(authShellBalance.value.amount);
    console.log("shell", shell.toNumber() / TOKEN_MULTIPLIER);
    await _psdnState.program.rpc.removeLiquidity(shell, {
      accounts: {
        config: _psdnState.poseidon,
        authority: _psdnState.program.provider.wallet.publicKey,
        usdcAccount: _psdnState.psdnUsdcAccount,
        trtnAccount: _psdnState.psdnTrtnAccount,
        usdcMint: _psdnState.usdcToken,
        trtnMint: _psdnState.trtnToken,
        shellMint: _psdnState.psdnShellAccount,
        authUsdcAccount: _psdnState.walletUsdcAccount,
        authShellAccount: _psdnState.walletShellAccount,
        authTrtnAccount: _psdnState.walletTrtnAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
    });
    await get().getPsdnStats();
    _psdnStats = get().psdnStats;
    console.log("psdnStats", _psdnStats);
    console.log(
      "psdnStats.shellAmount.toNumber()",
      _psdnStats.shellAmount.toNumber() / TOKEN_MULTIPLIER
    );
  },
  swap: async (
    trtn: number,
    usdc: number,
    swapType: string,
    confirmed: boolean
  ) => {
    console.log(trtn, usdc, swapType, confirmed);
    await get().getPsdnStats();
    const _psdnStats = get().psdnStats;
    const pool_constant =
      _psdnStats.usdcAmount.toNumber() * _psdnStats.trtnAmount.toNumber();
    let slippage = 0;
    if (swapType === "trtn") {
      const new_trtn_amount =
        _psdnStats.trtnAmount.toNumber() + trtn * TOKEN_MULTIPLIER;
      const new_usdc_amount = pool_constant / new_trtn_amount;
      const usdc_to_send = _psdnStats.usdcAmount.toNumber() - new_usdc_amount;
      // console.log("swapAmounts.usdc", swapAmounts.usdc);
      // console.log("usdc_to_send", usdc_to_send / TOKEN_MULTIPLIER);
      slippage = Math.abs(1 - usdc_to_send / TOKEN_MULTIPLIER / usdc);
    } else if (swapType === "usdc") {
      const new_usdc_amount =
        _psdnStats.usdcAmount.toNumber() + usdc * TOKEN_MULTIPLIER;
      const new_trtn_amount = pool_constant / new_usdc_amount;
      const trtn_to_send = _psdnStats.trtnAmount.toNumber() - new_trtn_amount;
      // console.log("trtn_to_send", trtn_to_send / TOKEN_MULTIPLIER);
      // console.log("swapAmounts.usdc", swapAmounts.trtn);
      slippage = Math.abs(1 - trtn_to_send / TOKEN_MULTIPLIER / trtn);
    }
    // setSlippageAmount(slippage);
    if (slippage > 0.01 && !confirmed /*|| ( && !confirmed)*/) {
      throw new SlippageToHighError(`${slippage}`);
    } else {
      const _psdnState = get().psdnState;
      /// closeSlippageRef.current?.click();
      /// swapRef.current?.focus();
      if (swapType === "usdc") {
        // console.log("swapping usdc to trtn");
        const usdcToSwap = new BN(usdc * TOKEN_MULTIPLIER);
        // console.log("usdcToSwap", usdcToSwap.toNumber());
        await _psdnState.program.rpc.swapToTriton(usdcToSwap, {
          accounts: {
            config: _psdnState.poseidon,
            authority: _psdnState.program.provider.wallet.publicKey,
            usdcAccount: _psdnState.psdnUsdcAccount,
            trtnAccount: _psdnState.psdnTrtnAccount,
            usdcMint: _psdnState.usdcToken,
            trtnMint: _psdnState.trtnToken,
            authTrtnAccount: _psdnState.walletTrtnAccount,
            authUsdcAccount: _psdnState.walletUsdcAccount,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          },
        });
        /// await refresh();
      } else if (swapType === "trtn") {
        // console.log("swapping triton to usdc");
        const trtnToSwap = new BN(trtn * TOKEN_MULTIPLIER);
        // console.log("trtnToSwap", trtnToSwap.toNumber());
        await _psdnState.program.rpc.swapToUsdc(trtnToSwap, {
          accounts: {
            config: _psdnState.poseidon,
            authority: _psdnState.program.provider.wallet.publicKey,
            usdcAccount: _psdnState.psdnUsdcAccount,
            trtnAccount: _psdnState.psdnTrtnAccount,
            usdcMint: _psdnState.usdcToken,
            trtnMint: _psdnState.trtnToken,
            authUsdcAccount: _psdnState.walletUsdcAccount,
            authTrtnAccount: _psdnState.walletTrtnAccount,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          },
        });
        /// await refresh();
      }
    }
  },
  getPsdnStats: async () => {
    const psdnAccount = await get().psdnState.program.account.config.fetch(
      get().psdnState.poseidon
    );

    // console.log("psdnAccount", psdnAccount);
    // console.log("constant", psdnAccount.poolConstant.toNumber());
    // console.log(
    //     "amount owed",
    //     parseFloat(psdnAccount.usdcAmount.toNumber() + 1.5) /
    //     parseFloat(psdnAccount.poolConstant.toString())
    // );
    //
    // const real_x = psdnAccount.trtnAmount.toNumber();
    // const real_y = psdnAccount.usdcAmount.toNumber();
    // const real_k = real_x * real_y;
    //
    // const real_new_x = real_x + 1 * 1e6;
    // const real_new_y = real_k / real_new_x;
    //
    // const real_amount_owed = (real_y - real_new_y) / 1e6;
    //
    // console.log("real_trtn", real_x);
    // console.log("real_usdc", real_y);
    // console.log("real_k", real_k);
    // console.log("real_new_x", real_new_x);
    // console.log("real_new_y", real_new_y);
    // console.log("real_amount_owed", real_amount_owed);
    //
    // const x = 8000 * 1e6;
    // const y = 12001.5 * 1e6;
    // const k = x * y;
    //
    // const newX = x + 1 * 1e6;
    // const newY = k / newX;
    // const amountOwed = (y - newY) / 1e6;
    //
    // console.log("x", x);
    // console.log("y", y);
    // console.log("k", k);
    // console.log("newX", newX);
    // console.log("newY", newY);
    // console.log("amountOwed", amountOwed);
    //
    // console.log("psdnAccount.usdcAmount", psdnAccount.usdcAmount.toNumber());
    // console.log("psdnAccount.trtnAmount", psdnAccount.trtnAmount.toNumber());

    const psdnRatio =
      psdnAccount.usdcAmount.toNumber() / psdnAccount.trtnAmount.toNumber();
    // console.log(psdnAccount);
    // console.log("psdnqRatio", psdnRatio);
    set({ psdnRatio });
    set({ psdnStats: psdnAccount });
  },
  getTideStats: async () => {
    const tideAccount = await get().tideState.program.account.config.fetch(
      get().tideState.tide
    );
    let stakeAccount = null;
    try {
      stakeAccount = await get().tideState.program.account.stake.fetch(
        get().tideState.stake
      );
    } catch (e) {
      console.log("no stake account");
    }
    set({ tideStats: { tideAccount, stakeAccount } });
  },
  getAccountStats: async () => {
    const usdcBalance = await get()
      .psdnState.program.provider.connection.getTokenAccountBalance(
        get().psdnState.walletUsdcAccount
      )
      .then((balance: { value: { uiAmount: any } }) =>
        balance?.value?.uiAmount ? balance.value.uiAmount : 0
      )
      .catch(() => 0);
    const shellBalance = await get()
      .psdnState.program.provider.connection.getTokenAccountBalance(
        get().psdnState.walletShellAccount
      )
      .then((balance: { value: { uiAmount: any } }) =>
        balance?.value?.uiAmount ? balance.value.uiAmount : 0
      )
      .catch(() => 0);
    const trtnBalance = await get()
      .psdnState.program.provider.connection.getTokenAccountBalance(
        get().psdnState.walletTrtnAccount
      )
      .then((balance: { value: { uiAmount: any } }) =>
        balance?.value?.uiAmount ? balance.value.uiAmount : 0
      )
      .catch(() => 0);
    set({
      accountStats: {
        usdcBalance,
        shellBalance,
        trtnBalance,
      },
    });
  },
}));

export default useLPStore;
export class SlippageToHighError extends Error {}
