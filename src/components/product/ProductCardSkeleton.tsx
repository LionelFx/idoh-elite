export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden border border-[#e0e0e0]">
      <div className="aspect-square bg-[#f0f0f0] relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      </div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-[#f0f0f0] rounded relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite_0.1s] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </div>
        <div className="h-3 bg-[#f0f0f0] rounded w-2/3 relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite_0.2s] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </div>
        <div className="h-4 bg-[#f0f0f0] rounded w-1/3 relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite_0.3s] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </div>
      </div>
    </div>
  );
}
