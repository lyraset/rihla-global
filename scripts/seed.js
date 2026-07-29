/**
 * Seed the current hardcoded frontend content into MongoDB. Idempotent — every
 * document is upserted by a natural key, so re-running never duplicates.
 *
 *   npm run seed        (loads .env.local via node --env-file)
 */
import mongoose from 'mongoose'
import { connectDB } from '../lib/db.js'
import { env } from '../lib/env.js'
import { Stat } from '../models/Stat.js'
import { Service } from '../models/Service.js'
import { Feature } from '../models/Feature.js'
import { ProcessStep } from '../models/ProcessStep.js'
import { Testimonial } from '../models/Testimonial.js'
import { Faq } from '../models/Faq.js'
import { Country } from '../models/Country.js'
import { Page } from '../models/Page.js'
import { SiteSettings } from '../models/SiteSettings.js'

const STATS = [
  { label: 'Years of Excellence', value: 10, suffix: '+' },
  { label: 'Visa Success Rate', value: 98, suffix: '%' },
  { label: 'Happy Clients', value: 5000, suffix: '+' },
  { label: 'Countries Covered', value: 50, suffix: '+' },
]

const SERVICES = [
  { title: 'Student Visa', slug: 'student-visa', icon: 'GraduationCap', shortDescription: 'End-to-end support for university offers, funding proof and study permits.' },
  { title: 'Work Visa', slug: 'work-visa', icon: 'Briefcase', shortDescription: 'Employer sponsorship, work permits and skilled migration pathways.' },
  { title: 'Tourist Visa', slug: 'tourist-visa', icon: 'Plane', shortDescription: 'Fast-tracked travel visas with itinerary and documentation help.' },
  { title: 'Business Visa', slug: 'business-visa', icon: 'Building2', shortDescription: 'Investor and business-visitor visas for entrepreneurs and executives.' },
  { title: 'PR & Immigration', slug: 'pr-immigration', icon: 'FileCheck2', shortDescription: 'Points-based and family-sponsored permanent residency applications.' },
]

const FEATURES = [
  { title: 'Expert Guidance', icon: 'Award', description: 'Certified consultants with a decade of visa filing experience.' },
  { title: 'Transparent Process', icon: 'ShieldCheck', description: 'Clear timelines and fees — no hidden charges, ever.' },
  { title: 'High Success Rate', icon: 'BadgeCheck', description: '98% approval rate across student, work and PR categories.' },
  { title: 'Global Network', icon: 'Globe2', description: 'Partner universities and employers across 50+ countries.' },
  { title: 'Skilled Evaluation Team', icon: 'Compass', description: 'Dedicated case officers assess eligibility before you apply.' },
  { title: 'Personalized Approach', icon: 'Sparkles', description: 'A tailored roadmap built around your goals and timeline.' },
]

const PROCESS = [
  { title: 'Initial Consultation', icon: 'UserCheck' },
  { title: 'Documentation', icon: 'FileText' },
  { title: 'Application Submission', icon: 'ClipboardCheck' },
  { title: 'Visa Approval', icon: 'BadgeCheck' },
]

const TESTIMONIALS = [
  { name: 'Aisha R.', destination: 'UK Student Visa', rating: 5, quote: 'Rihla handled my offer letter and visa filing in under three weeks.' },
  { name: 'Daniel K.', destination: 'Canada PR', rating: 5, quote: 'Clear checklist, honest timelines — my PR was approved on the first try.' },
  { name: 'Meera S.', destination: 'Australia Work Visa', rating: 5, quote: 'They matched me with a sponsoring employer and managed every form.' },
]

