import useLPStore from "../../hooks/useLPStore";
import {useState} from "react";
import LoaderModal from "./LoaderModal";


export default function HarvestButton() {
    // TODO when clicked disable and change button text
    // TODO disable when no shell is staked
    const stakeRedeem = useLPStore((state => state.stakeRedeem));
    const getAccountStats = useLPStore((state => state.getAccountStats));
    const getPsdnStats = useLPStore((state => state.getPsdnStats));
    const getTideStats = useLPStore((state => state.getTideStats));

    const [showLoaderModal, setShowLoaderModal] = useState(false);

    return (
        <>
            <LoaderModal isOpen={showLoaderModal} handleFinished={() => {
                setShowLoaderModal(false);
                getAccountStats();
                getPsdnStats();
                getTideStats();
            }} />
            <button
                className="btn rounded-full btn-outline btn-md btn-accent relative shadow"
                onClick={async () => {
                    await stakeRedeem();
                    setShowLoaderModal(true);
                }}
            >
                Harvest
            </button>
        </>
    );
}
