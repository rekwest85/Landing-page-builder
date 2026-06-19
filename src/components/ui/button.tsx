import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-white text-[#0a0a0f] hover:bg-white/90 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_2px_8px_-2px_rgba(0,0,0,0.6)]",
        primary:
          "bg-gradient-to-b from-violet-500 to-indigo-600 text-white hover:from-violet-400 hover:to-indigo-500 shadow-[0_0_24px_-6px_rgba(139,92,246,0.6),inset_0_1px_0_0_rgba(255,255,255,0.15)]",
        secondary:
          "bg-white/[0.04] text-white border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.14]",
        ghost:
          "text-white/70 hover:text-white hover:bg-white/[0.04]",
        outline:
          "border border-white/[0.12] bg-transparent text-white hover:bg-white/[0.04]",
        destructive:
          "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
