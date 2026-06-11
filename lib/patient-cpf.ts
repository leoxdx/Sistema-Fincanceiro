const MISSING_CPF_PREFIX = 'sem-cpf-'

export function normalizePatientCpf(cpf: string | undefined | null): string {
  return (cpf ?? '').trim()
}

export function createMissingPatientCpfToken(): string {
  return `${MISSING_CPF_PREFIX}${crypto.randomUUID()}`
}

export function getVisiblePatientCpf(cpf: string | undefined | null): string {
  const normalized = normalizePatientCpf(cpf)
  return normalized.startsWith(MISSING_CPF_PREFIX) ? '' : normalized
}
