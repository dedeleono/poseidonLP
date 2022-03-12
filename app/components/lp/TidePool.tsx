import {FC} from "react";
import HarvestButton from "./HarvestButton";
import UnstakeButton from "./UnstakeButton";
import useLPStore from "../../hooks/useLPStore";
import {formatNumberToUSD, getNumber} from "../../utils/format";
import {useAnchorWallet} from "@solana/wallet-adapter-react";
import CountUpValue from "../shared/CountUpValue";

const TidePool: FC  = () => {
    const wallet = useAnchorWallet();
    const tideStats = useLPStore((state => state.tideStats));
    const psdnStats = useLPStore((state => state.psdnStats));
    const accountShellBalance = useLPStore((state => state.accountStats.shellBalance));

    let totalStakedShell = null;
    let totalStakedPercentage = null;
    let APY = null;
    if(wallet?.publicKey && !!tideStats?.totalStakedShell && !!psdnStats?.trtnAmount) {
        totalStakedShell = getNumber(tideStats.totalStakedShell, 6);
        const totalPooledTrtn = getNumber(psdnStats.trtnAmount, 6);
        const totalIssuedShell = getNumber(psdnStats.shellAmount, 6);
        totalStakedPercentage = totalStakedShell/totalIssuedShell * 100;
        const shellValue = 2 * (totalPooledTrtn / totalIssuedShell);
        const tidePoolYield = 2000 / totalStakedShell;
        APY = 100 * 365 * (tidePoolYield / shellValue)

        // totalLiquidity * (unstakedShell+stakedShell) / issuedShell
        // totalPooledTrtn * (totalStakedShell) / totalIssuedShell;
    }

    return (
        <div className="pb-6 card bg-neutral/50">
            <div className="card bg-primary-content/80 p-5 xl:p-8 rounded-b-none">
                <div className="card gap-6 flex flex-row items-center pb-2">
                    <div className="-space-x-3 flex-shrink-0">
                        <div className="avatar z-10">
                            <div className="w-14">
                                <img src="/images/shell.png" alt="Shell" />
                            </div>
                        </div>
                    </div>
                    <h2>
                        Tide Pool
                    </h2>
                </div>
                <div className="flex flex-row gap-4 md:gap-12">
                    <div>
                        <div className="text-xs md:text-base opacity-50">Total staked $SHELL</div>
                        <div className="text-base md:text-2xl">
                            {(totalStakedShell && totalStakedPercentage) ? (
                              <>
                                  <CountUpValue value={totalStakedShell} showCents={false} />
                                  <span className="opacity-50 pl-2">
                                      (<CountUpValue value={totalStakedPercentage} showCents={false} />%)
                                  </span>

                              </>
                            ): '-'}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs md:text-base opacity-50">Daily emission</div>
                        <div className="text-base md:text-2xl">
                            2000 TRTN
                        </div>
                    </div>
                    <div>
                        <div className="text-xs md:text-base opacity-50">APY</div>
                        <div className="text-base md:text-2xl">
                            {APY ? <><CountUpValue value={APY} showCents={false} />%</>: '-'}
                        </div>
                    </div>
                </div>
            </div>
            {!!accountShellBalance && (
              <div className="alert m-3 -mb-4 alert-info shadow-lg">
                  <div className="flex gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                           className="stroke-current flex-shrink-0 w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <span>
                          You have
                          {' '}
                          <CountUpValue value={accountShellBalance} showCents={true} />
                          {' '}
                          unstaked SHELL, Stake it and start earning TRTN
                      </span>
                  </div>
              </div>
            )}
            <div className="mt-3 p-5 xl:p-8 xl:pb-4">
                <div className="flex grid grid-cols-3 flex-wrap gap-4 md:gap-6">
                    <div className="flex-grow">
                        <div className="text-xs md:text-base opacity-50">Your staked $SHELL</div>
                        <div className="text-base md:text-2xl">{tideStats?.walletStakedShell ? <CountUpValue value={tideStats.walletStakedShell} showCents={true} /> : '-'}</div>
                    </div>
                    <div className="flex-grow">
                        <div className="text-xs md:text-base opacity-50">Your daily reward</div>
                        <div className="text-base md:text-2xl">{(totalStakedShell && tideStats?.walletStakedShell) ? (<span><CountUpValue value={2000 * (tideStats.walletStakedShell/totalStakedShell)} showCents={true} /> TRTN</span>) : '-'}</div>
                    </div>
                    <div className="flex-grow">
                        <HarvestButton />
                    </div>
                </div>
                <div className="w-full mt-4 text-right">
                    <UnstakeButton />
                </div>
            </div>
        </div>
    );
}


export default TidePool;
