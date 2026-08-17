'use client';

import Image from 'next/image';
import { useState, useRef } from 'react';
import type { SiteSettings, SlideItem, CategoryItem, CheckoutFaqItem, PowerCalculatorItem, TestimonialItem, HomeNeedItem, TrustStatItem, TrustBadgeItem, FooterColumn, FooterLink, HeaderLink } from '@/lib/types';
import { Save, CheckCircle2, AlertCircle, Plus, Trash2, GripVertical, Library, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import MediaPicker from '@/components/MediaPicker';
import { revalidateSettings } from '@/lib/revalidateFrontend';

const inputCls = 'w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all';
const labelCls = 'text-sm font-semibold text-gray-700';
const sectionCls = 'space-y-4 pt-4 border-t border-gray-100 first:border-0 first:pt-0';

const TABS = ['Contact', 'Socials', 'Hero Slides', 'Brand Banner', 'Trust Signal', 'Home Needs', 'Testimonials', 'Checkout FAQ', 'Power Calculator', 'Final CTA', 'Homepage Sections', 'Categories', 'Header', 'Footer', 'Payments', 'Shipping'];

const DEFAULT_SLIDE: SlideItem = { title: '', description: '', cta: '', link: '/products', productImage: '', productAlt: '', backgroundImage: '', showProductImage: true, enabled: true };
const DEFAULT_CATEGORY: CategoryItem = { name: '', slug: '', image: '' };
const DEFAULT_FAQ_ITEM: CheckoutFaqItem = { question: '', answer: '' };
const DEFAULT_POWER_CALC_ITEM: PowerCalculatorItem = { question: '', answer: '' };
const DEFAULT_TESTIMONIAL: TestimonialItem = { rating: 5, quote: '', name: '', location: '', product: '', image: '' };
const DEFAULT_HOME_NEED: HomeNeedItem = { title: '', description: '', cta: 'Get Recommendations', link: '/products', icon: 'home', image: '' };
const DEFAULT_TRUST_STAT: TrustStatItem = { value: '', label: '' };
const DEFAULT_TRUST_BADGE: TrustBadgeItem = { label: '' };

const HARDCODED_DEFAULTS: SiteSettings = {
  contact_phone: '+2348032170129',
  contact_email: 'sales@prag.global',
  whatsapp: '+2348032170129',
  address: '14 Industrial Layout, Victoria Island, Lagos, Nigeria',
  business_hours_weekday: 'Mon–Fri: 8:00 AM – 6:00 PM',
  business_hours_saturday: 'Sat: 9:00 AM – 2:00 PM',
  announcement_bar: '',
  site_under_construction: false,
  under_construction_title: 'We are coming back soon',
  under_construction_message: 'We are currently making improvements to serve you better. Please check back shortly.',
  footer_description: "Nigeria's leading power engineering company. We design, supply and install power solutions for homes, businesses and industrial facilities across the country.",
  footer_columns: [
    { title: 'Products', links: [
      { label: 'Batteries', link: '/products/batteries' },
      { label: 'Stabilizers', link: '/products/voltage-stabilizers' },
      { label: 'Inverter', link: '/products/inverters' },
      { label: 'Solar', link: '/products/solar' },
    ]},
    { title: 'Company', links: [
      { label: 'About us', link: '/about' },
      { label: 'PRAG Stores', link: '/stores' },
      { label: 'Knowledge Center', link: '/knowledge-center' },
      { label: 'Become a Distributor', link: '/distributor' },
    ]},
    { title: 'Support', links: [
      { label: 'Contact Us', link: '/contact' },
      { label: 'FAQ', link: '/faq' },
      { label: 'Power Calculator', link: '/power-calculator' },
      { label: 'Compare Products', link: '/compare' },
      { label: 'Technical Resources', link: '/resources' },
      { label: 'Shipping Policy', link: '/shipping-policy' },
      { label: 'Return policy', link: '/return-policy' },
    ]},
    { title: 'Socials', links: [
      { label: 'Facebook', link: 'https://www.facebook.com/pragpowersolutions' },
      { label: 'Instagram', link: 'https://www.instagram.com/prag_ng/' },
      { label: 'LinkedIn', link: 'https://www.linkedin.com/company/prag/' },
      { label: 'Twitter / X', link: 'https://x.com/PRAG_Ng' },
    ]},
  ],
  header_menu: [
    { label: 'Stabilizer', link: '/products/voltage-stabilizers' },
    { label: 'Inverter', link: '/products/inverters' },
    { label: 'Solar', link: '/products/solar' },
    { label: 'Batteries', link: '/products/batteries' },
  ],
  brand_banner_kicker: 'HELP ME CHOOSE',
  brand_banner_title: 'Not Sure What to Buy?',
  brand_banner_description: 'Tell us what you want to power and we\'ll help you find the right PRAG setup.',
  brand_banner_cta: 'Use Power Calculator',
  brand_banner_link: '/power-calculator',
  brand_banner_whatsapp_text: 'Ask PRAG on WhatsApp',
  brand_banner_image: '',
  brand_banner_enabled: true,
  brand_banner_mode: 'text',
  brand_banners: [],
  slideout_chat_enabled: true,
  slideout_chat_title: 'Not sure what to pick?',
  slideout_chat_subtitle: 'Chat with us',
  slideout_chat_message: 'Hi PRAG team, I was browsing your product pages and need help choosing the right product. Can you assist?',
  checkout_faq_enabled: true,
  shop_by_need_enabled: true,
  flash_sales_enabled: true,
  best_sellers_enabled: true,
  featured_section_enabled: true,
  product_assurance_enabled: true,
  product_stats_enabled: true,
  product_showrooms_enabled: true,
  final_cta_title: 'Ready for More Reliable Power?',
  final_cta_subtitle: 'Shop PRAG power solutions for your home today.',
  final_cta_shop_text: 'Shop Now',
  final_cta_shop_link: '/products',
  final_cta_whatsapp_text: 'Chat with PRAG on WhatsApp',
  checkout_faq_kicker: 'FAQ',
  checkout_faq_title: 'Still deciding? Here\'s what you need to know before you buy.',
  checkout_faq_subtitle: 'Straight answers on sizing, warranty, delivery and installation — so you can shop with confidence and never second-guess your power setup.',
  checkout_faq_link_text: 'Find your perfect inverter size',
  checkout_faq_link_url: '/power-calculator',
  checkout_faq_items: [
    { question: 'Which inverter size should I buy?', answer: 'The right inverter size depends on the total wattage of the appliances you want to power and how long you need them running. Add up the wattage of your essential loads (fridge, lights, TV, fans) and add a 20–30% buffer for surge power. Use our Power Calculator for an instant recommendation, or chat with our team for a tailored sizing.' },
    { question: 'How do I know what battery I need?', answer: 'Battery sizing depends on your inverter size, how long you want backup power, and your daily energy usage. A 12V system works for small setups, while 48V is better for larger loads. Lithium batteries last longer and charge faster than lead-acid. Use our Power Calculator or talk to our team to match the right battery capacity (Ah) to your inverter and runtime needs.' },
    { question: 'How long will my battery last?', answer: 'Battery runtime depends on capacity (kWh), the load you are running, and battery chemistry. A 2.4kWh lithium battery powering a 300W load gives roughly 6–7 hours of backup. Lithium batteries typically last 5–10 years with proper use, while lead-acid batteries last 2–4 years. Our team can help you estimate runtime for your specific setup.' },
    { question: 'Do PRAG products come with warranty?', answer: 'Yes. All PRAG products come with a manufacturer\'s warranty — typically 5 years for inverters and stabilizers, and up to 10 years for lithium batteries. Warranty covers manufacturing defects and component failures under normal use. Your warranty is activated automatically at purchase.' },
    { question: 'Do you deliver nationwide?', answer: 'Yes, we deliver to all 36 states in Nigeria. Orders within Lagos arrive within 1–2 business days, while other states typically take 2–5 business days. Shipping is free on orders over ₦500,000. You will receive tracking details once your order is dispatched.' },
    { question: 'Can I get help choosing the right product?', answer: 'Absolutely. You can use our Power Calculator for an instant recommendation, chat with us on WhatsApp, call our support line, or visit any PRAG store. Our team will guide you to the right inverter, battery, or solar setup based on your budget and power needs.' },
    { question: 'Can PRAG help with installation?', answer: 'Yes. PRAG offers professional installation through our certified engineers and authorized partner network across Nigeria. We handle everything from residential inverter setups to full solar installations. Schedule an installation by contacting us or visiting a PRAG store after your purchase.' },
  ],
  checkout_faq_banner_enabled: true,
  checkout_faq_banner_image: 'https://central.prag.global/wp-content/uploads/2026/04/eebd514c0d3e75e4f32cb8fd691c7b3613fd99d5.png',
  checkout_faq_banner_link: '/products/inverters',
  testimonial_enabled: true,
  testimonial_title: 'Trusted in Homes Across Nigeria',
  testimonial_subtitle: 'Real reviews from real PRAG customers who took control of their power.',
  testimonial_items: [
    { rating: 5, quote: 'I bought a 3.5kVA inverter and two lithium batteries for my flat. From the day it was installed, I have not had a single dark night. The team came, sized everything properly, and installed it clean. Worth every naira.', name: 'Chidi', location: 'Lekki, Lagos', product: '3.5kVA Inverter + Lithium Battery', image: '' },
    { rating: 5, quote: 'The stabilizer saved my fridge and TV during the voltage spikes in our area. It has been running silently for eight months now — no issues at all. PRAG makes solid products.', name: 'Aisha', location: 'Kano', product: '5kVA Voltage Stabilizer', image: '' },
    { rating: 5, quote: 'I was tired of spending on fuel. PRAG set up a solar system for my home and I barely touch my generator now. Installation was professional and the support team answered every question.', name: 'Emeka', location: 'Port Harcourt', product: 'Solar System Installation', image: '' },
  ],
  home_need_enabled: true,
  home_need_title: 'Power Your Home Your Way',
  home_need_subtitle: 'Whatever your setup, PRAG has a reliable power solution sized for how you actually live.',
  home_need_items: [
    { title: 'For Apartments', description: 'Compact inverter and battery combos that fit tight spaces and keep your essentials running through every outage.', cta: 'Get Recommendations', link: '/home-needs/apartments', icon: '', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80' },
    { title: 'For Family Homes', description: 'Higher-capacity inverters with extended-life lithium batteries for longer runtime across more rooms and appliances.', cta: 'Get Recommendations', link: '/home-needs/family-homes', icon: '', image: 'https://images.unsplash.com/photo-1568605114967-8130f81a6e54?w=800&q=80' },
    { title: 'For Home Offices', description: 'Quiet, clean power that keeps your laptop, internet router, and essential devices online without missing a beat.', cta: 'Get Recommendations', link: '/home-needs/home-offices', icon: '', image: 'https://images.unsplash.com/photo-1593696954577-ab3d39817b21?w=800&q=80' },
    { title: 'For Solar Homes', description: 'Solar panels and hybrid inverters that cut your grid and generator dependence — and your fuel bill.', cta: 'Get Recommendations', link: '/home-needs/solar-homes', icon: '', image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80' },
  ],
  trust_signal_enabled: true,
  trust_signal_kicker: 'Why People Buy PRAG',
  trust_signal_title: 'Buy With Confidence',
  trust_signal_stats: [
    { value: '36', label: 'States Covered' },
    { value: '15+', label: 'Years Power Expertise' },
    { value: '50K+', label: 'Installations' },
  ],
  trust_signal_badges: [
    { label: 'Product Warranty' },
    { label: 'Nationwide Delivery' },
    { label: 'Expert Support' },
    { label: 'Secure Checkout' },
  ],
  power_calculator_enabled: true,
  power_calculator_kicker: 'POWER CALCULATOR',
  power_calculator_title: 'Not sure what size you need? Let\u2019s work it out.',
  power_calculator_subtitle: 'Answer a few quick questions about what you want to power and we\u2019ll recommend the right inverter, battery, and solar setup in seconds \u2014 no guesswork.',
  power_calculator_link_text: 'Open the Power Calculator',
  power_calculator_link_url: '/power-calculator',
  power_calculator_items: [
    { question: 'How does the Power Calculator work?', answer: 'Tell us which appliances you want to run and for how long. The calculator adds up your total wattage, factors in surge power and backup runtime, then recommends a PRAG inverter and battery combination sized to your actual load \u2014 no guesswork.' },
    { question: 'What do I need to know before I start?', answer: 'Have a rough list of the appliances you want to power (fridge, lights, TV, fans) and an idea of how many hours of backup you need. You don\u2019t need exact wattage \u2014 our calculator uses typical values and lets you adjust.' },
    { question: 'Will it recommend the right battery too?', answer: 'Yes. Based on your inverter size and desired runtime, the calculator suggests a battery capacity (Ah) and chemistry \u2014 lithium or lead-acid \u2014 so your backup lasts as long as you need it to.' },
    { question: 'Can it size a solar setup?', answer: 'Yes. If you want to reduce your grid or generator use, the calculator can recommend solar panels and a hybrid inverter sized to your daily energy usage and location.' },
    { question: 'What if I\u2019m not sure about my load?', answer: 'No problem. Start with your essentials \u2014 lights, fans, TV, and a fridge \u2014 and add from there. You can also chat with our team on WhatsApp and a PRAG engineer will help you build your load list.' },
    { question: 'Is the recommendation a quote?', answer: 'It\u2019s a sizing guide. Once you have your recommendation, you can shop the suggested products directly, request a formal quote, or schedule a free consultation with our team.' },
  ],
  hero_background: 'https://central.prag.global/wp-content/uploads/2026/04/421db5e8efbc14b105a33a6db7182652503c3fdd.png',
  slide_transition: 'fade',
  socials: {
    facebook: 'https://www.facebook.com/pragpowersolutions',
    instagram: 'https://www.instagram.com/prag_ng/',
    linkedin: 'https://www.linkedin.com/company/prag/',
    twitter: '',
    whatsapp: 'https://wa.me/2348032170129',
  },
  slides: [
    { title: 'No Hype. Just Inverters That Deliver.', description: 'Choose inverters engineered for real-world loads. Shop reliable power systems today.', cta: 'Buy Inverters Built to Last', link: '/products', productImage: 'https://central.prag.global/wp-content/uploads/2026/04/eebd514c0d3e75e4f32cb8fd691c7b3613fd99d5.png', productAlt: 'Heavy Duty Inverter', backgroundImage: 'https://central.prag.global/wp-content/uploads/2026/04/421db5e8efbc14b105a33a6db7182652503c3fdd.png', showProductImage: true, enabled: true },
    { title: 'Power Your Home. Power Your Business.', description: 'From residential to industrial applications. Trusted inverters for every power need.', cta: 'Explore Our Range', link: '/products', productImage: 'https://central.prag.global/wp-content/uploads/2026/04/7ee70985fdddba92a39a6e67f80ec4773cbf34fd.png', productAlt: 'Residential Inverter', backgroundImage: 'https://central.prag.global/wp-content/uploads/2026/04/421db5e8efbc14b105a33a6db7182652503c3fdd.png', showProductImage: true, enabled: true },
    { title: 'Built Tough. Tested Tougher.', description: 'Heavy-duty inverters designed to handle the toughest loads without compromise.', cta: 'Shop Heavy Duty Inverters', link: '/inverter', productImage: 'https://central.prag.global/wp-content/uploads/2026/04/b5564cf299de3eea9dbe804a547cf74e99bc41a7.png', productAlt: 'Industrial Inverter', backgroundImage: 'https://central.prag.global/wp-content/uploads/2026/04/421db5e8efbc14b105a33a6db7182652503c3fdd.png', showProductImage: true, enabled: true },
    { title: 'Reliable Power. Unbeatable Performance.', description: 'Experience consistent power delivery with inverters engineered for excellence.', cta: 'Get Started Today', link: '/products', productImage: 'https://central.prag.global/wp-content/uploads/2026/04/dd4b835690b546ee636b7659added08cd02d9891.png', productAlt: 'Premium Inverter', backgroundImage: 'https://central.prag.global/wp-content/uploads/2026/04/421db5e8efbc14b105a33a6db7182652503c3fdd.png', showProductImage: true, enabled: true },
  ],
  categories: [
    { name: 'Voltage Stabilizers', slug: 'voltage-stabilizers', image: 'https://central.prag.global/wp-content/uploads/2026/04/7ee70985fdddba92a39a6e67f80ec4773cbf34fd.png' },
    { name: 'Inverters',           slug: 'inverters',            image: 'https://central.prag.global/wp-content/uploads/2026/04/eebd514c0d3e75e4f32cb8fd691c7b3613fd99d5-1.png' },
    { name: 'Batteries',           slug: 'batteries',            image: 'https://central.prag.global/wp-content/uploads/2026/04/dd4b835690b546ee636b7659added08cd02d9891.png' },
    { name: 'Solar Panels',        slug: 'solar',                image: 'https://central.prag.global/wp-content/uploads/2026/04/b5564cf299de3eea9dbe804a547cf74e99bc41a7.png' },
  ],
  paystack_public_key: '',
  shipping_local_pickup_description: 'Pick up your order from any of our PRAG showrooms in Lagos or Abuja. Choose the branch most convenient for you at checkout.',
  shipping_custom_delivery_description: 'Need a tailored shipping arrangement? Chat with our support team to arrange delivery that fits your location and schedule. Shipping costs are calculated based on your destination — no flat-rate or free shipping applies.',
  hidden_categories: [],
  category_order: ['voltage-stabilizers', 'inverters', 'batteries', 'solar'],
  subcategory_order: {},
};

function mergeWithDefaults(saved: SiteSettings | null): SiteSettings {
  if (!saved) return HARDCODED_DEFAULTS;
  return {
    ...HARDCODED_DEFAULTS,
    ...saved,
    socials: { ...HARDCODED_DEFAULTS.socials, ...(saved.socials ?? {}) },
    // Only use defaults for fields that are truly missing (undefined/null)
    // Respect saved values even if they're empty arrays/strings
    slides: Array.isArray(saved.slides) ? saved.slides : HARDCODED_DEFAULTS.slides,
    categories: Array.isArray(saved.categories) ? saved.categories : HARDCODED_DEFAULTS.categories,
    checkout_faq_items: Array.isArray(saved.checkout_faq_items) ? saved.checkout_faq_items : HARDCODED_DEFAULTS.checkout_faq_items,
    power_calculator_items: Array.isArray(saved.power_calculator_items) ? saved.power_calculator_items : HARDCODED_DEFAULTS.power_calculator_items,
    testimonial_items: Array.isArray(saved.testimonial_items) ? saved.testimonial_items : HARDCODED_DEFAULTS.testimonial_items,
    home_need_items: Array.isArray(saved.home_need_items) ? saved.home_need_items : HARDCODED_DEFAULTS.home_need_items,
    trust_signal_stats: Array.isArray(saved.trust_signal_stats) ? saved.trust_signal_stats : HARDCODED_DEFAULTS.trust_signal_stats,
    trust_signal_badges: Array.isArray(saved.trust_signal_badges) ? saved.trust_signal_badges : HARDCODED_DEFAULTS.trust_signal_badges,
    footer_columns: Array.isArray(saved.footer_columns) ? saved.footer_columns : HARDCODED_DEFAULTS.footer_columns,
    header_menu: Array.isArray(saved.header_menu) ? saved.header_menu : HARDCODED_DEFAULTS.header_menu,
    paystack_public_key: saved.paystack_public_key ?? '',
    shipping_local_pickup_description: saved.shipping_local_pickup_description ?? HARDCODED_DEFAULTS.shipping_local_pickup_description,
    shipping_custom_delivery_description: saved.shipping_custom_delivery_description ?? HARDCODED_DEFAULTS.shipping_custom_delivery_description,
    hidden_categories: Array.isArray(saved.hidden_categories) ? saved.hidden_categories : [],
    category_order: Array.isArray(saved.category_order) ? saved.category_order : HARDCODED_DEFAULTS.category_order,
    subcategory_order: saved.subcategory_order && typeof saved.subcategory_order === 'object' ? saved.subcategory_order : {},
  };
}

export default function SettingsForm({ initialSettings }: { initialSettings: SiteSettings | null }) {
  const [form, setForm] = useState<SiteSettings>(() => mergeWithDefaults(initialSettings));
  const [activeTab, setActiveTab] = useState('Contact');
  const [status, setStatus] = useState<'idle' | 'saving' | 'revalidating' | 'success' | 'error'>('idle');
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [dragColIdx, setDragColIdx] = useState<number | null>(null);
  const [dragOverColIdx, setDragOverColIdx] = useState<number | null>(null);
  const [dragHeaderIdx, setDragHeaderIdx] = useState<number | null>(null);
  const [dragOverHeaderIdx, setDragOverHeaderIdx] = useState<number | null>(null);
  const [dragCatIdx, setDragCatIdx] = useState<number | null>(null);
  const [dragOverCatIdx, setDragOverCatIdx] = useState<number | null>(null);
  const mediaPickerCallback = useRef<((url: string) => void) | null>(null);

  function openMediaPicker(callback: (url: string) => void) {
    mediaPickerCallback.current = callback;
    setMediaPickerOpen(true);
  }

  function setField(field: keyof SiteSettings, value: unknown) {
    setForm(p => ({ ...p, [field]: value }));
  }

  function setSocial(key: keyof SiteSettings['socials'], value: string) {
    setForm(p => ({ ...p, socials: { ...p.socials, [key]: value } }));
  }

  function setSlide(index: number, key: keyof SlideItem, value: string | boolean) {
    const slides = [...form.slides];
    slides[index] = { ...slides[index], [key]: value };
    setField('slides', slides);
  }

  function addSlide() { setField('slides', [...form.slides, { ...DEFAULT_SLIDE }]); }
  function removeSlide(i: number) { setField('slides', form.slides.filter((_, idx) => idx !== i)); }
  function moveSlide(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= form.slides.length) return;
    const slides = [...form.slides];
    [slides[i], slides[j]] = [slides[j], slides[i]];
    setField('slides', slides);
  }

  function setBanner(index: number, key: 'image' | 'link' | 'enabled', value: string | boolean) {
    const banners = [...(form.brand_banners || [])];
    banners[index] = { ...banners[index], [key]: value };
    setField('brand_banners', banners);
  }
  function addBanner() { setField('brand_banners', [...(form.brand_banners || []), { image: '', link: '', enabled: true }]); }
  function removeBanner(i: number) { setField('brand_banners', (form.brand_banners || []).filter((_, idx) => idx !== i)); }

  function setCategory(index: number, key: keyof CategoryItem, value: string) {
    const cats = [...form.categories];
    cats[index] = { ...cats[index], [key]: value };
    setField('categories', cats);
  }

  function addCategory() { setField('categories', [...form.categories, { ...DEFAULT_CATEGORY }]); }
  function removeCategory(i: number) { setField('categories', form.categories.filter((_, idx) => idx !== i)); }
  function moveCategory(from: number, to: number) {
    if (from === to || from < 0 || to < 0 || from >= form.categories.length || to >= form.categories.length) return;
    const cats = [...form.categories];
    const [moved] = cats.splice(from, 1);
    cats.splice(to, 0, moved);
    // Keep category_order in sync with the visible category order so the
    // homepage grid and product tabs respect the drag order after save.
    const newOrder = cats.map((c) => c.slug).filter(Boolean);
    setForm((p) => ({ ...p, categories: cats, category_order: newOrder }));
  }

  function setFaqItem(index: number, key: keyof CheckoutFaqItem, value: string) {
    const items = [...form.checkout_faq_items];
    items[index] = { ...items[index], [key]: value };
    setField('checkout_faq_items', items);
  }
  function addFaqItem() { setField('checkout_faq_items', [...form.checkout_faq_items, { ...DEFAULT_FAQ_ITEM }]); }
  function removeFaqItem(i: number) { setField('checkout_faq_items', form.checkout_faq_items.filter((_, idx) => idx !== i)); }

  function setPowerCalcItem(index: number, key: keyof PowerCalculatorItem, value: string) {
    const items = [...form.power_calculator_items];
    items[index] = { ...items[index], [key]: value };
    setField('power_calculator_items', items);
  }
  function addPowerCalcItem() { setField('power_calculator_items', [...form.power_calculator_items, { ...DEFAULT_POWER_CALC_ITEM }]); }
  function removePowerCalcItem(i: number) { setField('power_calculator_items', form.power_calculator_items.filter((_, idx) => idx !== i)); }

  function setTestimonial(index: number, key: keyof TestimonialItem, value: string | number) {
    const items = [...form.testimonial_items];
    items[index] = { ...items[index], [key]: value };
    setField('testimonial_items', items);
  }
  function addTestimonial() { setField('testimonial_items', [...form.testimonial_items, { ...DEFAULT_TESTIMONIAL }]); }
  function removeTestimonial(i: number) { setField('testimonial_items', form.testimonial_items.filter((_, idx) => idx !== i)); }

  function setHomeNeed(index: number, key: keyof HomeNeedItem, value: string) {
    const items = [...form.home_need_items];
    items[index] = { ...items[index], [key]: value };
    setField('home_need_items', items);
  }
  function addHomeNeed() { setField('home_need_items', [...form.home_need_items, { ...DEFAULT_HOME_NEED }]); }
  function removeHomeNeed(i: number) { setField('home_need_items', form.home_need_items.filter((_, idx) => idx !== i)); }

  function setTrustStat(index: number, key: keyof TrustStatItem, value: string) {
    const items = [...form.trust_signal_stats];
    items[index] = { ...items[index], [key]: value };
    setField('trust_signal_stats', items);
  }
  function addTrustStat() { setField('trust_signal_stats', [...form.trust_signal_stats, { ...DEFAULT_TRUST_STAT }]); }
  function removeTrustStat(i: number) { setField('trust_signal_stats', form.trust_signal_stats.filter((_, idx) => idx !== i)); }

  function setTrustBadge(index: number, value: string) {
    const items = [...form.trust_signal_badges];
    items[index] = { ...items[index], label: value };
    setField('trust_signal_badges', items);
  }
  function addTrustBadge() { setField('trust_signal_badges', [...form.trust_signal_badges, { ...DEFAULT_TRUST_BADGE }]); }
  function removeTrustBadge(i: number) { setField('trust_signal_badges', form.trust_signal_badges.filter((_, idx) => idx !== i)); }

  // Footer columns
  function setFooterColumnTitle(index: number, title: string) {
    const cols = [...form.footer_columns];
    cols[index] = { ...cols[index], title };
    setField('footer_columns', cols);
  }
  function setFooterLink(colIndex: number, linkIndex: number, key: keyof FooterLink, value: string) {
    const cols = [...form.footer_columns];
    const links = [...cols[colIndex].links];
    links[linkIndex] = { ...links[linkIndex], [key]: value };
    cols[colIndex] = { ...cols[colIndex], links };
    setField('footer_columns', cols);
  }
  function addFooterLink(colIndex: number) {
    const cols = [...form.footer_columns];
    cols[colIndex] = { ...cols[colIndex], links: [...cols[colIndex].links, { label: '', link: '' }] };
    setField('footer_columns', cols);
  }
  function removeFooterLink(colIndex: number, linkIndex: number) {
    const cols = [...form.footer_columns];
    cols[colIndex] = { ...cols[colIndex], links: cols[colIndex].links.filter((_, idx) => idx !== linkIndex) };
    setField('footer_columns', cols);
  }
  function addFooterColumn() {
    setField('footer_columns', [...form.footer_columns, { title: 'New Column', links: [] }]);
  }
  function removeFooterColumn(colIndex: number) {
    setField('footer_columns', form.footer_columns.filter((_, idx) => idx !== colIndex));
  }
  function moveFooterColumn(from: number, to: number) {
    if (from === to || from < 0 || to < 0 || from >= form.footer_columns.length || to >= form.footer_columns.length) return;
    const cols = [...form.footer_columns];
    const [moved] = cols.splice(from, 1);
    cols.splice(to, 0, moved);
    setField('footer_columns', cols);
  }

  // Header menu
  function setHeaderLink(index: number, key: keyof HeaderLink, value: string) {
    const items = [...form.header_menu];
    items[index] = { ...items[index], [key]: value };
    setField('header_menu', items);
  }
  function addHeaderLink() {
    setField('header_menu', [...form.header_menu, { label: '', link: '' }]);
  }
  function removeHeaderLink(i: number) {
    setField('header_menu', form.header_menu.filter((_, idx) => idx !== i));
  }
  function moveHeaderLink(from: number, to: number) {
    if (from === to || from < 0 || to < 0 || from >= form.header_menu.length || to >= form.header_menu.length) return;
    const items = [...form.header_menu];
    const [moved] = items.splice(from, 1);
    items.splice(to, 0, moved);
    setField('header_menu', items);
  }

  async function uploadMedia(file: File, fieldKey: string) {
    setUploadingField(fieldKey);
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/media/upload', {
      method: 'POST',
      body: formData,
    });

    setUploadingField(null);
    if (!res.ok) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
      return null;
    }

    const media = await res.json() as { source_url?: string };
    return media.source_url ?? null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('saving');
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    setStatus('revalidating');
    try {
      await revalidateSettings();
    } catch {
      // revalidation failure doesn't mean save failed
    }
    setStatus('success');
    setTimeout(() => setStatus('idle'), 3000);
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-6">
      {status === 'revalidating' && (
        <div className="flex items-center gap-2 p-3 bg-sky-50 border border-sky-100 rounded-xl text-sky-700 text-sm">
          <Loader2 size={16} className="animate-spin" /> Revalidating frontend...
        </div>
      )}
      {status === 'success' && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm">
          <CheckCircle2 size={16} /> Settings saved & frontend updated!
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
          <AlertCircle size={16} /> Failed to save. Check your connection.
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
              activeTab === tab ? 'border-sky-700 text-sky-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* ── Contact ── */}
      {activeTab === 'Contact' && (
        <div className="space-y-5">
          <div className={sectionCls}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Contact Info</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={labelCls}>Phone Number</label>
                <input value={form.contact_phone} onChange={e => setField('contact_phone', e.target.value)} className={inputCls} placeholder="+2348032170129" />
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Email Address</label>
                <input type="email" value={form.contact_email} onChange={e => setField('contact_email', e.target.value)} className={inputCls} placeholder="sales@prag.global" />
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>WhatsApp Number</label>
                <input value={form.whatsapp} onChange={e => setField('whatsapp', e.target.value)} className={inputCls} placeholder="+2348032170129" />
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Business Address</label>
                <input value={form.address} onChange={e => setField('address', e.target.value)} className={inputCls} placeholder="14 Industrial Layout, VI, Lagos" />
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Weekday Hours</label>
                <input value={form.business_hours_weekday} onChange={e => setField('business_hours_weekday', e.target.value)} className={inputCls} placeholder="Mon–Fri: 8:00 AM – 6:00 PM" />
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Saturday Hours</label>
                <input value={form.business_hours_saturday} onChange={e => setField('business_hours_saturday', e.target.value)} className={inputCls} placeholder="Sat: 9:00 AM – 2:00 PM" />
              </div>
            </div>
          </div>
          <div className={sectionCls}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Announcement Bar</p>
            <div className="space-y-1.5">
              <label className={labelCls}>Announcement Text</label>
              <input value={form.announcement_bar} onChange={e => setField('announcement_bar', e.target.value)} className={inputCls} placeholder="Free shipping on orders over ₦500,000!" />
              <p className="text-xs text-gray-400">Leave empty to hide the announcement bar.</p>
            </div>
          </div>
        </div>
      )}


      {/* ── Socials ── */}
      {activeTab === 'Socials' && (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Social Media Links</p>
          {(['facebook', 'instagram', 'linkedin', 'twitter', 'whatsapp'] as const).map(key => (
            <div key={key} className="space-y-1.5">
              <label className={labelCls}>{key.charAt(0).toUpperCase() + key.slice(1)} URL</label>
              <input value={form.socials?.[key] ?? ''} onChange={e => setSocial(key, e.target.value)} className={inputCls} placeholder={`https://${key}.com/...`} />
            </div>
          ))}
        </div>
      )}

      {/* ── Hero Slides ── */}
      {activeTab === 'Hero Slides' && (
        <div className="space-y-6">
          {/* Background Image */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Hero Background Image</p>
            <div className="space-y-2">
              <label className={labelCls}>Image URL</label>
              <div className="flex gap-2 items-start">
                <input
                  value={form.hero_background}
                  onChange={e => setField('hero_background', e.target.value)}
                  className={inputCls}
                  placeholder="https://... or /images/hero-bg.jpg"
                />
                <div className="shrink-0 flex gap-2">
                  <label className="inline-flex items-center justify-center px-4 h-11 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors whitespace-nowrap">
                    {uploadingField === 'hero-bg' ? 'Uploading...' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        const url = await uploadMedia(file, 'hero-bg');
                        if (url) setField('hero_background', url);
                        event.target.value = '';
                      }}
                    />
                  </label>
                  <button type="button" onClick={() => openMediaPicker((url) => setField('hero_background', url))}
                    className="inline-flex items-center gap-2 px-4 h-11 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
                    <Library size={15} /> Library
                  </button>
                </div>
              </div>
              {form.hero_background && (
                <Image src={form.hero_background} alt="Hero background preview" width={400} height={120} unoptimized
                  className="w-full h-28 object-cover rounded-xl border border-gray-100 mt-1" />
              )}
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Slide Transition Effect</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['fade', 'slide', 'zoom', 'flip', 'slide-up', 'blur', 'skew', 'rotate-zoom'] as const).map((effect) => (
                <button
                  key={effect}
                  type="button"
                  onClick={() => setField('slide_transition', effect)}
                  className={`px-4 py-2.5 rounded-xl border text-sm font-medium capitalize transition-all ${
                    form.slide_transition === effect
                      ? 'border-sky-700 bg-sky-50 text-sky-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {effect.replace('-', ' ')}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400">Choose how slides transition on the desktop hero. Fade = crossfade, Slide = horizontal shift, Zoom = scale, Flip = rotate, Slide Up = vertical shift, Blur = focus blur, Skew = diagonal tilt, Rotate Zoom = spin + scale.</p>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Slides ({form.slides.length})</p>
            <button type="button" onClick={addSlide}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-700 text-white rounded-lg text-xs font-medium hover:bg-sky-800 transition-colors">
              <Plus size={14} /> Add Slide
            </button>
          </div>

          {form.slides.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">No slides yet. Click &quot;Add Slide&quot; to create one.</p>
          )}

          {form.slides.map((slide, i) => (
            <div key={i} className={`border rounded-xl p-4 space-y-4 ${slide.enabled === false ? 'border-gray-200 opacity-60' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical size={16} className="text-gray-300" />
                  <span className="text-sm font-semibold text-gray-700">Slide {i + 1}</span>
                  {slide.enabled === false && <span className="text-xs font-medium text-red-400 bg-red-50 px-2 py-0.5 rounded">Disabled</span>}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-0.5">
                    <button type="button" onClick={() => moveSlide(i, -1)} disabled={i === 0}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                      <ArrowUp size={14} />
                    </button>
                    <button type="button" onClick={() => moveSlide(i, 1)} disabled={i === form.slides.length - 1}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                      <ArrowDown size={14} />
                    </button>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={slide.enabled !== false}
                      onChange={e => setSlide(i, 'enabled', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-sky-700 focus:ring-sky-500"
                    />
                    <span className="text-xs font-medium text-gray-600">Enabled</span>
                  </label>
                  <button type="button" onClick={() => removeSlide(i)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className={labelCls}>Title</label>
                  <input value={slide.title} onChange={e => setSlide(i, 'title', e.target.value)} className={inputCls} placeholder="No Hype. Just Inverters That Deliver." />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className={labelCls}>Description</label>
                  <input value={slide.description} onChange={e => setSlide(i, 'description', e.target.value)} className={inputCls} placeholder="Short description..." />
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>CTA Button Text</label>
                  <input value={slide.cta} onChange={e => setSlide(i, 'cta', e.target.value)} className={inputCls} placeholder="Buy Inverters Built to Last" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>CTA Link</label>
                  <input value={slide.link} onChange={e => setSlide(i, 'link', e.target.value)} className={inputCls} placeholder="/products" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className={labelCls}>Product Image</label>
                  <div className="flex gap-2">
                    <label className="inline-flex items-center justify-center px-4 h-11 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
                      {uploadingField === `slide-${i}` ? 'Uploading...' : 'Upload Image'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          const url = await uploadMedia(file, `slide-${i}`);
                          if (url) setSlide(i, 'productImage', url);
                          event.target.value = '';
                        }}
                      />
                    </label>
                    <button type="button" onClick={() => openMediaPicker((url) => setSlide(i, 'productImage', url))}
                      className="inline-flex items-center gap-2 px-4 h-11 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      <Library size={15} /> Library
                    </button>
                  </div>
                  {slide.productImage && (
                    <Image src={slide.productImage} alt="preview" width={160} height={80} unoptimized className="h-20 w-auto object-contain rounded-lg border border-gray-100 mt-1" />
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>Product Image Alt Text</label>
                  <input value={slide.productAlt} onChange={e => setSlide(i, 'productAlt', e.target.value)} className={inputCls} placeholder="Heavy Duty Inverter" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className={labelCls}>Background Image (Desktop only — optional, falls back to Hero Background)</label>
                  <div className="flex gap-2">
                    <input value={slide.backgroundImage || ''} onChange={e => setSlide(i, 'backgroundImage', e.target.value)} className={inputCls} placeholder="https://... (leave empty to use Hero Background)" />
                    <div className="shrink-0 flex gap-2">
                      <label className="inline-flex items-center justify-center px-4 h-11 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors whitespace-nowrap">
                        {uploadingField === `slide-bg-${i}` ? 'Uploading...' : 'Upload'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            const url = await uploadMedia(file, `slide-bg-${i}`);
                            if (url) setSlide(i, 'backgroundImage', url);
                            event.target.value = '';
                          }}
                        />
                      </label>
                      <button type="button" onClick={() => openMediaPicker((url) => setSlide(i, 'backgroundImage', url))}
                        className="inline-flex items-center gap-2 px-4 h-11 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
                        <Library size={15} /> Library
                      </button>
                    </div>
                  </div>
                  {slide.backgroundImage && (
                    <Image src={slide.backgroundImage} alt="Background preview" width={400} height={120} unoptimized
                      className="w-full h-28 object-cover rounded-xl border border-gray-100 mt-1" />
                  )}
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={slide.showProductImage !== false}
                      onChange={e => setSlide(i, 'showProductImage', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-sky-700 focus:ring-sky-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Show product image on desktop</span>
                  </label>
                  <p className="text-xs text-gray-400">When unchecked, only the background image is shown on desktop (product image still appears on mobile).</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Brand Banner ── */}
      {activeTab === 'Brand Banner' && (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Mid-page Banner Section</p>
          <p className="text-xs text-gray-400">A focused &quot;Help Me Choose&quot; banner shown after Featured Products. Captures unsure buyers with two clear paths: the Power Calculator or a WhatsApp chat. Upload a background image for a richer look — text stays legible via an automatic dark overlay.</p>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.brand_banner_enabled !== false}
              onChange={e => setField('brand_banner_enabled', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-sky-700 focus:ring-sky-500"
            />
            <span className="text-sm font-medium text-gray-700">Show Brand Banner section on homepage</span>
          </label>

          {/* Mode toggle: text-based vs image-only */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-3">
            <div>
              <p className="text-sm font-semibold text-gray-700">Banner Type</p>
              <p className="text-xs text-gray-400 mt-0.5">Choose whether to show the text-based banner (with title, description, and CTAs) or image-only banners.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setField('brand_banner_mode', 'text')}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium border-2 transition-colors ${
                  (form.brand_banner_mode ?? 'text') === 'text'
                    ? 'border-sky-700 bg-sky-50 text-sky-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                Text Banner
                <span className="block text-xs font-normal mt-0.5 opacity-70">Title, description & CTA buttons</span>
              </button>
              <button
                type="button"
                onClick={() => setField('brand_banner_mode', 'image')}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium border-2 transition-colors ${
                  form.brand_banner_mode === 'image'
                    ? 'border-sky-700 bg-sky-50 text-sky-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                Image Banners
                <span className="block text-xs font-normal mt-0.5 opacity-70">Standalone images only, no text</span>
              </button>
            </div>
          </div>

          {/* Text banner fields — only show when mode is 'text' */}
          {(form.brand_banner_mode ?? 'text') === 'text' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className={labelCls}>Kicker (eyebrow label)</label>
              <input value={form.brand_banner_kicker} onChange={e => setField('brand_banner_kicker', e.target.value)} className={inputCls} placeholder="HELP ME CHOOSE" />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className={labelCls}>Title</label>
              <input value={form.brand_banner_title} onChange={e => setField('brand_banner_title', e.target.value)} className={inputCls} placeholder="Not Sure What to Buy?" />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className={labelCls}>Description</label>
              <textarea value={form.brand_banner_description} onChange={e => setField('brand_banner_description', e.target.value)} rows={3}
                className="w-full p-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none"
                placeholder="Tell us what you want to power and we'll help you find the right PRAG setup." />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Primary CTA Text (Power Calculator)</label>
              <input value={form.brand_banner_cta} onChange={e => setField('brand_banner_cta', e.target.value)} className={inputCls} placeholder="Use Power Calculator" />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Primary CTA Link</label>
              <input value={form.brand_banner_link} onChange={e => setField('brand_banner_link', e.target.value)} className={inputCls} placeholder="/power-calculator" />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className={labelCls}>WhatsApp CTA Text</label>
              <input value={form.brand_banner_whatsapp_text} onChange={e => setField('brand_banner_whatsapp_text', e.target.value)} className={inputCls} placeholder="Ask PRAG on WhatsApp" />
              <p className="text-xs text-gray-400">WhatsApp link is pulled from Socials &rarr; WhatsApp. No third option is shown.</p>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className={labelCls}>Background Image (optional)</label>
              <div className="flex gap-2">
                <label className="inline-flex items-center justify-center px-4 h-11 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
                  {uploadingField === 'brand-banner' ? 'Uploading...' : 'Upload Image'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      const url = await uploadMedia(file, 'brand-banner');
                      if (url) setField('brand_banner_image', url);
                      event.target.value = '';
                    }}
                  />
                </label>
                <button type="button" onClick={() => openMediaPicker((url) => setField('brand_banner_image', url))}
                  className="inline-flex items-center gap-2 px-4 h-11 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <Library size={15} /> Library
                </button>
                {form.brand_banner_image && (
                  <button type="button" onClick={() => setField('brand_banner_image', '')}
                    className="inline-flex items-center gap-2 px-4 h-11 rounded-xl border border-gray-200 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={15} /> Clear
                  </button>
                )}
              </div>
              {form.brand_banner_image ? (
                <Image src={form.brand_banner_image} alt="preview" width={400} height={120} unoptimized className="w-full h-28 object-cover rounded-xl border border-gray-100 mt-1" />
              ) : (
                <p className="text-xs text-gray-400 mt-1">No background uploaded — banner falls back to a clean gradient. Upload a wide image (e.g. 1600&times;600) for best results.</p>
              )}
            </div>
          </div>
          )}

          {/* Image-only banners — always available, primary content when mode is 'image' */}
          <div className="border-t border-gray-100 pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Image-only Banners</p>
                <p className="text-xs text-gray-400 mt-0.5">Add standalone banner images. No text or buttons — just the image. Optionally link to a page. {form.brand_banner_mode === 'image' ? 'These are the primary banners shown on the homepage.' : 'Shown below the main text banner.'}</p>
              </div>
              <button type="button" onClick={addBanner}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-700 text-white rounded-lg text-xs font-medium hover:bg-sky-800 transition-colors shrink-0">
                <Plus size={14} /> Add Banner
              </button>
            </div>

            {(form.brand_banners || []).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">No extra banners. Click &quot;Add Banner&quot; to add one.</p>
            )}

            {(form.brand_banners || []).map((banner, i) => (
              <div key={i} className={`border rounded-xl p-4 space-y-3 ${banner.enabled === false ? 'border-gray-200 opacity-60' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Banner {i + 1}</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={banner.enabled !== false}
                        onChange={e => setBanner(i, 'enabled', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-sky-700 focus:ring-sky-500"
                      />
                      <span className="text-xs font-medium text-gray-600">Enabled</span>
                    </label>
                    <button type="button" onClick={() => removeBanner(i)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>Image URL</label>
                  <div className="flex gap-2">
                    <input value={banner.image} onChange={e => setBanner(i, 'image', e.target.value)} className={inputCls} placeholder="https://..." />
                    <button type="button" onClick={() => openMediaPicker((url) => setBanner(i, 'image', url))}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors">
                      <Library size={14} /> Library
                    </button>
                  </div>
                  {banner.image && (
                    <Image src={banner.image} alt="preview" width={400} height={120} unoptimized className="w-full h-20 object-cover rounded-xl border border-gray-100 mt-1" />
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>Link URL (optional)</label>
                  <input value={banner.link} onChange={e => setBanner(i, 'link', e.target.value)} className={inputCls} placeholder="/products or https://..." />
                </div>
              </div>
            ))}
          </div>

          {/* Slide-out Chat */}
          <div className="border-t border-gray-100 pt-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Slide-out Chat (Product Pages)</p>
              <p className="text-xs text-gray-400 mt-0.5">A WhatsApp chat prompt that slides in from the right side on product listing and category pages after the user scrolls. Wired to your sales WhatsApp number.</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.slideout_chat_enabled !== false}
                onChange={e => setField('slideout_chat_enabled', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-sky-700 focus:ring-sky-500"
              />
              <span className="text-sm font-medium text-gray-700">Show slide-out chat on product pages</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={labelCls}>Title Text</label>
                <input value={form.slideout_chat_title} onChange={e => setField('slideout_chat_title', e.target.value)} className={inputCls} placeholder="Not sure what to pick?" />
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Subtitle Text</label>
                <input value={form.slideout_chat_subtitle} onChange={e => setField('slideout_chat_subtitle', e.target.value)} className={inputCls} placeholder="Chat with us" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Pre-filled WhatsApp Message</label>
              <textarea value={form.slideout_chat_message} onChange={e => setField('slideout_chat_message', e.target.value)} rows={3}
                className="w-full p-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none"
                placeholder="Hi PRAG team, I was browsing your product pages and need help choosing the right product. Can you assist?" />
              <p className="text-xs text-gray-400">This message is automatically included when the user opens WhatsApp, so your sales team knows it came from the product page slide-out.</p>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'Trust Signal' && (
        <div className="space-y-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Trust Signal (above Flash Sales)</p>
          <p className="text-xs text-gray-400">A consumer-focused credibility block shown on the shop homepage, right before the discount/flash sales section. Keep it short and confidence-driven.</p>

          {/* Header */}
          <div className={sectionCls}>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.trust_signal_enabled} onChange={e => setField('trust_signal_enabled', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500" />
                Enable Trust Signal section
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={labelCls}>Kicker</label>
                <input value={form.trust_signal_kicker} onChange={e => setField('trust_signal_kicker', e.target.value)} className={inputCls} placeholder="Why People Buy PRAG" />
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Title</label>
                <input value={form.trust_signal_title} onChange={e => setField('trust_signal_title', e.target.value)} className={inputCls} placeholder="Buy With Confidence" />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className={sectionCls}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Stats ({form.trust_signal_stats.length})</p>
              <button type="button" onClick={addTrustStat}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-700 text-white rounded-lg text-xs font-medium hover:bg-sky-800 transition-colors">
                <Plus size={14} /> Add Stat
              </button>
            </div>

            {form.trust_signal_stats.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">No stats yet. Click &quot;Add Stat&quot; to create one.</p>
            )}

            {form.trust_signal_stats.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Stat {i + 1}</span>
                  <button type="button" onClick={() => removeTrustStat(i)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={labelCls}>Value</label>
                    <input value={item.value} onChange={e => setTrustStat(i, 'value', e.target.value)} className={inputCls} placeholder="36" />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelCls}>Label</label>
                    <input value={item.label} onChange={e => setTrustStat(i, 'label', e.target.value)} className={inputCls} placeholder="States Covered" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Badges */}
          <div className={sectionCls}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Badges ({form.trust_signal_badges.length})</p>
              <button type="button" onClick={addTrustBadge}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-700 text-white rounded-lg text-xs font-medium hover:bg-sky-800 transition-colors">
                <Plus size={14} /> Add Badge
              </button>
            </div>

            {form.trust_signal_badges.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">No badges yet. Click &quot;Add Badge&quot; to create one.</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {form.trust_signal_badges.map((item, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Badge {i + 1}</span>
                    <button type="button" onClick={() => removeTrustBadge(i)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelCls}>Label</label>
                    <input value={item.label} onChange={e => setTrustBadge(i, e.target.value)} className={inputCls} placeholder="Product Warranty" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Product page section visibility */}
          <div className={sectionCls}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Single Product Page Sections</p>
            <p className="text-xs text-gray-400">Control which supporting cards appear on individual product pages. Disabling a card hides it completely; its content (e.g. stats) is still managed above.</p>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={form.product_assurance_enabled !== false}
                  onChange={e => setField('product_assurance_enabled', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-sky-700 focus:ring-sky-500"
                />
                <div>
                  <span className="text-sm font-semibold text-gray-700 block">Why shop with PRAG</span>
                  <span className="text-xs text-gray-400">The assurance card listing genuine products, nationwide delivery, and after-sales support.</span>
                </div>
              </label>

              <label className="flex items-center gap-2 cursor-pointer border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={form.product_stats_enabled !== false}
                  onChange={e => setField('product_stats_enabled', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-sky-700 focus:ring-sky-500"
                />
                <div>
                  <span className="text-sm font-semibold text-gray-700 block">Stats strip</span>
                  <span className="text-xs text-gray-400">The small stats bar (States Covered, Years, Installations) shown beneath the share buttons. Uses the same stats configured above.</span>
                </div>
              </label>

              <label className="flex items-center gap-2 cursor-pointer border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={form.product_showrooms_enabled !== false}
                  onChange={e => setField('product_showrooms_enabled', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-sky-700 focus:ring-sky-500"
                />
                <div>
                  <span className="text-sm font-semibold text-gray-700 block">Visit a showroom (Location)</span>
                  <span className="text-xs text-gray-400">The &quot;Visit a showroom&quot; card listing Lagos &amp; Abuja offices with map links.</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ── Home Needs ── */}
      {activeTab === 'Home Needs' && (
        <div className="space-y-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Shop by Home Need (above Testimonials)</p>
          <p className="text-xs text-gray-400">Themed cards that route shoppers to the right product category by home type. Link to SEO-rich category pages or the power calculator for recommendations.</p>

          {/* Header */}
          <div className={sectionCls}>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.home_need_enabled} onChange={e => setField('home_need_enabled', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500" />
                Enable Home Needs section
              </label>
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Section Title</label>
              <input value={form.home_need_title} onChange={e => setField('home_need_title', e.target.value)} className={inputCls} placeholder="Power Your Home Your Way" />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Section Subtitle</label>
              <textarea value={form.home_need_subtitle} onChange={e => setField('home_need_subtitle', e.target.value)} rows={2}
                className="w-full p-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none"
                placeholder="Whatever your setup, PRAG has a reliable power solution..." />
            </div>
          </div>

          {/* Cards */}
          <div className={sectionCls}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Cards ({form.home_need_items.length})</p>
              <button type="button" onClick={addHomeNeed}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-700 text-white rounded-lg text-xs font-medium hover:bg-sky-800 transition-colors">
                <Plus size={14} /> Add Card
              </button>
            </div>

            {form.home_need_items.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">No cards yet. Click &quot;Add Card&quot; to create one.</p>
            )}

            {form.home_need_items.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Card {i + 1}</span>
                  <button type="button" onClick={() => removeHomeNeed(i)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={labelCls}>Card Title</label>
                    <input value={item.title} onChange={e => setHomeNeed(i, 'title', e.target.value)} className={inputCls} placeholder="For Apartments" />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelCls}>CTA Button Text</label>
                    <input value={item.cta} onChange={e => setHomeNeed(i, 'cta', e.target.value)} className={inputCls} placeholder="Get Recommendations" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={labelCls}>Description</label>
                  <textarea value={item.description} onChange={e => setHomeNeed(i, 'description', e.target.value)} rows={2}
                    className="w-full p-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none"
                    placeholder="Compact backup solutions..." />
                </div>

                <div className="space-y-1.5">
                  <label className={labelCls}>CTA Link</label>
                  <input value={item.link} onChange={e => setHomeNeed(i, 'link', e.target.value)} className={inputCls} placeholder="/home-needs/apartments" />
                </div>

                <div className="space-y-1.5">
                  <label className={labelCls}>Card Image (optional)</label>
                  <div className="flex gap-2 items-start">
                    <input
                      value={item.image}
                      onChange={e => setHomeNeed(i, 'image', e.target.value)}
                      className={inputCls}
                      placeholder="https://... product image URL"
                    />
                    <div className="shrink-0 flex gap-2">
                      <label className="inline-flex items-center justify-center px-4 h-11 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors whitespace-nowrap">
                        {uploadingField === `home-need-${i}` ? 'Uploading...' : 'Upload'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            const url = await uploadMedia(file, `home-need-${i}`);
                            if (url) setHomeNeed(i, 'image', url);
                            event.target.value = '';
                          }}
                        />
                      </label>
                      <button type="button" onClick={() => openMediaPicker((url) => setHomeNeed(i, 'image', url))}
                        className="inline-flex items-center gap-2 px-4 h-11 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
                        <Library size={15} /> Library
                      </button>
                    </div>
                  </div>
                  {item.image && (
                    <Image src={item.image} alt="preview" width={192} height={96} unoptimized className="h-20 w-auto object-contain rounded-lg border border-gray-100 mt-1" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Testimonials ── */}
      {activeTab === 'Testimonials' && (
        <div className="space-y-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Customer Reviews (above Checkout FAQ)</p>
          <p className="text-xs text-gray-400">Genuine reviews shown on every page. Up to 3 are displayed — add more in reserve and reorder by deleting/re-adding. Customer installation photos make reviews stronger.</p>

          {/* Header */}
          <div className={sectionCls}>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.testimonial_enabled} onChange={e => setField('testimonial_enabled', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500" />
                Enable testimonials section
              </label>
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Section Title</label>
              <input value={form.testimonial_title} onChange={e => setField('testimonial_title', e.target.value)} className={inputCls} placeholder="Trusted in Homes Across Nigeria" />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Section Subtitle</label>
              <textarea value={form.testimonial_subtitle} onChange={e => setField('testimonial_subtitle', e.target.value)} rows={2}
                className="w-full p-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none"
                placeholder="Real reviews from real PRAG customers..." />
            </div>
          </div>

          {/* Review items */}
          <div className={sectionCls}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Reviews ({form.testimonial_items.length})</p>
              <button type="button" onClick={addTestimonial}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-700 text-white rounded-lg text-xs font-medium hover:bg-sky-800 transition-colors">
                <Plus size={14} /> Add Review
              </button>
            </div>

            {form.testimonial_items.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">No reviews yet. Click &quot;Add Review&quot; to create one.</p>
            )}

            {form.testimonial_items.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Review {i + 1}</span>
                  <button type="button" onClick={() => removeTestimonial(i)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Rating */}
                <div className="space-y-1.5">
                  <label className={labelCls}>Star Rating (1–5)</label>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, starIdx) => (
                      <button key={starIdx} type="button" onClick={() => setTestimonial(i, 'rating', starIdx + 1)}
                        className="p-0.5 hover:scale-110 transition-transform">
                        <svg width="24" height="24" viewBox="0 0 24 24"
                          fill={starIdx < item.rating ? 'currentColor' : 'none'}
                          stroke="currentColor" strokeWidth="1.5"
                          className={starIdx < item.rating ? 'text-amber-400' : 'text-gray-300'}>
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinejoin="round" />
                        </svg>
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-500">{item.rating} / 5</span>
                  </div>
                </div>

                                {/* Quote */}
                <div className="space-y-1.5">
                  <label className={labelCls}>Review Quote</label>
                  <textarea value={item.quote} onChange={e => setTestimonial(i, 'quote', e.target.value)} rows={3}
                    className="w-full p-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none"
                    placeholder="&ldquo;I bought a 3.5kVA inverter...&rdquo;" />
                </div>

                {/* Name + Location + Product */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className={labelCls}>Customer First Name</label>
                    <input value={item.name} onChange={e => setTestimonial(i, 'name', e.target.value)} className={inputCls} placeholder="Chidi" />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelCls}>Location</label>
                    <input value={item.location} onChange={e => setTestimonial(i, 'location', e.target.value)} className={inputCls} placeholder="Lekki, Lagos" />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelCls}>Product Purchased</label>
                    <input value={item.product} onChange={e => setTestimonial(i, 'product', e.target.value)} className={inputCls} placeholder="3.5kVA Inverter + Lithium Battery" />
                  </div>
                </div>

                {/* Customer / installation photo */}
                <div className="space-y-1.5">
                  <label className={labelCls}>Customer / Installation Photo (optional)</label>
                  <p className="text-xs text-gray-400">Upload a customer photo or installation photo. Shown as a banner at the top of the review card. Leave empty to show initials avatar instead.</p>
                  <div className="flex gap-2 items-start">
                    <input
                      value={item.image}
                      onChange={e => setTestimonial(i, 'image', e.target.value)}
                      className={inputCls}
                      placeholder="https://... image URL (leave empty for initials avatar)"
                    />
                    <div className="shrink-0 flex gap-2">
                      <label className="inline-flex items-center justify-center px-4 h-11 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors whitespace-nowrap">
                        {uploadingField === `testimonial-${i}` ? 'Uploading...' : 'Upload'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            const url = await uploadMedia(file, `testimonial-${i}`);
                            if (url) setTestimonial(i, 'image', url);
                            event.target.value = '';
                          }}
                        />
                      </label>
                      <button type="button" onClick={() => openMediaPicker((url) => setTestimonial(i, 'image', url))}
                        className="inline-flex items-center gap-2 px-4 h-11 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
                        <Library size={15} /> Library
                      </button>
                    </div>
                  </div>
                  {item.image && (
                    <Image src={item.image} alt="preview" width={192} height={96} unoptimized className="h-20 w-auto object-cover rounded-lg border border-gray-100 mt-1" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Checkout FAQ ── */}
      {activeTab === 'Checkout FAQ' && (
        <div className="space-y-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Checkout FAQ (above Final CTA)</p>
          <p className="text-xs text-gray-400">Short, sales-focused answers that remove buying hesitation. Shown on every page above the Final CTA section.</p>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.checkout_faq_enabled !== false}
              onChange={e => setField('checkout_faq_enabled', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-sky-700 focus:ring-sky-500"
            />
            <span className="text-sm font-medium text-gray-700">Show FAQ section on the homepage</span>
          </label>

          {/* Header text */}
          <div className={sectionCls}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={labelCls}>Kicker</label>
                <input value={form.checkout_faq_kicker} onChange={e => setField('checkout_faq_kicker', e.target.value)} className={inputCls} placeholder="FAQ" />
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Link Text</label>
                <input value={form.checkout_faq_link_text} onChange={e => setField('checkout_faq_link_text', e.target.value)} className={inputCls} placeholder="Find your perfect inverter size" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Title</label>
              <input value={form.checkout_faq_title} onChange={e => setField('checkout_faq_title', e.target.value)} className={inputCls} placeholder="Still deciding? Here's what you need to know before you buy." />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Subtitle</label>
              <textarea value={form.checkout_faq_subtitle} onChange={e => setField('checkout_faq_subtitle', e.target.value)} rows={2}
                className="w-full p-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none"
                placeholder="Straight answers on sizing, warranty, delivery and installation..." />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Link URL</label>
              <input value={form.checkout_faq_link_url} onChange={e => setField('checkout_faq_link_url', e.target.value)} className={inputCls} placeholder="/power-calculator" />
            </div>
          </div>

          {/* FAQ Items */}
          <div className={sectionCls}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">FAQ Items ({form.checkout_faq_items.length})</p>
              <button type="button" onClick={addFaqItem}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-700 text-white rounded-lg text-xs font-medium hover:bg-sky-800 transition-colors">
                <Plus size={14} /> Add Question
              </button>
            </div>

            {form.checkout_faq_items.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">No questions yet. Click &quot;Add Question&quot; to create one.</p>
            )}

            {form.checkout_faq_items.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Question {i + 1}</span>
                  <button type="button" onClick={() => removeFaqItem(i)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>Question</label>
                  <input value={item.question} onChange={e => setFaqItem(i, 'question', e.target.value)} className={inputCls} placeholder="Which inverter size should I buy?" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>Answer</label>
                  <textarea value={item.answer} onChange={e => setFaqItem(i, 'answer', e.target.value)} rows={3}
                    className="w-full p-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none"
                    placeholder="The right inverter size depends on..." />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Product Banner */}
          <div className={sectionCls}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Desktop Product Banner</p>
            <p className="text-xs text-gray-400">Shown below the link on desktop only (hidden on mobile). Use a transparent PNG for best results.</p>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.checkout_faq_banner_enabled} onChange={e => setField('checkout_faq_banner_enabled', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500" />
                Enable banner
              </label>
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Banner Image URL</label>
              <div className="flex gap-2 items-start">
                <input
                  value={form.checkout_faq_banner_image}
                  onChange={e => setField('checkout_faq_banner_image', e.target.value)}
                  className={inputCls}
                  placeholder="https://... product image URL"
                />
                <div className="shrink-0 flex gap-2">
                  <label className="inline-flex items-center justify-center px-4 h-11 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors whitespace-nowrap">
                    {uploadingField === 'faq-banner' ? 'Uploading...' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        const url = await uploadMedia(file, 'faq-banner');
                        if (url) setField('checkout_faq_banner_image', url);
                        event.target.value = '';
                      }}
                    />
                  </label>
                  <button type="button" onClick={() => openMediaPicker((url) => setField('checkout_faq_banner_image', url))}
                    className="inline-flex items-center gap-2 px-4 h-11 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
                    <Library size={15} /> Library
                  </button>
                </div>
              </div>
              {form.checkout_faq_banner_image && (
                <Image src={form.checkout_faq_banner_image} alt="preview" width={192} height={96} unoptimized className="h-24 w-auto object-contain rounded-lg border border-gray-100 mt-1" />
              )}
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Banner Link URL</label>
              <input value={form.checkout_faq_banner_link} onChange={e => setField('checkout_faq_banner_link', e.target.value)} className={inputCls} placeholder="/products/inverters" />
            </div>
          </div>
        </div>
      )}

      {/* ── Power Calculator Q&A ── */}
      {activeTab === 'Power Calculator' && (
        <div className="space-y-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Power Calculator Q&amp;A (above Final CTA, homepage only)</p>
          <p className="text-xs text-gray-400">A conversion-focused Q&amp;A accordion that answers sizing questions and drives visitors to the Power Calculator. Shown on the homepage only, just before the Final CTA.</p>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.power_calculator_enabled !== false}
              onChange={e => setField('power_calculator_enabled', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-sky-700 focus:ring-sky-500"
            />
            <span className="text-sm font-medium text-gray-700">Show Power Calculator Q&amp;A on the homepage</span>
          </label>

          {/* Header text */}
          <div className={sectionCls}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={labelCls}>Kicker</label>
                <input value={form.power_calculator_kicker} onChange={e => setField('power_calculator_kicker', e.target.value)} className={inputCls} placeholder="POWER CALCULATOR" />
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Button Text</label>
                <input value={form.power_calculator_link_text} onChange={e => setField('power_calculator_link_text', e.target.value)} className={inputCls} placeholder="Open the Power Calculator" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Title</label>
              <input value={form.power_calculator_title} onChange={e => setField('power_calculator_title', e.target.value)} className={inputCls} placeholder="Not sure what size you need? Let's work it out." />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Subtitle</label>
              <textarea value={form.power_calculator_subtitle} onChange={e => setField('power_calculator_subtitle', e.target.value)} rows={2}
                className="w-full p-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none"
                placeholder="Answer a few quick questions about what you want to power..." />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Button Link URL</label>
              <input value={form.power_calculator_link_url} onChange={e => setField('power_calculator_link_url', e.target.value)} className={inputCls} placeholder="/power-calculator" />
            </div>
          </div>

          {/* Q&A Items */}
          <div className={sectionCls}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Q&amp;A Items ({form.power_calculator_items.length})</p>
              <button type="button" onClick={addPowerCalcItem}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-700 text-white rounded-lg text-xs font-medium hover:bg-sky-800 transition-colors">
                <Plus size={14} /> Add Question
              </button>
            </div>

            {form.power_calculator_items.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">No questions yet. Click &quot;Add Question&quot; to create one.</p>
            )}

            {form.power_calculator_items.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Question {i + 1}</span>
                  <button type="button" onClick={() => removePowerCalcItem(i)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>Question</label>
                  <input value={item.question} onChange={e => setPowerCalcItem(i, 'question', e.target.value)} className={inputCls} placeholder="How does the Power Calculator work?" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>Answer</label>
                  <textarea value={item.answer} onChange={e => setPowerCalcItem(i, 'answer', e.target.value)} rows={3}
                    className="w-full p-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none"
                    placeholder="Tell us which appliances you want to run..." />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Final CTA ── */}
      {activeTab === 'Final CTA' && (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Final Conversion CTA (above footer)</p>
          <p className="text-xs text-gray-400">Shown just before the footer on every page. The WhatsApp link uses the WhatsApp URL set under the Socials tab.</p>
          <div className={sectionCls}>
            <div className="space-y-1.5">
              <label className={labelCls}>Title</label>
              <input value={form.final_cta_title} onChange={e => setField('final_cta_title', e.target.value)} className={inputCls} placeholder="Ready for More Reliable Power?" />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Subtitle</label>
              <textarea value={form.final_cta_subtitle} onChange={e => setField('final_cta_subtitle', e.target.value)} rows={2}
                className="w-full p-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none"
                placeholder="Shop PRAG power solutions for your home today." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={labelCls}>Shop Button Text</label>
                <input value={form.final_cta_shop_text} onChange={e => setField('final_cta_shop_text', e.target.value)} className={inputCls} placeholder="Shop Now" />
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Shop Button Link</label>
                <input value={form.final_cta_shop_link} onChange={e => setField('final_cta_shop_link', e.target.value)} className={inputCls} placeholder="/products" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>WhatsApp CTA Text</label>
              <input value={form.final_cta_whatsapp_text} onChange={e => setField('final_cta_whatsapp_text', e.target.value)} className={inputCls} placeholder="Chat with PRAG on WhatsApp" />
            </div>
          </div>
        </div>
      )}

      {/* ── Homepage Sections (toggles) ── */}
      {activeTab === 'Homepage Sections' && (
        <div className="space-y-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Homepage Section Visibility</p>
          <p className="text-xs text-gray-400">Turn entire homepage sections on or off without deleting their content. Disabled sections stay hidden on the live site but keep their configured content here.</p>

          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={form.shop_by_need_enabled !== false}
                onChange={e => setField('shop_by_need_enabled', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-sky-700 focus:ring-sky-500"
              />
              <div>
                <span className="text-sm font-semibold text-gray-700 block">Shop by What You Need</span>
                <span className="text-xs text-gray-400">The &quot;What do you need help with?&quot; card grid linking to product categories.</span>
              </div>
            </label>

            <label className="flex items-center gap-2 cursor-pointer border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={form.flash_sales_enabled !== false}
                onChange={e => setField('flash_sales_enabled', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-sky-700 focus:ring-sky-500"
              />
              <div>
                <span className="text-sm font-semibold text-gray-700 block">Deals (Today&apos;s PRAG Deals)</span>
                <span className="text-xs text-gray-400">The flash-sale carousel of discounted, in-stock products.</span>
              </div>
            </label>

            <label className="flex items-center gap-2 cursor-pointer border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={form.best_sellers_enabled !== false}
                onChange={e => setField('best_sellers_enabled', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-sky-700 focus:ring-sky-500"
              />
              <div>
                <span className="text-sm font-semibold text-gray-700 block">Best Sellers</span>
                <span className="text-xs text-gray-400">The &quot;Most Popular Right Now&quot; grid showing up to 8 featured products.</span>
              </div>
            </label>

            <label className="flex items-center gap-2 cursor-pointer border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={form.featured_section_enabled !== false}
                onChange={e => setField('featured_section_enabled', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-sky-700 focus:ring-sky-500"
              />
              <div>
                <span className="text-sm font-semibold text-gray-700 block">Featured (classic layout)</span>
                <span className="text-xs text-gray-400">A second featured-products section using the classic 4-product layout. Independent of Best Sellers.</span>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* ── Categories ── */}
      {activeTab === 'Categories' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Category Grid ({form.categories.length})</p>
            <button type="button" onClick={addCategory}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-700 text-white rounded-lg text-xs font-medium hover:bg-sky-800 transition-colors">
              <Plus size={14} /> Add Category
            </button>
          </div>
          <p className="text-xs text-gray-400">Drag a category card by its handle to reorder. The order here controls the homepage &quot;Shop by Categories&quot; grid and the product page tabs.</p>

          {form.categories.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">No categories yet.</p>
          )}

          {form.categories.map((cat, i) => (
            <div
              key={i}
              draggable
              onDragStart={() => setDragCatIdx(i)}
              onDragOver={(e) => { e.preventDefault(); setDragOverCatIdx(i); }}
              onDragLeave={() => setDragOverCatIdx(null)}
              onDrop={() => { if (dragCatIdx !== null) moveCategory(dragCatIdx, i); setDragCatIdx(null); setDragOverCatIdx(null); }}
              onDragEnd={() => { setDragCatIdx(null); setDragOverCatIdx(null); }}
              className={`border rounded-xl p-4 space-y-4 transition-all ${
                dragOverCatIdx === i ? 'border-sky-500 ring-2 ring-sky-200' : 'border-gray-200'
              } ${dragCatIdx === i ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-grab active:cursor-grabbing">
                  <GripVertical size={16} className="text-gray-400" />
                  <span className="text-sm font-semibold text-gray-700">Category {i + 1}</span>
                </div>
                <button type="button" onClick={() => removeCategory(i)}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={labelCls}>Display Name</label>
                  <input value={cat.name} onChange={e => setCategory(i, 'name', e.target.value)} className={inputCls} placeholder="Voltage Stabilizers" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>URL Slug</label>
                  <input value={cat.slug} onChange={e => setCategory(i, 'slug', e.target.value)} className={inputCls} placeholder="voltage-stabilizers" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className={labelCls}>Image</label>
                  <div className="flex gap-2">
                    <label className="inline-flex items-center justify-center px-4 h-11 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
                      {uploadingField === `category-${i}` ? 'Uploading...' : 'Upload Image'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          const url = await uploadMedia(file, `category-${i}`);
                          if (url) setCategory(i, 'image', url);
                          event.target.value = '';
                        }}
                      />
                    </label>
                    <button type="button" onClick={() => openMediaPicker((url) => setCategory(i, 'image', url))}
                      className="inline-flex items-center gap-2 px-4 h-11 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      <Library size={15} /> Library
                    </button>
                  </div>
                  {cat.image && (
                    <Image src={cat.image} alt="preview" width={128} height={64} unoptimized className="h-16 w-auto object-contain rounded-lg border border-gray-100 mt-1" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Header ── */}
      {activeTab === 'Header' && (
        <div className="space-y-5">
          <div className={sectionCls}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Header Menu Links</p>
              <button type="button" onClick={addHeaderLink}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-700 text-white rounded-lg text-xs font-semibold hover:bg-sky-800 transition-colors">
                <Plus size={14} /> Add Link
              </button>
            </div>
            <p className="text-xs text-gray-400">Add, edit, remove, or reorder the links shown in the header navigation bar. Drag the handle to reorder.</p>

            <div className="space-y-2">
              {form.header_menu.map((lnk, idx) => (
                <div
                  key={idx}
                  draggable
                  onDragStart={() => setDragHeaderIdx(idx)}
                  onDragOver={(e) => { e.preventDefault(); setDragOverHeaderIdx(idx); }}
                  onDragLeave={() => setDragOverHeaderIdx(null)}
                  onDrop={() => { if (dragHeaderIdx !== null) moveHeaderLink(dragHeaderIdx, idx); setDragHeaderIdx(null); setDragOverHeaderIdx(null); }}
                  onDragEnd={() => { setDragHeaderIdx(null); setDragOverHeaderIdx(null); }}
                  className={`flex items-center gap-2 border rounded-xl p-3 transition-all cursor-grab active:cursor-grabbing ${
                    dragOverHeaderIdx === idx ? 'border-sky-500 ring-2 ring-sky-200' : 'border-gray-200'
                  } ${dragHeaderIdx === idx ? 'opacity-50' : ''}`}
                >
                  <GripVertical size={16} className="text-gray-400 shrink-0" />
                  <input
                    value={lnk.label}
                    onChange={e => setHeaderLink(idx, 'label', e.target.value)}
                    className="w-32 h-10 px-3 rounded-lg border border-gray-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Label"
                  />
                  <input
                    value={lnk.link}
                    onChange={e => setHeaderLink(idx, 'link', e.target.value)}
                    className="flex-1 h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="/products/voltage-stabilizers or https://..."
                  />
                  <button type="button" onClick={() => removeHeaderLink(idx)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Remove link">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      {activeTab === 'Footer' && (
        <div className="space-y-5">
          <div className={sectionCls}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Footer Content</p>
            <div className="space-y-1.5">
              <label className={labelCls}>Company Description</label>
              <textarea value={form.footer_description} onChange={e => setField('footer_description', e.target.value)} rows={4}
                className="w-full p-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none"
                placeholder="Nigeria's leading power engineering company..." />
            </div>
          </div>

          <div className={sectionCls}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Footer Menu Columns</p>
              <button type="button" onClick={addFooterColumn}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-700 text-white rounded-lg text-xs font-semibold hover:bg-sky-800 transition-colors">
                <Plus size={14} /> Add Column
              </button>
            </div>
            <p className="text-xs text-gray-400">Add, edit, or remove the link columns shown in the footer. Drag the handle to reorder columns.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {form.footer_columns.map((col, colIdx) => (
                <div
                  key={colIdx}
                  draggable
                  onDragStart={() => setDragColIdx(colIdx)}
                  onDragOver={(e) => { e.preventDefault(); setDragOverColIdx(colIdx); }}
                  onDragLeave={() => setDragOverColIdx(null)}
                  onDrop={() => { if (dragColIdx !== null) moveFooterColumn(dragColIdx, colIdx); setDragColIdx(null); setDragOverColIdx(null); }}
                  onDragEnd={() => { setDragColIdx(null); setDragOverColIdx(null); }}
                  className={`border rounded-xl p-4 space-y-3 transition-all cursor-grab active:cursor-grabbing ${
                    dragOverColIdx === colIdx ? 'border-sky-500 ring-2 ring-sky-200' : 'border-gray-200'
                  } ${dragColIdx === colIdx ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <GripVertical size={16} className="text-gray-400 shrink-0" />
                    <input
                      value={col.title}
                      onChange={e => setFooterColumnTitle(colIdx, e.target.value)}
                      className="flex-1 h-10 px-3 rounded-lg border border-gray-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="Column title"
                    />
                    <button type="button" onClick={() => removeFooterColumn(colIdx)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Remove column">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {col.links.map((lnk, lnkIdx) => (
                      <div key={lnkIdx} className="flex items-center gap-2">
                        <input
                          value={lnk.label}
                          onChange={e => setFooterLink(colIdx, lnkIdx, 'label', e.target.value)}
                          className="w-28 h-9 px-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                          placeholder="Label"
                        />
                        <input
                          value={lnk.link}
                          onChange={e => setFooterLink(colIdx, lnkIdx, 'link', e.target.value)}
                          className="flex-1 h-9 px-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                          placeholder="/path or https://..."
                        />
                        <button type="button" onClick={() => removeFooterLink(colIdx, lnkIdx)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Remove link">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => addFooterLink(colIdx)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-sky-700 text-xs font-semibold hover:bg-sky-50 rounded-lg transition-colors">
                      <Plus size={14} /> Add Link
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Payments' && (
        <div className="space-y-5">
          <div className={sectionCls}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Paystack</p>
            <div className="space-y-1.5">
              <label className={labelCls}>Paystack Public Key</label>
              <input
                value={form.paystack_public_key}
                onChange={e => setField('paystack_public_key', e.target.value)}
                className={inputCls}
                placeholder="pk_live_xxxxxxxxxxxxxxxxxxxxxxxx"
              />
              <p className="text-xs text-gray-400">
                Your Paystack public key — safe to expose on the frontend. Find it in your{' '}
                <a href="https://dashboard.paystack.com/#/settings/developer" target="_blank" rel="noreferrer" className="text-sky-600 underline">
                  Paystack dashboard → Settings → API Keys
                </a>.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Shipping' && (
        <div className="space-y-5">
          <div className={sectionCls}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Shipping Method Descriptions</p>
            <p className="text-xs text-gray-400">
              These descriptions appear under each shipping method at checkout. Update them to guide customers on what each option means.
            </p>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className={labelCls}>Local Pickup Description</label>
                <textarea
                  value={form.shipping_local_pickup_description}
                  onChange={e => setField('shipping_local_pickup_description', e.target.value)}
                  rows={3}
                  className={inputCls}
                  placeholder="Pick up your order from any of our PRAG showrooms..."
                />
                <p className="text-xs text-gray-400">
                  Shown for the &ldquo;Local pickup&rdquo; shipping method. Tell customers they can collect from any PRAG store.
                </p>
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Custom Delivery Description</label>
                <textarea
                  value={form.shipping_custom_delivery_description}
                  onChange={e => setField('shipping_custom_delivery_description', e.target.value)}
                  rows={3}
                  className={inputCls}
                  placeholder="Chat with our support team to arrange custom delivery..."
                />
                <p className="text-xs text-gray-400">
                  Shown for any delivery method that isn&apos;t local pickup or conditional free shipping (e.g. flat rate, or the &ldquo;Custom Shipping&rdquo; method). Let customers know to contact support for arrangements.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-2 border-t border-gray-100">
        <button type="submit" disabled={status === 'saving' || status === 'revalidating'}
          className="flex items-center gap-2 px-6 py-3 bg-sky-700 text-white rounded-xl text-sm font-semibold hover:bg-sky-800 transition-colors disabled:opacity-60">
          <Save size={16} />
          {status === 'saving' ? 'Saving...' : status === 'revalidating' ? 'Revalidating...' : 'Save Settings'}
        </button>
      </div>
    </form>

      <MediaPicker
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        multiple={false}
        onSelect={(items) => {
          if (items[0] && mediaPickerCallback.current) {
            mediaPickerCallback.current(items[0].source_url);
          }
        }}
      />
    </>
  );
}
