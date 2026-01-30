"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stateReaders_1 = require("../../src/pumble/stateReaders");
describe('stateReaders', () => {
    describe('readInput', () => {
        it('should read input value from state', () => {
            const state = {
                values: {
                    block1: {
                        action1: { value: 'test value' }
                    }
                }
            };
            expect((0, stateReaders_1.readInput)(state, 'block1', 'action1')).toBe('test value');
        });
        it('should return empty string for missing block', () => {
            const state = { values: {} };
            expect((0, stateReaders_1.readInput)(state, 'missing', 'action1')).toBe('');
        });
        it('should return empty string for missing action', () => {
            const state = {
                values: {
                    block1: {}
                }
            };
            expect((0, stateReaders_1.readInput)(state, 'block1', 'missing')).toBe('');
        });
        it('should return empty string for null state', () => {
            expect((0, stateReaders_1.readInput)(null, 'block1', 'action1')).toBe('');
        });
        it('should return empty string for undefined state', () => {
            expect((0, stateReaders_1.readInput)(undefined, 'block1', 'action1')).toBe('');
        });
        it('should trim input value', () => {
            const state = {
                values: {
                    block1: {
                        action1: { value: '  trimmed  ' }
                    }
                }
            };
            expect((0, stateReaders_1.readInput)(state, 'block1', 'action1')).toBe('trimmed');
        });
    });
    describe('readCheckbox', () => {
        it('should return true for checked checkbox with selected_options', () => {
            const state = {
                values: {
                    block1: {
                        action1: { selected_options: [{ value: 'true' }] }
                    }
                }
            };
            expect((0, stateReaders_1.readCheckbox)(state, 'block1', 'action1')).toBe(true);
        });
        it('should return false for unchecked checkbox', () => {
            const state = {
                values: {
                    block1: {
                        action1: { selected_options: [] }
                    }
                }
            };
            expect((0, stateReaders_1.readCheckbox)(state, 'block1', 'action1')).toBe(false);
        });
        it('should return false for missing block', () => {
            const state = { values: {} };
            expect((0, stateReaders_1.readCheckbox)(state, 'missing', 'action1')).toBe(false);
        });
        it('should return false for null state', () => {
            expect((0, stateReaders_1.readCheckbox)(null, 'block1', 'action1')).toBe(false);
        });
        it('should handle values array format', () => {
            const state = {
                values: {
                    block1: {
                        action1: { values: [{ value: 'true' }] }
                    }
                }
            };
            expect((0, stateReaders_1.readCheckbox)(state, 'block1', 'action1')).toBe(true);
        });
    });
    describe('readDatepicker', () => {
        it('should read date value and convert to end-of-day ISO string', () => {
            const state = {
                values: {
                    block1: {
                        action1: { selected_date: '2026-01-30' }
                    }
                }
            };
            const result = (0, stateReaders_1.readDatepicker)(state, 'block1', 'action1');
            expect(result).toContain('2026-01-30');
            expect(result).toContain('23:59:59');
        });
        it('should return undefined for missing date', () => {
            const state = {
                values: {
                    block1: {
                        action1: {}
                    }
                }
            };
            expect((0, stateReaders_1.readDatepicker)(state, 'block1', 'action1')).toBeUndefined();
        });
        it('should return undefined for null state', () => {
            expect((0, stateReaders_1.readDatepicker)(null, 'block1', 'action1')).toBeUndefined();
        });
    });
    describe('readStaticSelect', () => {
        it('should read selected option value', () => {
            const state = {
                values: {
                    block1: {
                        action1: { selected_option: { value: 'option1' } }
                    }
                }
            };
            expect((0, stateReaders_1.readStaticSelect)(state, 'block1', 'action1')).toBe('option1');
        });
        it('should return undefined for no selection', () => {
            const state = {
                values: {
                    block1: {
                        action1: { selected_option: null }
                    }
                }
            };
            expect((0, stateReaders_1.readStaticSelect)(state, 'block1', 'action1')).toBeUndefined();
        });
        it('should return undefined for null state', () => {
            expect((0, stateReaders_1.readStaticSelect)(null, 'block1', 'action1')).toBeUndefined();
        });
    });
});
