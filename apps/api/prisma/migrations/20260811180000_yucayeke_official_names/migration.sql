-- Adopt the Nation's official yucayeke names (Arawakan corrections).
-- Source: data/naming/yucayeke-names/ — delivered by BTF at the 2026-07-20 sync.
--
-- Rewrites `Enrollment.yucayeke` from the superseded cacique-flavoured
-- spellings to the current legal names. Values not listed here (free text
-- predating the official list) are deliberately left untouched — the API
-- canonicalizes on read, and rewriting a member's own words is not ours to do.
--
-- `Ancestry.yucayeke` is intentionally NOT touched: it is free text by design
-- for grandparents' historical yucayekes.

UPDATE "Enrollment" SET "yucayeke" = 'Yukayeke Abakoa'    WHERE "yucayeke" IN ('Abacoa', 'Arasibo');
UPDATE "Enrollment" SET "yucayeke" = 'Yukayeke Aymako'    WHERE "yucayeke" = 'Aymaco';
UPDATE "Enrollment" SET "yucayeke" = 'Yukayeke Kainabon'  WHERE "yucayeke" = 'Canóbana';
UPDATE "Enrollment" SET "yucayeke" = 'Yukayeke Turabo'    WHERE "yucayeke" = 'Caguax';
UPDATE "Enrollment" SET "yucayeke" = 'Yukayeke Dawao'     WHERE "yucayeke" = 'Daguao';
UPDATE "Enrollment" SET "yucayeke" = 'Yukayeke Wayama'    WHERE "yucayeke" IN ('Guamaní', 'Guayama');
UPDATE "Enrollment" SET "yucayeke" = 'Yukayeke Wayanei'   WHERE "yucayeke" = 'Guaraca';
UPDATE "Enrollment" SET "yucayeke" = 'Yukayeke Otoao'     WHERE "yucayeke" = 'Guarionex (Otoao)';
UPDATE "Enrollment" SET "yucayeke" = 'Yukayeke Wainia'    WHERE "yucayeke" = 'Guaynía';
UPDATE "Enrollment" SET "yucayeke" = 'Yukayeke Makao'     WHERE "yucayeke" = 'Humacao';
UPDATE "Enrollment" SET "yucayeke" = 'Guajataca'          WHERE "yucayeke" = 'Mabodamaca';
UPDATE "Enrollment" SET "yucayeke" = 'Yukayeke Atiboniku' WHERE "yucayeke" = 'Orocobix';
UPDATE "Enrollment" SET "yucayeke" = 'Yukayeke Yawekax'   WHERE "yucayeke" = 'Urayoán (Yagüeca)';
UPDATE "Enrollment" SET "yucayeke" = 'Yukayeke Aimanio'   WHERE "yucayeke" = 'Yuisa (Jaymanío)';

-- ROLLBACK (copy-paste to reverse; Abacoa/Arasibo and Guamaní/Guayama collapsed
-- on the way in, so the inverse picks the primary of each pair):
--
-- UPDATE "Enrollment" SET "yucayeke" = 'Abacoa'            WHERE "yucayeke" = 'Yukayeke Abakoa';
-- UPDATE "Enrollment" SET "yucayeke" = 'Aymaco'            WHERE "yucayeke" = 'Yukayeke Aymako';
-- UPDATE "Enrollment" SET "yucayeke" = 'Canóbana'          WHERE "yucayeke" = 'Yukayeke Kainabon';
-- UPDATE "Enrollment" SET "yucayeke" = 'Caguax'            WHERE "yucayeke" = 'Yukayeke Turabo';
-- UPDATE "Enrollment" SET "yucayeke" = 'Daguao'            WHERE "yucayeke" = 'Yukayeke Dawao';
-- UPDATE "Enrollment" SET "yucayeke" = 'Guayama'           WHERE "yucayeke" = 'Yukayeke Wayama';
-- UPDATE "Enrollment" SET "yucayeke" = 'Guaraca'           WHERE "yucayeke" = 'Yukayeke Wayanei';
-- UPDATE "Enrollment" SET "yucayeke" = 'Guarionex (Otoao)' WHERE "yucayeke" = 'Yukayeke Otoao';
-- UPDATE "Enrollment" SET "yucayeke" = 'Guaynía'           WHERE "yucayeke" = 'Yukayeke Wainia';
-- UPDATE "Enrollment" SET "yucayeke" = 'Humacao'           WHERE "yucayeke" = 'Yukayeke Makao';
-- UPDATE "Enrollment" SET "yucayeke" = 'Mabodamaca'        WHERE "yucayeke" = 'Guajataca';
-- UPDATE "Enrollment" SET "yucayeke" = 'Orocobix'          WHERE "yucayeke" = 'Yukayeke Atiboniku';
-- UPDATE "Enrollment" SET "yucayeke" = 'Urayoán (Yagüeca)' WHERE "yucayeke" = 'Yukayeke Yawekax';
-- UPDATE "Enrollment" SET "yucayeke" = 'Yuisa (Jaymanío)'  WHERE "yucayeke" = 'Yukayeke Aimanio';
