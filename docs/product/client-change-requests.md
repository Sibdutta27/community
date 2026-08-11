Web App: https://community-frontend-web.vercel.app/

Landing Page

- [ ] Taino Nation → **Taino Nation of Boriken**
- [ ] Apply Now → **Enroll Today**
- [ ] Welcome to the Taíno Nation Digital Platform → Welcome to Taino Nation of Boriken
- [ ] Reconnect with your ancestral roots, preserve your lineage, and join a sovereign community dedicated to honoring our Indigenous heritage and cultural identity.
- [ ] 5M+ Yucayeke Member Joined → Tribal Citizens ?

- [ ] ### To create a secure, culturally grounded digital platform that empowers Borikua Taíno descendants to reclaim their heritage, document their lineage, and participate in a thriving Indigenous community. We honor the wisdom of our ancestors while embracing modern technology to ensure our culture, traditions, and identity endure for generations to come.

- [ ] (old) Sovereign Data: Your information belongs to the Taíno community. We maintain complete sovereignty over our data, ensuring it remains protected, private, and culturally respected. → **(new) Sovereign Data: Your data belongs to you. You maintain ownership and control over the personal information and files you upload to your account. You may also choose to contribute selected files to the tribally governed “Indigenous Archives of Puerto Rico” project, where they will become part of a communally held archive stewarded for cultural preservation, kinship research, and future learning by Borikua Taíno community members.**
- [ ] (old) Community Help Access health services, legal assistance, cultural events, and community resources designed specifically for Taíno Nation members. → (**new) Community Help: Learn from and contribute to a growing community resource hub where members can share information related to health services, legal assistance, job searches, cultural events, and other support for Taíno Nation members.**
- [ ] 12 Historical Yucayeke Regions\* Needs verification from our researcher \- there are 18 verified
- [ ] (old) Comprehensive Support for Our Community: As an enrolled member of the Taíno Nation, you gain access to a wide range of services designed to support your health, wellbeing, education, and cultural connection. → (New) **Comprehensive Support for Our Community: As an enrolled member of the Taíno Nation, you will be part of a growing services hub created to support health, wellbeing, education, cultural connection, and community care. This space will be built collectively over time, guided by the needs of our members and strengthened by community leaders, practitioners, educators, and service providers who wish to offer their knowledge in service to one another.**
- [ ] Need Help Accessing Services? → **remove the phone number option for now. We will need to decide which email questions should be directed to.**
- [ ] Enrolled members can access their Tribal ID, document maternal lineage, connect with their assigned Yucayeke, use the secure document vault, and explore member services such as health, legal, educational, and community support resources.

Enrollment Process

- [ ] ## How to Join the Taíno Nation→ How to Enroll with the Taino Nation of Boriken

- [ ] Our enrollment process is designed to be simple, respectful, and thorough. Follow these steps to begin your journey toward official tribal membership.
- [ ] 1
- [ ] Step

- [ ] ### Create Account

- [ ] Sign up with your email and create a secure password to access the enrollment portal.
- [ ] 2
- [ ] Step

- [ ] ### Personal Information

- [ ] Provide your basic details including name, date of birth, and contact information.
- [ ] 3
- [ ] Step

- [ ] ### Maternal Lineage

- [ ] Document your maternal ancestry with names, dates, and places of birth for your lineage.
- [ ] 4
- [ ] Step

- [ ] ### Upload Documents

- [ ] Submit supporting documents such as birth certificates, family records, and lineage proof.
- [ ]

Communication Consent\*

I consent to receive communications from the Taino Nation of Boriken regarding my enrollment application and community updates via email, phone, and/or SMS.

Consent for ancestor to be added to ever green collective memory

For application follow brittany genes work \- \\

Additional  
Add domestic partnership  
Change taino to arawak, kalinago, garifuna

Sex / gender \- follow brittny genes work

Maternal to Ancestry or Genealogy \- follow brittany genes work

- Needs both father and mothers line

Allow users to jump application sections

2026-07-08 Sync (transcript: [transcripts/2026-07-08-btf-sync.md](./transcripts/2026-07-08-btf-sync.md))

Enrollment / questionnaire

