import { promises as fs } from 'node:fs';
import path from 'node:path';
import { cookies } from 'next/headers';

export type B2BSubmissionKind = 'contact' | 'distributor';
export type B2BSectionKey = 'overview' | 'enquiries' | 'distributors' | 'installations' | 'case-studies' | 'solutions' | 'pages' | 'site-settings' | 'access' | 'launch' | 'scripts' | 'smtp' | 'forms' | 'audit';

export type B2BCaseStudyCategory = 'Residential' | 'Commercial' | 'Industrial';

export interface B2BCaseStudyResult {
  label: string;
  value: string;
}

export interface B2BCaseStudy {
  id: string;
  category: B2BCaseStudyCategory;
  title: string;
  imageUrl: string;
  imageAlt: string;
  imageLeft: boolean;
  problem: string;
  solution: string;
  tags: string[];
  results: B2BCaseStudyResult[];
  featured: boolean;
  active: boolean;
}

export interface B2BCaseStudyProcessStep {
  id: string;
  label: string;
  title: string;
  description: string;
}

export interface B2BCaseStudiesContent {
  sectionKicker: string;
  sectionTitle: string;
  sectionDescription: string;
  sectionCtaLabel: string;
  sectionCtaHref: string;
  installationsHeroTitle: string;
  installationsHeroDescription: string;
  processKicker: string;
  processTitle: string;
  processSteps: B2BCaseStudyProcessStep[];
  installationsCtaLabel: string;
  installationsCtaHref: string;
  categories: B2BCaseStudyCategory[];
  studies: B2BCaseStudy[];
}

export type B2BSolutionCategoryKey = 'residential' | 'commercial' | 'industrial';

export interface B2BSolutionProblem {
  id: string;
  title: string;
  body: string;
  impact: string[];
  solution: string[];
  imageUrl: string;
  technologies: string[];
  productIds?: number[];
  productCategories: string[];
  active: boolean;
}

export interface B2BSolutionCategory {
  key: B2BSolutionCategoryKey;
  label: 'Residential' | 'Commercial' | 'Industrial';
  route: string;
  heroTitle: string;
  heroDescription: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  problems: B2BSolutionProblem[];
}

export interface B2BSolutionsContent {
  categories: B2BSolutionCategory[];
}

export interface B2BSubmissionRecord {
  id: string;
  kind: B2BSubmissionKind;
  status: 'new' | 'in-review' | 'resolved';
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  message: string;
  source: 'public-form' | 'admin';
  route: string;
  createdAt: string;
}

export interface B2BInstallationRecord {
  id: string;
  clientName: string;
  location: string;
  status: 'planned' | 'active' | 'completed';
  note: string;
  createdAt: string;
}

export interface B2BPageSection {
  id: string;
  title: string;
  type: string;
  visible: boolean;
  summary: string;
  content?: string;
  kicker?: string;
  ctaLabel?: string;
  ctaHref?: string;
  imageUrl?: string;
  imageAlt?: string;
}

export interface B2BPageRecord {
  route: string;
  title: string;
  description: string;
  published: boolean;
  updatedAt: string;
  sections: B2BPageSection[];
}

export interface B2BTrackingScripts {
  head: string;
  body: string;
  footer: string;
}

export interface B2BIntegrationsConfig {
  googleAnalyticsId: string;
  googleTagManagerId: string;
  searchConsoleVerification: string;
  zohoOneScript: string;
  customDomainHook: string;
  whatsappChatEnabled: boolean;
  whatsappChatNumber: string;
  whatsappChatText: string;
}

export interface B2BSiteContact {
  contactPhone: string;
  contactEmail: string;
  address: string;
  whatsapp: string;
  socials: {
    facebook: string;
    instagram: string;
    linkedin: string;
    twitter: string;
  };
}

export interface B2BHeaderConfig {
  brandLabel: string;
  announcement: string;
  ctaLabel: string;
  ctaHref: string;
  menuItems: Array<{ label: string; href: string }>;
}

export interface B2BFooterConfig {
  ctaTitle: string;
  ctaDescription: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  companyName: string;
  companyRegistration: string;
  tagline: string;
  copyright: string;
  disclaimerText: string;
  legalLinks: Array<{ label: string; href: string }>;
  columns: Array<{ title: string; items: Array<{ label: string; href: string }> }>;
}

export interface B2BLaunchConfig {
  enabled: boolean;
  title: string;
  message: string;
}

export interface B2BSmtpConfig {
  provider: 'microsoft365';
  useWordPressMailer: boolean;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
}

export interface B2BFormRoutingRule {
  formKey: string;
  formName: string;
  recipients: string[];
  fromEmail: string;
  senderName: string;
}

export interface B2BAccessRoleVisibility {
  [role: string]: Record<B2BSectionKey, boolean>;
}

export interface B2BSettings {
  contact: B2BSiteContact;
  header: B2BHeaderConfig;
  footer: B2BFooterConfig;
  integrations: B2BIntegrationsConfig;
  launch: B2BLaunchConfig;
  scripts: B2BTrackingScripts;
  smtp: B2BSmtpConfig;
  forms: B2BFormRoutingRule[];
  access: B2BAccessRoleVisibility;
}

export interface B2BAuditRecord {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
  details?: string;
}

export interface B2BAdminStore {
  enquiries: B2BSubmissionRecord[];
  distributorApplications: B2BSubmissionRecord[];
  installations: B2BInstallationRecord[];
  caseStudies: B2BCaseStudiesContent;
  solutions: B2BSolutionsContent;
  pages: B2BPageRecord[];
  settings: B2BSettings;
  audit: B2BAuditRecord[];
}

export interface B2BAdminHealthCheck {
  checkedAt: string;
  storageMode: 'wordpress' | 'file';
  env: {
    hasWpApiUrl: boolean;
    hasWpAppUser: boolean;
    hasWpAppPassword: boolean;
  };
  wordpress: {
    authHeaderPresent: boolean;
    read: {
      ok: boolean;
      status?: number;
      error?: string;
      skipped?: boolean;
    };
    write: {
      ok: boolean;
      status?: number;
      error?: string;
      skipped?: boolean;
    };
  };
  pages: {
    discovered: number;
    stored: number;
    effective: number;
  };
}

const B2B_APP_ROOT = process.env.B2B_APP_ROOT || path.resolve(process.cwd(), '..', 'prag-b2b');
const B2B_APP_DIR = path.join(B2B_APP_ROOT, 'app');
const STORE_PATH = path.join(process.cwd(), '.admin-data', 'b2b-admin-config.json');
const PAGE_FILE_NAMES = new Set(['page.tsx', 'page.ts', 'page.jsx', 'page.js']);

const WP_API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'https://central.prag.global/wp-json';
const WP_APP_USER = process.env.WP_APP_USER || '';
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD || '';

export async function buildWpAuthHeader(): Promise<Record<string, string>> {
  if (WP_APP_USER && WP_APP_PASSWORD) {
    const encoded = Buffer.from(`${WP_APP_USER}:${WP_APP_PASSWORD}`).toString('base64');
    return { Authorization: `Basic ${encoded}` };
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  } catch {
    // No request cookie context available.
  }

  return {};
}

const HOMEPAGE_HERO_IMAGE = 'https://central.prag.global/wp-content/uploads/2026/05/pragrite-1.jpg';
const ABOUT_TEAM_IMAGE = 'https://central.prag.global/wp-content/uploads/2026/04/51105cfa2d7e118079c6acdb18a81c8b54dc18e6.png';
const ABOUT_STORY_IMAGE = 'https://central.prag.global/wp-content/uploads/2026/04/51105cfa2d7e118079c6acdb18a81c8b54dc18e6-1.png';

