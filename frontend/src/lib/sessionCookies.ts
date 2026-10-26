/**
 * The two cookies that are the session, named once. The edge proxy, the Server
 * Action fetch and the header's signed-in check all read this, so a renamed
 * prefix in Django's FTP_AUTH is one change here rather than three that drift.
 */
export const ACCESS_COOKIE = 'freethedesk_access';
export const REFRESH_COOKIE = 'freethedesk_refresh';
export const SESSION_COOKIES: readonly string[] = [ACCESS_COOKIE, REFRESH_COOKIE];
