import {FC} from "react";
import Modal from "../shared/Modal";

interface WithdrawConfirmModalProps {
    isOpen: boolean,
    handleClose?: () => void,
    handleConfirm?: () => void,
}

/**
 * Component that contains the global menu
 */
const WithdrawConfirmModal: FC<WithdrawConfirmModalProps>  = ({isOpen,handleClose, handleConfirm}) => {
    return (
        <Modal isOpen={isOpen} handleClose={handleClose}>
            <div className="flex justify-around">
                <h4
                    className="text-center text-xl font-bold mt-6"
                    style={{ fontFamily: "Jangkuy", color: "white" }}
                >
                    WITHDRAW LIQUIDITY
                </h4>
            </div>
            <p
                className="font-extralight text-sm py-2 text-justify"
                style={{ fontFamily: "Montserrat", color: "white" }}
            >
                Clicking unstake below will burn all your shell tokens
                and give you back the amount of TRITON and USDC you own
                in the pool. This includes your share of the 1% trading
                fee charged on all swaps since you deposited.
            </p>
            {/* <p
                className="font-extralight text-sm py-2 text-justify"
                style={{ fontFamily: "Montserrat", color: "white" }}
              >
                Please note may have suffered impermanence loss. You can
                learn more about impermanence loss by clicking the info
                button.
              </p> */}
            <div className="pt-4 pb-4">
                <button
                    className="btn rounded-full btn-block btn-lg btn-accent relative overflow-hidden shadow"
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
