import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500",
  secondary:
    "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 focus-visible:ring-emerald-400",
  outline:
    "border border-emerald-600 text-emerald-700 hover:bg-emerald-50 focus-visible:ring-emerald-500",
  ghost:
    "text-emerald-700 hover:bg-emerald-50 focus-visible:ring-emerald-500",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
}

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> & {
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

function classes(variant: Variant, size: Size): string {
  return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;
}

export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", loading = false, children, ...rest } = props;
  const isLink = "href" in rest && rest.href !== undefined;
  const className = classes(variant, size);

  if (isLink) {
    return (
      <a className={className} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <button className={className} disabled={loading || rest.disabled} {...rest}>
      {loading ? (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : null}
      {children}
    </button>
  );
}
