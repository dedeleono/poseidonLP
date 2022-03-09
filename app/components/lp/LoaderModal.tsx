import {FC, useEffect, useState} from "react";
import Modal from "../shared/Modal";

interface DepositConfirmModalProps {
    isOpen: boolean,
    handleClose?: () => void,
    handleFinished: () => void,
}
const txTimeout = 10000;
/**
 * Modal with loading progress
 * handleConfirm is called when loader is finished
 */
const LoaderModal: FC<DepositConfirmModalProps>  = ({isOpen,handleClose, handleFinished}) => {
    const [loader, setLoader] = useState(0);
    useEffect(() => {
        if(isOpen) {
            setLoader(0);
            const downloadTimer = setInterval(() => {
                if (loader >= txTimeout) {
                    clearInterval(downloadTimer);
                }
                setLoader((prevLoader) => prevLoader + 10);
            }, 10);
            const timer = setTimeout(() => {
                handleFinished();
                clearTimeout(timer);
            }, txTimeout);
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} handleClose={handleClose}>
            <div className="stat-figure text-primary text-[Montserrat]">
                <button className="btn loading btn-circle btn-lg bg-base-200 btn-ghost"/>
            </div>
            <p style={{fontFamily: "Montserrat"}}>Loading...</p>
            <div className="stat-desc max-w-[90%]">
                <progress value={loader} max={txTimeout} className="progress progress-primary"/>
            </div>
        </Modal>
    );
}

export default LoaderModal;
