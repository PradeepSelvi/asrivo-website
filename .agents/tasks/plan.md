# Implementation Plan — Missing CMS Coverage

Generated from codebase exploration. All 5 sub-tasks are ordered so that every
dependency exists before the code that needs it.

---

## Dependency order rationale

- Step 1 adds `BookConsultContent` interface + `getBookConsultContent()` to
  `content-helpers.ts` and converts `app/book-consult/page.tsx`. Must come
  first because the admin form (step 2) references the same field names, and
  the page-content-actions route map (step 3) references the slug.
- Step 2 adds the admin UI for `schedule` and `book-consult`. `ScheduleContent`
  and `getScheduleContent()` already exist in `content-helpers.ts`, so there is
  no missing dependency for the `schedule` side. `BookConsultContent` is added
  in step 1, so step 2 must come after step 1.
- Step 3 adds `'book-consult': '/book-consult'` to the `pageRoutes` map inside
  `savePageContent()`. This is a pure data change with no dependencies on steps
  1-2, but it is placed after them to keep the admin registration complete
  before testing save behaviour.
- Step 4 (services-preview) and step 5 (schedule layout) are independent of
  each other and of steps 1-3. They are placed last for clarity.

---

- [ ] **1. Add `BookConsultContent` interface + `getBookConsultContent()` to
      `lib/supabase/content-helpers.ts`, then convert
      `app/book-consult/page.tsx` to a CMS-driven server component.**

  **What to do**

  At the very bottom of `lib/supabase/content-helpers.ts` (after the closing
  brace of `getScheduleContent()`, which is the last export, at line 1537),
  append the following block — following the exact same pattern as
  `ScheduleContent` / `getScheduleContent()` already present in the file:

  ```ts
  // ============================================
  // Book-Consult Page Content
  // ============================================

  export interface BookConsultContent {
    // Hero
    hero_badge: string
    hero_title: string
    hero_subtitle: string

    // "What to Expect" section
    expect_section_title: string
    expect_section_subtitle: string
    expect_step_1_title: string
    expect_step_1_desc: string
    expect_step_2_title: string
    expect_step_2_desc: string
    expect_step_3_title: string
    expect_step_3_desc: string

    // "Free Consultation" detail section
    consult_title: string
    benefit_1_title: string
    benefit_1_desc: string
    benefit_2_title: string
    benefit_2_desc: string
    benefit_3_title: string
    benefit_3_desc: string
    benefit_4_title: string
    benefit_4_desc: string

    // Schedule card
    card_title: string
    card_subtitle: string
    card_btn_schedule: string
    card_btn_inquiry: string

    // "Why Choose Us" section
    why_section_title: string
    stat_1_title: string
    stat_1_desc: string
    stat_2_title: string
    stat_2_desc: string
    stat_3_title: string
    stat_3_desc: string
    stat_4_title: string
    stat_4_desc: string

    // CTA section
    cta_title: string
    cta_subtitle: string
    cta_btn_primary: string
    cta_btn_secondary: string

    // SEO
    meta_title?: string
    meta_description?: string
  }

  const DEFAULT_BOOK_CONSULT_CONTENT: BookConsultContent = {
    hero_badge: "Let's Talk",
    hero_title: 'Book a Consultation',
    hero_subtitle:
      "Schedule a free consultation with our expert team. We'll discuss your project requirements, technical challenges, and explore how we can help bring your vision to life.",

    expect_section_title: 'What to Expect',
    expect_section_subtitle:
      'Our consultation process is designed to understand your needs and provide actionable insights.',
    expect_step_1_title: '1. Discovery Call',
    expect_step_1_desc:
      "We'll start with a friendly conversation to understand your business goals, technical requirements, and project timeline.",
    expect_step_2_title: '2. Solution Design',
    expect_step_2_desc:
      'Our experts will propose tailored solutions, technology stack recommendations, and architecture designs suited to your needs.',
    expect_step_3_title: '3. Project Roadmap',
    expect_step_3_desc:
      "We'll create a detailed roadmap with milestones, timelines, and cost estimates to bring your project to life.",

    consult_title: 'Free 30-Minute Consultation',
    benefit_1_title: 'No Commitment Required',
    benefit_1_desc:
      'Our consultation is completely free with no strings attached. Get expert advice even if you decide not to work with us.',
    benefit_2_title: 'Expert Guidance',
    benefit_2_desc:
      'Meet with our senior engineers and technical leads who have years of experience building successful products.',
    benefit_3_title: 'Flexible Scheduling',
    benefit_3_desc:
      'Choose a time that works best for you. We offer consultations across different time zones to accommodate your schedule.',
    benefit_4_title: 'Actionable Insights',
    benefit_4_desc:
      'Walk away with clear next steps, technology recommendations, and a better understanding of your project scope.',

    card_title: 'Schedule Your Consultation',
    card_subtitle: "Choose how you'd like to get in touch with us.",
    card_btn_schedule: 'Schedule Consultation Now',
    card_btn_inquiry: 'Fill Service Inquiry Form',

    why_section_title: 'Why Work With Asrivo Tech?',
    stat_1_title: '2+ Projects Built',
    stat_1_desc: 'Proven track record of delivering successful digital products across industries.',
    stat_2_title: 'Expert Team',
    stat_2_desc: 'Skilled developers, designers, and technical leads with years of experience.',
    stat_3_title: 'Client-Centric',
    stat_3_desc: 'We prioritize your vision and work collaboratively to achieve your goals.',
    stat_4_title: 'Modern Stack',
    stat_4_desc: 'We use cutting-edge technologies to build fast, secure, and scalable solutions.',

    cta_title: 'Ready to Start Your Project?',
    cta_subtitle: "Let's turn your ideas into reality. Book your free consultation today.",
    cta_btn_primary: 'Book Now',
    cta_btn_secondary: 'View Our Team',
  }

  /**
   * Fetches book-consult page content with proper typing and fallback to defaults.
   */
  export async function getBookConsultContent(): Promise<BookConsultContent> {
    const content = await getPageContent('book-consult')

    return {
      hero_badge: content.hero_badge || DEFAULT_BOOK_CONSULT_CONTENT.hero_badge,
      hero_title: content.hero_title || DEFAULT_BOOK_CONSULT_CONTENT.hero_title,
      hero_subtitle: content.hero_subtitle || DEFAULT_BOOK_CONSULT_CONTENT.hero_subtitle,

      expect_section_title: content.expect_section_title || DEFAULT_BOOK_CONSULT_CONTENT.expect_section_title,
      expect_section_subtitle: content.expect_section_subtitle || DEFAULT_BOOK_CONSULT_CONTENT.expect_section_subtitle,
      expect_step_1_title: content.expect_step_1_title || DEFAULT_BOOK_CONSULT_CONTENT.expect_step_1_title,
      expect_step_1_desc: content.expect_step_1_desc || DEFAULT_BOOK_CONSULT_CONTENT.expect_step_1_desc,
      expect_step_2_title: content.expect_step_2_title || DEFAULT_BOOK_CONSULT_CONTENT.expect_step_2_title,
      expect_step_2_desc: content.expect_step_2_desc || DEFAULT_BOOK_CONSULT_CONTENT.expect_step_2_desc,
      expect_step_3_title: content.expect_step_3_title || DEFAULT_BOOK_CONSULT_CONTENT.expect_step_3_title,
      expect_step_3_desc: content.expect_step_3_desc || DEFAULT_BOOK_CONSULT_CONTENT.expect_step_3_desc,

      consult_title: content.consult_title || DEFAULT_BOOK_CONSULT_CONTENT.consult_title,
      benefit_1_title: content.benefit_1_title || DEFAULT_BOOK_CONSULT_CONTENT.benefit_1_title,
      benefit_1_desc: content.benefit_1_desc || DEFAULT_BOOK_CONSULT_CONTENT.benefit_1_desc,
      benefit_2_title: content.benefit_2_title || DEFAULT_BOOK_CONSULT_CONTENT.benefit_2_title,
      benefit_2_desc: content.benefit_2_desc || DEFAULT_BOOK_CONSULT_CONTENT.benefit_2_desc,
      benefit_3_title: content.benefit_3_title || DEFAULT_BOOK_CONSULT_CONTENT.benefit_3_title,
      benefit_3_desc: content.benefit_3_desc || DEFAULT_BOOK_CONSULT_CONTENT.benefit_3_desc,
      benefit_4_title: content.benefit_4_title || DEFAULT_BOOK_CONSULT_CONTENT.benefit_4_title,
      benefit_4_desc: content.benefit_4_desc || DEFAULT_BOOK_CONSULT_CONTENT.benefit_4_desc,

      card_title: content.card_title || DEFAULT_BOOK_CONSULT_CONTENT.card_title,
      card_subtitle: content.card_subtitle || DEFAULT_BOOK_CONSULT_CONTENT.card_subtitle,
      card_btn_schedule: content.card_btn_schedule || DEFAULT_BOOK_CONSULT_CONTENT.card_btn_schedule,
      card_btn_inquiry: content.card_btn_inquiry || DEFAULT_BOOK_CONSULT_CONTENT.card_btn_inquiry,

      why_section_title: content.why_section_title || DEFAULT_BOOK_CONSULT_CONTENT.why_section_title,
      stat_1_title: content.stat_1_title || DEFAULT_BOOK_CONSULT_CONTENT.stat_1_title,
      stat_1_desc: content.stat_1_desc || DEFAULT_BOOK_CONSULT_CONTENT.stat_1_desc,
      stat_2_title: content.stat_2_title || DEFAULT_BOOK_CONSULT_CONTENT.stat_2_title,
      stat_2_desc: content.stat_2_desc || DEFAULT_BOOK_CONSULT_CONTENT.stat_2_desc,
      stat_3_title: content.stat_3_title || DEFAULT_BOOK_CONSULT_CONTENT.stat_3_title,
      stat_3_desc: content.stat_3_desc || DEFAULT_BOOK_CONSULT_CONTENT.stat_3_desc,
      stat_4_title: content.stat_4_title || DEFAULT_BOOK_CONSULT_CONTENT.stat_4_title,
      stat_4_desc: content.stat_4_desc || DEFAULT_BOOK_CONSULT_CONTENT.stat_4_desc,

      cta_title: content.cta_title || DEFAULT_BOOK_CONSULT_CONTENT.cta_title,
      cta_subtitle: content.cta_subtitle || DEFAULT_BOOK_CONSULT_CONTENT.cta_subtitle,
      cta_btn_primary: content.cta_btn_primary || DEFAULT_BOOK_CONSULT_CONTENT.cta_btn_primary,
      cta_btn_secondary: content.cta_btn_secondary || DEFAULT_BOOK_CONSULT_CONTENT.cta_btn_secondary,

      meta_title: content.meta_title,
      meta_description: content.meta_description,
    }
  }
  ```

  Then rewrite `app/book-consult/page.tsx` entirely. The page must:

  1. Add `export const dynamic = 'force-dynamic'` and `export const revalidate = 0`
     (same as every other CMS page).
  2. Become `async` and call `const content = await getBookConsultContent()` at
     the top.
  3. Build `metadata` dynamically:
     ```ts
     export async function generateMetadata(): Promise<Metadata> {
       const content = await getBookConsultContent()
       return {
         title: content.meta_title || 'Book a Consultation - Asrivo Tech',
         description:
           content.meta_description ||
           'Schedule a free consultation with our expert team...',
       }
     }
     ```
     Remove the current static `export const metadata` object.
  4. Replace every hardcoded string with the matching `content.*` field, keeping
     all existing JSX structure, icons, and Tailwind classes unchanged:

     | Hardcoded string in current file | Replace with |
     |---|---|
     | `"Let's Talk"` (span) | `{content.hero_badge}` |
     | `"Book a Consultation"` (h1) | `{content.hero_title}` |
     | Hero `<p>` text | `{content.hero_subtitle}` |
     | `"What to Expect"` (h2) | `{content.expect_section_title}` |
     | What-to-expect `<p>` subtitle | `{content.expect_section_subtitle}` |
     | `"1. Discovery Call"` | `{content.expect_step_1_title}` |
     | Discovery call `<p>` | `{content.expect_step_1_desc}` |
     | `"2. Solution Design"` | `{content.expect_step_2_title}` |
     | Solution design `<p>` | `{content.expect_step_2_desc}` |
     | `"3. Project Roadmap"` | `{content.expect_step_3_title}` |
     | Project roadmap `<p>` | `{content.expect_step_3_desc}` |
     | `"Free 30-Minute Consultation"` (h2) | `{content.consult_title}` |
     | `"No Commitment Required"` (h4) | `{content.benefit_1_title}` |
     | No commitment `<p>` | `{content.benefit_1_desc}` |
     | `"Expert Guidance"` (h4) | `{content.benefit_2_title}` |
     | Expert guidance `<p>` | `{content.benefit_2_desc}` |
     | `"Flexible Scheduling"` (h4) | `{content.benefit_3_title}` |
     | Flexible scheduling `<p>` | `{content.benefit_3_desc}` |
     | `"Actionable Insights"` (h4) | `{content.benefit_4_title}` |
     | Actionable insights `<p>` | `{content.benefit_4_desc}` |
     | `"Schedule Your Consultation"` (h3) | `{content.card_title}` |
     | Card `<p>` subtitle | `{content.card_subtitle}` |
     | `"Schedule Consultation Now"` button | `{content.card_btn_schedule}` |
     | `"Fill Service Inquiry Form"` button | `{content.card_btn_inquiry}` |
     | `"Why Work With Asrivo Tech?"` (h2) | `{content.why_section_title}` |
     | The `.map()` over the 4 static feature objects — replace the array with: | (see note below) |
     | `"Ready to Start Your Project?"` (h2) | `{content.cta_title}` |
     | CTA `<p>` subtitle | `{content.cta_subtitle}` |
     | `"Book Now"` button | `{content.cta_btn_primary}` |
     | `"View Our Team"` button | `{content.cta_btn_secondary}` |

     **Why-Choose-Us block note:** The current code maps over a 4-item array to
     render stat tiles. Replace the inline array with four explicit JSX tiles
     using `content.stat_1_title` / `content.stat_1_desc` … `stat_4_*` — do
     not use `.map()` since the fields are individually named. Keep the same
     Tailwind styling. The `feature.title.split(' ')[0]` display value becomes
     the first word of the CMS title, so keep that logic:
     ```tsx
     {[
       { title: content.stat_1_title, description: content.stat_1_desc },
       { title: content.stat_2_title, description: content.stat_2_desc },
       { title: content.stat_3_title, description: content.stat_3_desc },
       { title: content.stat_4_title, description: content.stat_4_desc },
     ].map((feature, index) => (
       <div key={index} className="text-center">
         <div className="text-4xl font-bold text-primary mb-2">{feature.title.split(' ')[0]}</div>
         <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
         <p className="text-sm text-muted-foreground">{feature.description}</p>
       </div>
     ))}
     ```

  **Files:**
  - `lib/supabase/content-helpers.ts` — append block at end of file (after line 1537)
  - `app/book-consult/page.tsx` — full rewrite

  **Verify:** `pnpm run type-check` — zero TypeScript errors.

