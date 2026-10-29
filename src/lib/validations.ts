import { z } from 'zod';

/** Indian mobile number — 10 digits starting 6-9. */
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number');

/** 6-digit Indian pincode (first digit 1-8). */
export const pincodeSchema = z
  .string()
  .trim()
  .regex(/^[1-8]\d{5}$/, 'Enter a valid 6-digit pincode');

/** Standard or BH-series Indian registration number. */
export const registrationNumberSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(
    /^([A-Z]{2}\d{1,2}[A-Z]{0,2}\d{4}|\d{2}BH\d{4}[A-Z]{1,2})$/,
    'Enter a valid registration number (e.g. MH12AB1234 or 22BH1234AA)',
  );

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Za-z]/, 'Include at least one letter')
  .regex(/\d/, 'Include at least one number');

export const emailSchema = z.string().trim().email('Enter a valid email address');

export const requiredString = (label: string, min = 1) =>
  z.string().trim().min(min, `${label} is required`);

export const optionalString = z.string().trim().optional().or(z.literal(''));
