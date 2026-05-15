export default function Loading() {
  return (
    <div className="fixed top-0 left-0 w-full z-50 h-1">
      <div className="h-full bg-[#a67c52] animate-[progress_1s_ease-in-out_infinite]" style={{ width: '30%', animation: 'progress 2s ease-in-out infinite alternate' }}></div>
      <style>{`
        @keyframes progress {
          0% { width: 0%; transform: translateX(0); }
          50% { width: 30%; transform: translateX(100vw); }
          100% { width: 100%; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
