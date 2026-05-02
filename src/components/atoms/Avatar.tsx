import { cva, type VariantProps } from 'class-variance-authority';

const avatarVariants = cva('relative inline-flex items-center justify-center rounded-full bg-white/10 overflow-hidden shrink-0', {
  variants: {
    size: {
      sm: 'h-6 w-6 text-xs',
      md: 'h-8 w-8 text-sm',
      lg: 'h-12 w-12 text-base',
      xl: 'h-16 w-16 text-lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

interface AvatarProps extends VariantProps<typeof avatarVariants> {
  src?: string | null;
  alt?: string;
  className?: string;
}

function getInitials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

export function Avatar({ src, alt = '', size, className }: AvatarProps) {
  return (
    <span className={avatarVariants({ size, className })}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
      ) : null}
      <span className={src ? 'hidden' : ''}>
        {getInitials(alt || '?')}
      </span>
    </span>
  );
}
