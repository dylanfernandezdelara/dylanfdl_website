export function markPendingInstantFill(
  current: boolean,
  instant: boolean,
  shouldRoll: boolean,
): boolean {
  if (instant && shouldRoll) {
    return true
  }

  return current
}
