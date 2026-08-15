export interface AdminUser {
  token: string;
  user_email: string;
  user_nicename: string;
  user_display_name: string;
}

export interface WCProduct {
  id: number;
  name: string;
  slug: string;
  sku: string;
  status: string;
  stock_status: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  featured: boolean;
  categories: { id: number; name: string; slug: string }[];
  images: { id: number; src: string; alt: string; name?: string }[];
  date_created: string;
  total_sales: number;
}

export interface WCOrder {
  id: number;
  status: string;
  date_created: string;
  total: string;
  currency: string;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address_1: string;
    city: string;
    state: string;
  };
  line_items: { id: number; name: string; quantity: number; total: string }[];
  shipping_total: string;
  payment_method_title: string;
}

export interface WCCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  date_created: string;
  orders_count: number;
  total_spent: string;
  avatar_url: string;
  billing: { phone: string; city: string; state: string };
}

export interface SlideItem {
  title: string;
  description: string;
  cta: string;
  link: string;
  productImage: string;
  productAlt: string;
  backgroundImage?: string;
  showProductImage?: boolean;
  enabled?: boolean;
}

export interface CategoryItem {
  name: string;
  slug: string;
  image: string;
}

export interface CheckoutFaqItem {
  question: string;
  answer: string;
}

export interface TestimonialItem {
  rating: number;
  quote: string;
  name: string;
  location: string;
  product: string;
  image: string;
}

export interface HomeNeedItem {
  title: string;
  description: string;
  cta: string;
  link: string;
  icon: string;
  image: string;
}

export interface TrustStatItem {
  value: string;
  label: string;
}

export interface TrustBadgeItem {
  label: string;
}

export interface FooterLink {
  label: string;
  link: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface HeaderLink {
  label: string;
  link: string;
}

export interface SocialLinks {
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  whatsapp: string;
}

export interface SiteSettings {
  // Contact
  contact_phone: string;
  contact_email: string;
  whatsapp: string;
  address: string;
  business_hours_weekday: string;
  business_hours_saturday: string;
  // Socials
  socials: SocialLinks;
  // Announcement
  announcement_bar: string;
  // Under Construction
  site_under_construction: boolean;
  under_construction_title: string;
  under_construction_message: string;
  // Footer
  footer_description: string;
  footer_columns: FooterColumn[];
  header_menu: HeaderLink[];
  // Brand Banner
  brand_banner_kicker: string;
  brand_banner_title: string;
  brand_banner_description: string;
  brand_banner_cta: string;
  brand_banner_link: string;
  brand_banner_whatsapp_text: string;
  brand_banner_image: string;
  brand_banner_enabled: boolean;
  brand_banner_mode: 'text' | 'image';
  brand_banners: { image: string; link: string; enabled: boolean }[];
  // Slide-out chat (product pages)
  slideout_chat_enabled: boolean;
  slideout_chat_title: string;
  slideout_chat_subtitle: string;
  slideout_chat_message: string;
  // Final Conversion CTA (above footer)
  final_cta_title: string;
  final_cta_subtitle: string;
  final_cta_shop_text: string;
  final_cta_shop_link: string;
  final_cta_whatsapp_text: string;
  // Checkout FAQ (above Final CTA)
  checkout_faq_kicker: string;
  checkout_faq_title: string;
  checkout_faq_subtitle: string;
  checkout_faq_link_text: string;
  checkout_faq_link_url: string;
  checkout_faq_items: CheckoutFaqItem[];
  checkout_faq_banner_enabled: boolean;
  checkout_faq_banner_image: string;
  checkout_faq_banner_link: string;
  // Testimonials / Reviews (above Checkout FAQ)
  testimonial_enabled: boolean;
  testimonial_title: string;
  testimonial_subtitle: string;
  testimonial_items: TestimonialItem[];
  // Shop by Home Need (above Testimonials)
  home_need_enabled: boolean;
  home_need_title: string;
  home_need_subtitle: string;
  home_need_items: HomeNeedItem[];
  // Trust Signal ("Why People Buy PRAG" / "Buy With Confidence") — above Flash Sales
  trust_signal_enabled: boolean;
  trust_signal_kicker: string;
  trust_signal_title: string;
  trust_signal_stats: TrustStatItem[];
  trust_signal_badges: TrustBadgeItem[];
  // Hero Slides
  hero_background: string;
  slide_transition: string;
  slides: SlideItem[];
  // Category Grid
  categories: CategoryItem[];
  // Hidden product categories (array of slugs)
  hidden_categories: string[];
  // Category display order (array of slugs)
  category_order: string[];
  // Subcategory display order per parent (key = parent slug, value = array of child slugs)
  subcategory_order: Record<string, string[]>;
  // Payments
  paystack_public_key: string;
  // Shipping method descriptions (shown at checkout)
  shipping_local_pickup_description: string;
  shipping_custom_delivery_description: string;
}

export interface WPPost {
  id: number;
  slug: string;
  status: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  date: string;
  _embedded?: { 'wp:featuredmedia'?: [{ source_url: string }] };
}
