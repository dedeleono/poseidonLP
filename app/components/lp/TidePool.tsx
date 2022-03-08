import {FC} from "react";
import HarvestButton from "./HarvestButton";
import UnstakeButton from "./UnstakeButton";
import useLPStore from "../../hooks/useLPStore";
import {getNumber} from "../../utils/format";
import {useAnchorWallet} from "@solana/wallet-adapter-react";
import CountUpValue from "../shared/CountUpValue";

const TidePool: FC  = () => {
    const wallet = useAnchorWallet();
    const tideStats = useLPStore((state => state.tideStats));
    const psdnStats = useLPStore((state => state.psdnStats));

    let totalStakedShell = null;
    let APY = null;
    if(wallet?.publicKey && !!tideStats?.totalStakedShell && !!psdnStats?.trtnAmount) {
        totalStakedShell = getNumber(tideStats.totalStakedShell, 6);
        const totalPooledTrtn = getNumber(psdnStats.trtnAmount, 6);
        const totalIssuedShell = getNumber(psdnStats.shellAmount, 6);

        const shellValue = 2 * (totalPooledTrtn / totalIssuedShell)
        const tidePoolYield = 2000 / totalStakedShell;
        APY = 100 * 365 * (tidePoolYield / shellValue)
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
                        <div className="text-xs md:text-base opacity-50">Total Staked $SHELL</div>
                        <div className="text-base md:text-2xl">
                            {totalStakedShell ? <CountUpValue value={totalStakedShell} showCents={true} />: '-'}
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
            <div className="mt-3 p-5 xl:p-8">
                <div className="flex flex-row flex-wrap gap-4 md:gap-12">
                    <div className="flex-grow">
                        <div className="text-xs md:text-base opacity-50">Your Staked $SHELL</div>
                        <div className="text-base md:text-2xl">{tideStats?.walletStakedShell ? tideStats.walletStakedShell : '-'}</div>
                    </div>
                    <div className="flex-grow">
                        <HarvestButton />
                    </div>
                    <div className="">
                        <UnstakeButton />
                    </div>
                </div>
            </div>
        </div>
    );
}


export default TidePool;
