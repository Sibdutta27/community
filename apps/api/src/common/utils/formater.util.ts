/**
 * Formate the pbublic id to 12 digit number
 */
export function formatPublicId(prefix: string, serial: bigint): string {
    const serialStr = serial.toString().padStart(8, '0');

    const parts = serialStr.match(/.{1,4}/g); // split into 4-4

    return `${prefix}-${parts?.join('-')}`;
}