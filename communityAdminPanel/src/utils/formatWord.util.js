/**
 * Convert a _ or - containing word to nice word
 * @param { String } word
 * @returns
 */
export function formatWords(word) {
    
    if ( !word ) return '';
    
    // Split the string by hyphen or underscore
    const words = word.split(/[-_]/);

    // Capitalize each word
    const formattedWords = words.map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });

    // Join the words with a space
    return formattedWords.join(" ");
}