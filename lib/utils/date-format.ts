/**
 * Formats a date string or timestamp into YYYY-MM-DD HH:MM:SS format (24-hour).
 * Handles both ISO strings and numeric timestamps.
 * Provides a safe fallback if the date is invalid.
 */
export function formatTimestamp(dateSource: string | number | undefined): string {
    if (!dateSource) return "";

    try {
        const d = new Date(dateSource);

        // Check if date is valid
        if (isNaN(d.getTime())) {
            // If it's just a date string like "2026-03-09", return it as is
            if (typeof dateSource === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateSource)) {
                return dateSource;
            }
            return String(dateSource);
        }

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');

        // If time is 00:00:00 and it looks like it might have been just a date string,
        // we could potentially omit the time, but the requirement says "display it normally"
        // if only a date exists. However, ISO strings usually have time.
        // Let's stick to the requirement: "YYYY-MM-DD HH:MM:SS" if possible.

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (e) {
        return String(dateSource);
    }
}
