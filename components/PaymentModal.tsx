
import React, { useState } from 'react';

interface PaymentModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handlePay = () => {
    setLoading(true);
    // Simulate Razorpay Gateway
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-black text-slate-800 mb-2">Unlock Pro Features</h3>
            <p className="text-slate-500">Scale your Meesho business with advanced optimization.</p>
          </div>

          <div className="space-y-4 mb-8">
            {[
              'Unlimited image variant generation',
              'Bulk download optimized images',
              'Priority Meesho API sync',
              'Advanced algorithm for 2025 shipping tiers',
              'Ad-free experience'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-slate-600">{feature}</span>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8">
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-400 font-bold text-xs uppercase">Annual Plan</span>
              <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded text-[10px] font-black uppercase">Save 40%</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900">₹999</span>
              <span className="text-slate-400 text-sm font-medium">/ year</span>
            </div>
          </div>

          <button 
            onClick={handlePay}
            disabled={loading}
            className="w-full bg-pink-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-pink-200 hover:bg-pink-700 transition-all flex items-center justify-center"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'PAY WITH RAZORPAY'}
          </button>
          
          <p className="text-center text-[10px] text-slate-400 mt-4 uppercase tracking-widest font-bold">Secure SSL Encrypted Payment</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