---

- [ ] **2. Register `schedule` and `book-consult` in the admin content list,
      slug page, and form editor.**

  **What to do**

  **2a — `app/admin/(dashboard)/content/page.tsx`**

  Change:
  ```ts
  const PAGE_NAMES: Record<string, string> = {
    home: 'Home Page',
    about: 'About Page',
    services: 'Services Page',
    contact: 'Contact Page',
    projects: 'Projects Page',
    team: 'Team Page',
    careers: 'Careers Page',
  }

  const ALL_PAGES = ['home', 'about', 'services', 'contact', 'projects', 'team', 'careers']
  ```

  To:
  ```ts
  const PAGE_NAMES: Record<string, string> = {
    home: 'Home Page',
    about: 'About Page',
    services: 'Services Page',
    contact: 'Contact Page',
    projects: 'Projects Page',
    team: 'Team Page',
    careers: 'Careers Page',
    schedule: 'Schedule Page',
    'book-consult': 'Book Consultation Page',
  }

  const ALL_PAGES = ['home', 'about', 'services', 'contact', 'projects', 'team', 'careers', 'schedule', 'book-consult']
  ```

  **2b — `app/admin/(dashboard)/content/[slug]/page.tsx`**

  Change:
  ```ts
  const ALLOWED_PAGES = ['home', 'about', 'services', 'contact', 'projects', 'team', 'careers'] as const
  type PageSlug = typeof ALLOWED_PAGES[number]

  const PAGE_NAMES: Record<PageSlug, string> = {
    home: 'Home Page',
    about: 'About Page',
    services: 'Services Page',
    contact: 'Contact Page',
    projects: 'Projects Page',
    team: 'Team Page',
    careers: 'Careers Page',
  }
  ```

  To:
  ```ts
  const ALLOWED_PAGES = ['home', 'about', 'services', 'contact', 'projects', 'team', 'careers', 'schedule', 'book-consult'] as const
  type PageSlug = typeof ALLOWED_PAGES[number]

  const PAGE_NAMES: Record<PageSlug, string> = {
    home: 'Home Page',
    about: 'About Page',
    services: 'Services Page',
    contact: 'Contact Page',
    projects: 'Projects Page',
    team: 'Team Page',
    careers: 'Careers Page',
    schedule: 'Schedule Page',
    'book-consult': 'Book Consultation Page',
  }
  ```

  Also update the `<p>` route display to handle hyphenated slugs correctly.
  The current code uses:
  ```tsx
  <p className="text-sm text-muted-foreground">
    Update content and SEO settings for /{pageSlug === 'home' ? '' : pageSlug}
  </p>
  ```
  This already works for `book-consult` — no change needed.

  **2c — `app/admin/(dashboard)/content/[slug]/content-edit-form.tsx`**

  Change the `PageSlug` type at the top of the file:
  ```ts
  type PageSlug = 'home' | 'about' | 'services' | 'contact' | 'projects' | 'team' | 'careers'
  ```
  To:
  ```ts
  type PageSlug = 'home' | 'about' | 'services' | 'contact' | 'projects' | 'team' | 'careers' | 'schedule' | 'book-consult'
  ```

  In the `onSubmit` function (no changes needed — it already passes `slug` directly
  to `savePageContent`).

  Inside the JSX block that renders page-specific fields, after the final
  `{slug === 'careers' && <CareersFields register={register} />}` line, add:
  ```tsx
  {slug === 'schedule' && <ScheduleFields register={register} />}
  {slug === 'book-consult' && <BookConsultFields register={register} />}
  ```

  Append the two new field-component functions at the bottom of the file, just
  before the last `}` (end of file — after `CareersFields`):

  ```tsx
  function ScheduleFields({ register }: { register: any }) {
    return (
      <>
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-foreground">Hero Section</h3>

          <div className="space-y-2">
            <Label htmlFor="hero_badge">Hero Badge</Label>
            <Input id="hero_badge" {...register('hero_badge')} placeholder="Consultation" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hero_title">Hero Title</Label>
            <Input id="hero_title" {...register('hero_title')} placeholder="Schedule a Consultation Call" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
            <Textarea id="hero_subtitle" {...register('hero_subtitle')} rows={3} />
          </div>
        </div>

        <div className="space-y-6 border-t border-border pt-8">
          <h3 className="text-lg font-semibold text-foreground">Consultation Call Info Card</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="call_type_title">Call Type Title</Label>
              <Input id="call_type_title" {...register('call_type_title')} placeholder="Consultation Call" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="call_type_duration">Duration / Mode</Label>
              <Input id="call_type_duration" {...register('call_type_duration')} placeholder="30 min • Video Call" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="call_feature_1">Feature 1</Label>
              <Input id="call_feature_1" {...register('call_feature_1')} placeholder="Project requirements analysis" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="call_feature_2">Feature 2</Label>
              <Input id="call_feature_2" {...register('call_feature_2')} placeholder="Technical feasibility discussion" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="call_feature_3">Feature 3</Label>
              <Input id="call_feature_3" {...register('call_feature_3')} placeholder="Timeline and budget estimation" />
            </div>
          </div>
        </div>

        <div className="space-y-6 border-t border-border pt-8">
          <h3 className="text-lg font-semibold text-foreground">Urgent Contact Box</h3>

          <div className="space-y-2">
            <Label htmlFor="urgent_title">Urgent Title</Label>
            <Input id="urgent_title" {...register('urgent_title')} placeholder="Need a faster response?" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgent_description">Urgent Description</Label>
            <Textarea id="urgent_description" {...register('urgent_description')} rows={2} />
          </div>
        </div>
      </>
    )
  }

  function BookConsultFields({ register }: { register: any }) {
    return (
      <>
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-foreground">Hero Section</h3>

          <div className="space-y-2">
            <Label htmlFor="hero_badge">Hero Badge</Label>
            <Input id="hero_badge" {...register('hero_badge')} placeholder="Let's Talk" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hero_title">Hero Title</Label>
            <Input id="hero_title" {...register('hero_title')} placeholder="Book a Consultation" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
            <Textarea id="hero_subtitle" {...register('hero_subtitle')} rows={3} />
          </div>
        </div>

        <div className="space-y-6 border-t border-border pt-8">
          <h3 className="text-lg font-semibold text-foreground">What to Expect Section</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expect_section_title">Section Title</Label>
              <Input id="expect_section_title" {...register('expect_section_title')} placeholder="What to Expect" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expect_section_subtitle">Section Subtitle</Label>
              <Input id="expect_section_subtitle" {...register('expect_section_subtitle')} />
            </div>
          </div>

          {[1, 2, 3].map((n) => (
            <div key={n} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`expect_step_${n}_title`}>Step {n} Title</Label>
                <Input id={`expect_step_${n}_title`} {...register(`expect_step_${n}_title`)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`expect_step_${n}_desc`}>Step {n} Description</Label>
                <Textarea id={`expect_step_${n}_desc`} {...register(`expect_step_${n}_desc`)} rows={2} />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6 border-t border-border pt-8">
          <h3 className="text-lg font-semibold text-foreground">Free Consultation Details</h3>

          <div className="space-y-2">
            <Label htmlFor="consult_title">Section Title</Label>
            <Input id="consult_title" {...register('consult_title')} placeholder="Free 30-Minute Consultation" />
          </div>

          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`benefit_${n}_title`}>Benefit {n} Title</Label>
                <Input id={`benefit_${n}_title`} {...register(`benefit_${n}_title`)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`benefit_${n}_desc`}>Benefit {n} Description</Label>
                <Textarea id={`benefit_${n}_desc`} {...register(`benefit_${n}_desc`)} rows={2} />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6 border-t border-border pt-8">
          <h3 className="text-lg font-semibold text-foreground">Schedule Card</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="card_title">Card Title</Label>
              <Input id="card_title" {...register('card_title')} placeholder="Schedule Your Consultation" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card_subtitle">Card Subtitle</Label>
              <Input id="card_subtitle" {...register('card_subtitle')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card_btn_schedule">Schedule Button</Label>
              <Input id="card_btn_schedule" {...register('card_btn_schedule')} placeholder="Schedule Consultation Now" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card_btn_inquiry">Inquiry Button</Label>
              <Input id="card_btn_inquiry" {...register('card_btn_inquiry')} placeholder="Fill Service Inquiry Form" />
            </div>
          </div>
        </div>

        <div className="space-y-6 border-t border-border pt-8">
          <h3 className="text-lg font-semibold text-foreground">Why Work With Us Section</h3>

          <div className="space-y-2">
            <Label htmlFor="why_section_title">Section Title</Label>
            <Input id="why_section_title" {...register('why_section_title')} placeholder="Why Work With Asrivo Tech?" />
          </div>

          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`stat_${n}_title`}>Stat {n} Title</Label>
                <Input id={`stat_${n}_title`} {...register(`stat_${n}_title`)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`stat_${n}_desc`}>Stat {n} Description</Label>
                <Textarea id={`stat_${n}_desc`} {...register(`stat_${n}_desc`)} rows={2} />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6 border-t border-border pt-8">
          <h3 className="text-lg font-semibold text-foreground">CTA Section</h3>

          <div className="space-y-2">
            <Label htmlFor="cta_title">CTA Title</Label>
            <Input id="cta_title" {...register('cta_title')} placeholder="Ready to Start Your Project?" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cta_subtitle">CTA Subtitle</Label>
            <Textarea id="cta_subtitle" {...register('cta_subtitle')} rows={2} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cta_btn_primary">Primary Button</Label>
              <Input id="cta_btn_primary" {...register('cta_btn_primary')} placeholder="Book Now" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cta_btn_secondary">Secondary Button</Label>
              <Input id="cta_btn_secondary" {...register('cta_btn_secondary')} placeholder="View Our Team" />
            </div>
          </div>
        </div>
      </>
    )
  }
  ```

  **Files:**
  - `app/admin/(dashboard)/content/page.tsx`
  - `app/admin/(dashboard)/content/[slug]/page.tsx`
  - `app/admin/(dashboard)/content/[slug]/content-edit-form.tsx`

  **Verify:** `pnpm run type-check` — zero TypeScript errors. Navigating to
  `/admin/content` must show 9 page cards instead of 7. Clicking "Edit Content"
  for "Schedule Page" and "Book Consultation Page" must not return a 404.

