import ReactDOM from "react-dom";
import React from "react";

const ReviewReqModal = ({ children }) => {
    return ReactDOM.createPortal(
        <div className="modal-overlay">
            <div className="modal-content">
                {children}
            </div>
        </div>,
        document.body
    );
};

export default ReviewReqModal;