const ROUTE_PRESETS: Record<string, Partial<B2BPageRecord>> = {
  '/': {
    title: 'Homepage',
    description: 'We design, install, and support reliable power systems for homes, businesses, and industries across Nigeria.',
    sections: [
      { id: 'home-hero', title: 'Homepage Hero', type: 'hero', visible: true, kicker: 'Reliable Power Solutions', summary: 'Unstable Power? We Fix It Permanently.', content: 'We design, install, and support reliable power systems for homes, businesses, and industries across Nigeria.', ctaLabel: 'Get a Free Power Assessment', ctaHref: '/contact', imageUrl: HOMEPAGE_HERO_IMAGE, imageAlt: 'PRAG homepage hero' },
      { id: 'home-reason-1', title: 'Built for Nigerian power conditions', type: 'reason', visible: true, summary: 'Built for Nigerian power conditions', content: 'Our systems are specifically engineered to handle voltage fluctuations, frequent outages, and harsh environmental conditions, ensuring consistent performance where it matters most.', imageUrl: 'https://central.prag.global/wp-content/uploads/2026/05/6333bffe31c649645bdba2b956b3e4bafe0a7868-scaled.jpg', imageAlt: 'Built for Nigerian power conditions' },
      { id: 'home-reason-2', title: 'End-to-End Delivery', type: 'reason', visible: true, summary: 'End-to-End Delivery (Design → Installation → Support)', content: 'From initial consultation and system design to professional installation and ongoing maintenance, we manage the entire process so you can enjoy a seamless, stress-free experience.', imageUrl: 'https://central.prag.global/wp-content/uploads/2026/05/8d3cd2d330451451580f7d3cb8661c92c954a0fa-scaled.jpg', imageAlt: 'End-to-End Delivery' },
      { id: 'home-reason-3', title: 'Trusted by Thousands Nationwide', type: 'reason', visible: true, summary: 'Trusted by Thousands Nationwide', content: 'With a growing network of satisfied customers across the country, our solutions have been tested and proven in real homes and businesses you can relate to.', imageUrl: 'https://central.prag.global/wp-content/uploads/2026/05/9ef4a5ee5bff2a6013ceebaf1698c605c4ed6fc4-scaled.jpg', imageAlt: 'Trusted nationwide' },
      { id: 'home-reason-4', title: 'Long-Term Reliability', type: 'reason', visible: true, summary: 'Long-Term Reliability, Not Quick Fixes', content: 'We focus on building durable energy systems designed to last for years, helping you avoid frequent replacements and unnecessary costs over time.', imageUrl: 'https://central.prag.global/wp-content/uploads/2026/05/aa2e989afcc2e3f55275cac3da1e786d9b35d788.jpg', imageAlt: 'Long-Term Reliability' },
      { id: 'home-tech-1', title: 'Voltage Stabilizers', type: 'technology', visible: true, summary: 'Voltage Stabilizers', content: 'Part of the four technologies that make up a complete PRAG system.', ctaLabel: 'View Products', ctaHref: '/products/all-prag-stabilizers', imageUrl: 'https://central.prag.global/wp-content/uploads/2026/04/7ee70985fdddba92a39a6e67f80ec4773cbf34fd.png', imageAlt: 'Voltage Stabilizers' },
      { id: 'home-tech-2', title: 'Inverters', type: 'technology', visible: true, summary: 'Inverters', content: 'Part of the four technologies that make up a complete PRAG system.', ctaLabel: 'View Products', ctaHref: '/products/inverters', imageUrl: 'https://central.prag.global/wp-content/uploads/2026/04/eebd514c0d3e75e4f32cb8fd691c7b3613fd99d5-1.png', imageAlt: 'Inverters' },
      { id: 'home-tech-3', title: 'Solar Systems', type: 'technology', visible: true, summary: 'Solar Systems', content: 'Part of the four technologies that make up a complete PRAG system.', ctaLabel: 'View Products', ctaHref: '/products/solar', imageUrl: 'https://central.prag.global/wp-content/uploads/2026/04/b5564cf299de3eea9dbe804a547cf74e99bc41a7.png', imageAlt: 'Solar Systems' },
      { id: 'home-tech-4', title: 'Battery Storage', type: 'technology', visible: true, summary: 'Battery Storage', content: 'Part of the four technologies that make up a complete PRAG system.', ctaLabel: 'View Products', ctaHref: '/products/batteries', imageUrl: 'https://central.prag.global/wp-content/uploads/2026/04/dd4b835690b546ee636b7659added08cd02d9891.png', imageAlt: 'Battery Storage' },
    ],
  },
  '/solutions': {
    title: 'Power Solutions',
    description: 'From industrial plants to residential homes, we engineer power systems that never let you down.',
    sections: [
      { id: '/solutions-hero', title: 'Solutions Hero', type: 'hero', visible: true, kicker: 'Power Solutions', summary: 'Power Solutions for Every Challenge', content: 'From industrial plants to residential homes, we engineer power systems that never let you down.', imageUrl: '', imageAlt: '' },
      { id: '/solutions-industrial', title: 'Industrial Solution', type: 'content', visible: true, summary: 'Heavy-Duty Power Engineering for Industry', content: 'Challenge: Industrial operations have zero tolerance for power problems. Voltage fluctuations can destroy motors, VFDs, and CNC machines. Unexpected outages halt production lines and cause massive losses. Our Solutions: PRAG\'s Industrial division handles complex, high-load power installations. We work directly with factory engineers to design systems that integrate with existing infrastructure.', ctaLabel: 'Learn More', ctaHref: '/solutions/industrial', imageUrl: 'https://central.prag.global/wp-content/uploads/2026/05/Rectangle-6-1.png', imageAlt: 'Industrial power engineering' },
      { id: '/solutions-commercial', title: 'Commercial Solution', type: 'content', visible: true, summary: 'Protect Your Business From Power Disruption', content: 'Challenge: For businesses, every hour of downtime costs money. Voltage surges can destroy servers, POS systems, and refrigeration. Power interruptions kill productivity and customer experience. Our Solutions: We engineer power reliability systems for offices, retail outlets, hospitals, hotels, and educational institutions sized for your actual load and growth plans.', ctaLabel: 'Learn More', ctaHref: '/solutions/commercial', imageUrl: 'https://central.prag.global/wp-content/uploads/2026/05/Rectangle-6.png', imageAlt: 'Commercial power systems' },
      { id: '/solutions-residential', title: 'Residential Solution', type: 'content', visible: true, summary: 'Complete Home Power Solutions', content: 'Challenge: Most Nigerian homes deal with power that comes unpredictably, appliances that get damaged, and generators that run all night. You deserve better. Our Solutions: PRAG designs complete home power systems that combine voltage stabilisation, solar generation, and battery storage so your home stays powered whether NEPA is around or not.', ctaLabel: 'Learn More', ctaHref: '/solutions/residential', imageUrl: 'https://central.prag.global/wp-content/uploads/2026/04/51105cfa2d7e118079c6acdb18a81c8b54dc18e6-1.png', imageAlt: 'Residential power systems' },
    ],
  },
  '/solutions/industrial': {
    title: 'Industrial Power Solutions',
    description: 'Engineered power for heavy-duty operations. PRAG delivers robust, high-capacity power systems designed to keep industrial operations running without interruption.',
    sections: [
      { id: '/solutions/industrial-hero', title: 'Industrial Hero', type: 'hero', visible: true, kicker: 'Industrial', summary: 'Engineered Power for Heavy-Duty Operations', content: 'Downtime is expensive. PRAG delivers robust, high-capacity power systems designed to keep industrial operations running without interruption.', ctaLabel: 'Get a Custom Quote', ctaHref: '/contact', imageUrl: '', imageAlt: '' },
      { id: '/solutions/industrial-problem-1', title: 'Voltage Instability & Equipment Damage', type: 'problem', visible: true, summary: 'Voltage Instability & Equipment Damage', content: 'Unstable power supply causes sudden voltage spikes and fluctuations that can damage sensitive systems, reduce equipment lifespan, and disrupt daily operations.', imageUrl: 'https://central.prag.global/wp-content/uploads/2026/05/Rectangle-6-1.png', imageAlt: 'Voltage instability and equipment damage' },
      { id: '/solutions/industrial-problem-2', title: 'Unplanned Downtime', type: 'problem', visible: true, summary: 'Unplanned Downtime', content: 'Frequent outages interrupt workflows, delay production timelines, and result in costly operational downtime for businesses and facilities.', imageUrl: 'https://central.prag.global/wp-content/uploads/2026/05/Rectangle-6-1.png', imageAlt: 'Unplanned downtime' },
      { id: '/solutions/industrial-problem-3', title: 'High Generator Dependence', type: 'problem', visible: true, summary: 'High Generator Dependence', content: 'Heavy reliance on diesel generators increases fuel expenses, maintenance costs, noise pollution, and overall operational inefficiency.', imageUrl: 'https://central.prag.global/wp-content/uploads/2026/05/Rectangle-6-1.png', imageAlt: 'High generator dependence' },
      { id: '/solutions/industrial-problem-4', title: 'Power Quality Issues', type: 'problem', visible: true, summary: 'Power Quality Issues', content: 'Harmonics, surges, and poor power factor degrade equipment performance, increase energy bills, and shorten the lifespan of industrial machinery.', imageUrl: 'https://central.prag.global/wp-content/uploads/2026/05/Rectangle-6-1.png', imageAlt: 'Power quality issues' },
      { id: '/solutions/industrial-cta', title: 'Industrial CTA', type: 'cta', visible: true, summary: 'Get a Custom Quote', content: 'Talk to PRAG about a tailored industrial power solution or browse all products.', ctaLabel: 'Get a Custom Quote', ctaHref: '/contact', imageUrl: '', imageAlt: '' },
    ],
  },
  '/solutions/commercial': {
    title: 'Commercial Power Solutions',
    description: 'Efficient and reliable power solutions built to support daily business operations without interruption.',
    sections: [
      { id: '/solutions/commercial-hero', title: 'Commercial Hero', type: 'hero', visible: true, kicker: 'Commercial', summary: 'Smart Energy Systems for Growing Businesses', content: 'Efficient and reliable power solutions built to support daily business operations without interruption.', ctaLabel: 'Get a Custom Quote', ctaHref: '/contact', imageUrl: '', imageAlt: '' },
      { id: '/solutions/commercial-problem-1', title: 'Operational Downtime', type: 'problem', visible: true, summary: 'Operational Downtime', content: 'Frequent power outages interrupt workflows, delay services, and reduce overall business productivity. Downtime can negatively impact customer experience, staff efficiency, and daily operations.', imageUrl: 'https://central.prag.global/wp-content/uploads/2026/05/Rectangle-6.png', imageAlt: 'Operational downtime' },
      { id: '/solutions/commercial-problem-2', title: 'High Energy Expenses', type: 'problem', visible: true, summary: 'High Energy Expenses', content: 'Businesses often rely heavily on generators, leading to rising fuel and maintenance costs. Increasing operational expenses reduce profitability and affect long term business growth.', imageUrl: 'https://central.prag.global/wp-content/uploads/2026/05/Rectangle-6.png', imageAlt: 'High energy expenses' },
      { id: '/solutions/commercial-problem-3', title: 'Unstable Equipment Performance', type: 'problem', visible: true, summary: 'Unstable Equipment Performance', content: 'Voltage instability affects computers, servers, and critical office equipment performance. Power fluctuations can cause system failures, data loss, and unexpected operational disruptions.', imageUrl: 'https://central.prag.global/wp-content/uploads/2026/05/Rectangle-6.png', imageAlt: 'Unstable equipment performance' },
      { id: '/solutions/commercial-problem-4', title: 'Inconsistent Customer Experience', type: 'problem', visible: true, summary: 'Inconsistent Customer Experience', content: 'Power interruptions in retail, hospitality, and service environments directly affect customer satisfaction, brand reputation, and revenue generation.', imageUrl: 'https://central.prag.global/wp-content/uploads/2026/05/Rectangle-6.png', imageAlt: 'Inconsistent customer experience' },
      { id: '/solutions/commercial-cta', title: 'Commercial CTA', type: 'cta', visible: true, summary: 'Get a Custom Quote', content: 'Talk to PRAG about a commercial power system built around your business load profile.', ctaLabel: 'Get a Custom Quote', ctaHref: '/contact', imageUrl: '', imageAlt: '' },
    ],
  },
  '/solutions/residential': {
    title: 'Residential Power Solutions',
    description: 'Keep your home comfortable, secure, and fully powered with smart energy solutions designed for everyday living.',
    sections: [
      { id: '/solutions/residential-hero', title: 'Residential Hero', type: 'hero', visible: true, kicker: 'Residential', summary: 'Reliable Power for Modern Living', content: 'Keep your home comfortable, secure, and fully powered with smart energy solutions designed for everyday living.', ctaLabel: 'Get a Custom Quote', ctaHref: '/contact', imageUrl: '', imageAlt: '' },
      { id: '/solutions/residential-problem-1', title: 'Frequent Power Interruptions', type: 'problem', visible: true, summary: 'Frequent Power Interruptions', content: 'Unstable electricity disrupts essential home activities, affecting comfort, security, and productivity. Frequent outages create inconvenience and make daily living less reliable for modern households.', imageUrl: 'https://central.prag.global/wp-content/uploads/2026/04/51105cfa2d7e118079c6acdb18a81c8b54dc18e6-1.png', imageAlt: 'Frequent power interruptions' },
      { id: '/solutions/residential-problem-2', title: 'Rising Energy Costs', type: 'problem', visible: true, summary: 'Rising Energy Costs', content: 'Constant generator usage and fuel consumption significantly increase monthly household expenses. High energy costs make it difficult for families to maintain affordable and efficient power access.', imageUrl: 'https://central.prag.global/wp-content/uploads/2026/04/51105cfa2d7e118079c6acdb18a81c8b54dc18e6-1.png', imageAlt: 'Rising energy costs' },
      { id: '/solutions/residential-problem-3', title: 'Appliance & Electronics Damage', type: 'problem', visible: true, summary: 'Appliance & Electronics Damage', content: 'Voltage fluctuations and sudden surges can damage sensitive household electronics and appliances. Repeated exposure to unstable power reduces equipment lifespan and increases repair costs.', imageUrl: 'https://central.prag.global/wp-content/uploads/2026/04/51105cfa2d7e118079c6acdb18a81c8b54dc18e6-1.png', imageAlt: 'Appliance and electronics damage' },
      { id: '/solutions/residential-problem-4', title: 'Dependence on Diesel Generators', type: 'problem', visible: true, summary: 'Dependence on Diesel Generators', content: 'Running generators around the clock creates noise, air pollution, and safety risks. Families deserve a cleaner, quieter, and more sustainable alternative for home power.', imageUrl: 'https://central.prag.global/wp-content/uploads/2026/04/51105cfa2d7e118079c6acdb18a81c8b54dc18e6-1.png', imageAlt: 'Dependence on diesel generators' },
      { id: '/solutions/residential-cta', title: 'Residential CTA', type: 'cta', visible: true, summary: 'Get a Custom Quote', content: 'Talk to PRAG about a residential power solution tailored to your home and comfort loads.', ctaLabel: 'Get a Custom Quote', ctaHref: '/contact', imageUrl: '', imageAlt: '' },
    ],
  },
  '/about': {
    title: 'About Us',
    description: 'PRAG is a power solutions company focused on designing and delivering systems that solve unstable electricity problems for homes, businesses, and industries.',
    sections: [
      { id: '/about-hero', title: 'About Hero', type: 'hero', visible: true, kicker: 'About PRAG', summary: 'Engineering Reliable Power Solutions for Real-World Challenges', content: 'PRAG is a power solutions company focused on designing and delivering systems that solve unstable electricity problems for homes, businesses, and industries.', imageUrl: '', imageAlt: '' },
      { id: '/about-company', title: 'About PRAG', type: 'content', visible: true, summary: 'Built on Engineering, Driven by Real Power Challenges', content: 'PRAG was founded to address one core problem, unreliable electricity. Instead of simply supplying equipment, we set out to design complete power solutions that ensure stability, efficiency, and long-term performance. Today, we work with homeowners, businesses, and industrial clients to deliver systems tailored to their specific needs, backed by technical expertise and real-world experience.', imageUrl: ABOUT_TEAM_IMAGE, imageAlt: 'PRAG team' },
      { id: '/about-story', title: 'Our Story', type: 'content', visible: true, summary: 'Nigeria\'s Leading Provider of Voltage Regulation, Power Backup, Storage, and Renewable Energy Solutions.', content: 'PRAG Power Engineering was founded in 2005 by a team of electrical engineers who were frustrated with the poor quality of power solutions being installed across Nigeria. They saw expensive imported equipment failing because installers did not understand Nigerian power conditions. They saw families and businesses suffering from systems that were never properly designed. We started with a simple mission: engineer power systems that actually work in Nigerian conditions. Twenty years later, we have installed over 50,000 systems across 36 states. Our engineers hold COREN certifications and international qualifications. We have grown, but our mission has not changed: reliable power engineering, done right.', imageUrl: ABOUT_STORY_IMAGE, imageAlt: 'Our story' },
      { id: '/about-values', title: 'Our Core Values', type: 'content', visible: true, summary: 'Built on Principles That Deliver Reliable Results', content: 'Engineering for Reliable Power: Engineering Power Systems with Precision, Technical Expertise, and a Focus on Long-Term Performance. Reliable Power Systems You Trust: Building Reliable Power Solutions That Perform Consistently Under Real-World Conditions. Practical Solutions for Real Conditions: Delivering Practical Power Solutions Designed for Real Environments, Not Just Ideal Scenarios. Designed to Meet Your Needs: Putting Client Needs First by Designing Power Systems Around Real Challenges and Requirements.', imageUrl: '', imageAlt: '' },
    ],
  },
  '/installations': {
    title: 'Installations',
    description: 'Real installations with measurable outcomes delivered across residential, commercial, and industrial sites.',
    sections: [
      {
        id: '/installations-main',
        title: 'Installations Main Content',
        type: 'hero',
        visible: true,
        kicker: 'Our Installations',
        summary: 'Real Installations, Measurable Results.',
        content: 'Every project tells the story of a solved problem. Browse our installation portfolio and see the outcomes we\'ve delivered.',
        ctaLabel: 'Start Your Installation →',
        ctaHref: '/contact',
        imageUrl: '',
        imageAlt: '',
      },
    ],
  },
  '/contact': {
    title: 'Get in Touch',
    description: 'Have a question or need a custom power solution? We would love to hear from you.',
    sections: [
      { id: '/contact-hero', title: 'Contact Hero', type: 'hero', visible: true, kicker: 'Contact', summary: 'Get in Touch', content: 'Have a question or need a custom power solution? We would love to hear from you.', imageUrl: '', imageAlt: '' },
      { id: '/contact-details', title: 'Contact Details', type: 'content', visible: true, summary: 'Contact Information', content: 'Email: sales@prag.global. Phone: +2348032170129. Location: Contact details are loaded from store settings on the frontend. Business hours are also loaded dynamically from site settings.', ctaLabel: 'Email PRAG', ctaHref: 'mailto:sales@prag.global', imageUrl: '', imageAlt: '' },
      { id: '/contact-form', title: 'Contact Form', type: 'cta', visible: true, summary: 'Need a custom power solution?', content: 'Use the contact form to reach the PRAG team and request a custom quote or technical guidance.', ctaLabel: 'Submit Enquiry', ctaHref: '/contact', imageUrl: '', imageAlt: '' },
    ],
  },
  '/privacy': {
    title: 'Privacy Policy',
    description: 'We respect your privacy and are committed to protecting your personal data.',
    sections: [
      { id: '/privacy-intro', title: 'Privacy Policy', type: 'content', visible: true, summary: 'Privacy Policy', content: 'We respect your privacy and are committed to protecting your personal data.', imageUrl: '', imageAlt: '' },
      { id: '/privacy-collect', title: 'Information We Collect', type: 'content', visible: true, summary: 'Information We Collect', content: 'We may collect the following types of information: Name, phone number, email. Delivery address. Transaction details. Website usage data including cookies and analytics.', imageUrl: '', imageAlt: '' },
      { id: '/privacy-use', title: 'How We Use Your Information', type: 'content', visible: true, summary: 'How We Use Your Information', content: 'We use your information for order processing, customer support, service updates, and marketing and promotions.', imageUrl: '', imageAlt: '' },
      { id: '/privacy-sharing', title: 'Third-Party Sharing', type: 'content', visible: true, summary: 'Third-Party Sharing', content: 'We may share data with payment providers, logistics partners, and marketing platforms. Your data is handled in accordance with the Nigeria Data Protection Act.', imageUrl: '', imageAlt: '' },
    ],
  },
  '/return-policy': {
    title: 'Returns & Refund Policy',
    description: 'Return eligibility, non-returnable items, refunds, and important notices for PRAG products.',
    sections: [
      { id: '/return-eligibility', title: 'Return Eligibility', type: 'content', visible: true, summary: 'Return Eligibility', content: 'Returns are accepted only where the product is unused, in original packaging, and the request is made within 7 days of purchase.', imageUrl: '', imageAlt: '' },
      { id: '/return-nonreturnable', title: 'Non-Returnable Items', type: 'content', visible: true, summary: 'Non-Returnable Items', content: 'Installed products, used or damaged products, and custom or special-order items are not eligible for return.', imageUrl: '', imageAlt: '' },
      { id: '/return-refunds', title: 'Refunds', type: 'content', visible: true, summary: 'Refunds', content: 'Approved returns may be exchanged or refunded via the original payment method. Once a product has been installed, it is deemed accepted and cannot be returned.', imageUrl: '', imageAlt: '' },
    ],
  },
  '/terms-of-use': {
    title: 'Terms of Use',
    description: 'Website usage, order terms, warranty coverage, and important notices for PRAG products and services.',
    sections: [
      { id: '/terms-website', title: 'Use of Our Website', type: 'content', visible: true, summary: 'Use of Our Website', content: 'By using this website, you agree not to misuse or disrupt the platform and not to copy or reproduce content without permission. All content remains the property of PRAG.', imageUrl: '', imageAlt: '' },
      { id: '/terms-sale', title: 'Terms of Sale', type: 'content', visible: true, summary: 'Terms of Sale', content: 'Orders are subject to confirmation and availability. Full payment is required before delivery unless otherwise agreed. Prices may change without notice and pricing errors may be corrected at any time. Delivery timelines are estimates and responsibility passes to the customer upon delivery.', imageUrl: '', imageAlt: '' },
      { id: '/terms-warranty', title: 'Warranty Policy', type: 'content', visible: true, summary: 'Warranty Policy', content: 'All PRAG products carry a 1-Year Limited Warranty and Lithium Batteries carry a 5-Year Limited Warranty for manufacturing defects under normal and proper use. The warranty does not cover improper installation, overloading or misuse, environmental damage, unauthorized repairs, or normal wear and tear. PRAG is not liable for indirect or consequential losses.', imageUrl: '', imageAlt: '' },
      { id: '/terms-claims', title: 'Warranty Claims', type: 'content', visible: true, summary: 'Warranty Claims', content: 'To make a claim, contact our support team, provide proof of purchase, and allow product inspection. Repairs or replacements will be handled at PRAG\'s discretion.', imageUrl: '', imageAlt: '' },
    ],
  },
  '/shipping-policy': {
    title: 'Shipping Policy',
    description: 'Shipping areas, delivery timeframes, shipping costs, tracking, and delivery notices for orders across Nigeria.',
    sections: [
      { id: '/shipping-areas', title: 'Shipping Areas', type: 'content', visible: true, summary: 'Shipping Areas', content: 'We currently ship to all states in Nigeria. Our primary distribution centers are located in Lagos, Abuja, and Port Harcourt to ensure faster delivery times across the country.', imageUrl: '', imageAlt: '' },
      { id: '/shipping-timeframes', title: 'Delivery Timeframes', type: 'content', visible: true, summary: 'Delivery Timeframes', content: 'Lagos and environs: 1 to 2 business days for standard delivery. Major cities such as Abuja, Port Harcourt, Kano, and Ibadan: 2 to 4 business days. Other states: 3 to 7 business days.', imageUrl: '', imageAlt: '' },
      { id: '/shipping-costs', title: 'Shipping Costs', type: 'content', visible: true, summary: 'Shipping Costs', content: 'Shipping costs are calculated based on the weight and dimensions of your order, as well as your delivery location. Free shipping applies on orders above ₦500,000 within Lagos.', imageUrl: '', imageAlt: '' },
      { id: '/shipping-issues', title: 'Order Tracking and Delivery Issues', type: 'content', visible: true, summary: 'Order Tracking and Delivery Issues', content: 'Once your order has been shipped, you will receive a confirmation email with a tracking number. If your package arrives damaged or goes missing during transit, contact our customer support team within 48 hours of the expected delivery date for investigation and resolution.', imageUrl: '', imageAlt: '' },
    ],
  },
  '/compare': {
    title: 'Compare Products',
    description: 'Compare PRAG power products side-by-side to choose the best fit for your needs.',
    sections: [
      { id: '/compare-hero', title: 'Compare Hero', type: 'hero', visible: true, kicker: 'Compare', summary: 'Compare Products', content: 'Compare PRAG power products side-by-side to choose the best fit for your needs.', imageUrl: '', imageAlt: '' },
    ],
  },
  '/distributor': {
    title: 'Become a Distributor',
    description: 'Apply to become a PRAG distributor and grow with reliable power solutions.',
    sections: [
      { id: '/distributor-hero', title: 'Distributor Hero', type: 'hero', visible: true, kicker: 'Distributor', summary: 'Become a Distributor', content: 'Apply to become a PRAG distributor and grow with reliable power solutions.', imageUrl: '', imageAlt: '' },
    ],
  },
  '/find-a-distributor': {
    title: 'Find a Distributor',
    description: 'Locate verified PRAG distributors near you.',
    sections: [
      { id: '/find-a-distributor-hero', title: 'Find Distributor Hero', type: 'hero', visible: true, kicker: 'Distributors', summary: 'Find a Distributor', content: 'Locate verified PRAG distributors near you.', imageUrl: '', imageAlt: '' },
    ],
  },
  '/knowledge-center': {
    title: 'Knowledge Center',
    description: 'Explore guides, updates, and practical insights for reliable power systems.',
    sections: [
      { id: '/knowledge-center-hero', title: 'Knowledge Center Hero', type: 'hero', visible: true, kicker: 'Knowledge Center', summary: 'Knowledge Center', content: 'Explore guides, updates, and practical insights for reliable power systems.', imageUrl: '', imageAlt: '' },
    ],
  },
  '/knowledge-center/[slug]': {
    title: 'Knowledge Article',
    description: 'Detailed article content from the PRAG knowledge center.',
    sections: [
      { id: '/knowledge-center-slug-hero', title: 'Knowledge Article Hero', type: 'hero', visible: true, kicker: 'Knowledge Center', summary: 'Knowledge Article', content: 'Detailed article content from the PRAG knowledge center.', imageUrl: '', imageAlt: '' },
    ],
  },
  '/power-calculator': {
    title: 'Power Calculator',
    description: 'Estimate your power requirements and get the right PRAG recommendation.',
    sections: [
      { id: '/power-calculator-hero', title: 'Power Calculator Hero', type: 'hero', visible: true, kicker: 'Calculator', summary: 'Power Calculator', content: 'Estimate your power requirements and get the right PRAG recommendation.', imageUrl: '', imageAlt: '' },
    ],
  },
  '/products': {
    title: 'Products',
    description: 'Browse all PRAG product categories and power technologies.',
    sections: [
      { id: '/products-hero', title: 'Products Hero', type: 'hero', visible: true, kicker: 'Products', summary: 'Products', content: 'Browse all PRAG product categories and power technologies.', imageUrl: '', imageAlt: '' },
    ],
  },
  '/products/[category]': {
    title: 'Product Category',
    description: 'Explore products in the selected category.',
    sections: [
      { id: '/products-category-hero', title: 'Product Category Hero', type: 'hero', visible: true, kicker: 'Products', summary: 'Product Category', content: 'Explore products in the selected category.', imageUrl: '', imageAlt: '' },
    ],
  },
  '/products/[category]/[slug]': {
    title: 'Product Details',
    description: 'Review product details, specifications, and use cases.',
    sections: [
      { id: '/products-category-slug-hero', title: 'Product Details Hero', type: 'hero', visible: true, kicker: 'Products', summary: 'Product Details', content: 'Review product details, specifications, and use cases.', imageUrl: '', imageAlt: '' },
    ],
  },
  '/resources': {
    title: 'Resources',
    description: 'Access technical resources, guides, and supporting documentation.',
    sections: [
      { id: '/resources-hero', title: 'Resources Hero', type: 'hero', visible: true, kicker: 'Resources', summary: 'Resources', content: 'Access technical resources, guides, and supporting documentation.', imageUrl: '', imageAlt: '' },
    ],
  },
};