---

- [ ] **3. Add `'book-consult': '/book-consult'` to `pageRoutes` in
      `savePageContent()` inside `lib/supabase/page-content-actions.ts`.**

  **What to do**

  In `lib/supabase/page-content-actions.ts`, find the `pageRoutes` object
  inside `savePageContent()`:

  ```ts
  const pageRoutes: Record<string, string> = {
    home: '/',
    about: '/about',
    services: '/services',
    contact: '/contact',
    projects: '/projects',
    team: '/team',
    careers: '/careers',
    schedule: '/schedule',
  }
  ```

  Add `'book-consult': '/book-consult'` as the last entry:

  ```ts
  const pageRoutes: Record<string, string> = {
    home: '/',
    about: '/about',
    services: '/services',
    contact: '/contact',
    projects: '/projects',
    team: '/team',
    careers: '/careers',
    schedule: '/schedule',
    'book-consult': '/book-consult',
  }
  ```

  This ensures `revalidatePath('/book-consult')` is called whenever an admin
  saves book-consult content, so Next.js re-renders the page immediately.

  **Files:**
  - `lib/supabase/page-content-actions.ts`

  **Verify:** `pnpm run type-check` — zero errors. Saving book-consult content
  in the admin panel must not show a 500 error, and `/book-consult` must render
  the updated CMS content on the next page load.

