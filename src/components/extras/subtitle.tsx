import { cn } from "@infrastructure/utils/client";
import type { JSX } from "preact/jsx-runtime";

interface SubtitleProps {
    children: JSX.Element | string | JSX.Element[];
    className?: string;
}
function Subtitle({ children, className }: SubtitleProps) {
    return (
        <h3
            class={cn(
                "text-xl text-foreground font-bold text-center",
                className
            )}
        >
            {children}
        </h3>
    );
}

export default Subtitle;
