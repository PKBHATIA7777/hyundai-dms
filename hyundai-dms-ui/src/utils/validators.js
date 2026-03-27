/**
 * Returns an error string if invalid, or empty string if valid.
 */

export const validatePhone = (phone) => {
    if (!phone) return 'Phone number is required.';
    if (!/^\d{10}$/.test(phone.trim())) return 'Phone must be exactly 10 digits.';
    return '';
};

export const validatePAN = (pan) => {
    if (!pan) return ''; // PAN is optional
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.trim())) {
        return 'PAN must be in format: ABCDE1234F (5 letters, 4 digits, 1 letter).';
    }
    return '';
};

export const validateEmail = (email) => {
    if (!email) return ''; // email is optional in most forms
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return 'Please enter a valid email address.';
    }
    return '';
};

export const validateAdvanceAmount = (amount, variantPrice) => {
    const val = Number(amount);
    if (!val || val <= 0) return 'Advance amount must be greater than zero.';
    if (variantPrice && val >= variantPrice) {
        return `Advance amount must be less than the vehicle price (₹${Number(variantPrice).toLocaleString('en-IN')}).`;
    }
    return '';
};

export const validateRequired = (value, fieldName) => {
    if (!value || String(value).trim() === '') return `${fieldName} is required.`;
    return '';
};