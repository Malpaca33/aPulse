import { cva, type VariantProps } from 'class-variance-authority';

const spinnerVariants = cva('animate-spin rounded-full border-current border-t-transparent', {
  variants: {
    size: {
      sm: 'h-4 w-4 border-2',
      md: 'h-6 w-6 border-2',
      lg: 'h-8 w-8 border-3',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
}

export function Spinner({ size, className }: SpinnerProps) {
  return (
    <span
      className={spinnerVariants({ size, className })}
      role="status"
      aria-label="加载中"
    />
  );
}
