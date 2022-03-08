import {useState, useRef} from "react";
import useLPStore from "../../hooks/useLPStore";

export default function Stake() {
    const accountStats = useLPStore((state => state.accountStats));
    const stakeDeposit = useLPStore((state => state.stakeDeposit));

    const [shellAmount, setShellAmount] = useState(1.0);
    const [isPending, setIsPending] = useState(false);

    return (
        <div>
            <div>
                <h2>Stake $SHELL</h2>
                <p className="text-base w-9/12">
                    Stake your $SHELL in the Tide Pool and start harvesting $TRTN
                </p>
                <div className="text-right pb-1 text-sm opacity-50 mt-4">
                    <span>Balance: </span>
                    <span onClick={() => setShellAmount(accountStats.shellBalance)} className="cursor-pointer underline">
                        {accountStats.shellBalance}
                    </span>
                </div>
                <label className="flex flex-row items-center pb-5">
                    <img className="w-12 pr-2" src="/images/shell.png" />
                    <div className="w-17 text-xl pr-2">
                        <strong>SHELL</strong>
                    </div>
                    <input
                        type="number"
                        value={shellAmount}
                        onChange={(e) => {
                            const amount = parseFloat(e.target.value);
                            if (amount > 0) {
                                setShellAmount(amount);
                            } else {
                                setShellAmount(0.000001);
                            }
                        }}
                        className="input w-full rounded-3xl bg-opacity-50 spin-button-none"
                    />
                </label>
                <div className="mt-4 gap-2">
                    <button
                        className={`btn rounded-full btn-block btn-lg btn-accent relative overflow-hidden shadow ${isPending ? 'loading' : ''}`}
                        onClick={async () => {
                            setIsPending(true);
                            await stakeDeposit(shellAmount);
                            setIsPending(false);
                        }}
                    >
                        <img src="/images/bubbles-1.svg" className="absolute top-0 -right-10" />
                        <img src="/images/bubbles-2.svg" className="absolute top-0 left-0" />
                        stake
                    </button>
                </div>
            </div>
        </div>
    );
}