const COUNTRIES = [
  { name: 'Turkey', code: 'TR', flag: '🇹🇷', visaTypes: ['Tourist', 'Work', 'Student'], blurb: 'Student, work and tourist visas for Turkey — including university placements and fast e-visa support.' },
  { name: 'UK', code: 'GB', flag: '🇬🇧', visaTypes: ['Student', 'Work', 'Tourist'], blurb: 'Complete UK visa support — student (CAS & university offers), skilled worker, and visitor visas.' },
  { name: 'UAE', code: 'AE', flag: '🇦🇪', visaTypes: ['Work', 'Business', 'Tourist'], blurb: 'Employment, business and tourist visas for the UAE, with document attestation and quick processing.' },
  { name: 'Saudi Arabia', code: 'SA', flag: '🇸🇦', visaTypes: ['Work', 'Business', 'Tourist'], blurb: 'Work, business and visit visas for Saudi Arabia, including Umrah and family-visit support.' },
  { name: 'USA', code: 'US', flag: '🇺🇸', visaTypes: ['Student', 'Business', 'Tourist'], blurb: 'Guidance for US F-1 student, B1/B2 visitor and business visas, with full interview preparation.' },
  { name: 'Italy', code: 'IT', flag: '🇮🇹', visaTypes: ['Student', 'Work', 'Tourist'], blurb: 'Study, work and Schengen tourist visas for Italy, including university admissions and appointments.' },
  { name: 'Philippines', code: 'PH', flag: '🇵🇭', visaTypes: ['Work', 'Tourist'], blurb: 'Work and tourist visa processing for the Philippines with complete documentation support.' },
  { name: 'Thailand', code: 'TH', flag: '🇹🇭', visaTypes: ['Tourist', 'Business'], blurb: 'Tourist and business visa assistance for Thailand, including visa-on-arrival guidance.' },
  { name: 'Indonesia', code: 'ID', flag: '🇮🇩', visaTypes: ['Tourist', 'Business'], blurb: 'Tourist and business visa support for Indonesia with itinerary and document help.' },
  { name: 'Malaysia', code: 'MY', flag: '🇲🇾', visaTypes: ['Student', 'Work', 'Tourist'], blurb: 'Student, work and tourist visas for Malaysia, including university placements.' },
  { name: 'Sri Lanka', code: 'LK', flag: '🇱🇰', visaTypes: ['Tourist', 'Business'], blurb: 'Tourist and business (ETA) visa processing for Sri Lanka with quick turnaround.' },
  { name: 'Azerbaijan', code: 'AZ', flag: '🇦🇿', visaTypes: ['Tourist', 'Work'], blurb: 'Tourist and work visa support for Azerbaijan, including fast e-visa processing.' },
  { name: 'Brunei', code: 'BN', flag: '🇧🇳', visaTypes: ['Work', 'Tourist'], blurb: 'Work and visit visa assistance for Brunei with full documentation support.' },
]

const FAQS = [
  { question: 'How long does the visa process take?', answer: 'Timelines vary by country and visa type — most student and tourist visas take 2–6 weeks once documents are ready. We give you a clear estimate at your free consultation.' },
  { question: 'What are your fees?', answer: 'Our consultation is free. Service fees depend on the visa category and are shared upfront in writing — no hidden charges, ever.' },
  { question: 'Do you guarantee a visa approval?', answer: 'No honest consultant can guarantee an approval, as the final decision rests with the embassy. We do maximise your chances with a 98% success rate through thorough eligibility checks and complete documentation.' },
  { question: 'Can you help if I was refused before?', answer: 'Yes. We review your previous refusal, address the reasons, and prepare a stronger re-application.' },
]

const PAGES = [
  {
    title: 'Privacy Policy',
    slug: 'privacy',
    content: '<p>Rihla Global Visa Consultant Pvt. Ltd. respects your privacy. This policy explains how we collect, use, and protect your information.</p><h2>Information we collect</h2><p>When you submit a form we collect your name, email, phone number and visa interest so we can respond to your enquiry.</p><h2>How we use it</h2><p>We use your details solely to contact you about your enquiry and our services. We never sell your data.</p><h2>Contact</h2><p>For any privacy request, email rihlaglobalofficail@gmail.com.</p>',
  },
  {
    title: 'Terms & Conditions',
    slug: 'terms',
    content: '<p>By using this website and our services you agree to these terms.</p><h2>Our services</h2><p>We provide visa and immigration consultancy. Final visa decisions are made by the relevant embassy or authority, not by us.</p><h2>Fees</h2><p>Service fees are agreed in writing before work begins and are non-refundable once processing has started, except as required by law.</p><h2>Contact</h2><p>Questions? Email rihlaglobalofficail@gmail.com.</p>',
  },
  {
    title: 'About Us',
    slug: 'about',
    content: '<p>Rihla Global is a licensed visa and immigration consultancy helping students, professionals and families reach opportunities across 50+ countries. With a decade of experience and a 98% success rate, we handle every step — from eligibility assessment to documentation and filing — with complete transparency.</p>',
  },
]