- [ ] Sex vs. gender split — Sex: Female / Male / Intersex. Gender: Woman / Man / Two-Spirit (Arawak/Taíno term for Two-Spirit pending from Priscilla; keep the list easy to extend)
- [ ] Verified-ancestry indicator — lineage entries markable as verified indigenous ancestry (DNA/mtDNA haplogroup, genealogy) vs. unverified; shown on the member's lineage view
- [ ] Consent should persist — no re-consent on every re-entry to the enrollment application; consent recorded once and visible to admins attached to the user
- [ ] Personal identity documents — documents step must collect proof of identity: any **2 of 3** of state ID, birth certificate, social security card
- [ ] Yucayeke official-names dropdown — restrict yucayeke selection to the official list, no free text (**blocked**: awaiting official names list + map from BTF)

Tribal ID

- [ ] Verify tribal ID appears on profile after approval and is downloadable (PDF/PNG)
- [ ] (Future — not now) Printed physical ID with community artwork / watermark; ~$25 printing fee flow

Bugs seen on the call

- [ ] "Unauthorized — showing fallback profile values" on profile + admin dashboard "not connected" on staging (fix: expired-cookie/401 handling — committed on btf-testing)

Process / non-code

- [ ] Merge staging (btf-testing) into main → updated single link for Priscilla to share with testers
- [ ] Focus: no new features — lock down enrollment + admin approval end-to-end for production/investors
- [ ] Community artwork/photographs to fill out the visual design (content gathering, not code)

2026-07-20 Sync (transcript: [transcripts/2026-07-20-btf-sync.md](./transcripts/2026-07-20-btf-sync.md))

Context: the consent-once + identity-document work was committed 12:57–13:53 EDT that day; this
call started 15:06 EDT and the changes were not yet deployed ("we'll have that in the next day or
two"). Several items below are the client restating asks against the _older live build_ — status
against code is recorded in each line.

Yucayeke naming

- [ ] Arawakan corrections — adopt the client's official spellings; legal names are `Yukayeke <Name>` (e.g. `Guania` → **Yukayeke Wainia**, `Daguao` → **Yukayeke Dawao**). List delivered: `data/naming/yucayeke-names/` (**unblocks** the S3-list• placeholder)
- [ ] Generic term corrected — "Yucayeke" → **"Yukayeke"** (user-facing copy only; URLs, i18n namespaces, package names and domains unchanged)
- [ ] Count reconciliation — client's sheet has **18**; app carries **21**, GeoJSON **19**, API list **18**. Nothing eliminated; the three extras (Guajataca/Hayuya/Loquillo) retained pending client answer
- [ ] Guaynabo promoted to historically documented — client's sheet lists it; our data had it as oral tradition

Enrollment / questionnaire

- [ ] Single point of consent, filled out once — **not implemented**: consent is asked three times (sign-up, pre-step-1 dialog, step 5). Decision: keep consent at the START (sensitive identity documents must not be collected before it) and delete the step-5 re-ask, which becomes a signature + read-only summary of what was already consented to
- [ ] Government ID mandatory — **partial**: 2-of-3 identity docs shipped, but `STATE_ID` is optional, so birth certificate + social security card passes with no ID. Rule becomes "state ID **plus** at least one other"
- [ ] Intro / description of the Nation inside the flow — **partial**: intro copy exists only on the public marketing page, and that copy is **stale** (claims 4 steps, maternal-only; the real flow is 5 steps with paternal kinship). Add an intro screen at `/enrollment/start` (**blocked on copy**: authoritative "what the Nation is" text must come from BTF)

Beta testing / support

- [ ] Feedback + work-order widget — **not implemented**. Friendly always-available button so closed-beta testers can report issues with a screenshot; wanted before the weekly Wednesday focus groups. Hook exists: the chat button in `support-section.tsx` has no handler today

Roadmap decisions

- [x] PWA deprioritised — security concerns; stay on the web app, Google Play Store later once validated. Consistent with the repo (`apps/pwa` + `apps/mobile` are inert placeholders) but **undocumented** — PRD §9 still lists them as planned
- [x] Messaging board / social feature — explicitly deferred by the client ("for this month maybe not so much"); to be released later as its own announcement
- [x] GIS map of the yucayekes — delivered and shipped (contractor package + interactive map, 2026-07-28)

Process / non-code

- [ ] Closed-beta focus groups every Wednesday; NDA wording for testers (framed as "closed beta test", lifting at launch)
- [ ] Launch-party date deferred to end of month, to be paired with marketing rollout
- [ ] Social/marketing: stagger announcements as features land (enrollment now, chat later)
