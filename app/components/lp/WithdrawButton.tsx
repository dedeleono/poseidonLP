import { useState, useRef } from "react";
import useLPStore from "../../hooks/useLPStore";
import WithdrawConfirmModal from "./WithdrawConfirmModal";

export default function WithDrawButton() {
    // TODO disable when shell is staked or chain calls to unstake + withdraw
    const removeLiquidity = useLPStore((state => state.removeLiquidity));
    const shellBalance = useLPStore((state => state.accountStats?.shellBalance));

    const [infoState, setInfoState] = useState(false);
    const [isPending, setIsPending] = useState(false);

    return (
        <>
            <button
                className={`btn rounded-full btn-outline btn-sm relative shadow ${isPending ? 'loading' : ''} ${shellBalance ? 'btn-accent' : ''}`}
                disabled={!shellBalance}
                onClick={() => {
                    setInfoState(true)
                }}
            >
                withdraw
            </button>
            <WithdrawConfirmModal
                isOpen={infoState}
                isPending={isPending}
                handleConfirm={async () => {
                  setIsPending(true);
                  await removeLiquidity();
                  setIsPending(false);
                }}
                handleClose={() => setInfoState(false)}
            />
        </>
    );
}
