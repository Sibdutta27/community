/**
 * Hand a string to the browser as a downloaded file.
 *
 * The API sends the roster as CSV text rather than a redirect so the request
 * still carries the bearer token; turning that text into a file is this
 * helper's whole job. The object URL is revoked on the next tick — Safari
 * needs the click to have happened first.
 */
export function downloadTextFile(
    text,
    filename,
    mimeType = 'text/csv;charset=utf-8',
) {
    const blob = new Blob([text], { type: mimeType });

    const url = URL.createObjectURL(blob);

    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = filename;

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    setTimeout(() => URL.revokeObjectURL(url), 0);
}

/**
 * Flatten a title into a safe file stem — the same shape the API uses, since
 * the browser cannot read the API's Content-Disposition header across CORS.
 */
export function filenameSlug(value) {
    const slug = String(value || '')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60);

    return slug || 'export';
}
