
import { LoaderCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<typeof Button>;

interface Props extends ButtonProps {
  isLoading: boolean;
}

export default function ButtonWithLoading({
  isLoading,
  children,
  className,
  ...props
}: Props) {

  const gapClass = props.size === 'sm' ? 'gap-1.5' : 'gap-2';

  return (
    <Button
      disabled={isLoading}
      className={cn("relative", className)}
      {...props}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoaderCircleIcon
            className="h-4 w-4 animate-spin"
            aria-hidden="true"
          />
        </div>
      )}

      <span className={cn(
        "inline-flex items-center justify-center",
        gapClass,
        "transition-opacity",
        { "opacity-0": isLoading }
      )}>
        {children}
      </span>
    </Button>
  );
}
