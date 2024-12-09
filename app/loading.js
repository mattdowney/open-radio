'use client';

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-black">
      <div className="w-8 h-8 border-4 border-white/20 border-t-white/80 rounded-full animate-spin-fast"></div>
    </div>
  );
}