const DEFAULT_SECTION_VISIBILITY: Record<B2BSectionKey, boolean> = {
  overview: true,
  enquiries: true,
  distributors: true,
  installations: true,
  'case-studies': true,
  solutions: true,
  pages: true,
  'site-settings': true,
  access: true,
  launch: true,
  scripts: true,
  smtp: true,
  forms: true,
  audit: true,
};

const DEFAULT_SETTINGS: B2BSettings = {
  contact: {
    contactPhone: '+2348032170129',
    contactEmail: 'sales@prag.global',
    address: '14 Industrial Layout, Victoria Island, Lagos, Nigeria',
    whatsapp: 'https://wa.me/2348032170129',
    socials: {
      facebook: 'https://www.facebook.com/pragpowersolutions',
      instagram: 'https://www.instagram.com/prag_ng/',
      linkedin: 'https://www.linkedin.com/company/prag/',
      twitter: '',
    },
  },
  header: {
    brandLabel: 'PRAG B2B',
    announcement: '',
    ctaLabel: 'View Store',
    ctaHref: 'https://shop.prag.global',
    menuItems: [
      { label: 'About', href: '/about' },
      { label: 'Find a distributor', href: '/find-a-distributor' },
      { label: 'Become a distributor', href: '/distributor' },
      { label: 'Compare Products', href: '/compare' },
    ],
  },
  footer: {
    ctaTitle: 'Stop Losing Money to Bad Power',
    ctaDescription: 'Talk to a PRAG engineer today and fix your power issues permanently.',
    primaryCtaLabel: 'Get a Free Power Assessment',
    primaryCtaHref: '/power-calculator',
    secondaryCtaLabel: 'WhatsApp Us Now',
    secondaryCtaHref: 'https://wa.me/2348032170129',
    companyName: 'PRAG Power Engineering Ltd',
    companyRegistration: 'RC: 1234567.',
    tagline: 'Nigeria\'s leading power engineering company delivering reliable power systems for homes, businesses, and industries nationwide.',
    copyright: '© Copyright 2026 PRAG. All rights reserved.',
    disclaimerText: 'The products, prices and promotions on this website are applicable to our customers only and are subject to change anytime.',
    legalLinks: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms of use', href: '/terms-of-use' },
      { label: 'Shipping', href: '/shipping-policy' },
    ],
    columns: [
      {
        title: 'Solutions',
        items: [
          { label: 'Industrial Power', href: '/solutions/industrial' },
          { label: 'Commercial Power', href: '/solutions/commercial' },
          { label: 'Residential Power', href: '/solutions/residential' },
          { label: 'All Solutions', href: '/solutions' },
        ],
      },
      {
        title: 'Company',
        items: [
          { label: 'About us', href: '/about' },
          { label: 'Contact us', href: '/contact' },
          { label: 'Find a Distributor', href: '/find-a-distributor' },
          { label: 'Become a Distributor', href: '/distributor' },
          { label: 'Compare Products', href: '/compare' },
        ],
      },
      {
        title: 'Quicklinks',
        items: [
          { label: 'Shop', href: '/products' },
          { label: 'Power Calculator', href: '/power-calculator' },
          { label: 'Technical Resources', href: '/resources' },
          { label: 'Shipping Policy', href: '/shipping-policy' },
          { label: 'Return Policy', href: '/return-policy' },
          { label: 'Privacy Policy', href: '/privacy' },
          { label: 'Terms of Use', href: '/terms-of-use' },
        ],
      },
    ],
  },
  integrations: {
    googleAnalyticsId: '',
    googleTagManagerId: '',
    searchConsoleVerification: '',
    zohoOneScript: '',
    customDomainHook: '',
    whatsappChatEnabled: false,
    whatsappChatNumber: '',
    whatsappChatText: 'Chat with us on WhatsApp',
  },
  launch: {
    enabled: false,
    title: 'Launch control is active',
    message: 'Use this switch to temporarily hold the b2b site for updates.',
  },
  scripts: {
    head: '',
    body: '',
    footer: '',
  },
  smtp: {
    provider: 'microsoft365',
    useWordPressMailer: true,
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    username: '',
    password: '',
    fromEmail: 'sales@prag.global',
    fromName: 'PRAG B2B',
  },
  forms: [
    { formKey: 'contact', formName: 'Contact Form', recipients: ['sales@prag.global'], fromEmail: 'sales@prag.global', senderName: 'PRAG B2B' },
    { formKey: 'distributor', formName: 'Distributor Application', recipients: ['sales@prag.global'], fromEmail: 'sales@prag.global', senderName: 'PRAG B2B' },
    { formKey: 'installations', formName: 'Installation Request', recipients: ['sales@prag.global'], fromEmail: 'sales@prag.global', senderName: 'PRAG B2B' },
  ],
  access: {
    administrator: { ...DEFAULT_SECTION_VISIBILITY },
    shop_manager: {
      overview: true,
      enquiries: true,
      distributors: true,
      installations: true,
      'case-studies': true,
      solutions: true,
      pages: true,
      'site-settings': true,
      access: false,
      launch: false,
      scripts: false,
      smtp: false,
      forms: true,
      audit: false,
    },
  },
};

