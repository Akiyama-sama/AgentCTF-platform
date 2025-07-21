import { cn } from "@/lib/utils"
import { LoaderCircleIcon } from "lucide-react"

type Props={
  className?:string
}
export default function Loading( {className}:Props) {
  return (
        <div className={cn(className,"absolute inset-0 flex items-center justify-center ")}>
          <LoaderCircleIcon
            className="animate-spin"
            size={16}
            aria-hidden="true"
          />
        </div>
  )
}