---

- [ ] **4. Replace the hardcoded `services` array in
      `components/home/services-preview.tsx` with a dynamic list from
      `config/services.ts`.**

  **What to do**

  The file currently has a module-level `const services = [...]` with 6
  hardcoded items. `config/services.ts` exports `getHomeServices()` which
  returns the 8 `showOnHome: true` services (excluding the one with
  `showOnHome: false`), each with a string `icon` field (`'Code'`,
  `'Smartphone'`, `'Layers'`, `'Palette'`, `'Cloud'`, `'Database'`, `'Cpu'`,
  `'Factory'`) and `getServiceLink(service)` for the href.

  **4a — change the import block** at the top of the file from:
  ```ts
  import { 
    Code2, 
    Globe, 
    Smartphone, 
    Cloud, 
    Bot, 
    Users,
    ArrowRight 
  } from "lucide-react"
  ```
  To:
  ```ts
  import {
    Code2,
    Smartphone,
    Layers,
    Palette,
    Cloud,
    Database,
    Cpu,
    Factory,
    Wrench,
    ArrowRight,
    type LucideIcon,
  } from "lucide-react"
  import { getHomeServices, getServiceLink, type Service } from "@/config/services"
  ```

  **4b — remove the hardcoded `services` array entirely** (the 6-item `const
  services = [...]`). Replace it with an icon map and a derived services list:

  ```ts
  const ICON_MAP: Record<string, LucideIcon> = {
    Code: Code2,
    Smartphone: Smartphone,
    Layers: Layers,
    Palette: Palette,
    Cloud: Cloud,
    Database: Database,
    Cpu: Cpu,
    Factory: Factory,
    Wrench: Wrench,
  }

  const GRADIENTS = [
    'from-blue-500/20 to-indigo-500/20',
    'from-emerald-500/20 to-teal-500/20',
    'from-purple-500/20 to-pink-500/20',
    'from-cyan-500/20 to-blue-500/20',
    'from-orange-500/20 to-amber-500/20',
    'from-rose-500/20 to-red-500/20',
    'from-violet-500/20 to-purple-500/20',
    'from-green-500/20 to-emerald-500/20',
  ]
  ```

  **4c — update `ServiceCard`** to accept a `Service` from config instead of
  the old inline object type:

  Change the component signature from:
  ```ts
  function ServiceCard({ service, index }: { service: typeof services[0]; index: number }) {
  ```
  To:
  ```ts
  function ServiceCard({ service, index }: { service: Service; index: number }) {
  ```

  Inside `ServiceCard`, replace `service.icon` (which was a component) with a
  runtime lookup:
  ```tsx
  const Icon = ICON_MAP[service.icon] ?? Code2
  ```
  Then replace `<service.icon className="..." />` with `<Icon className="..." />`.

  Replace `service.gradient` (the old object had this field) with:
  ```ts
  GRADIENTS[index % GRADIENTS.length]
  ```
  everywhere it was used (two places: the hover overlay `div` and the glow
  `div`).

  Replace `service.href` with `getServiceLink(service)`.

  **4d — update `ServicesPreview`** to call `getHomeServices()` instead of
  mapping over the removed `services` constant:

  ```tsx
  export function ServicesPreview({ content }: { content?: HomeContent }) {
    const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation()
    const homeServices = getHomeServices()

    // ... badge/title/subtitle/ctaText as before ...

    return (
      // ... existing JSX ...
      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {homeServices.map((service, index) => (
          <ServiceCard key={service.id} service={service} index={index} />
        ))}
      </div>
      // ...
    )
  }
  ```

  Note: `service.id` is the stable key (e.g. `'web-development'`), replacing
  `service.title` which was used before. The grid renders up to 8 items (all
  `showOnHome: true` entries); the 3-column grid layout handles that gracefully.

  **Files:**
  - `components/home/services-preview.tsx`

  **Verify:** `pnpm run type-check` — zero errors. The home page (`/`) must
  render 8 service cards whose titles and descriptions come from
  `config/services.ts`, not the old hardcoded list.