const DEFAULT_CASE_STUDIES: B2BCaseStudiesContent = {
  sectionKicker: 'Case Studies',
  sectionTitle: 'Real Results from Real Projects',
  sectionDescription: 'Explore how we\'ve helped homes, businesses, and industrial facilities overcome power challenges with tailored solutions.',
  sectionCtaLabel: 'View all Case studies →',
  sectionCtaHref: '/installations',
  installationsHeroTitle: 'Real Installations,\nMeasurable Results.',
  installationsHeroDescription: 'Every project tells the story of a solved problem. Browse our installation portfolio and see the outcomes we\'ve delivered.',
  processKicker: 'Our Process',
  processTitle: 'Every Installation Follows the\nSame Process',
  processSteps: [
    {
      id: 'process-01',
      label: '01',
      title: 'Site Assessment',
      description: 'We visit your site, measure load, assess infrastructure, and identify problem sources before touching any equipment.',
    },
    {
      id: 'process-02',
      label: '02',
      title: 'Custom Design',
      description: 'Your system is engineered specifically for your load profile, space constraints, and budget - never a template.',
    },
    {
      id: 'process-03',
      label: '03',
      title: 'Certified Installation',
      description: 'PRAG-trained engineers install to NSO standards. No subs, no shortcuts.',
    },
    {
      id: 'process-04',
      label: '04',
      title: 'Testing & Support',
      description: 'We test every circuit and component, brief your team, and provide ongoing warranty and maintenance.',
    },
  ],
  installationsCtaLabel: 'Start Your Installation →',
  installationsCtaHref: '/contact',
  categories: ['Residential', 'Commercial', 'Industrial'],
  studies: [
    {
      id: 'industrial-lagos-manufacturing',
      category: 'Industrial',
      title: 'A Lagos manufacturing company reduced downtime by over 90% with a PRAG system — achieving 99.8% uptime.',
      imageUrl: 'https://central.prag.global/wp-content/uploads/2026/05/Rectangle-7.png',
      imageAlt: 'Lagos manufacturing case study',
      imageLeft: true,
      problem: 'To reduce frequent power outages causing 12+ hours of weekly downtime, damaging expensive CNC machines.',
      solution: '500KVA integrated stabilizer, inverter, and solar system designed for high-load manufacturing operations with continuous uptime requirements.',
      tags: ['Stabilizer', 'Inverter', 'Solar Panels'],
      results: [
        { label: 'Power Rating', value: '500KVA' },
        { label: 'Uptime', value: '99.8%' },
        { label: 'Solar Panels', value: '99.8%' },
        { label: 'Annual Savings', value: '₦15M' },
        { label: 'Life Span', value: '3X' },
      ],
      featured: true,
      active: true,
    },
    {
      id: 'residential-meadows-estate',
      category: 'Residential',
      title: 'Meadows Estate, Lekki Phase II',
      imageUrl: 'https://central.prag.global/wp-content/uploads/2026/05/Rectangle-7.png',
      imageAlt: 'Meadows Estate installation',
      imageLeft: true,
      problem: '60 housing units dependent on shared generator, disputes over fuel costs, and 8-12 hour daily power cuts.',
      solution: 'Communal 50kW solar microgrid + 120kWh battery bank + individual unit smart metering for transparent consumption billing.',
      tags: ['Stabilizer', 'Inverter', 'Solar Panels', 'Lithium Battery'],
      results: [
        { label: 'Unit Powered', value: '60' },
        { label: 'Cost Production', value: '65%' },
        { label: 'Power Supply', value: '24/7' },
      ],
      featured: false,
      active: true,
    },
    {
      id: 'industrial-zenith-textile',
      category: 'Industrial',
      title: 'Zenith Textile Factory, Kano',
      imageUrl: 'https://central.prag.global/wp-content/uploads/2026/05/de54212698666fc36bad495a64ee3ac2e8d43166.png',
      imageAlt: 'Zenith Textile factory installation',
      imageLeft: false,
      problem: 'Voltage fluctuations causing 3-5 motor burnouts per month on industrial looms, costing ₦8M+ in repairs annually.',
      solution: 'Three-phase 250kVA servo-motor stabilizer + power factor correction capacitors + surge protection system across all production lines.',
      tags: ['Stabilizer', 'Inverter', 'Solar Panels', 'Lithium Battery'],
      results: [
        { label: 'Motor Burnout', value: '0' },
        { label: 'Production Gain', value: '+22.8%' },
        { label: 'Cost Production', value: '87%' },
      ],
      featured: false,
      active: true,
    },
    {
      id: 'commercial-federal-medical-centre',
      category: 'Commercial',
      title: 'Federal Medical Centre, Abuja',
      imageUrl: 'https://central.prag.global/wp-content/uploads/2026/05/7fc3e3ba69e25dbdf5621fb3f7498f827e5c525f.png',
      imageAlt: 'Federal Medical Centre installation',
      imageLeft: true,
      problem: 'Severe voltage fluctuations destroying diagnostic equipment and theatre instruments worth ₦45M annually.',
      solution: '100kVA three-phase industrial stabilizer + dual-input online UPS system deployed across all critical wards and theatres.',
      tags: ['Stabilizer', 'Inverter', 'Solar Panels', 'Lithium Battery'],
      results: [
        { label: 'Power Rating', value: '100KVA' },
        { label: 'Uptime', value: '99.8%' },
        { label: 'Annual Savings', value: '₦45M' },
      ],
      featured: false,
      active: true,
    },
    {
      id: 'commercial-ikeja-shopping-mall',
      category: 'Commercial',
      title: 'Ikeja Shopping Mall, Lagos',
      imageUrl: 'https://central.prag.global/wp-content/uploads/2026/05/Rectangle-6.png',
      imageAlt: 'Ikeja shopping mall installation',
      imageLeft: false,
      problem: 'Daily 6-8hr outages causing ₦2.1M/week in lost sales and spoiled perishables across 42 tenants.',
      solution: '200kW rooftop solar system + 500kWh lithium battery storage + three-phase hybrid inverters with remote monitoring dashboard.',
      tags: ['Stabilizer', 'Inverter', 'Solar Panels', 'Lithium Battery'],
      results: [
        { label: 'Tenants Powered', value: '42' },
        { label: 'Uptime', value: '99.5%' },
        { label: 'Weekly Savings', value: '₦2.1M' },
      ],
      featured: false,
      active: true,
    },
  ],
};

