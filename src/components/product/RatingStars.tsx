import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  reviewsCount?: number;
  size?: "sm" | "md";
  className?: string;
}

export default function RatingStars({ rating, reviewsCount, size = "sm", className }: RatingStarsProps) {
  if (reviewsCount === 0) {
    return (
      <span className={cn(
        "inline-flex items-center font-bold uppercase tracking-wider text-[#FF9D3D] bg-[#FF9D3D]/10 px-2 py-1 rounded-full",
        size === "sm" ? "text-[10px]" : "text-xs",
        className
      )}>
        ✦ Nouveau
      </span>
    );
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "fill-current",
              star <= Math.round(rating) ? "text-[#FF9D3D]" : "text-[#e0e0e0]",
              size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5"
            )}
          />
        ))}
      </div>
      <span className={cn("text-[#999999]", size === "sm" ? "text-xs" : "text-sm")}>
        {rating.toFixed(1)}
        {reviewsCount !== undefined && ` (${reviewsCount})`}
      </span>
    </div>
  );
}
