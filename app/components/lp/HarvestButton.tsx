import useLPStore from "../../hooks/useLPStore";
import {useState} from "react";

export default function HarvestButton() {
    const stakeRedeem = useLPStore((state => state.stakeRedeem));
    const walletStakedShell = useLPStore((state => state.tideStats?.walletStakedShell));

    const [isPending, setIsPending] = useState(false);

    return (
      <button
        className={`btn rounded-full btn-block btn-md relative overflow-hidden shadow ${isPending ? 'loading' : ''}  ${walletStakedShell ? 'btn-accent' : ''}`}
        disabled={!walletStakedShell}
        onClick={async () => {
          setIsPending(true);
          await stakeRedeem();
          setIsPending(false);
        }}
      >
        <img src="/images/bubbles-1.svg" className="absolute top-0 -right-10" />
        <img src="/images/bubbles-2.svg" className="absolute top-0 left-0" />
        Harvest
      </button>
    );
}
