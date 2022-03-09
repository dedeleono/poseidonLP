import arrows from "../../public/images/arrows1.svg";
import arrowsWhite from "../../public/images/arrows1-white.svg";

import {useState, useEffect} from "react";
import useLPStore, {SlippageToHighError} from "../../hooks/useLPStore";
import SlippageConfirmModal from "./SlippageConfirmModal";

export default function Exchange() {
    const psdnRatio = useLPStore((state => state.psdnRatio));
    const accountStats = useLPStore((state => state.accountStats));
    const swap = useLPStore((state => state.swap));
    const [swapAmounts, setSwapAmounts] = useState({
        trtn: 0.0,
        usdc: 1.0,
        type: "usdc",
    });
    const [showSlippageModal, setShowSlippageModal] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [slippageAmount, setSlippageAmount] = useState(0);

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
            setSwapAmounts({...swapAmounts, type: "usdc"});
        } else if (swapAmounts.type === "usdc") {
            setSwapAmounts({...swapAmounts, type: "trtn"});
        }
    };

    const handleSwap = async (confirmed: boolean = false) => {
        try {
            setShowSlippageModal(false);
            setIsPending(true);
            await swap(swapAmounts.trtn, swapAmounts.usdc, swapAmounts.type, confirmed);
            setIsPending(false);
        } catch (e) {
            setIsPending(false);
            if (e instanceof SlippageToHighError) {
                // User needs to confirm
                setSlippageAmount(Number(e.message));
                setShowSlippageModal(true);
            }
        }
        /// refresh
    }

    useEffect(() => {
        if (psdnRatio > 0) {
            if (swapAmounts.type === "trtn") {
                calculateSwap(swapAmounts.trtn, null);
            } else if (swapAmounts.type === "usdc") {
                calculateSwap(null, swapAmounts.usdc);
            }
        }
    }, [psdnRatio]);


    const trtnField = (
        <label className="flex flex-row items-center pb-5">
            <img className="w-12 pr-2" src="/images/trtn.png"/>
            <div className="w-16 text-xl pr-2">
                <strong>TRTN</strong>
            </div>
            <input
                type="number"
                value={swapAmounts.trtn}
                onChange={(e) => {
                    const amount = parseFloat(e.target.value);
                    if (amount > 0) {
                        calculateSwap(amount, null);
                    } else {
                        calculateSwap(0.000001, null);
                    }
                }}
                className="input w-full rounded-3xl bg-opacity-50 spin-button-none"
            />
        </label>
    )
    const usdField = (
        <label className="flex flex-row items-center pb-5">
            <img className="w-12 pr-2" src="/images/usdc.png"/>
            <div className="w-16 text-xl pr-2">
                <strong>USDC</strong>
            </div>
            <input
                type="number"
                value={swapAmounts.usdc}
                onChange={(e) => {
                    const amount = parseFloat(e.target.value);
                    if (amount > 0) {
                        calculateSwap(null, amount);
                    } else {
                        calculateSwap(null, 0.000001);
                    }
                }}
                className="input w-full rounded-3xl bg-opacity-50 spin-button-none"
            />
        </label>
    )

    return (
        <div>
            <SlippageConfirmModal
                isOpen={showSlippageModal}
                handleClose={() => setShowSlippageModal(false)}
                handleConfirm={() => handleSwap(true)}
                isPending={isPending}
                slippageAmount={slippageAmount}
            />
            <div>
                <h2>Exchange</h2>
                <p className="text-base">
                    Buy $TRTN to deposit in the poseidon pool, breed/catch pets, participate in DAO raffles
                </p>
                <div className="-mb-3 mt-4">Trade</div>
                <div className="text-right pb-1 text-sm opacity-50">
                    <span>Balance: </span>
                    <span
                        onClick={() => swapAmounts.type === "trtn" ?
                            calculateSwap(accountStats.trtnBalance, null) :
                            calculateSwap(null, accountStats.usdcBalance)}
                        className="cursor-pointer underline"
                    >
                        { swapAmounts.type === "trtn" ? accountStats.trtnBalance : accountStats.usdcBalance}
                    </span>
                </div>
                {swapAmounts.type === "trtn" ? trtnField : usdField}
                <button
                    className="btn group bg-white bg-opacity-30 border-0 btn-circle btn-lg -mt-5 ml-8"
                    onClick={() => {
                        changeSwapType();
                    }}
                >
                    <img src={arrows.src} className="h-6 block group-hover:hidden"/>
                    <img src={arrowsWhite.src} className="h-6 hidden group-hover:block"/>
                </button>
                <div className="pb-2">For</div>
                {swapAmounts.type === "trtn" ? usdField : trtnField}
                <div className="mt-4 gap-2">
                    <button
                        className={`btn rounded-full btn-block btn-lg btn-accent relative overflow-hidden shadow ${isPending ? 'loading' : ''}`}
                        onClick={() => handleSwap(false)}
                    >
                        <img src="/images/bubbles-1.svg" className="absolute top-0 -right-10" />
                        <img src="/images/bubbles-2.svg" className="absolute top-0 left-0" />
                        Exchange
                    </button>
                </div>
            </div>
        </div>
    );
}
