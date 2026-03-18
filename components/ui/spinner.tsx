import { Loader2Icon } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface SpinnerProps extends React.ComponentProps<'svg'> {
  size?: number | string;
}

function Spinner({ className, size, ...props }: SpinnerProps) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn('animate-spin', !size && 'size-4', className)}
      size={size}
      {...props}
    />
  )
}

export { Spinner }
