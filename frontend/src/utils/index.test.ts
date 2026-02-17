import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate, formatDateTime, formatNumber, capitalizeFirst, truncateText } from '@/utils'

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('formats numbers as currency', () => {
      expect(formatCurrency(1000)).toContain('1,000')
    })

    it('handles zero', () => {
      expect(formatCurrency(0)).toContain('0')
    })

    it('handles negative numbers', () => {
      const result = formatCurrency(-500)
      expect(result).toContain('500')
    })

    it('handles decimal numbers', () => {
      expect(formatCurrency(1234.56)).toContain('1,234')
    })

    it('handles large numbers', () => {
      const result = formatCurrency(1000000)
      expect(result).toContain('1,000,000')
    })
  })

  describe('formatDate', () => {
    it('formats ISO date string', () => {
      const result = formatDate('2024-01-15')
      expect(result).toBeTruthy()
    })

    it('handles Date object', () => {
      const date = new Date('2024-06-20')
      const result = formatDate(date)
      expect(result).toBeTruthy()
    })
  })

  describe('formatDateTime', () => {
    it('formats date and time', () => {
      const result = formatDateTime('2024-01-15T10:30:00')
      expect(result).toBeTruthy()
    })
  })

  describe('formatNumber', () => {
    it('formats numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000')
    })

    it('handles decimal places', () => {
      expect(formatNumber(1234.567, 2)).toBe('1,234.57')
    })

    it('handles zero', () => {
      expect(formatNumber(0)).toBe('0')
    })
  })

  describe('capitalizeFirst', () => {
    it('capitalizes first letter', () => {
      expect(capitalizeFirst('hello')).toBe('Hello')
    })

    it('handles empty string', () => {
      expect(capitalizeFirst('')).toBe('')
    })

    it('handles already capitalized string', () => {
      expect(capitalizeFirst('Hello')).toBe('Hello')
    })
  })

  describe('truncateText', () => {
    it('truncates long text', () => {
      const longText = 'This is a very long text that needs to be truncated'
      const result = truncateText(longText, 20)
      expect(result.length).toBeLessThanOrEqual(23)
      expect(result).toContain('...')
    })

    it('does not truncate short text', () => {
      const shortText = 'Short text'
      const result = truncateText(shortText, 20)
      expect(result).toBe(shortText)
    })

    it('handles exact length', () => {
      const text = 'Exactly twenty chars!'
      const result = truncateText(text, 20)
      expect(result).toBe(text)
    })
  })
})