const DEFAULT_SOLUTIONS: B2BSolutionsContent = {
  categories: [
    {
      key: 'residential',
      label: 'Residential',
      route: '/solutions/residential',
      heroTitle: 'Reliable Power for Modern Living',
      heroDescription: 'Keep your home comfortable, secure, and fully powered with smart energy solutions designed for everyday living.',
      ctaLabel: 'Get a Custom Quote',
      ctaHref: '/contact',
      secondaryCtaLabel: 'Browse All Products →',
      secondaryCtaHref: '/products',
      problems: [
        {
          id: 'residential-frequent-power-interruptions',
          title: 'Frequent Power Interruptions',
          body: 'Unstable electricity disrupts essential home activities, affecting comfort, security, and productivity.',
          impact: [
            'Frequent outages disrupt daily routines across lighting, refrigeration, internet access, and home productivity.',
            'In homes with remote work and e-learning, unstable electricity directly affects output and quality of life.',
          ],
          solution: [
            'PRAG builds residential continuity systems combining inverter and battery capacity to keep essential circuits running.',
            'We design around your real household usage so the system supports comfort and productivity loads.',
          ],
          imageUrl: 'https://central.prag.global/wp-content/uploads/2026/04/51105cfa2d7e118079c6acdb18a81c8b54dc18e6-1.png',
          technologies: ['Hybrid Solar Inverter Systems', 'Lithium Battery Banks (100-400Ah)', 'Automatic Changeover Controls'],
          productCategories: ['inverters', 'batteries'],
          active: true,
        },
        {
          id: 'residential-rising-energy-costs',
          title: 'Rising Energy Costs',
          body: 'Constant generator usage and fuel consumption significantly increase monthly household expenses.',
          impact: [
            'Generator fuel and maintenance place steady pressure on monthly household budgets.',
            'High energy spend limits financial flexibility and makes long-term planning difficult.',
          ],
          solution: [
            'PRAG reduces recurring costs through solar-inverter-battery systems optimized for residential demand.',
            'We balance affordability, reliability, and future expandability in one design.',
          ],
          imageUrl: 'https://central.prag.global/wp-content/uploads/2026/04/51105cfa2d7e118079c6acdb18a81c8b54dc18e6-1.png',
          technologies: ['Monocrystalline Solar Panels', 'Hybrid Solar Inverter Systems', 'Residential Battery Storage'],
          productCategories: ['solar', 'inverters', 'batteries'],
          active: true,
        },
        {
          id: 'residential-appliance-damage',
          title: 'Appliance & Electronics Damage',
          body: 'Voltage fluctuations and surges can damage sensitive household electronics and appliances.',
          impact: [
            'Voltage spikes and drops can damage TVs, refrigerators, AC units, and routers.',
            'Repeated unstable power reduces appliance lifespan and increases maintenance frequency.',
          ],
          solution: [
            'PRAG deploys voltage regulation and surge control tailored for residential environments.',
            'Our setup delivers cleaner, more consistent power to sensitive home electronics.',
          ],
          imageUrl: 'https://central.prag.global/wp-content/uploads/2026/04/51105cfa2d7e118079c6acdb18a81c8b54dc18e6-1.png',
          technologies: ['Automatic Voltage Stabilizers (1-5kVA)', 'Surge Protection for Home Circuits', 'Clean Power Distribution'],
          productCategories: ['all-prag-stabilizers', 'voltage-stabilizers'],
          active: true,
        },
        {
          id: 'residential-generator-dependence',
          title: 'Dependence on Diesel Generators',
          body: 'Running generators around the clock creates noise, pollution, and safety risks.',
          impact: [
            'Continuous generator use introduces persistent noise and emissions into home life.',
            'Fuel logistics and maintenance interruptions make generator-only strategies expensive.',
          ],
          solution: [
            'PRAG replaces generator-heavy setups with cleaner hybrid systems that prioritize solar and battery power.',
            'Families get a safer, quieter, and more sustainable home power experience.',
          ],
          imageUrl: 'https://central.prag.global/wp-content/uploads/2026/04/51105cfa2d7e118079c6acdb18a81c8b54dc18e6-1.png',
          technologies: ['Hybrid Inverter + Battery Systems', 'Solar Integration for Homes', 'Smart Backup Prioritization'],
          productCategories: ['solar', 'inverters', 'batteries'],
          active: true,
        },
      ],
    },
    {
      key: 'commercial',
      label: 'Commercial',
      route: '/solutions/commercial',
      heroTitle: 'Smart Energy Systems for Growing Businesses',
      heroDescription: 'Efficient and reliable power solutions built to support daily business operations without interruption.',
      ctaLabel: 'Get a Custom Quote',
      ctaHref: '/contact',
      secondaryCtaLabel: 'Browse All Products →',
      secondaryCtaHref: '/products',
      problems: [
        {
          id: 'commercial-operational-downtime',
          title: 'Operational Downtime',
          body: 'Frequent outages interrupt workflows, delay services, and reduce productivity.',
          impact: [
            'Outages can halt customer-facing and back-office operations, reducing output and revenue.',
            'Downtime weakens customer confidence and increases recovery costs.',
          ],
          solution: [
            'PRAG deploys continuity-focused backup systems so critical operations remain powered during outages.',
            'We size inverter and battery capacity around your actual business load profile.',
          ],
          imageUrl: 'https://central.prag.global/wp-content/uploads/2026/05/Rectangle-6.png',
          technologies: ['Three-Phase Hybrid Inverter Systems', 'Commercial Battery Storage', 'Automatic Changeover Controls'],
          productCategories: ['inverters', 'batteries'],
          active: true,
        },
        {
          id: 'commercial-high-energy-expenses',
          title: 'High Energy Expenses',
          body: 'Generator-heavy operations increase fuel and maintenance costs, reducing profitability.',
          impact: [
            'Unpredictable energy bills make planning and expansion decisions harder.',
            'High recurring energy costs limit reinvestment and growth.',
          ],
          solution: [
            'PRAG designs cost-optimized systems to reduce diesel dependence with inverter, battery, and solar integration.',
            'This improves cost predictability while maintaining continuity and power quality.',
          ],
          imageUrl: 'https://central.prag.global/wp-content/uploads/2026/05/Rectangle-6.png',
          technologies: ['Commercial Solar Systems (10-500kW)', 'High-Efficiency Inverter Platforms', 'Lithium Battery Storage Solution'],
          productCategories: ['solar', 'inverters', 'batteries'],
          active: true,
        },
        {
          id: 'commercial-unstable-equipment-performance',
          title: 'Unstable Equipment Performance',
          body: 'Voltage instability affects servers, POS systems, and other critical office equipment.',
          impact: [
            'Unstable voltage shortens equipment lifespan and increases failure events.',
            'Abrupt outages can interrupt transactions and damage data integrity.',
          ],
          solution: [
            'PRAG implements voltage regulation and protection layers for sensitive business loads.',
            'From stabilizers to surge protection, we reduce stress on equipment and prevent avoidable failures.',
          ],
          imageUrl: 'https://central.prag.global/wp-content/uploads/2026/05/Rectangle-6.png',
          technologies: ['Commercial Voltage Stabilizers (10-100kVA)', 'Power Conditioning and Surge Protection', 'UPS Systems for Critical Loads'],
          productCategories: ['all-prag-stabilizers', 'voltage-stabilizers', 'inverters'],
          active: true,
        },
        {
          id: 'commercial-inconsistent-customer-experience',
          title: 'Inconsistent Customer Experience',
          body: 'Power interruptions in service environments reduce satisfaction and brand trust.',
          impact: [
            'Outages in retail and hospitality directly affect payment systems, cooling, and service delivery.',
            'Repeated interruptions reduce repeat business and customer confidence.',
          ],
          solution: [
            'PRAG builds continuity-first power systems that keep front-of-house and core operations live.',
            'We prioritize service-critical loads to maintain smooth operations during grid instability.',
          ],
          imageUrl: 'https://central.prag.global/wp-content/uploads/2026/05/Rectangle-6.png',
          technologies: ['Hybrid Inverter + Battery Systems', 'Commercial Solar Integration', 'Energy Monitoring Dashboards'],
          productCategories: ['inverters', 'solar', 'batteries'],
          active: true,
        },
      ],
    },
    {
      key: 'industrial',
      label: 'Industrial',
      route: '/solutions/industrial',
      heroTitle: 'Engineered Power for Heavy-Duty Operations',
      heroDescription: 'Downtime is expensive. PRAG delivers robust, high-capacity power systems designed to keep industrial operations running without interruption.',
      ctaLabel: 'Get a Custom Quote',
      ctaHref: '/contact',
      secondaryCtaLabel: 'Browse All Products →',
      secondaryCtaHref: '/products',
      problems: [
        {
          id: 'industrial-voltage-instability',
          title: 'Voltage Instability & Equipment Damage',
          body: 'Unstable power causes spikes and drops that damage critical machinery and disrupt operations.',
          impact: [
            'Sensitive industrial equipment is vulnerable to unstable supply and repeated fluctuations.',
            'Frequent incidents increase repair costs, downtime, and delivery risk.',
          ],
          solution: [
            'PRAG delivers regulated power architecture to protect sensitive loads and maintain continuity.',
            'We combine advanced stabilizers, surge protection, and monitoring for long-term stability.',
          ],
          imageUrl: 'https://central.prag.global/wp-content/uploads/2026/05/Rectangle-6-1.png',
          technologies: ['Industrial Automatic Voltage Regulators', 'Servo and Relay Voltage Stabilizers', 'Power Quality Monitoring'],
          productCategories: ['all-prag-stabilizers', 'voltage-stabilizers', 'relay-voltage-stabilizers', 'servo-voltage-stabilizers'],
          active: true,
        },
        {
          id: 'industrial-unplanned-downtime',
          title: 'Unplanned Downtime',
          body: 'Frequent outages interrupt production workflows and cause costly downtime.',
          impact: [
            'Every minute of outage can translate into delayed production and lost revenue.',
            'In continuity-critical operations, brief outages can have cascading operational impact.',
          ],
          solution: [
            'PRAG installs high-capacity inverter and backup systems with automatic switchover.',
            'Our systems are sized to keep critical equipment powered through outage events.',
          ],
          imageUrl: 'https://central.prag.global/wp-content/uploads/2026/05/Rectangle-6-1.png',
          technologies: ['High Capacity Inverter Systems', 'Lithium Battery Storage Solution', 'Automatic Transfer Systems'],
          productCategories: ['inverters', 'batteries'],
          active: true,
        },
        {
          id: 'industrial-high-generator-dependence',
          title: 'High Generator Dependence',
          body: 'Heavy reliance on diesel generators increases cost, noise, and emissions.',
          impact: [
            'Generator-first strategies create high recurring fuel and service costs.',
            'Noise, emissions, and inconsistent output introduce additional operational risk.',
          ],
          solution: [
            'PRAG replaces generator dependence with hybrid inverter and battery systems.',
            'Solar + storage integration reduces fuel exposure while preserving reliability.',
          ],
          imageUrl: 'https://central.prag.global/wp-content/uploads/2026/05/Rectangle-6-1.png',
          technologies: ['Hybrid Power Systems', 'Solar + Inverter Integration', 'Lithium Battery Storage Solution'],
          productCategories: ['solar', 'inverters', 'batteries'],
          active: true,
        },
        {
          id: 'industrial-power-quality-issues',
          title: 'Power Quality Issues',
          body: 'Harmonics, surges, and poor power factor degrade performance and increase energy costs.',
          impact: [
            'Poor power quality reduces equipment lifespan and can cause precision process errors.',
            'Energy waste and demand inefficiency increase overall operating cost.',
          ],
          solution: [
            'PRAG deploys power-factor correction, filtering, and voltage regulation to clean and stabilize supply.',
            'Facilities gain safer operations, longer equipment life, and improved energy efficiency.',
          ],
          imageUrl: 'https://central.prag.global/wp-content/uploads/2026/05/Rectangle-6-1.png',
          technologies: ['Power Factor Correction Systems', 'Harmonic Filtering', 'Advanced Voltage Regulation'],
          productCategories: ['all-prag-stabilizers', 'voltage-stabilizers', 'inverters'],
          active: true,
        },
      ],
    },
  ],
};

