'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get('action') || 'approve';

  const handleConfirm = () => {
    // Dummy confirmation - just redirect back to dashboard
    alert(`${action === 'approve' ? 'Approval' : 'Rejection'} confirmed successfully!`);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3FD8D4] from-10% via-white via-50% to-[#DDEE59] to-90% flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#3FD8D4] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#3FD8D4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Admin Confirmation
          </h1>
          <p className="text-[#757575] mb-4">
            You are about to {action === 'approve' ? 'approve' : 'reject'} this application.
          </p>
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
            action === 'approve' 
              ? 'bg-[#DDEE59] bg-opacity-20 text-[#8B9A00]' 
              : 'bg-[#FF8500] bg-opacity-20 text-[#B85F00]'
          }`}>
            Action: {action === 'approve' ? 'APPROVE' : 'REJECT'}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-blue-800 font-semibold mb-1">Dummy Mode</h3>
                <p className="text-blue-700 text-sm">
                  This is a simplified confirmation. No email or password required.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-[#757575] rounded-lg text-[#757575] font-medium hover:bg-[#757575] hover:bg-opacity-10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                action === 'approve' 
                  ? 'bg-[#DDEE59] hover:bg-[#C5D649] text-black' 
                  : 'bg-[#FF8500] hover:bg-[#E07600] text-white'
              }`}
            >
              Confirm {action === 'approve' ? 'Approval' : 'Rejection'}
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This is a dummy confirmation page for testing purposes. Simply click "Confirm" to proceed.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  // Wrap penggunaan useSearchParams di dalam Suspense agar sesuai aturan Next
  return (
    <Suspense fallback={<></>}>
      <ConfirmContent />
    </Suspense>
  );
}