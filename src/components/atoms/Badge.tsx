import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva('inline-flex items-center justify-center font-medium', {
  variants: {
    variant: {
      count: 'min-w-[18px] h-[18px] rounded-full bg-cyan-500 text-[11px] text-black px-1 leading-none',
      dot: 'h-2 w-2 rounded-full bg-red-500',
    },
  },
  defaultVariants: {
    variant: 'dot',
  },
});

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  count?: number;
  className?: string;
}

export function Badge({ variant = 'dot', count, className }: BadgeProps) {
  if (variant === 'count' && count !== undefined) {
    const display = count > 99 ? '99+' : count;
    return (
      <span className={badgeVariants({ variant, className })}>
        {display}
      </span>
    );
  }

  return <span className={badgeVariants({ variant, className })} />;
}