const DEFAULT_STORE: B2BAdminStore = {
  enquiries: [],
  distributorApplications: [],
  installations: [],
  caseStudies: DEFAULT_CASE_STUDIES,
  solutions: DEFAULT_SOLUTIONS,
  pages: [],
  settings: DEFAULT_SETTINGS,
  audit: [],
};

function normalizeCaseStudyCategory(value: string | undefined): B2BCaseStudyCategory {
  if (value === 'Industrial' || value === 'Commercial') return value;
  return 'Residential';
}

export function normalizeCaseStudiesContent(content?: Partial<B2BCaseStudiesContent> | null): B2BCaseStudiesContent {
  const seeded = content?.studies ?? [];
  const deduped = new Map<string, B2BCaseStudy>();
  const normalizedProcessSteps = Array.isArray(content?.processSteps)
    ? content.processSteps
      .map((step, index) => ({
        id: String(step?.id ?? `process-${index + 1}`).trim(),
        label: String(step?.label ?? `${index + 1}`.padStart(2, '0')).trim(),
        title: String(step?.title ?? '').trim(),
        description: String(step?.description ?? '').trim(),
      }))
      .filter((step) => step.title || step.description)
    : [];

  for (const [index, raw] of seeded.entries()) {
    const title = String(raw?.title ?? '').trim();
    if (!title) continue;

    const key = title.toLowerCase();
    if (deduped.has(key)) continue;

    const fallback = DEFAULT_CASE_STUDIES.studies[index] ?? DEFAULT_CASE_STUDIES.studies[0];
    deduped.set(key, {
      id: String(raw?.id ?? `${normalizeCaseStudyCategory(raw?.category)}-${index + 1}`).trim(),
      category: normalizeCaseStudyCategory(raw?.category),
      title,
      imageUrl: String(raw?.imageUrl ?? fallback.imageUrl ?? '').trim(),
      imageAlt: String(raw?.imageAlt ?? fallback.imageAlt ?? title).trim(),
      imageLeft: raw?.imageLeft ?? fallback.imageLeft ?? true,
      problem: String(raw?.problem ?? '').trim(),
      solution: String(raw?.solution ?? '').trim(),
      tags: Array.isArray(raw?.tags) ? raw.tags.map((item) => String(item).trim()).filter(Boolean) : [],
      results: Array.isArray(raw?.results)
        ? raw.results
          .map((item) => ({ label: String(item?.label ?? '').trim(), value: String(item?.value ?? '').trim() }))
          .filter((item) => item.label && item.value)
        : [],
      featured: Boolean(raw?.featured),
      active: raw?.active ?? true,
    });
  }

  const studies = deduped.size > 0 ? Array.from(deduped.values()) : DEFAULT_CASE_STUDIES.studies;
  if (!studies.some((study) => study.featured && study.active)) {
    studies[0] = { ...studies[0], featured: true };
  }

  return {
    ...DEFAULT_CASE_STUDIES,
    ...content,
    sectionKicker: String(content?.sectionKicker ?? DEFAULT_CASE_STUDIES.sectionKicker),
    sectionTitle: String(content?.sectionTitle ?? DEFAULT_CASE_STUDIES.sectionTitle),
    sectionDescription: String(content?.sectionDescription ?? DEFAULT_CASE_STUDIES.sectionDescription),
    sectionCtaLabel: String(content?.sectionCtaLabel ?? DEFAULT_CASE_STUDIES.sectionCtaLabel),
    sectionCtaHref: String(content?.sectionCtaHref ?? DEFAULT_CASE_STUDIES.sectionCtaHref),
    installationsHeroTitle: String(content?.installationsHeroTitle ?? DEFAULT_CASE_STUDIES.installationsHeroTitle),
    installationsHeroDescription: String(content?.installationsHeroDescription ?? DEFAULT_CASE_STUDIES.installationsHeroDescription),
    processKicker: String(content?.processKicker ?? DEFAULT_CASE_STUDIES.processKicker),
    processTitle: String(content?.processTitle ?? DEFAULT_CASE_STUDIES.processTitle),
    processSteps: normalizedProcessSteps.length > 0 ? normalizedProcessSteps : DEFAULT_CASE_STUDIES.processSteps,
    installationsCtaLabel: String(content?.installationsCtaLabel ?? DEFAULT_CASE_STUDIES.installationsCtaLabel),
    installationsCtaHref: String(content?.installationsCtaHref ?? DEFAULT_CASE_STUDIES.installationsCtaHref),
    categories: ['Residential', 'Commercial', 'Industrial'],
    studies,
  };
}

function normalizeSolutionCategoryKey(value: string | undefined): B2BSolutionCategoryKey {
  if (value === 'commercial' || value === 'industrial') return value;
  return 'residential';
}

export function normalizeSolutionsContent(content?: Partial<B2BSolutionsContent> | null): B2BSolutionsContent {
  const defaultsByKey = new Map(DEFAULT_SOLUTIONS.categories.map((category) => [category.key, category]));
  const incoming = Array.isArray(content?.categories) ? content.categories : [];
  const incomingByKey = new Map(incoming.map((category) => [normalizeSolutionCategoryKey(category?.key), category]));
  const orderedKeys: B2BSolutionCategoryKey[] = ['residential', 'commercial', 'industrial'];

  const categories = orderedKeys.map((key) => {
    const fallback = defaultsByKey.get(key)!;
    const raw = incomingByKey.get(key);
    const normalizedProblems = Array.isArray(raw?.problems)
      ? raw.problems
        .map((problem, index) => ({
          id: String(problem?.id ?? `${key}-problem-${index + 1}`).trim(),
          title: String(problem?.title ?? '').trim(),
          body: String(problem?.body ?? '').trim(),
          impact: Array.isArray(problem?.impact) ? problem.impact.map((item) => String(item).trim()).filter(Boolean) : [],
          solution: Array.isArray(problem?.solution) ? problem.solution.map((item) => String(item).trim()).filter(Boolean) : [],
          imageUrl: String(problem?.imageUrl ?? fallback.problems[index]?.imageUrl ?? '').trim(),
          technologies: Array.isArray(problem?.technologies) ? problem.technologies.map((item) => String(item).trim()).filter(Boolean) : [],
          productIds: Array.isArray(problem?.productIds) ? problem.productIds.map((item) => Number(item)).filter((item) => Number.isFinite(item) && item > 0) : [],
          productCategories: Array.isArray(problem?.productCategories) ? problem.productCategories.map((item) => String(item).trim()).filter(Boolean) : [],
          active: problem?.active ?? true,
        }))
        .filter((problem) => problem.title)
      : [];

    return {
      key,
      label: fallback.label,
      route: fallback.route,
      heroTitle: String(raw?.heroTitle ?? fallback.heroTitle).trim(),
      heroDescription: String(raw?.heroDescription ?? fallback.heroDescription).trim(),
      ctaLabel: String(raw?.ctaLabel ?? fallback.ctaLabel).trim(),
      ctaHref: String(raw?.ctaHref ?? fallback.ctaHref).trim(),
      secondaryCtaLabel: String(raw?.secondaryCtaLabel ?? fallback.secondaryCtaLabel).trim(),
      secondaryCtaHref: String(raw?.secondaryCtaHref ?? fallback.secondaryCtaHref).trim(),
      problems: normalizedProblems.length > 0 ? normalizedProblems : fallback.problems,
    };
  });

  return { categories };
}

