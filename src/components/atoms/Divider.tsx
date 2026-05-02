interface DividerProps {
  className?: string;
}

export function Divider({ className = '' }: DividerProps) {
  return <hr className={`border-0 h-px bg-border-subtle ${className}`} />;
}
