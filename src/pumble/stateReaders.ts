/**
 * Pumble modal state readers.
 * Extract values from modal view state by block/action IDs.
 */

/**
 * Modal view state - uses Record types to be compatible with Pumble SDK's State type
 * while still providing meaningful type information for our code.
 */
export type ModalViewState = Record<string, unknown> | null | undefined;

/** Field state for various input types (internal use) */
interface FieldState {
    value?: string;
    values?: Array<{ value?: string } | string>;
    selected_options?: Array<{ value?: string }>;
    selected_option?: { value?: string };
    selectedOption?: { value?: string };
    selected_date?: string;
    selectedDate?: string;
}

/** 
 * Safely extracts field state from modal state.
 * Handles the dynamic structure of Pumble SDK's State type.
 */
function getField(state: ModalViewState, blockId: string, actionId: string): FieldState | undefined {
    if (!state || typeof state !== 'object') return undefined;
    const values = (state as Record<string, unknown>).values;
    if (!values || typeof values !== 'object') return undefined;
    const block = (values as Record<string, unknown>)[blockId];
    if (!block || typeof block !== 'object') return undefined;
    return (block as Record<string, unknown>)[actionId] as FieldState | undefined;
}

/** Reads checkbox value (first selected option) */
export function readCheckbox(state: ModalViewState, blockId: string, actionId: string): boolean {
    const field = getField(state, blockId, actionId);
    if (!field) return false;
    
    // Handle selected_options array (checkbox format)
    const selectedOption = field.selected_options?.[0];
    if (selectedOption) {
        const value = typeof selectedOption === 'object' ? selectedOption.value : selectedOption;
        return parseBool(value) ?? false;
    }
    
    // Handle values array (alternative format)
    const firstValue = field.values?.[0];
    if (firstValue) {
        const value = typeof firstValue === 'object' ? firstValue.value : firstValue;
        return parseBool(value) ?? false;
    }
    
    return parseBool(field.value) ?? false;
}

/** Reads date picker value, returns ISO string with end-of-day time */
export function readDatepicker(state: ModalViewState, blockId: string, actionId: string): string | undefined {
    const field = getField(state, blockId, actionId);
    const rawValue = field?.selected_date ?? field?.selectedDate ?? field?.value;
    if (typeof rawValue !== 'string') return undefined;
    const date = new Date(rawValue.split('T')[0]);
    if (isNaN(date.getTime())) return undefined;
    date.setUTCHours(23, 59, 59, 0); // Set to end of day for expiration

    return date.toISOString();
}

/** Reads text input value, trimmed */
export function readInput(state: ModalViewState, blockId: string, actionId: string): string {
    const field = getField(state, blockId, actionId);
    const inputValue = field?.value;
    return typeof inputValue === 'string' ? inputValue.trim() : '';
}

/** Reads static select dropdown value */
export function readStaticSelect(state: ModalViewState, blockId: string, actionId: string): string | undefined {
    const field = getField(state, blockId, actionId);
    return field?.selected_option?.value ?? field?.selectedOption?.value ?? field?.value ?? undefined;
}

function parseBool(value: string | boolean | undefined | null): boolean | undefined {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.trim().toLowerCase() === 'true';
    return undefined;
}
