import {FC} from "react";
import {useAnchorWallet} from "@solana/wallet-adapter-react";
import WalletMultiButtonStyled from "./WalletMultiButtonStyled";

interface ConnectDialogProps {
    title?: string;
}

/**
 * Component that contains the global menu
 */
const ConnectDialog: FC<ConnectDialogProps>  = ({title = 'Connect your wallet to provide liquidity and view your deposits.'}) => {
    const wallet = useAnchorWallet();

    if(!wallet?.publicKey) {
        return (
            <div className="card rounded-box border  my-10 backdrop-blur-sm backdrop-brightness-10	">
                <div className="card-body text-center  items-center">
                    <div className="text-2xl pb-8">{title}</div>
                    <WalletMultiButtonStyled className="btn-lg" />
                </div>

            </div>
        );
    }
    return null;

}

export default ConnectDialog;
