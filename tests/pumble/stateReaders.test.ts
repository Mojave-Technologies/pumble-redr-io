import { readInput, readCheckbox, readDatepicker, readStaticSelect } from '../../src/pumble/stateReaders';

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
            expect(readInput(state, 'block1', 'action1')).toBe('test value');
        });

        it('should return empty string for missing block', () => {
            const state = { values: {} };
            expect(readInput(state, 'missing', 'action1')).toBe('');
        });

        it('should return empty string for missing action', () => {
            const state = {
                values: {
                    block1: {}
                }
            };
            expect(readInput(state, 'block1', 'missing')).toBe('');
        });

        it('should return empty string for null state', () => {
            expect(readInput(null, 'block1', 'action1')).toBe('');
        });

        it('should return empty string for undefined state', () => {
            expect(readInput(undefined, 'block1', 'action1')).toBe('');
        });

        it('should trim input value', () => {
            const state = {
                values: {
                    block1: {
                        action1: { value: '  trimmed  ' }
                    }
                }
            };
            expect(readInput(state, 'block1', 'action1')).toBe('trimmed');
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
            expect(readCheckbox(state, 'block1', 'action1')).toBe(true);
        });

        it('should return false for unchecked checkbox', () => {
            const state = {
                values: {
                    block1: {
                        action1: { selected_options: [] }
                    }
                }
            };
            expect(readCheckbox(state, 'block1', 'action1')).toBe(false);
        });

        it('should return false for missing block', () => {
            const state = { values: {} };
            expect(readCheckbox(state, 'missing', 'action1')).toBe(false);
        });

        it('should return false for null state', () => {
            expect(readCheckbox(null, 'block1', 'action1')).toBe(false);
        });

        it('should handle values array format', () => {
            const state = {
                values: {
                    block1: {
                        action1: { values: [{ value: 'true' }] }
                    }
                }
            };
            expect(readCheckbox(state, 'block1', 'action1')).toBe(true);
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
            const result = readDatepicker(state, 'block1', 'action1');
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
            expect(readDatepicker(state, 'block1', 'action1')).toBeUndefined();
        });

        it('should return undefined for null state', () => {
            expect(readDatepicker(null, 'block1', 'action1')).toBeUndefined();
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
            expect(readStaticSelect(state, 'block1', 'action1')).toBe('option1');
        });

        it('should return undefined for no selection', () => {
            const state = {
                values: {
                    block1: {
                        action1: { selected_option: null }
                    }
                }
            };
            expect(readStaticSelect(state, 'block1', 'action1')).toBeUndefined();
        });

        it('should return undefined for null state', () => {
            expect(readStaticSelect(null, 'block1', 'action1')).toBeUndefined();
        });
    });
});
