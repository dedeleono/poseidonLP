import {FC} from "react";

const TidePool: FC  = () => {
    // TODO Harvest
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
                        <div className="text-xs md:text-base opacity-50">Total Staked Shell</div>
                        <div className="text-base md:text-2xl">-</div>
                    </div>
                </div>
            </div>
            <div className="mt-3 p-5 xl:p-8">
                <div className="flex flex-row flex-wrap gap-4 md:gap-12">
                    <div>
                        <div className="text-xs md:text-base opacity-50">Your Rewards from Tide Pool</div>
                        <div className="text-base md:text-2xl">-</div>
                    </div>
                    <div className="flex-grow">
                        <div className="text-xs md:text-base opacity-50">Your Staked</div>
                        <div className="text-base md:text-2xl">-</div>
                    </div>
                    <div className="">
                        <button
                            className="btn rounded-full btn-outline btn-md btn-accent relative shadow"
                        >
                            Harvest
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default TidePool;
