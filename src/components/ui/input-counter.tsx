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
    <div
      className={cn(
        "flex items-stretch overflow-hidden rounded-lg border border-border/80 bg-muted/40 shadow-sm",
        className,
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Decrease hours"
        className="h-11 min-w-[24px] rounded-none border-r border-border/60 bg-muted px-3 text-muted-foreground"
        onClick={() => onChange(clamp(value - step))}
        disabled={value <= min}
      >
        <Minus className="h-4 w-4" aria-hidden />
      </Button>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        className="h-11 w-20 border-none bg-transparent text-center text-base font-medium text-foreground shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Increase hours"
        className="h-11 min-w-[24px] rounded-none border-l border-border/60 bg-muted px-3 text-muted-foreground"
        onClick={() => onChange(clamp(value + step))}
        disabled={value >= max}
      >
        <Plus className="h-4 w-4" aria-hidden />
      </Button>
    </div>
  );
}