function mergeSettings(settings?: Partial<B2BSettings> | null): B2BSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    contact: { ...DEFAULT_SETTINGS.contact, ...(settings?.contact ?? {}) },
    header: {
      ...DEFAULT_SETTINGS.header,
      ...(settings?.header ?? {}),
      menuItems: Array.isArray(settings?.header?.menuItems) ? settings.header.menuItems : DEFAULT_SETTINGS.header.menuItems,
    },
    footer: {
      ...DEFAULT_SETTINGS.footer,
      ...(settings?.footer ?? {}),
      columns: Array.isArray(settings?.footer?.columns) ? settings.footer.columns : DEFAULT_SETTINGS.footer.columns,
    },
    launch: { ...DEFAULT_SETTINGS.launch, ...(settings?.launch ?? {}) },
    integrations: { ...DEFAULT_SETTINGS.integrations, ...(settings?.integrations ?? {}) },
    scripts: { ...DEFAULT_SETTINGS.scripts, ...(settings?.scripts ?? {}) },
    smtp: { ...DEFAULT_SETTINGS.smtp, ...(settings?.smtp ?? {}) },
    forms: Array.isArray(settings?.forms) ? settings.forms : DEFAULT_SETTINGS.forms,
    access: {
      ...DEFAULT_SETTINGS.access,
      ...(settings?.access ?? {}),
    },
  };
}

function mergePageSections(route: string, sections?: B2BPageSection[]): B2BPageSection[] {
  if (Array.isArray(sections) && sections.length > 0) return sections;
  if (route === '/') {
    return [
      { id: 'home-hero', title: 'Hero', type: 'hero', visible: true, kicker: 'Reliable Power Solutions', summary: 'Homepage hero headline.', content: 'Homepage hero supporting copy and value proposition.', ctaLabel: 'Get a Free Power Assessment', ctaHref: '/contact', imageUrl: '', imageAlt: '' },
      { id: 'home-reason-1', title: 'Why PRAG Card 1', type: 'reason', visible: true, summary: 'First homepage trust card title.', content: 'First homepage trust card body copy.', imageUrl: '', imageAlt: '' },
      { id: 'home-reason-2', title: 'Why PRAG Card 2', type: 'reason', visible: true, summary: 'Second homepage trust card title.', content: 'Second homepage trust card body copy.', imageUrl: '', imageAlt: '' },
      { id: 'home-reason-3', title: 'Why PRAG Card 3', type: 'reason', visible: true, summary: 'Third homepage trust card title.', content: 'Third homepage trust card body copy.', imageUrl: '', imageAlt: '' },
      { id: 'home-reason-4', title: 'Why PRAG Card 4', type: 'reason', visible: true, summary: 'Fourth homepage trust card title.', content: 'Fourth homepage trust card body copy.', imageUrl: '', imageAlt: '' },
      { id: 'home-tech-1', title: 'Technology Card 1', type: 'technology', visible: true, summary: 'Homepage technology card title.', content: 'Homepage technology card supporting copy.', imageUrl: '', imageAlt: '' },
      { id: 'home-tech-2', title: 'Technology Card 2', type: 'technology', visible: true, summary: 'Homepage technology card title.', content: 'Homepage technology card supporting copy.', imageUrl: '', imageAlt: '' },
      { id: 'home-tech-3', title: 'Technology Card 3', type: 'technology', visible: true, summary: 'Homepage technology card title.', content: 'Homepage technology card supporting copy.', imageUrl: '', imageAlt: '' },
      { id: 'home-tech-4', title: 'Technology Card 4', type: 'technology', visible: true, summary: 'Homepage technology card title.', content: 'Homepage technology card supporting copy.', imageUrl: '', imageAlt: '' },
    ];
  }
  if (route.startsWith('/solutions/')) {
    return [
      { id: `${route}-hero`, title: 'Hero', type: 'hero', visible: true, kicker: 'Solution Overview', summary: 'Solution page headline.', content: 'Hero supporting copy for this solution page.', ctaLabel: 'Speak to Sales', ctaHref: '/contact', imageUrl: '', imageAlt: '' },
      { id: `${route}-cta`, title: 'Call To Action', type: 'cta', visible: true, summary: 'Final conversion headline.', content: 'Final CTA supporting copy.', ctaLabel: 'Browse All Products', ctaHref: '/products', imageUrl: '', imageAlt: '' },
    ];
  }
  return [
    { id: `${route}-hero`, title: 'Hero', type: 'hero', visible: true, kicker: 'Page Intro', summary: 'Top section headline.', content: 'Top section supporting copy.', ctaLabel: 'Contact Sales', ctaHref: '/contact', imageUrl: '', imageAlt: '' },
    { id: `${route}-content`, title: 'Content', type: 'content', visible: true, summary: 'Primary content title.', content: 'Primary body content and supporting copy.', imageUrl: '', imageAlt: '' },
    { id: `${route}-cta`, title: 'Call To Action', type: 'cta', visible: true, summary: 'Final conversion headline.', content: 'Final conversion action or contact path.', ctaLabel: 'Learn More', ctaHref: '/contact', imageUrl: '', imageAlt: '' },
  ];
}

function mergePageRecord(route: string, record?: Partial<B2BPageRecord>): B2BPageRecord {
  const title = record?.title || humanizeRoute(route);
  return {
    route,
    title,
    description: record?.description || `${title} content managed from the b2b admin.`,
    published: record?.published ?? true,
    updatedAt: record?.updatedAt || new Date().toISOString(),
    sections: mergePageSections(route, record?.sections).map((section, index) => {
      const source = record?.sections?.[index];
      return {
        ...section,
        ...(source ?? {}),
        content: source?.content ?? section.content ?? '',
        kicker: source?.kicker ?? section.kicker ?? '',
        ctaLabel: source?.ctaLabel ?? section.ctaLabel ?? '',
        ctaHref: source?.ctaHref ?? section.ctaHref ?? '',
        imageUrl: source?.imageUrl ?? section.imageUrl ?? '',
        imageAlt: source?.imageAlt ?? section.imageAlt ?? '',
      };
    }),
  };
}

function humanizeRoute(route: string) {
  if (route === '/') return 'Homepage';
  return route
    .split('/')
    .filter(Boolean)
    .map((segment) => segment
      .replace(/^\[(.+)\]$/, '$1')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase()))
    .join(' / ');
}