async function upsertMany(Model, items, keyField) {
  for (let i = 0; i < items.length; i++) {
    const doc = { ...items[i], order: i, isPublished: true }
    await Model.updateOne({ [keyField]: doc[keyField] }, { $set: doc }, { upsert: true })
  }
  console.log(`  ✓ ${Model.modelName}: ${items.length} upserted`)
}

async function seedSettings() {
  await SiteSettings.updateOne(
    { key: 'main' },
    {
      $set: {
        key: 'main',
        brandName: 'Rihla Global',
        tagline: 'Visa Consultant Pvt. Ltd.',
        contact: {
          email: 'rihlaglobalofficail@gmail.com',
          phone: '+92 324 3799558',
          whatsapp: env.WHATSAPP_BUSINESS_NUMBER,
          addressLine1: 'Office No. 02, 2nd Floor, Naseem Arcade',
          addressLine2: 'I-9 Markaz',
          city: 'Islamabad',
          country: 'Pakistan',
        },
        socials: {},
        hero: {
          badge: 'Licensed Visa & Immigration Consultants',
          headline: 'Your Gateway to',
          headlineAccent: 'Global Opportunities',
          subheadline: 'Expert guidance for student, work, tourist, business and PR visas — backed by a 98% success rate and complete transparency at every step.',
          primaryCtaLabel: 'Book Free Consultation',
          secondaryCtaLabel: 'Explore Services',
          trustItems: ['No hidden fees', 'Free eligibility check', 'End-to-end support'],
        },
        forms: {
          consultationTitle: 'Book a Free Consultation',
          consultationSubtitle: 'Get a personalised response from our team within 24 hours.',
          consultationSuccess: 'Thank you! Our team will reach out within 24 hours.',
          visaTypes: ['Student', 'Work', 'Tourist', 'Business'],
        },
        navLinks: [
          { label: 'Home', href: '#home', order: 0 },
          { label: 'About', href: '#about', order: 1 },
          { label: 'Services', href: '#services', order: 2 },
          { label: 'Study Abroad', href: '#study-abroad', order: 3 },
          { label: 'Success', href: '#success', order: 4 },
          { label: 'Contact', href: '#contact', order: 5 },
        ],
        whatsapp: {
          enabled: true,
          number: env.WHATSAPP_BUSINESS_NUMBER,
          defaultMessage: 'Hi, I would like to enquire about visa services.',
          showFloatingButton: true,
        },
      },
    },
    { upsert: true },
  )
  console.log('  ✓ SiteSettings: singleton upserted')
}

async function main() {
  console.log('Seeding Rihla content into MongoDB…')
  await connectDB()
  await seedSettings()
  await upsertMany(Stat, STATS, 'label')
  await upsertMany(Service, SERVICES, 'slug')
  await upsertMany(Feature, FEATURES, 'title')
  await upsertMany(ProcessStep, PROCESS, 'title')
  await upsertMany(Testimonial, TESTIMONIALS, 'name')
  await upsertMany(Country, COUNTRIES, 'name')
  await upsertMany(Faq, FAQS, 'question')
  await upsertMany(Page, PAGES, 'slug')
  await mongoose.connection.close()
  console.log('Done. Create your admin at /admin (first-run setup) or: npm run create-admin -- <email> <password>')
  process.exit(0)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
