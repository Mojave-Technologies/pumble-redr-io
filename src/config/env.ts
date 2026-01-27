/**
 * Environment configuration loader.
 * Reads settings from process.env and validates required values.
 */

function getEnvOrThrow(name: string): string {
    const envValue = process.env[name]?.trim();
    if (!envValue) throw new Error(`${name} is not set`);
    return envValue;
}

function getEnvOptional(name: string, fallback: string = ''): string {
    const envValue = process.env[name]?.trim();
    return envValue ? envValue : fallback;
}

function getEnvNumber(name: string, fallback: number): number {
    const envValue = process.env[name]?.trim();
    if (!envValue) return fallback;
    const numericValue = Number(envValue);
    return Number.isNaN(numericValue) ? fallback : numericValue;
}

export interface AppConfig {
    redrApiUrl: string;
    redrApiKey: string;
    redrDomainId: string;
    redrFolderId?: string;       // If set, skips folder lookup/creation
    redrFolderName: string;      // Used when redrFolderId is not set
    redrHttpTimeoutMs: number;
    pumbleTokenStorePath: string;
}

/** Loads and validates configuration from environment variables. */
export function loadConfig(): AppConfig {
    return {
        redrApiUrl: getEnvOrThrow('REDR_API_URL'),
        redrApiKey: getEnvOrThrow('REDR_API_KEY'),
        redrDomainId: getEnvOrThrow('REDR_DOMAIN_ID'),

        redrFolderId: getEnvOptional('REDR_FOLDER_ID') || undefined,
        redrFolderName: getEnvOptional('REDR_FOLDER_NAME', 'pumble-redr'),
        redrHttpTimeoutMs: getEnvNumber('REDR_HTTP_TIMEOUT_MS', 25000),
        pumbleTokenStorePath: getEnvOptional('PUMBLE_TOKEN_STORE_PATH', './tokens.json'),
    };
}
