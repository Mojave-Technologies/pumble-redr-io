/**
 * HTTP client factory for REDR API communication.
 * Uses keep-alive connections and handles network errors.
 */

import axios, { AxiosError, AxiosInstance } from 'axios';
import http from 'http';
import https from 'https';
import { NetworkError, TimeoutError } from './helpers';

export interface RedrHttpClient extends AxiosInstance {
    /** Cleanup method to close keep-alive connections on shutdown */
    destroyAgents(): void;
}

function buildAuthHeaders(authHeader: string, authPrefix: string, apiKey: string): Record<string, string> {
    const prefix = authPrefix ? `${authPrefix} ` : '';
    return {
        [authHeader]: `${prefix}${apiKey}`,
        Accept: 'application/json',
    };
}

/**
 * Creates a configured HTTP client for REDR API.
 * - Uses Bearer token authentication
 * - Keep-alive connections for better performance
 * - Transforms network errors into typed exceptions
 */
export function createRedrHttpClient(apiKey: string, timeoutMs: number): RedrHttpClient {
    const headers = buildAuthHeaders('Authorization', 'Bearer', apiKey);

    const httpAgent = new http.Agent({ keepAlive: true });
    const httpsAgent = new https.Agent({ keepAlive: true });

    const client = axios.create({
        timeout: timeoutMs,
        headers,
        validateStatus: () => true, // Handle all status codes manually
        httpAgent,
        httpsAgent,
    }) as RedrHttpClient;

    client.destroyAgents = () => {
        httpAgent.destroy();
        httpsAgent.destroy();
    };

    client.interceptors.response.use(
        (response) => response,
        (error: AxiosError) => {
            if (axios.isAxiosError(error)) {
                if (error.code === 'ECONNABORTED') {
                    throw new TimeoutError(`REDR request timed out: ${error.message}`, error.code);
                }
                throw new NetworkError(`REDR network error: ${error.message}`, error.code);
            }
            return Promise.reject(error);
        }
    );

    return client;
}
