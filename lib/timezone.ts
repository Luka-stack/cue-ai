/** The device's IANA time zone, sent as `?tz=` so "today" and deadlines resolve locally. */
export function getTimeZone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
  } catch {
    return undefined;
  }
}
