import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Button } from "./Button.vue"

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold tracking-tight transition-all border disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black",
  {
    variants: {
      variant: {
        default: "bg-black text-white border-black hover:bg-gray-800 shadow-sm hover:shadow-md active:scale-[0.98]",
        destructive:
          "bg-red-600 text-white border-red-600 hover:bg-red-700 shadow-sm hover:shadow-md active:scale-[0.98]",
        outline:
          "border-gray-300 bg-white text-black hover:bg-gray-50 hover:border-gray-400 shadow-sm active:scale-[0.98]",
        secondary:
          "bg-gray-100 text-black border-gray-200 hover:bg-gray-200 hover:border-gray-300 shadow-sm active:scale-[0.98]",
        ghost: "border-transparent hover:bg-gray-100 hover:text-black",
        link: "text-black underline-offset-4 hover:underline border-transparent",
      },
      size: {
        "default": "h-10 px-5 py-2 rounded-md",
        "sm": "h-8 px-3 text-xs rounded-md",
        "lg": "h-12 px-6 text-base rounded-lg",
        "icon": "h-10 w-10 rounded-md",
        "icon-sm": "size-8 rounded-md",
        "icon-lg": "size-12 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
