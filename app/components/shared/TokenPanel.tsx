import {FC} from "react";
import {useAnchorWallet} from "@solana/wallet-adapter-react";
import useLPStore from "../../hooks/useLPStore";
import CountUpValue from "./CountUpValue";
import {formatNumberToUSD, getNumber} from "../../utils/format";

const TokenPanel: FC  = () => {
    const wallet = useAnchorWallet();
    const psdnStats = useLPStore((state => state.psdnStats));
    const accountStats = useLPStore((state => state.accountStats));
    const psdnRatio = useLPStore((state => state.psdnRatio));

    let totalIssuedShell = null;
    let totalLiquidity = null;
    let shellValue = null;
    let shellValueWallet = null;
    let trtnValueWallet = null;
    if(wallet?.publicKey && !!psdnStats?.trtnAmount) {
        const totalTrtn = (psdnStats.trtnAmount as any / 1e6);
        const totalUsdc = (psdnStats.usdcAmount as any / 1e6);
        // const totalPooledTrtn = getNumber(psdnStats.trtnAmount, 6);
        totalLiquidity = totalTrtn * psdnRatio  + totalUsdc;
        totalIssuedShell = getNumber(psdnStats.shellAmount, 6);
        const accountShell = accountStats?.shellBalance || 0;
        //shellValue = formatNumberToUSD(2 * (totalPooledTrtn / totalIssuedShell));
        shellValue = formatNumberToUSD(totalLiquidity / totalIssuedShell);
        // totalLiquidity * (unstakedShell+stakedShell) / issuedShell
        shellValueWallet = accountShell ? formatNumberToUSD((totalLiquidity * (accountShell)) / totalIssuedShell) : 0;
        trtnValueWallet = accountStats.trtnBalance ? formatNumberToUSD(psdnRatio * accountStats.trtnBalance) : 0;
    }



    if(wallet?.publicKey && accountStats) {
        return (
            <div className="card bg-neutral/50 backdrop-blur-sm p-5 mt-8">
                <div className="text-lg">Your wallet tokens</div>
                <div className="divider mt-1 mb-1 divide-base-content" />
                <div className="flex flex-col flex-grow gap-4">
                    <div className="flex flex-row gap-2">
                        <div className="w-10">
                            <img src="/images/trtn.png" alt="Triton" />
                        </div>
                        <div className="flex flex-col flex-grow">
                            <div className="flex flex-row gap-4">
                                <div className="text-lg">
                                    TRTN
                                </div>
                                <div className="flex-grow text-lg text-right">
                                    {<CountUpValue value={accountStats.trtnBalance} showCents={true} />}
                                </div>
                            </div>
                            <div className="flex flex-row gap-4">
                                <div className="opacity-50 text-xs">
                                    {psdnRatio ? formatNumberToUSD(psdnRatio) : '-'}
                                </div>
                                <div className="flex-grow text-right opacity-50 text-xs">
                                    {trtnValueWallet}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-row gap-2">
                        <div className="w-10">
                            <img src="/images/shell.png" alt="Shell" />
                        </div>
                        <div className="flex flex-col flex-grow">
                            <div className="flex flex-row gap-4">
                                <div className="text-lg">
                                    SHELL
                                </div>
                                <div className="flex-grow text-lg text-right">
                                    {<CountUpValue value={accountStats.shellBalance} showCents={true} />}
                                </div>
                            </div>
                            <div className="flex flex-row gap-4">
                                <div className="opacity-50 text-xs">
                                    {shellValue}
                                </div>
                                <div className="flex-grow text-right opacity-50 text-xs">
                                    {shellValueWallet}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-row gap-2">
                        <div className="w-10">
                            <img src="/images/usdc.png" alt="usdc" />
                        </div>
                        <div className="flex flex-col flex-grow">
                            <div className="flex flex-row gap-4">
                                <div className="text-lg">
                                    USDC
                                </div>
                                <div className="flex-grow text-lg text-right">
                                    {<CountUpValue value={accountStats.usdcBalance} showCents={true} />}
                                </div>
                            </div>
                            <div className="flex flex-row gap-4">
                                <div className="opacity-50 text-xs">
                                    $1
                                </div>
                                <div className="flex-grow text-right opacity-50 text-xs">
                                    {accountStats?.usdcBalance ? formatNumberToUSD(accountStats?.usdcBalance) : 0}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    return null;

}

export default TokenPanel;
