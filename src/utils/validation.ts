/**
 * Client Email and Phone Number Verification Utility
 * 
 * Verifies and validates client contact details before persisting records
 * to Firestore database or local storage.
 */

export interface EmailVerificationResult {
  isValid: boolean;
  error?: string;
  formattedEmail: string;
  domain?: string;
}

export interface PhoneVerificationResult {
  isValid: boolean;
  error?: string;
  formattedPhone: string;
  countryCode?: string;
}

export interface ClientVerificationResult {
  isValid: boolean;
  emailResult: EmailVerificationResult;
  phoneResult: PhoneVerificationResult;
  errorMessage?: string;
}

// Disallowed dummy or fake email domains/addresses
const DISALLOWED_TEST_EMAILS = [
  'test@test.com',
  'fake@fake.com',
  'asdf@asdf.com',
  'aaa@aaa.com',
  'admin@admin.com',
  'no-email@kagztravel.com',
  'sample@example.com',
  'user@example.com'
];

/**
 * Validates and verifies a client email address.
 * Enforces RFC 5322 compliance, valid TLD, domain structure, and disallows dummy placeholders.
 */
export function validateClientEmail(email: string | null | undefined): EmailVerificationResult {
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      error: 'Client email address is required.',
      formattedEmail: ''
    };
  }

  const trimmed = email.trim().toLowerCase();

  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: 'Client email address cannot be empty.',
      formattedEmail: ''
    };
  }

  if (trimmed.length > 150) {
    return {
      isValid: false,
      error: 'Client email address cannot exceed 150 characters.',
      formattedEmail: trimmed
    };
  }

  if (DISALLOWED_TEST_EMAILS.includes(trimmed)) {
    return {
      isValid: false,
      error: 'Please provide a genuine, reachable client email address.',
      formattedEmail: trimmed
    };
  }

  // RFC 5322 standard email regex with valid TLD requirement (minimum 2 chars)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Please enter a valid email format (e.g. client@example.com).',
      formattedEmail: trimmed
    };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return {
      isValid: false,
      error: 'Invalid email structure.',
      formattedEmail: trimmed
    };
  }

  const [localPart, domainPart] = parts;

  if (localPart.length > 64) {
    return {
      isValid: false,
      error: 'Email local username cannot exceed 64 characters.',
      formattedEmail: trimmed
    };
  }

  // Check domain and TLD
  const domainSegments = domainPart.split('.');
  const tld = domainSegments[domainSegments.length - 1];

  if (!tld || tld.length < 2 || !/^[a-zA-Z]{2,24}$/.test(tld)) {
    return {
      isValid: false,
      error: 'Email must contain a valid top-level domain (e.g. .com, .co.uk, .org).',
      formattedEmail: trimmed
    };
  }

  // Check for consecutive dots in domain
  if (domainPart.includes('..')) {
    return {
      isValid: false,
      error: 'Email domain cannot contain consecutive periods.',
      formattedEmail: trimmed
    };
  }

  return {
    isValid: true,
    formattedEmail: trimmed,
    domain: domainPart
  };
}

/**
 * Validates and verifies a client phone number.
 * Supports international formats (E.164, +254..., +1..., etc.) and national standard formats.
 * Normalizes and checks digit counts (7 to 15 digits). Disallows dummy sequences.
 */
export function validateClientPhone(phone: string | null | undefined): PhoneVerificationResult {
  if (!phone || typeof phone !== 'string') {
    return {
      isValid: false,
      error: 'Client phone number is required.',
      formattedPhone: ''
    };
  }

  const raw = phone.trim();

  if (raw.length === 0 || raw.toLowerCase() === 'n/a' || raw.toLowerCase() === 'none') {
    return {
      isValid: false,
      error: 'Client phone number cannot be empty or N/A.',
      formattedPhone: ''
    };
  }

  // Disallow characters that are not digits, +, spaces, dashes, brackets, or dots
  if (!/^[+]?[0-9\s\-().]{7,30}$/.test(raw)) {
    return {
      isValid: false,
      error: 'Phone number contains invalid characters. Use digits and optional country code.',
      formattedPhone: raw
    };
  }

  // Extract pure digits
  const hasLeadingPlus = raw.startsWith('+');
  const digitsOnly = raw.replace(/\D/g, '');

  // E.164 requires between 7 and 15 digits
  if (digitsOnly.length < 7) {
    return {
      isValid: false,
      error: `Phone number is too short (${digitsOnly.length} digits). Minimum 7 digits required.`,
      formattedPhone: raw
    };
  }

  if (digitsOnly.length > 15) {
    return {
      isValid: false,
      error: `Phone number is too long (${digitsOnly.length} digits). E.164 maximum is 15 digits.`,
      formattedPhone: raw
    };
  }

  // Disallow obvious repetitive or dummy numbers (e.g. 00000000, 11111111, 12345678)
  const isAllSameDigit = /^(\d)\1+$/.test(digitsOnly);
  const isSequence = '0123456789012345'.includes(digitsOnly) || '9876543210987654'.includes(digitsOnly);

  if (isAllSameDigit || (isSequence && digitsOnly.length >= 7)) {
    return {
      isValid: false,
      error: 'Please enter a genuine, active client telephone number.',
      formattedPhone: raw
    };
  }

  // Format phone number nicely
  let formatted: string;
  if (hasLeadingPlus) {
    formatted = `+${digitsOnly}`;
  } else if (digitsOnly.startsWith('0') && (digitsOnly.length === 10 || digitsOnly.length === 9)) {
    // Common Kenyan/African national notation (e.g. 0712345678 -> +254712345678)
    formatted = `+254${digitsOnly.substring(1)}`;
  } else if (digitsOnly.length === 10) {
    // Standard 10-digit international / US without plus
    formatted = `+1${digitsOnly}`;
  } else {
    formatted = `+${digitsOnly}`;
  }

  return {
    isValid: true,
    formattedPhone: formatted
  };
}

/**
 * Combined verification check for both client email and phone number.
 * Must pass before storing client records to the Firestore database.
 */
export function verifyClientContact(
  email: string | null | undefined, 
  phone: string | null | undefined
): ClientVerificationResult {
  const emailResult = validateClientEmail(email);
  const phoneResult = validateClientPhone(phone);

  const isValid = emailResult.isValid && phoneResult.isValid;

  let errorMessage: string | undefined;
  if (!emailResult.isValid && !phoneResult.isValid) {
    errorMessage = `${emailResult.error} Also, ${phoneResult.error}`;
  } else if (!emailResult.isValid) {
    errorMessage = emailResult.error;
  } else if (!phoneResult.isValid) {
    errorMessage = phoneResult.error;
  }

  return {
    isValid,
    emailResult,
    phoneResult,
    errorMessage
  };
}
