import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility to smartly merge tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ==========================================
// 1. Core Structural Primitives
// ==========================================

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-[6px] border border-[#2d3340] bg-bg-surface text-text-primary",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1 p-4 border-b border-[#2d3340]", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-4", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

// ==========================================
// 2. Buttons & Actions (Exactly 3 Variants)
// ==========================================

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'ghost' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    // Normalize aliases to the 3 exact design system button variants
    const resolvedVariant = 
      variant === 'accent' ? 'accent' :
      variant === 'ghost' ? 'ghost' :
      'primary';

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-[6px] text-xs font-medium transition-colors focus-visible:outline-none disabled:opacity-40 disabled:pointer-events-none select-none",
          {
            // Primary: --bg-surface-2 bg, --border-strong border, --text-primary text
            'bg-bg-surface-2 border border-border-strong text-text-primary hover:bg-[#262B31]':
              resolvedVariant === 'primary',
            // Accent: --accent 1px border + --accent text on transparent bg, NOT filled
            'border border-accent text-accent bg-transparent hover:bg-accent/10 hover:border-accent-hover hover:text-accent-hover':
              resolvedVariant === 'accent',
            // Ghost: transparent, --text-secondary text, border on hover only
            'border border-transparent bg-transparent text-text-secondary hover:border-border-strong hover:text-text-primary':
              resolvedVariant === 'ghost',
            // Sizes
            'h-7 px-3 text-[11px] gap-1.5': size === 'sm',
            'h-8 px-3.5 text-xs gap-2': size === 'md',
            'h-9 px-4 text-sm gap-2': size === 'lg',
            'h-8 w-8 p-0': size === 'icon',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// ==========================================
// 3. Status Badges (Strict Opacity & 4px Radius)
// ==========================================

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'good' | 'warn' | 'critical' | 'accent' | 'neutral' | 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'neutral', ...props }, ref) => {
    // Map aliases to canonical status variants
    const canonical =
      variant === 'good' || variant === 'success' ? 'good' :
      variant === 'warn' || variant === 'warning' ? 'warn' :
      variant === 'critical' || variant === 'danger' ? 'critical' :
      variant === 'accent' || variant === 'info' ? 'accent' :
      'neutral';

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.04em] transition-colors leading-none",
          {
            'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20': canonical === 'good',
            'bg-amber-500/10 text-amber-400 border border-amber-500/20': canonical === 'warn',
            'bg-rose-500/10 text-rose-400 border border-rose-500/20': canonical === 'critical',
            'bg-sky-500/10 text-sky-400 border border-sky-500/20': canonical === 'accent',
            'bg-slate-500/10 text-slate-300 border border-slate-500/20': canonical === 'neutral',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

// ==========================================
// 4. Metric Tiles (Identical Internal Alignment)
// ==========================================

export interface StatTileProps {
  title: string;
  value: string | React.ReactNode;
  subtext?: string;
  status?: 'good' | 'critical' | 'neutral';
  trend?: 'up' | 'down' | 'neutral';
}

export const StatTile = ({ title, value, subtext, status }: StatTileProps) => {
  return (
    <Card className="flex flex-col justify-between p-4 bg-bg-surface border-[#2d3340]">
      <div>
        <div className="text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary mb-2">
          {title}
        </div>
        <div className={cn(
          "text-[24px] font-semibold font-mono tabular-nums leading-none tracking-tight",
          status === 'good' ? 'text-status-good' :
          status === 'critical' ? 'text-status-critical' :
          'text-text-primary'
        )}>
          {value}
        </div>
      </div>
      {subtext && (
        <div className="text-[13px] text-text-secondary mt-3 truncate font-normal">
          {subtext}
        </div>
      )}
    </Card>
  );
};

export const MetricTile = StatTile;

// ==========================================
// 5. Tabs (Underline Active Style, No Box Background)
// ==========================================

export const TabsList = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("flex items-center gap-6 border-b border-[#2d3340] px-0", className)}>
    {children}
  </div>
);

export const TabsTrigger = ({
  className,
  active,
  children,
  ...props
}: {
  className?: string;
  active?: boolean;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap pb-2.5 text-xs font-medium transition-colors border-b-2 -mb-px focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40",
      active
        ? "border-accent text-text-primary"
        : "border-transparent text-text-tertiary hover:text-text-secondary",
      className
    )}
    {...props}
  >
    {children}
  </button>
);

// ==========================================
// 6. Data Table
// ==========================================

export const DataTable = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("w-full overflow-x-auto", className)}>
    <table className="w-full text-xs text-left text-text-secondary border-collapse">
      {children}
    </table>
  </div>
);

export const TableHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <thead className={cn("border-b border-[#2d3340] bg-bg-surface-2/40", className)}>
    <tr>{children}</tr>
  </thead>
);

export const TableRow = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <tr className={cn("border-b border-[#2d3340] hover:bg-bg-surface-2 transition-colors", className)}>
    {children}
  </tr>
);

export const TableCell = ({
  children,
  className,
  isHeader = false,
}: {
  children: React.ReactNode;
  className?: string;
  isHeader?: boolean;
}) => {
  const Tag = isHeader ? 'th' : 'td';
  return (
    <Tag
      className={cn(
        "px-4 py-2.5",
        isHeader
          ? "text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary"
          : "text-xs text-text-secondary font-normal",
        className
      )}
    >
      {children}
    </Tag>
  );
};
