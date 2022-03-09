import {FC} from "react";
import Modal from "../shared/Modal";

interface DepositConfirmModalProps {
    isOpen: boolean,
    handleClose?: () => void,
    handleConfirm?: () => void,
    isPending: boolean,
}

/**
 * Component that contains the global menu
 */
const DepositConfirmModal: FC<DepositConfirmModalProps>  = ({isOpen,handleClose, handleConfirm, isPending}) => {
    return (
        <Modal isOpen={isOpen} handleClose={handleClose}>
            <div className="flex justify-around">
                <h4
                    className="text-center font-jangkuy text-xl font-bold mt-6"
                >
                    ADD LIQUIDITY
                </h4>
            </div>
            <p
                className="text-sm py-2 text-justify"
            >
                By depositing USDC and Triton liquidity with Poseidon
                LP, you acknowledge that you understand the risks
                associated with providing liquidity and impermanent
                loss. For more detail, please see{" "}
                <a
                    className="inline underline"
                    target="_blank"
                    href={
                        "https://medium.com/coinmonks/understanding-impermanent-loss-9ac6795e5baa"
                    }
                >
                    Medium Article
                </a>{" "}
                and{" "}
                <a
                    className="inline underline"
                    target="_blank"
                    href={
                        "https://academy.binance.com/en/articles/impermanent-loss-explained"
                    }
                >
                    Binance Academy
                </a>
            </p>
            <p
                className="text-sm py-2 text-justify"
            >
                Once you have deposited funds, you will begin earning a
                portion of the 1% fee charged on every swap performed in
                the pool. Your share of the fee is proportional to your
                share of the pool liquidity. So if you deposited $100
                USDC and 100 $TRTN, and the pool had $1000 USDC and 1000
                $TRTN in total, you would receive 10% of the fee, or
                0.1% of every single swap executed in the pool. These
                fees simply accrue in your pool and will be collected
                automatically when you withdraw your funds, you do not
                need to claim them separately.
            </p>
            <div className="pt-4 pb-4">
                <button
                    className={`btn rounded-full btn-block btn-lg btn-accent relative overflow-hidden shadow ${isPending ? 'loading' : ''}`}
                    onClick={handleConfirm}
                >
                    <img src="/images/bubbles-1.svg" className="absolute top-0 -right-10" />
                    <img src="/images/bubbles-2.svg" className="absolute top-0 left-0" />
                    confirm deposit
                </button>
            </div>
        </Modal>
    );

}

export default DepositConfirmModal;
