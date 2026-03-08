"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export function SuccessToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const hasProcessedRef = useRef(false);

  const isAddedParam = searchParams.get("added") === "true";

  // Handle ?added=true param changes
  useEffect(() => {
    if (isAddedParam && !hasProcessedRef.current) {
      hasProcessedRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: sync external state (URL param) to component state
      setVisible(true);

      // Clear the query param
      const url = new URL(window.location.href);
      url.searchParams.delete("added");
      router.replace(url.pathname, { scroll: false });
    }

    if (!isAddedParam) {
      hasProcessedRef.current = false;
    }
  }, [isAddedParam, router]);

  // Auto-dismiss timer
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 animate-slide-up">
      <div className="max-w-md mx-auto bg-green text-cream px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
        <div className="w-8 h-8 bg-cream/20 rounded-full flex items-center justify-center flex-shrink-0">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="font-medium">Plant added to your garden!</p>
      </div>
    </div>
  );
}
