"use client";

import { useToast } from "@/contexts/ToastContext";
import { Check, ShoppingBag } from "lucide-react";

export default function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-3 bg-[#1a1a1a] text-white px-5 py-3 rounded-full shadow-2xl text-sm font-semibold animate-fade-up whitespace-nowrap border border-white/10"
        >
          <span className="w-5 h-5 rounded-full bg-[#FF9D3D] flex items-center justify-center flex-shrink-0">
            {toast.type === "success" ? (
              <Check className="w-3 h-3 text-white" />
            ) : (
              <ShoppingBag className="w-3 h-3 text-white" />
            )}
          </span>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
