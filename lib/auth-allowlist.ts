export const normalizeEmail = (email?: string | null) => email?.trim().toLowerCase() ?? ''

export const parseAllowedEmails = (value?: string | null) =>
  (value ?? '')
    .split(',')
    .map((email) => normalizeEmail(email))
    .filter(Boolean)

export const getAllowedEmails = () => parseAllowedEmails(process.env.ALLOWED_GOOGLE_EMAILS)

export const isEmailAllowed = (
  email?: string | null,
  allowedEmails: string[] = getAllowedEmails()
) => {
  const normalized = normalizeEmail(email)
  if (!normalized || allowedEmails.length === 0) {
    return false
  }
  return allowedEmails.includes(normalized)
}
