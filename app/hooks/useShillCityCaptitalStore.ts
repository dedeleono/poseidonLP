import create from "zustand";
import * as anchor from "@project-serum/anchor";
import {
    AccountInfo,
    ParsedAccountData,
    PublicKey,
} from "@solana/web3.js";
import { Provider } from "@project-serum/anchor";
import {
    TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import {getShellToken, getTrtnToken, getUsdcToken} from "../utils/token";
import {getSccAccounts} from "../utils/account";

type SccStats = {
    trtnBalance: number;
    shellBalance: number;
    usdcBalance: number;
};

interface UseShillCityCapitalStore {
    sccStats : SccStats;
    getSccStats: (wallet: AnchorWallet) => void;
}

const useShillCityCapitalStore = create<UseShillCityCapitalStore>((set: any, get: any) => ({
    sccStats: {} as SccStats,
    getSccStats: async (wallet: AnchorWallet) => {
        const connection = new anchor.web3.Connection(
            "https://bold-fragrant-cloud.solana-mainnet.quiknode.pro/6c6aa8c19e1c474208e30db3fa3a74c4a12ffff9/",
        );
        const provider = new Provider(connection, wallet, {});
        const shellToken = getShellToken();
        const trtnToken = getTrtnToken();
        const usdcToken = getUsdcToken();
        // get shill city capital accounts
        const sccAccounts = getSccAccounts();
        const sccAccountsTokens = [];
        // get shill city capital tokens
        for (const sccAccount of sccAccounts) {
            const accountTokens = await provider.connection.getParsedTokenAccountsByOwner(sccAccount, {programId: TOKEN_PROGRAM_ID})
            sccAccountsTokens.push(accountTokens);
        }

        let usdcBalance = 0;
        let shellBalance = 0;
        let trtnBalance = 0;
        sccAccountsTokens.forEach((sccAccountTokens: any) => {
            if(sccAccountTokens?.value?.length) {
                sccAccountTokens.value.forEach((tokenAccount: { pubkey:PublicKey , account:AccountInfo<ParsedAccountData>}) => {
                    const uiAmount = tokenAccount?.account?.data?.parsed?.info?.tokenAmount?.uiAmount || 0;
                    switch(tokenAccount.account.data.parsed.info.mint) {
                        case shellToken.toBase58():
                            shellBalance += uiAmount;
                            break;
                        case usdcToken.toBase58():
                            usdcBalance += uiAmount;
                            break;
                        case trtnToken.toBase58():
                            trtnBalance += uiAmount;
                            break;
                    }
                })
            }
        });
        set({
            sccStats: {
                usdcBalance,
                shellBalance,
                trtnBalance,
            },
        });
    }
}))
export default useShillCityCapitalStore
