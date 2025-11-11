import React from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  variant = "primary" // "danger" or "primary"
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const isDanger = variant === "danger";

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200">
          {/* Icon */}
          <div className={`flex items-center justify-center w-16 h-16 rounded-full mb-6 mx-auto ${
            isDanger 
              ? 'bg-red-500/10 border border-red-500/20' 
              : 'bg-blue-500/10 border border-blue-500/20'
          }`}>
            {isDanger ? (
              <AlertTriangle className="w-8 h-8 text-red-400" />
            ) : (
              <CheckCircle className="w-8 h-8 text-blue-400" />
            )}
          </div>
          
          {/* Content */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-3">
              {title}
            </h3>
            <p className="text-white/60 text-sm leading-relaxed">
              {message}
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-medium"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 px-6 py-3 rounded-full text-white transition-all font-medium shadow-lg ${
                isDanger 
                  ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' 
                  : 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmDialog;
