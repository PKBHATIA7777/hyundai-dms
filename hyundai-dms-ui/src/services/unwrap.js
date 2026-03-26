/**
 * Unwraps Axios responses that may or may not be wrapped in
 * Spring's ApiResponse envelope { success, data, timestamp }.
 *
 * Usage:  const items = unwrap(res);
 */
export const unwrap = (res) => {
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'data' in payload) {
        return payload.data;
    }
    return payload;
};

/**
 * Same as unwrap but guarantees an array is returned.
 */
export const unwrapArray = (res) => {
    const result = unwrap(res);
    return Array.isArray(result) ? result : [];
};