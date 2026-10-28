# Learning guidance and registration presentation

The directory offers combined field, level, content-cost and teaching-language filters.
`interface-prototype/dist/features/learning/guidance.js` contains the reviewed provider
categories and the three suggested starting paths. Matching uses the official provider
hostname, so guidance works with the live Supabase catalog and the local fixture.

Categories describe available learning options, not every course or certificate.
Unknown providers use “varies by program”; adding a provider does not assign an
unverified level, cost or language. Review its official course catalog before adding
metadata. A free-content label does not promise free certification or instructor-led
programs. Existing detailed language and cost descriptions remain visible.

Starting paths use existing published providers only, skip missing providers, and link
to the current opportunity directory filtered by field. They are suggested steps, with
no completion, admission or credential promise. Review provider guidance whenever
offerings change. Sources reviewed on 2026-10-28 include:

- https://elzero.org/
- https://www.freecodecamp.org/learn/
- https://www.netacad.com/
- https://skillsbuild.org/learning-catalog
- https://www.deeplearning.ai/courses/
- https://tryhackme.com/
- https://portswigger.net/web-security
- https://learn.microsoft.com/en-us/training/
- https://aws.amazon.com/training/digital/

Opportunity status comes from the saved registration kind and deadline. “Closes within
3 days” means 72 hours or less remain; at the deadline the existing expiry mechanism
removes the listing and registration action. Ongoing opportunities have a distinct
label. Open dialogs refresh when their status changes. No registration dates or locks
are changed. Participation summaries quote up to two relevant sentences from the
existing announcement, falling back to the stored audience or an organizer-rules prompt.

Validation: `learning-guidance.cjs`, `learning-directory.cjs`,
`registration-deadlines.cjs` and `ux-flows.cjs` in `interface-prototype/tests`.
