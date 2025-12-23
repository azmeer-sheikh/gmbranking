import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-lg border-2 px-2.5 py-1 font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:ring-4 focus-visible:ring-yellow-400/30 transition-all overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-yellow-600 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black [a&]:hover:from-yellow-500 [a&]:hover:to-yellow-600 shadow-sm",
        secondary:
          "border-slate-200 bg-slate-100 text-slate-900 [a&]:hover:bg-slate-200",
        destructive:
          "border-red-600 bg-destructive text-white [a&]:hover:bg-destructive/90",
        outline:
          "border-slate-200 text-foreground [a&]:hover:bg-slate-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
