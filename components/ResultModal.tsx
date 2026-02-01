
'use client';

import { useEffect } from "react";

// import React from 'react';

type Props = {
  open: boolean;
  success?: boolean;
  message?: string;
  onClose: () => void;
};

export function ResultModal({ open, success, message, onClose }: Props) {
    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    const ringClass = success ? 'border-green-500' : 'border-red-500';
    const stroke = success ? 'rgb(34 197 94)' : 'rgb(239 68 68)';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* overlay: click to close modal */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* modal */}
      <div className="relative z-10 w-[320px] rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()} // 点弹窗本体不关闭
        >
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 ${ringClass}`}>
          {success ?
            ( 
            //Green checkmark
            <svg
                viewBox="0 0 24 24"
                className="h-9 w-9"
                fill="none"
                stroke={stroke}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M20 6L9 17l-5-5" />
            </svg> )
            :
            (
            // ❌ 红色叉
            <svg
              viewBox="0 0 24 24"
              className="h-9 w-9"
              fill="none"
              stroke={stroke}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          )
            }
        </div>
  

        <p className="mt-4 text-center text-base font-medium text-slate-900">
          {message}
        </p>

        <p className="mt-1 text-center text-sm text-slate-500">
          Click on the blank space to close.
        </p>
      </div>
    </div>
  );
}
