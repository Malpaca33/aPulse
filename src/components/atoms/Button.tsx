import { cva, type VariantProps } from 'class-variance-authority';
import { Spinner } from './Spinner';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-full font-medium transition-all select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-cyan-500 text-black hover:bg-cyan-400 active:bg-cyan-600',
        secondary: 'bg-white/10 text-white hover:bg-white/15 active:bg-white/20',
        ghost: 'text-white/65 hover:text-white hover:bg-white/5 active:bg-white/10',
        danger: 'bg-red-500/10 text-red-400 hover:bg-red-500/20 active:bg-red-500/30',
      },
      size: {
        sm: 'h-8 px-3 text-sm gap-1.5',
        md: 'h-10 px-4 text-sm gap-2',
        lg: 'h-12 px-6 text-base gap-2.5',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export function Button({ variant, size, loading, children, ...props }: ButtonProps) {
  return (
    <button className={buttonVariants({ variant, size })} disabled={loading || props.disabled} {...props}>
      {loading ? <Spinner size="sm" /> : children}
    </button>
  );
}
