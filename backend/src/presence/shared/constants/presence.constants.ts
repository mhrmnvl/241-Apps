/**
 * A second accepted scan for the same credential inside this window is the same
 * event, not a departure.
 *
 * The failure this prevents is severe and silent: with no window, someone
 * double-tapping at 07:00 because the beep was ambiguous records a departure at
 * 07:00 and appears to have worked zero minutes. Sixty seconds absorbs a
 * double-tap and is far shorter than any real same-day departure.
 */
export const DUPLICATE_SCAN_WINDOW_SECONDS = 60;

/**
 * How far back a device-derived `occurredAt` may be before it is rejected as
 * stale. SC-013 requires four hours of offline tolerance; eight gives the
 * margin for a gate that stays down over a long morning without accepting
 * timestamps from a device whose anchor is days old.
 */
export const MAX_OFFLINE_WINDOW_HOURS = 8;

/** Cap on one offline flush, so a queued morning arrives in bounded batches. */
export const MAX_SCAN_BATCH_SIZE = 500;

/**
 * Tolerance for a derived timestamp that lands slightly in the future.
 * Monotonic drift is real but small; anything beyond this is a broken anchor.
 */
export const FUTURE_SCAN_TOLERANCE_SECONDS = 30;

export const PRESENCE_DEVICE_REQUEST_KEY = 'presenceDevice';
