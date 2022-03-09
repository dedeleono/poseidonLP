import {useState, useEffect, useRef} from "react";
import DepositConfirmModal from "./DepositConfirmModal";
import useLPStore from "../../hooks/useLPStore";

export default function Deposit() {
    const provideLiquidity = useLPStore((state => state.provideLiquidity));
    const psdnRatio = useLPStore((state => state.psdnRatio));
    const accountStats = useLPStore((state => state.accountStats));

    const [swapAmounts, setSwapAmounts] = useState({
        trtn: 1.0,
        usdc: 0.0,
        type: "trtn",
    });

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isPending, setIsPending] = useState(false);

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


    useEffect(() => {
        if (psdnRatio > 0) {
            if (swapAmounts.type === "trtn") {
                calculateSwap(swapAmounts.trtn, null);
            } else if (swapAmounts.type === "usdc") {
                calculateSwap(null, swapAmounts.usdc);
            }
        }
    }, [psdnRatio]);

    return (
        <div>
            <DepositConfirmModal
                isOpen={showConfirmModal}
                isPending={isPending}
                handleConfirm={async () => {
                    setIsPending(true);
                    await provideLiquidity(swapAmounts.trtn, swapAmounts.usdc);
                    setIsPending(false);
                    setShowConfirmModal(false)
                }}
                handleClose={() => setShowConfirmModal(false)}
            />
            <div>
                <h2>Deposit Liquidity</h2>
                <p className="text-base w-10/12">
                    Deposit $TRTN + $USDC and receive $SHELL to stake in the Tide Pool
                </p>
                <div className="text-right pb-1 text-sm opacity-50 mt-4">
                    <span>Balance: </span>
                    <span onClick={() => calculateSwap(accountStats.trtnBalance, null)} className="cursor-pointer underline">
                        {accountStats.trtnBalance}
                    </span>
                </div>
                <label className="flex flex-row items-center pb-5">
                    <div className="w-16 pr-2" />
                    <img className="w-12 pr-2" src="/images/trtn.png" />
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
                <div className="text-right pb-1 text-sm opacity-50">
                    <span>Balance: </span>
                    <span onClick={() => calculateSwap(null, accountStats.usdcBalance)} className="cursor-pointer underline">
                        {accountStats.usdcBalance}
                    </span>
                </div>
                <label className="flex flex-row items-center pb-5">
                    <div className="w-16 pr-2 text-4xl text-right leading-none -mt-1" >
                        +
                    </div>
                    <img className="w-12 pr-2" src="/images/usdc.png" />
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
                <div className="mt-4 gap-2">
                    <button
                        className={`btn rounded-full btn-block btn-lg btn-accent relative overflow-hidden shadow ${isPending ? 'loading' : ''}`}
                        onClick={() => setShowConfirmModal(true)}
                    >
                        <img src="/images/bubbles-1.svg" className="absolute top-0 -right-10" />
                        <img src="/images/bubbles-2.svg" className="absolute top-0 left-0" />
                        deposit
                    </button>
                </div>
            </div>
        </div>
    );
}
