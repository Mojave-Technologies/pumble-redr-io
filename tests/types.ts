/**
 * Shared test type definitions and mock factories.
 */

import { AxiosResponse } from 'axios';
import { HttpClient } from '../src/api/httpClient';

/** Re-export HttpClient for use in tests */
export type MockHttpClient = HttpClient;

/** Mock Axios response factory */
export function mockAxiosResponse<T>(status: number, data: T): AxiosResponse<T> {
    return {
        status,
        data,
        statusText: status >= 200 && status < 300 ? 'OK' : 'Error',
        headers: {},
        config: { headers: {} as AxiosResponse['config']['headers'] },
    };
}

/** Mock HTTP client factory with pre-configured response */
export function createMockHttpClient(response: AxiosResponse): MockHttpClient & { get: jest.Mock; post: jest.Mock } {
    return {
        get: jest.fn().mockResolvedValue(response),
        post: jest.fn().mockResolvedValue(response),
    };
}

/** Empty mock client for tests that mock at module level */
export const emptyMockClient: MockHttpClient = {
    get: jest.fn(),
    post: jest.fn(),
};

/** Pumble modal block types for testing */
export interface TestModalBlock {
    type: string;
    blockId?: string;
    label?: { type: string; text: string };
    element?: {
        type: string;
        onAction?: string;
        initial_value?: string;
        options?: Array<{ text: { type: string; text: string }; value: string }>;
        initial_option?: { value: string };
    };
    optional?: boolean;
    validationError?: string;
    text?: { type: string; text: string };
    elements?: Array<{
        type: string;
        text?: { type: string; text: string };
        onAction?: string;
        style?: string;
    }>;
}

/** Helper to find block by blockId */
export function findBlock(blocks: TestModalBlock[], blockId: string): TestModalBlock | undefined {
    return blocks.find((b) => b.blockId === blockId);
}

/** Helper to find block by type */
export function findBlockByType(blocks: TestModalBlock[], type: string): TestModalBlock | undefined {
    return blocks.find((b) => b.type === type);
}
