/**
 * Pumble modal state readers.
 * Extract values from modal view state by block/action IDs.
 */

/** Reads checkbox value (first selected option) */
export function readCheckbox(state: any, blockId: string, actionId: string): boolean {
    const field = state?.values?.[blockId]?.[actionId];
    if (!field) return false;
    const firstValue = field?.selected_options?.[0]?.value ?? field?.values?.[0]?.value ?? field?.value;
    return parseBool(firstValue) ?? false;
}

/** Reads date picker value, returns ISO string with end-of-day time */
export function readDatepicker(state: any, blockId: string, actionId: string): string | undefined {
    const field = state?.values?.[blockId]?.[actionId];
    const rawValue = field?.selected_date ?? field?.selectedDate ?? field?.value;
    if (typeof rawValue !== 'string') return undefined;
    const date = new Date(rawValue.split('T')[0]);
    if (isNaN(date.getTime())) return undefined;
    date.setUTCHours(23, 59, 59, 0); // Set to end of day for expiration

    return date.toISOString();
}

/** Reads text input value, trimmed */
export function readInput(state: any, blockId: string, actionId: string): string {
    const inputValue = state?.values?.[blockId]?.[actionId]?.value;
    return typeof inputValue === 'string' ? inputValue.trim() : '';
}

/** Reads static select dropdown value */
export function readStaticSelect(state: any, blockId: string, actionId: string): string | undefined {
    const field = state?.values?.[blockId]?.[actionId];
    return field?.selected_option?.value ?? field?.selectedOption?.value ?? field?.value ?? undefined;
}

function parseBool(value: string | boolean | undefined | null): boolean | undefined {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.trim().toLowerCase() === 'true';
    return undefined;
}
