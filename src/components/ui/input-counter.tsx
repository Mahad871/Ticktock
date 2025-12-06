"use client";

import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type InputCounterProps = {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (next: number) => void;
  className?: string;
};

export function InputCounter({
  value,
  min = 0,
  max = 168,
  step = 1,
  onChange,
  className,
}: InputCounterProps) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-md border border-[#d7dce5] text-[#0f1729] shadow-sm"
        onClick={() => onChange(clamp(value - step))}
        disabled={value <= min}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        className="h-9 w-16 rounded-md border border-[#d7dce5] text-center text-sm text-[#0f1729] shadow-sm"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-md border border-[#d7dce5] text-[#0f1729] shadow-sm"
        onClick={() => onChange(clamp(value + step))}
        disabled={value >= max}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
