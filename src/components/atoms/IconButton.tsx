import { cva, type VariantProps } from 'class-variance-authority';

const iconButtonVariants = cva(
  'inline-flex items-center justify-center rounded-full transition-all select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
      },
      variant: {
        default: 'text-white/65 hover:text-white hover:bg-white/5 active:bg-white/10',
        primary: 'text-cyan-400 hover:bg-cyan-500/10 active:bg-cyan-500/20',
        danger: 'text-red-400 hover:bg-red-500/10 active:bg-red-500/20',
        active: 'text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  tooltip?: string;
}

export function IconButton({ size, variant, tooltip, children, ...props }: IconButtonProps) {
  return (
    <button
      className={iconButtonVariants({ size, variant })}
      title={tooltip}
      {...props}
    >
      {children}
    </button>
  );
}
