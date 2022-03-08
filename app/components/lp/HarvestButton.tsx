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
                className="btn rounded-full btn-block btn-md btn-accent relative overflow-hidden shadow"
                onClick={async () => {
                  try {
                    await stakeRedeem();
                    setShowLoaderModal(true);
                  } catch (err) {
                    console.log(err);
                  }
                }}
            >
              <img src="/images/bubbles-1.svg" className="absolute top-0 -right-10" />
              <img src="/images/bubbles-2.svg" className="absolute top-0 left-0" />
                Harvest
            </button>
        </>
    );
}
