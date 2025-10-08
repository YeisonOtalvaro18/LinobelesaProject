import React, { useEffect } from "react";
import "../styles/login.css";

const Modal = ({ open, type = "success", message, onClose, loading }) => {
  useEffect(() => {
    return () => {
      // Cleanup if needed
    };
  }, []);

  if (!open) return null;

  return (
    <div className="modal-success-bg">
      <div className="modal-success-card animate-pop">
        <div className="modal-souccess-icon">
          {loading ? (
            <svg className="sending-spinner" width="60" height="60" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="26" stroke="#a749eb" strokeWidth="6" fill="none" opacity="0.2"/>
              <circle cx="30" cy="30" r="26" stroke="#a749eb" strokeWidth="6" fill="none"
                strokeDasharray="120" strokeDashoffset="60"
                style={{animation: "spin 1s linear infinite"}}/>
            </svg>
          ) : (
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              <circle cx="30" cy="30" r="30" fill="#a749eb"/>
              <path d="M18 32.5L27 41.5L43 23.5" stroke="#fff" strokeWidth="4"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <h3>{message}</h3>
        {!loading && (
          <button className="auth-button modal-success-btn" onClick={onClose}>
            Cerrar
          </button>
        )}
      </div>
    </div>
  );
};

export default Modal;
