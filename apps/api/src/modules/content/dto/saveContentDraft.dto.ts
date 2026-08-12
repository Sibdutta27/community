// dto/saveContentDraft.dto.ts

import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * A draft edit for one key.
 *
 * Both locales are optional so a single locale can be edited in isolation, but
 * the editor always submits the pair — publishing English while Spanish stays
 * on the shipped default is how a page ends up half-translated.
 *
 * The 4,000-character ceiling is well above the longest string in the catalog
 * (581 characters) and exists because the entire message catalog is serialized
 * into every page's payload: an editor pasting an essay taxes every request on
 * the site, not just the page they were looking at.
 */
export class SaveContentDraftDto {

    @IsOptional()
    @IsString()
    @MaxLength(4000)
    en?: string;

    @IsOptional()
    @IsString()
    @MaxLength(4000)
    es?: string;
}
