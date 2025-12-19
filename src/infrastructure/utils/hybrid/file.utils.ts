/**
 * Converts bytes to human-readable file size string
 *
 * @param bytes - The file size in bytes
 * @param decimals - Number of decimal places to show (default: 2)
 * @returns Formatted file size string with appropriate unit
 */
export function formatFileSize(bytes: number, decimals = 2): string {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	// Handle Bytes case differently (no decimals)
	if (i === 0) return `${bytes} ${sizes[i]}`;

	return `${Number.parseFloat((bytes / k ** i).toFixed(decimals))} ${sizes[i]}`;
}

// dimension solo es valido para imagenes
export function printFileWithDimension(
	files: any | null,
	dimension: number | null = null,
	custom_file_no_found: string | null = null,
) {
	if (!files) {
		return [custom_file_no_found || "noimagefound"];
	}
	const filterImages = dimension
		? files.filter(
				(img: any) =>
					img.url?.startsWith("https://") || img.dimension === dimension,
			)
		: files;

	return filterImages.map((file: any) =>
		file.url!.startsWith("https://") ? file.url : `/tu-empresa/${file.url}`,
	);
}
