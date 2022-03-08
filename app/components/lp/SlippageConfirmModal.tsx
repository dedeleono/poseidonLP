import {FC} from "react";
import Modal from "../shared/Modal";

interface SlippageConfirmModalProps {
    isOpen: boolean,
    handleClose?: () => void,
    handleConfirm?: () => void,
    slippageAmount: number,
  isPending: boolean,
}

const SlippageConfirmModal: FC<SlippageConfirmModalProps>  = ({isOpen,handleClose, handleConfirm,slippageAmount, isPending}) => {
    return (
        <Modal isOpen={isOpen} handleClose={handleClose}>
            <div className="flex justify-around">
                <h4
                    className="text-center font-jangkuy text-xl font-bold mt-6"
                >
                    Slippage Warning
                </h4>
            </div>
            <p
                className="text-sm py-2 text-justify"
            >
                The amount you're trying to swap will change the price of
                the pool by over 1%. You'll only receive{" "}
                {((1 - slippageAmount) * 100).toFixed(2)}% of what was
                shown for a trade that large. Make sure you are
                comfortable swapping for the amount provided by your
                wallets approve pop up otherwise do not proceed.
            </p>
            <div className="pt-4 pb-4">
                <button
                    className={`btn rounded-full btn-block btn-lg btn-accent relative overflow-hidden shadow ${isPending ? 'loading' : ''}`}
                    onClick={handleConfirm}
                >
                    <img src="/images/bubbles-1.svg" className="absolute top-0 -right-10" />
                    <img src="/images/bubbles-2.svg" className="absolute top-0 left-0" />
                    confirm swap
                </button>
            </div>
        </Modal>
    );

}

export default SlippageConfirmModal;
