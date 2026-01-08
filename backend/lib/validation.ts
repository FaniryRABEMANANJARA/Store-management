/**
 * Utilitaires de validation
 * Fournit des fonctions de validation réutilisables
 */

import { ValidationError } from './errors'

export function validateRequired(value: any, fieldName: string): void {
  if (value === undefined || value === null || value === '') {
    throw new ValidationError(`${fieldName} is required`, { field: fieldName })
  }
}

export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format', { field: 'email', value: email })
  }
}

export function validatePassword(password: string, minLength: number = 6): void {
  if (password.length < minLength) {
    throw new ValidationError(
      `Password must be at least ${minLength} characters long`,
      { field: 'password', minLength }
    )
  }
}

export function validateRole(role: string): void {
  const validRoles = ['user', 'admin']
  if (!validRoles.includes(role)) {
    throw new ValidationError(
      `Invalid role. Must be one of: ${validRoles.join(', ')}`,
      { field: 'role', value: role, validRoles }
    )
  }
}

export function validatePositiveNumber(value: number, fieldName: string): void {
  if (typeof value !== 'number' || value <= 0 || !isFinite(value)) {
    throw new ValidationError(
      `${fieldName} must be a positive number`,
      { field: fieldName, value }
    )
  }
}

export function validateNonNegativeNumber(value: number, fieldName: string): void {
  if (typeof value !== 'number' || value < 0 || !isFinite(value)) {
    throw new ValidationError(
      `${fieldName} must be a non-negative number`,
      { field: fieldName, value }
    )
  }
}

export function validateStringLength(
  value: string,
  fieldName: string,
  minLength?: number,
  maxLength?: number
): void {
  if (minLength !== undefined && value.length < minLength) {
    throw new ValidationError(
      `${fieldName} must be at least ${minLength} characters long`,
      { field: fieldName, minLength, actualLength: value.length }
    )
  }
  
  if (maxLength !== undefined && value.length > maxLength) {
    throw new ValidationError(
      `${fieldName} must be at most ${maxLength} characters long`,
      { field: fieldName, maxLength, actualLength: value.length }
    )
  }
}
