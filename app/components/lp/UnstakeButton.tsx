import useLPStore from "../../hooks/useLPStore";
import {useState} from "react";

export default function UnstakeButton() {
    const stakeWithdraw = useLPStore((state => state.stakeWithdraw));
    const walletStakedShell = useLPStore((state => state.tideStats?.walletStakedShell));

    const [isPending, setIsPending] = useState(false);

    return (
      <button
        className={`btn rounded-full btn-outline btn-md relative shadow ${isPending ? 'loading' : ''}  ${walletStakedShell ? 'btn-accent' : ''}`}
        disabled={!walletStakedShell}
        onClick={async () => {
          setIsPending(true);
          await stakeWithdraw();
          setIsPending(false);
        }}
      >
        Unstake
      </button>
    );
}
