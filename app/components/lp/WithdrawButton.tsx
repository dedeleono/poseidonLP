import { useState, useRef } from "react";
import useLPStore from "../../hooks/useLPStore";
import WithdrawConfirmModal from "./WithdrawConfirmModal";


export default function WithDrawButton() {
    const removeLiquidity = useLPStore((state => state.removeLiquidity));

    const [infoState, setInfoState] = useState(false);

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
        <>
            <button
                className="btn rounded-full btn-outline btn-md btn-accent relative shadow"
                onClick={() => {
                    setInfoState(true)
                }}
            >
                withdraw
            </button>
            <WithdrawConfirmModal
                isOpen={infoState}
                handleConfirm={async () => {
                    await removeLiquidity();
                    await refresh();
                }}
                handleClose={() => setInfoState(false)}
            />
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
                            <button className="btn loading btn-circle btn-lg bg-base-200 btn-ghost" />
                        </div>
                        <p style={{ fontFamily: "Montserrat" }}>Loading...</p>
                        <div className="stat-desc max-w-[90%]">
                            <progress value={loader} max="5000" className="progress progress-black" />
                        </div>
                        <a
                            href="#"
                            style={{ fontFamily: "Montserrat" }}
                            className="btn hidden"
                            ref={modalRef}
                        >
                            Close
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
