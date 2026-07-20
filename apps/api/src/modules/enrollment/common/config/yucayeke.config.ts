/**
 * OFFICIAL_YUCAYEKES — the single source of truth for the yucayeke select
 * (step 1). Served to the frontends via GET /enrollment/yucayekes and enforced
 * on the step-1 DTOs, so swapping this list updates validation + UI together.
 *
 * PLACEHOLDER: the client (BTF) is sending the official names list + map;
 * until then this holds the commonly documented historical cacicazgo/yucayeke
 * names of Borikén. Replace the array contents when the official list arrives —
 * nothing else needs to change.
 *
 * NOTE: ancestry (steps 2/3) yucayeke fields intentionally stay free text —
 * grandparents' historical yucayekes may not appear on an official list.
 */
export const OFFICIAL_YUCAYEKES: readonly string[] = [
    'Abacoa',
    'Aymaco',
    'Arasibo',
    'Canóbana',
    'Caguax',
    'Daguao',
    'Guamaní',
    'Guaraca',
    'Guarionex (Otoao)',
    'Guayama',
    'Guaynía',
    'Hayuya',
    'Humacao',
    'Loquillo',
    'Mabodamaca',
    'Orocobix',
    'Urayoán (Yagüeca)',
    'Yuisa (Jaymanío)',
];
