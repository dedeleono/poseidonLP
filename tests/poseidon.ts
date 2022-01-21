import * as anchor from "@project-serum/anchor";
import { Program, BN } from "@project-serum/anchor";
import { Poseidon } from "../target/types/poseidon";
import { PublicKey } from "@solana/web3.js";
import {
  Token,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

describe("poseidon", async () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());
  const program = anchor.workspace.Poseidon as Program<Poseidon>;
  const TOKEN_MULTIPLIER = 1e6;
  // log wallet

  console.log(
    "wallet pulbic key",
    program.provider.wallet.publicKey.toString()
  );

  // main data account generation (pda)
  const [poseidon, psdnBump] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("psdn_config")],
    program.programId
  );

  console.log("poseidon", poseidon.toBase58());
  console.log("psdnBump", psdnBump);

  // Get PDA accounts for triton
  const trtnToken = new PublicKey(
    "8rDACnycUMGFvndX74ZM9sxjEbR3gUpVHDjDbL4qW6Zf"
  );

  const [psdnTrtnAccount, psdnTrtnBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [poseidon.toBuffer(), Buffer.from("psdn_trtn_account")],
      program.programId
    );
  console.log("psdnTrtnAccount", psdnTrtnAccount.toBase58());
  console.log("psdnTrtnBump", psdnTrtnBump);

  const walletTrtnAccount = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    trtnToken,
    program.provider.wallet.publicKey
  );
  console.log("walletTrtnAccount", walletTrtnAccount.toBase58());

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
  console.log("psdnUsdcAccount", psdnUsdcAccount.toBase58());
  console.log("psdnUsdcBump", psdnUsdcBump);

  const walletUsdcAccount = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    usdcToken,
    program.provider.wallet.publicKey
  );
  console.log("walletUsdcAccount", walletUsdcAccount.toBase58());

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
  console.log("psdnShellAccount", psdnShellAccount.toBase58());
  console.log("psdnShellBump", psdnShellBump);

  const walletShellAccount = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    psdnShellAccount,
    program.provider.wallet.publicKey
  );
  console.log("walletShellAccount", walletShellAccount.toBase58());

  let psdnAccount;

  it("Is initialized!", async () => {
    // only run once to make the config
    // await program.rpc.initialize(
    //   psdnBump,
    //   psdnUsdcBump,
    //   psdnTrtnBump,
    //   psdnShellBump,
    //   {
    //     accounts: {
    //       config: poseidon,
    //       authority: program.provider.wallet.publicKey,
    //       usdcAccount: psdnUsdcAccount,
    //       trtnAccount: psdnTrtnAccount,
    //       usdcMint: usdcToken,
    //       trtnMint: trtnToken,
    //       shellMint: psdnShellAccount,
    //       systemProgram: anchor.web3.SystemProgram.programId,
    //       tokenProgram: TOKEN_PROGRAM_ID,
    //       rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    //     },
    //   }
    // );
    // console.log("Your transaction signature", tx);
    psdnAccount = await program.account.config.fetch(poseidon);
    console.log("psdnAccount", psdnAccount);
  });

  // it("Provide Liquidity", async () => {
  //   // only run once to make the config
  //   // initial ratio 12/8
  //   const trtn = new BN(8000 * TOKEN_MULTIPLIER);
  //   const usdc = new BN(12000 * TOKEN_MULTIPLIER);

  //   await program.rpc.provideLiquidity(trtn, usdc, {
  //     accounts: {
  //       config: poseidon,
  //       authority: program.provider.wallet.publicKey,
  //       usdcAccount: psdnUsdcAccount,
  //       trtnAccount: psdnTrtnAccount,
  //       usdcMint: usdcToken,
  //       trtnMint: trtnToken,
  //       shellMint: psdnShellAccount,
  //       authUsdcAccount: walletUsdcAccount,
  //       authTrtnAccount: walletTrtnAccount,
  //       authShellAccount: walletShellAccount,
  //       systemProgram: anchor.web3.SystemProgram.programId,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //       associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  //       rent: anchor.web3.SYSVAR_RENT_PUBKEY,
  //     },
  //   });
  // });

  // it("Update Config", async () => {
  //   // only run once to make the config
  //   // initial ratio 12/8

  //   await program.rpc.updateConfig({
  //     accounts: {
  //       config: poseidon,
  //       authority: program.provider.wallet.publicKey,
  //       systemProgram: anchor.web3.SystemProgram.programId,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //       rent: anchor.web3.SYSVAR_RENT_PUBKEY,
  //     },
  //   });
  // });

  // it("Swap To Triton", async () => {
  //   // only run once to make the config
  //   // initial ratio 12/8
  //   const usdcToSwap = new BN(1.5 * TOKEN_MULTIPLIER);

  //   await program.rpc.swapToTriton(usdcToSwap, {
  //     accounts: {
  //       config: poseidon,
  //       authority: program.provider.wallet.publicKey,
  //       usdcAccount: psdnUsdcAccount,
  //       trtnAccount: psdnTrtnAccount,
  //       usdcMint: usdcToken,
  //       trtnMint: trtnToken,
  //       authTrtnAccount: walletTrtnAccount,
  //       authUsdcAccount: walletUsdcAccount,
  //       systemProgram: anchor.web3.SystemProgram.programId,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //       associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  //       rent: anchor.web3.SYSVAR_RENT_PUBKEY,
  //     },
  //   });
  // });
});
