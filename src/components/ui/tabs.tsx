"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs@1.1.3";

import { cn } from "./utils";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-3", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-gradient-to-br from-white to-slate-50 text-muted-foreground inline-flex h-16 w-fit items-center justify-center rounded-2xl p-2 flex border-2 border-slate-300 shadow-xl backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex h-full flex-1 items-center justify-center gap-2.5 rounded-xl border-2 border-transparent px-6 py-3 font-medium whitespace-nowrap transition-all duration-300 ease-out relative",
        "text-slate-500 hover:text-slate-900 hover:bg-white/80 hover:border-slate-200 hover:shadow-sm",
        "data-[state=active]:bg-gradient-to-br data-[state=active]:from-yellow-400 data-[state=active]:via-yellow-500 data-[state=active]:to-yellow-600 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:border-yellow-600 data-[state=active]:scale-105 data-[state=active]:font-semibold data-[state=active]:z-10",
        "focus-visible:ring-4 focus-visible:ring-yellow-500/30 focus-visible:ring-offset-2 focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4.5",
        "data-[state=active]:[&_svg]:text-white data-[state=active]:[&_svg]:drop-shadow-sm",
        "overflow-hidden",
        "before:absolute before:inset-0 before:bg-gradient-to-tr before:from-transparent before:via-white/0 before:to-white/10 before:opacity-0 data-[state=active]:before:opacity-100 before:transition-opacity",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };