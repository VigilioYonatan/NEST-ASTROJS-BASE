import { cn } from "@infrastructure/utils/client";
import type { JSX } from "preact/jsx-runtime";

interface InfoItemProps {
	icon: JSX.Element;
	label: string;
	value: string | JSX.Element;
	className?: string;
	variant?: "default" | "compact" | "highlight";
	orientation?: "horizontal" | "vertical";
}

function InfoItem({
	icon,
	label,
	value,
	className = "",
	variant = "default",
	orientation = "vertical",
}: InfoItemProps) {
	const isHorizontal = orientation === "horizontal";

	return (
		<div
			className={cn(
				"space-y-2",
				isHorizontal && "flex items-center justify-between gap-4",
				variant === "compact" && "space-y-1",
				variant === "highlight" && "bg-gray-50 p-3 rounded-lg",
				className,
			)}
		>
			<div
				className={cn(
					"flex items-center gap-2 text-sm fill-primary text-primary",
					variant === "compact" && "text-xs",
					isHorizontal && "shrink-0",
				)}
			>
				{icon}
				<span>{label}</span>
			</div>
			<p
				className={cn(
					"font-medium",
					variant === "compact" && "text-sm",
					isHorizontal && "text-right truncate",
				)}
			>
				{value}
			</p>
		</div>
	);
}

export default InfoItem;
