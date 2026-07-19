/**
 * Shared academic constants and types used across multiple features
 * (student, class, etc.)
 */
export const GRADE_LEVELS = ['VII', 'VIII', 'IX'] as const
export type GradeLevel = (typeof GRADE_LEVELS)[number]
