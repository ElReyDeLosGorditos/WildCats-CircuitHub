import React from "react";
import "./Modal.css";

const ConfirmationModal = ({ show, onClose, onConfirm, message }) => {
    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <h3>Confirmation</h3>
                <p>{message}</p>
                <div className="modal-buttons">
                    <button className="cancel-button" onClick={onClose}>Cancel</button>
                    <button className="confirm-button" onClick={onConfirm}>Confirm</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;

