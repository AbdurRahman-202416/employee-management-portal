/** Shared auth constants with no server-only dependencies,
 *  so they can be imported from the proxy (edge) runtime too. */

export const SESSION_COOKIE = "emp_session";
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours
