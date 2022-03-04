import { useState, useRef } from "react";
import useLPStore from "../../hooks/useLPStore";
import WithdrawConfirmModal from "./WithdrawConfirmModal";
import LoaderModal from "./LoaderModal";

export default function WithDrawButton() {
    // TODO disable when shell is staked or chain calls to unstake + withdraw
    const removeLiquidity = useLPStore((state => state.removeLiquidity));
    const getAccountStats = useLPStore((state => state.getAccountStats));
    const getPsdnStats = useLPStore((state => state.getPsdnStats));

    const [infoState, setInfoState] = useState(false);
    const [showLoaderModal, setShowLoaderModal] = useState(false);

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
                    setShowLoaderModal(true);
                }}
                handleClose={() => setInfoState(false)}
            />
            <LoaderModal isOpen={showLoaderModal} handleFinished={() => {
                setShowLoaderModal(false);
                getAccountStats();
                getPsdnStats();
            }} />
        </>
    );
}