function isPageFile(name: string) {
  return PAGE_FILE_NAMES.has(name);
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function extractMetadataField(source: string, field: 'title' | 'description') {
  const match = field === 'title'
    ? source.match(/title\s*:\s*['"`]([^'"`]+)['"`]/)
    : source.match(/description\s*:\s*['"`]([^'"`]+)['"`]/);
  return match ? normalizeWhitespace(match[1]) : '';
}

function stripB2BSuffix(title: string) {
  return title.replace(/\s*[–-]\s*Prag B2B$/i, '').replace(/\s*[–-]\s*PRAG Power Engineering B2B$/i, '').trim();
}

function preferSeededValue(storedValue: string | undefined, placeholderValue: string | undefined, seededValue: string | undefined) {
  if (!storedValue) return seededValue ?? '';
  if (storedValue === placeholderValue) return seededValue ?? storedValue;
  if (storedValue.endsWith('content managed from the b2b admin.')) return seededValue ?? storedValue;
  return storedValue;
}

function mergeSeededPageRecord(seed: B2BPageRecord, stored?: Partial<B2BPageRecord>) {
  if (!stored) return seed;

  const storedSections = Array.isArray(stored.sections) ? stored.sections : [];
  const placeholderPage = mergePageRecord(seed.route);
  return mergePageRecord(seed.route, {
    ...seed,
    ...stored,
    title: preferSeededValue(stored.title, placeholderPage.title, seed.title),
    description: preferSeededValue(stored.description, placeholderPage.description, seed.description),
    updatedAt: stored.updatedAt || seed.updatedAt,
    sections: seed.sections.map((section, index) => {
      const current = storedSections[index];
      const placeholder = placeholderPage.sections[index];
      if (!current) return section;
      return {
        ...section,
        ...current,
        title: preferSeededValue(current.title, placeholder?.title, section.title),
        summary: preferSeededValue(current.summary, placeholder?.summary, section.summary),
        content: preferSeededValue(current.content, placeholder?.content, section.content),
        kicker: preferSeededValue(current.kicker, placeholder?.kicker, section.kicker),
        ctaLabel: preferSeededValue(current.ctaLabel, placeholder?.ctaLabel, section.ctaLabel),
        ctaHref: preferSeededValue(current.ctaHref, placeholder?.ctaHref, section.ctaHref),
        imageUrl: preferSeededValue(current.imageUrl, placeholder?.imageUrl, section.imageUrl),
        imageAlt: preferSeededValue(current.imageAlt, placeholder?.imageAlt, section.imageAlt),
      };
    }),
  });
}

async function buildSeededPageRecord(route: string, filePath?: string) {
  const source = filePath ? await fs.readFile(filePath, 'utf8').catch(() => '') : '';
  const preset = ROUTE_PRESETS[route] ?? {};
  const metadataTitle = extractMetadataField(source, 'title');
  const metadataDescription = extractMetadataField(source, 'description');
  const seeded: Partial<B2BPageRecord> = {
    ...preset,
    title: preset.title || stripB2BSuffix(metadataTitle) || humanizeRoute(route),
    description: preset.description || metadataDescription || `${stripB2BSuffix(metadataTitle) || humanizeRoute(route)} content managed from the b2b admin.`,
  };

  return mergePageRecord(route, seeded);
}

async function discoverPageFiles(dirPath: string, files: string[] = []): Promise<string[]> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true }).catch(() => [] as Awaited<ReturnType<typeof fs.readdir>>);
  for (const entry of entries) {
    const entryName = typeof entry.name === 'string' ? entry.name : entry.name.toString();
    if (entryName.startsWith('.')) continue;
    const absolutePath = path.join(dirPath, entryName);
    if (entry.isDirectory()) {
      await discoverPageFiles(absolutePath, files);
    } else if (isPageFile(entryName)) {
      files.push(absolutePath);
    }
  }
  return files;
}

function toRoute(filePath: string) {
  const relativeDir = path.relative(B2B_APP_DIR, path.dirname(filePath));
  const segments = relativeDir
    .split(path.sep)
    .filter(Boolean)
    .filter((segment) => !segment.startsWith('(') && !segment.startsWith('@'));
  const route = `/${segments.join('/')}`.replace(/\/+/g, '/');
  return route === '/' ? '/' : route;
}

export async function discoverB2BPages(): Promise<B2BPageRecord[]> {
  const files = await discoverPageFiles(B2B_APP_DIR);
  const routeToFile = new Map(files.map((filePath) => [toRoute(filePath), filePath]));
  const seededRoutes = Array.from(new Set([...routeToFile.keys(), ...Object.keys(ROUTE_PRESETS)]))
    .sort((routeA, routeB) => routeA.localeCompare(routeB));

  return Promise.all(seededRoutes.map(async (route) => buildSeededPageRecord(route, routeToFile.get(route))));
}

async function ensureStoreFile() {
  try {
    const dir = path.dirname(STORE_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.access(STORE_PATH);
  } catch {
    try {
      await fs.writeFile(STORE_PATH, JSON.stringify(DEFAULT_STORE, null, 2), 'utf8');
    } catch {
      // Read-only environment.
    }
  }
}

async function normalizeStore(parsed: Partial<B2BAdminStore>): Promise<B2BAdminStore> {
  const discoveredPages = await discoverB2BPages();
  const pagesByRoute = new Map((parsed.pages ?? []).map((page) => [page.route, page]));
  const discoveredByRoute = new Map(discoveredPages.map((page) => [page.route, page]));

  // Keep previously stored dynamic routes even when discovery is limited
  // (e.g. deployed admin without access to the prag-b2b filesystem).
  for (const [route, stored] of pagesByRoute.entries()) {
    if (!discoveredByRoute.has(route)) {
      discoveredByRoute.set(route, mergePageRecord(route, stored));
    }
  }

  const normalizedPages = Array.from(discoveredByRoute.values())
    .sort((a, b) => a.route.localeCompare(b.route))
    .map((page) => mergeSeededPageRecord(page, pagesByRoute.get(page.route)));

  return {
    enquiries: Array.isArray(parsed.enquiries) ? parsed.enquiries : [],
    distributorApplications: Array.isArray(parsed.distributorApplications) ? parsed.distributorApplications : [],
    installations: Array.isArray(parsed.installations) ? parsed.installations : [],
    caseStudies: normalizeCaseStudiesContent(parsed.caseStudies),
    solutions: normalizeSolutionsContent(parsed.solutions),
    pages: normalizedPages,
    settings: mergeSettings(parsed.settings),
    audit: Array.isArray(parsed.audit) ? parsed.audit : [],
  };
}

async function readFromFile(): Promise<B2BAdminStore> {
  await ensureStoreFile();
  const raw = await fs.readFile(STORE_PATH, 'utf8');
  const parsed = JSON.parse(raw) as Partial<B2BAdminStore>;
  return normalizeStore(parsed);
}

async function writeToFile(data: B2BAdminStore): Promise<void> {
  await ensureStoreFile();
  await fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function toIsoDate(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) return new Date().toISOString();
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();

  const mysqlLike = value.trim().replace(' ', 'T');
  const fallback = new Date(mysqlLike);
  return Number.isNaN(fallback.getTime()) ? new Date().toISOString() : fallback.toISOString();
}

function normalizeWpStatus(value: unknown): B2BSubmissionRecord['status'] {
  const status = String(value ?? '').trim().toLowerCase();
  if (!status || status === 'pending') return 'new';
  if (status === 'under-review') return 'in-review';
  return status as B2BSubmissionRecord['status'];
}

function mapWpEnquiry(item: Record<string, unknown>): B2BSubmissionRecord {
  return {
    id: String(item.id ?? ''),
    kind: 'contact',
    status: normalizeWpStatus(item.status),
    name: String(item.name ?? ''),
    email: String(item.email ?? ''),
    phone: String(item.phone ?? ''),
    company: String(item.company ?? ''),
    subject: String(item.type ?? item.subject ?? ''),
    message: String(item.message ?? ''),
    source: 'public-form',
    route: '/contact',
    createdAt: toIsoDate(item.date ?? item.createdAt ?? item.created_at ?? item.submitted_at),
  };
}

function mapWpDistributor(item: Record<string, unknown>): B2BSubmissionRecord {
  return {
    id: String(item.id ?? ''),
    kind: 'distributor',
    status: normalizeWpStatus(item.status),
    name: String(item.name ?? ''),
    email: String(item.email ?? ''),
    phone: String(item.phone ?? ''),
    company: String(item.company ?? ''),
    message: String(item.message ?? ''),
    source: 'public-form',
    route: '/distributor',
    createdAt: toIsoDate(item.date ?? item.createdAt ?? item.created_at ?? item.submitted_at),
  };
}

async function fetchWpB2BCollection(
  endpoint: string,
  mapper: (item: Record<string, unknown>) => B2BSubmissionRecord,
): Promise<B2BSubmissionRecord[] | null> {
  const headers = await buildWpAuthHeader();
  const results: B2BSubmissionRecord[] = [];
  const perPage = 100;
  let page = 1;
  let totalPages = 1;

  try {
    while (page <= totalPages) {
      const url = `${WP_API_URL}/prag-core/v1/${endpoint}?page=${page}&per_page=${perPage}`;
      const res = await fetch(url, { headers, cache: 'no-store' });
      if (!res.ok) return null;

      const payload = await res.json();
      if (!Array.isArray(payload)) break;

      for (const item of payload) {
        if (!item || typeof item !== 'object') continue;
        results.push(mapper(item as Record<string, unknown>));
      }

      const headerPages = Number(res.headers.get('X-WP-TotalPages') ?? '1');
      totalPages = Number.isFinite(headerPages) && headerPages > 0 ? headerPages : totalPages;
      page += 1;
    }

    return results;
  } catch {
    return null;
  }
}

async function readFromWordPress(): Promise<B2BAdminStore> {
  const res = await fetch(`${WP_API_URL}/prag-core/v1/admin-config`, {
    headers: { 'Content-Type': 'application/json', ...(await buildWpAuthHeader()) },
    cache: 'no-store',
  });

  if (res.status === 204 || res.status === 404) {
    return normalizeStore(DEFAULT_STORE);
  }
  if (!res.ok) {
    throw new Error(`WP admin-config GET failed: ${res.status}`);
  }

  const parsed = (await res.json()) as Record<string, unknown>;
  const nested = parsed?.b2bAdminStore;
  const source = nested && typeof nested === 'object'
    ? nested as Partial<B2BAdminStore>
    : {};

  const [liveEnquiries, liveDistributors] = await Promise.all([
    fetchWpB2BCollection('b2b/enquiries', mapWpEnquiry),
    fetchWpB2BCollection('b2b/distributors', mapWpDistributor),
  ]);

  const mergedSource: Partial<B2BAdminStore> = {
    ...source,
    enquiries: liveEnquiries ?? source.enquiries,
    distributorApplications: liveDistributors ?? source.distributorApplications,
  };

  return normalizeStore(mergedSource);
}

async function writeToWordPress(data: B2BAdminStore): Promise<void> {
  const readRes = await fetch(`${WP_API_URL}/prag-core/v1/admin-config`, {
    headers: { 'Content-Type': 'application/json', ...(await buildWpAuthHeader()) },
    cache: 'no-store',
  });

  let currentConfig: Record<string, unknown> = {};
  if (readRes.ok && readRes.status !== 204) {
    currentConfig = (await readRes.json()) as Record<string, unknown>;
  }

  const payload = {
    ...currentConfig,
    b2bAdminStore: data,
  };

  const writeRes = await fetch(`${WP_API_URL}/prag-core/v1/admin-config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await buildWpAuthHeader()) },
    body: JSON.stringify(payload),
  });

  if (!writeRes.ok) {
    throw new Error(`WP admin-config POST failed: ${writeRes.status}`);
  }
}

export async function readB2BAdminStore(): Promise<B2BAdminStore> {
  try {
    if (process.env.VERCEL) {
      return await readFromWordPress();
    }
    return await readFromFile();
  } catch (error) {
    if (process.env.VERCEL) {
      throw error;
    }
    return normalizeStore(DEFAULT_STORE);
  }
}

export async function writeB2BAdminStore(next: B2BAdminStore): Promise<void> {
  if (process.env.VERCEL) {
    await writeToWordPress(next);
  } else {
    await writeToFile(next);
  }
}

export async function updateB2BAdminStore(updater: (current: B2BAdminStore) => B2BAdminStore): Promise<B2BAdminStore> {
  const current = await readB2BAdminStore();
  const updated = updater(current);
  await writeB2BAdminStore(updated);
  return updated;
}

export async function appendB2BAuditLog(record: Omit<B2BAuditRecord, 'id' | 'at'>) {
  await updateB2BAdminStore((current) => {
    const entryId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    const entry: B2BAuditRecord = {
      id: entryId,
      at: new Date().toISOString(),
      ...record,
    };

    return {
      ...current,
      audit: [entry, ...current.audit].slice(0, 500),
    };
  });
}

export async function runB2BAdminHealthCheck(): Promise<B2BAdminHealthCheck> {
  const storageMode: 'wordpress' | 'file' = process.env.VERCEL ? 'wordpress' : 'file';
  const env = {
    hasWpApiUrl: Boolean(WP_API_URL),
    hasWpAppUser: Boolean(WP_APP_USER),
    hasWpAppPassword: Boolean(WP_APP_PASSWORD),
  };

  const authHeader = await buildWpAuthHeader();
  const authHeaderPresent = typeof authHeader.Authorization === 'string' && authHeader.Authorization.length > 0;

  const wordpress = {
    authHeaderPresent,
    read: {
      ok: false,
      skipped: storageMode !== 'wordpress',
    } as { ok: boolean; status?: number; error?: string; skipped?: boolean },
    write: {
      ok: false,
      skipped: storageMode !== 'wordpress',
    } as { ok: boolean; status?: number; error?: string; skipped?: boolean },
  };

  if (storageMode === 'wordpress') {
    let currentConfig: Record<string, unknown> | null = null;
    try {
      const readRes = await fetch(`${WP_API_URL}/prag-core/v1/admin-config`, {
        headers: { 'Content-Type': 'application/json', ...authHeader },
        cache: 'no-store',
      });

      wordpress.read.status = readRes.status;
      wordpress.read.ok = readRes.ok;

      if (readRes.ok) {
        if (readRes.status === 204) {
          currentConfig = {};
        } else {
          const parsed = (await readRes.json()) as unknown;
          currentConfig = (parsed && typeof parsed === 'object') ? parsed as Record<string, unknown> : {};
        }
      }
    } catch (error) {
      wordpress.read.ok = false;
      wordpress.read.error = error instanceof Error ? error.message : 'Unknown read error';
    }

    if (!wordpress.read.ok || currentConfig === null) {
      wordpress.write.skipped = true;
      wordpress.write.ok = false;
      wordpress.write.error = wordpress.read.error ?? `Skipped because read failed${wordpress.read.status ? ` (${wordpress.read.status})` : ''}`;
    } else {
      try {
        const writeRes = await fetch(`${WP_API_URL}/prag-core/v1/admin-config`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeader },
          body: JSON.stringify(currentConfig),
        });

        wordpress.write.status = writeRes.status;
        wordpress.write.ok = writeRes.ok;
      } catch (error) {
        wordpress.write.ok = false;
        wordpress.write.error = error instanceof Error ? error.message : 'Unknown write error';
      }
    }
  }

  const discoveredPages = await discoverB2BPages();
  const store = await readB2BAdminStore();
  const storedCount = store.pages.length;

  return {
    checkedAt: new Date().toISOString(),
    storageMode,
    env,
    wordpress,
    pages: {
      discovered: discoveredPages.length,
      stored: storedCount,
      effective: storedCount > 0 ? storedCount : discoveredPages.length,
    },
  };
}

export function getB2BOverview(store: B2BAdminStore) {
  return {
    enquiries: store.enquiries.length,
    distributorApplications: store.distributorApplications.length,
    installations: store.installations.length,
    caseStudies: store.caseStudies.studies.filter((study) => study.active).length,
    solutions: store.solutions.categories.reduce((count, category) => count + category.problems.filter((problem) => problem.active).length, 0),
    pages: store.pages.length,
    livePages: store.pages.filter((page) => page.published).length,
    pendingResponses: store.enquiries.filter((record) => record.status === 'new').length,
  };
}
