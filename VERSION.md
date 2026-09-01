# Version History

## V1.2.0 — Media & Project Assets

Current version: **V1.2.0**

This release adds profile and project media management on top of the production CMS and analytics system.

### Included
- Profile avatar URL management
- Resume/CV file URL management
- Project icon / initials
- Project thumbnail URL and alt text
- Project case-study gallery assets
- Media asset types: Image, Screenshot, Diagram, Document, Video and Link
- Media preview inside `/admin`
- Project card thumbnail display
- Case-study hero thumbnail display
- Case-study media gallery section
- JSON-LD image and associatedMedia fields
- Live-profile normalization for older V1.1.0 Supabase data
- Version sync across UI, package, README and deployment docs

### Version sync
- `package.json` version updated to `1.2.0`
- `src/data/version.ts` label updated to `V1.2.0`
- Admin storage/session keys updated to V1.2.0
- `supabase/schema.sql` notes updated for media fields

## Notes
Media is stored inside the existing `portfolio_profiles.data` JSONB field. Run `supabase/schema.sql` if this is a fresh Supabase project.

Use public image/file URLs for V1.2.0. Supabase Storage upload can be added later in V1.5.0 or another advanced CMS release.
