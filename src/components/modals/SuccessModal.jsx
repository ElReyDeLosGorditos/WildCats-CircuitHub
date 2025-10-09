import React from "react";
import "./Modal.css";

const SuccessModal = ({ show, onClose, message }) => {
    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <h3>Success</h3>
                <p>{message}</p>
                <button className="confirm-button" onClick={onClose}>OK</button>
            </div>
        </div>
    );
};

export default SuccessModal;
