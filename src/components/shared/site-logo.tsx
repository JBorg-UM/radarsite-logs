
import { ShieldCheck } from 'lucide-react';
import type { SVGProps } from 'react';

interface SiteLogoProps extends SVGProps<SVGSVGElement> {
  showText?: boolean;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

export function SiteLogo({ showText = true, className, iconClassName, textClassName, ...props }: SiteLogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <ShieldCheck className={cn("h-8 w-8 text-primary", iconClassName)} {...props} />
      {showText && <span className={cn("text-xl font-bold text-foreground", textClassName)}>Sentinel Watch</span>}
    </div>
  );
}

// Helper function cn, assuming it's not available globally in this component
// In a real setup, this would come from @/lib/utils
const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');
