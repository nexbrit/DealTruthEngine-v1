"use client"

import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "circular" | "text"
}

function Skeleton({ className, variant = "default", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-zinc-800",
        variant === "circular" && "rounded-full",
        variant === "text" && "rounded h-4",
        variant === "default" && "rounded-md",
        className
      )}
      {...props}
    />
  )
}

function DealCardSkeleton() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
      <div className="flex items-start gap-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="mt-4 flex gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-4 w-full mt-3" />
      <Skeleton className="h-4 w-2/3 mt-1" />
    </div>
  )
}

function StressMapSkeleton() {
  return (
    <div className="bg-zinc-900 rounded-lg p-6">
      <Skeleton className="h-6 w-40 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-zinc-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton variant="circular" className="w-3 h-3" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-3/4 mt-2 ml-6" />
          </div>
        ))}
      </div>
    </div>
  )
}

function EvidenceTableSkeleton() {
  return (
    <div className="divide-y divide-zinc-800">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-5 w-48 mb-2" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

function AnalysisSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-24 w-full rounded-lg" />
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-40 w-full rounded-lg" />
    </div>
  )
}

function PageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 animate-pulse">
      <div className="flex items-start gap-4 mb-6">
        <Skeleton className="w-14 h-14 rounded-xl" />
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-5 w-40 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <Skeleton className="h-20 w-full rounded-lg mb-6" />
      <div className="grid grid-cols-3 gap-6">
        <StressMapSkeleton />
        <div className="col-span-2">
          <Skeleton className="h-10 w-72 mb-4" />
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export {
  Skeleton,
  DealCardSkeleton,
  StressMapSkeleton,
  EvidenceTableSkeleton,
  AnalysisSkeleton,
  PageSkeleton
}