---

- [ ] **5. Update `app/schedule/layout.tsx` to be an async server component
      that uses `getScheduleContent()` for meta title and description,
      falling back to the current hardcoded values.**

  **What to do**

  Rewrite `app/schedule/layout.tsx` in full:

  ```tsx
  import type { Metadata } from 'next'
  import { getScheduleContent } from '@/lib/supabase/content-helpers'

  export const dynamic = 'force-dynamic'
  export const revalidate = 0

  export async function generateMetadata(): Promise<Metadata> {
    const content = await getScheduleContent()

    return {
      title: content.meta_title || 'Schedule a Consultation - Asrivo Tech',
      description:
        content.meta_description ||
        'Book a free 30-minute discovery call with our experts to discuss your project requirements and how we can help bring your vision to life.',
      keywords: ['consultation', 'schedule', 'discovery call', 'project discussion', 'asrivo tech'],
      openGraph: {
        title: content.meta_title || 'Schedule a Consultation - Asrivo Tech',
        description:
          content.meta_description ||
          'Book a free 30-minute discovery call with our experts.',
        type: 'website',
      },
    }
  }

  export default function ScheduleLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return children
  }
  ```

  The key changes:
  - Static `export const metadata` → dynamic `export async function
    generateMetadata()`, which is the Next.js 14/15 pattern for async metadata.
  - Import `getScheduleContent` from `content-helpers`.
  - Add `force-dynamic` + `revalidate = 0` so the metadata fetch is never
    stale-cached.
  - Fallback strings match the current hardcoded values exactly, so there is no
    visible change until an admin updates them.

  **Files:**
  - `app/schedule/layout.tsx`

  **Verify:** `pnpm run type-check` — zero errors. `pnpm run build` must
  complete without warnings about invalid `revalidate` values on `/schedule`.
  After saving a meta title in `/admin/content/schedule`, a hard reload of
  `/schedule` must show the updated `<title>` tag in the HTML source.
