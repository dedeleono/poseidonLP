import {FC} from "react";
import Modal from "../shared/Modal";

interface WithdrawConfirmModalProps {
    isOpen: boolean,
    isPending: boolean,
    handleClose?: () => void,
    handleConfirm?: () => void,
}

/**
 * Component that contains the global menu
 */
const WithdrawConfirmModal: FC<WithdrawConfirmModalProps>  = ({isOpen,handleClose, handleConfirm, isPending}) => {
    return (
        <Modal isOpen={isOpen} handleClose={handleClose}>
            <div className="flex justify-around">
                <h4
                    className="text-center font-jangkuy text-xl font-bold mt-6"
                >
                    WITHDRAW LIQUIDITY
                </h4>
            </div>
            <p
                className="text-sm py-2 text-justify"
            >
                Clicking "confirm withdraw" below will burn all your shell tokens
                and give you back the amount of TRITON and USDC you own
                in the pool. This includes your share of the 1% trading
                fee charged on all swaps since you deposited.
            </p>
            <div className="pt-4 pb-4">
                <button
                    className={`btn rounded-full btn-block btn-lg btn-accent relative overflow-hidden shadow ${isPending ? 'loading' : ''}`}
                    onClick={handleConfirm}
                >
                    <img src="/images/bubbles-1.svg" className="absolute top-0 -right-10" />
                    <img src="/images/bubbles-2.svg" className="absolute top-0 left-0" />
                    confirm withdraw
                </button>
            </div>
        </Modal>
    );

}

export default WithdrawConfirmModal;
