import {useState, useRef} from "react";
import useLPStore from "../../hooks/useLPStore";

export default function Stake() {
    const accountStats = useLPStore((state => state.accountStats));

    const [shellAmount, setShellAmount] = useState(1.0);

    const loaderRef = useRef<HTMLAnchorElement>(null);
    const modalRef = useRef<HTMLAnchorElement>(null);
    const [loader, setLoader] = useState(0);

    const txTimeout = 10000;

    const refresh = async () => {
        setLoader(0);
        loaderRef?.current?.click();
        const downloadTimer = setInterval(() => {
            if (loader >= 5000) {
                clearInterval(downloadTimer);
            }
            setLoader((prevLoader) => prevLoader + 10);
        }, 10);
        setTimeout(() => {
            modalRef?.current?.click();
            // forceUpdate();
            // setRefreshStateCounter(refreshStateCounter + 1);
            // window.location.reload();
            // refreshData();
        }, txTimeout + 10);
    };

    return (
        <div>
            {/* Loading Modal */}
            <a
                href="#loader"
                className="btn btn-primary hidden text-[Montserrat]"
                ref={loaderRef}
            >
                open loader
            </a>
            <div id="loader" className="modal">
                <div className="modal-box stat">
                    <div className="stat-figure text-primary text-[Montserrat]">
                        <button className="btn loading btn-circle btn-lg bg-base-200 btn-ghost"/>
                    </div>
                    <p style={{fontFamily: "Montserrat"}}>Loading...</p>
                    <div className="stat-desc max-w-[90%]">
                        <progress value={loader} max="5000" className="progress progress-black"/>
                    </div>
                    <a
                        href="#"
                        style={{fontFamily: "Montserrat"}}
                        className="btn hidden"
                        ref={modalRef}
                    >
                        Close
                    </a>
                </div>
            </div>
            <div>
                <h2>Stake $SHELL</h2>
                <p>
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
                        className="input input-lg w-full rounded-3xl bg-opacity-50 spin-button-none"
                    />
                </label>
                <div className="mt-4 gap-2">
                    <button
                        className="btn rounded-full btn-block btn-lg btn-accent relative overflow-hidden shadow"
                        onClick={() => {
                            // TODO call RPC
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
