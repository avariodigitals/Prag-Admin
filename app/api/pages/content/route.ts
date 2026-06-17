import { NextResponse } from 'next/server';

interface PageContent {
  slug: string;
  title: string;
  content: string;
  lastUpdated: string;
}

// Default content pulled from Prag frontend
const DEFAULT_PAGES: PageContent[] = [
  {
    slug: 'about',
    title: 'About Us',
    content: `Engineering Reliable Power Solutions for Real-World Challenges

PRAG is a power solutions company focused on designing and delivering systems that solve unstable electricity problems for homes, businesses, and industries.

Built on Engineering, Driven by Real Power Challenges

PRAG was founded to address one core problem, unreliable electricity. Instead of simply supplying equipment, we set out to design complete power solutions that ensure stability, efficiency, and long-term performance.

Today, we work with homeowners, businesses, and industrial clients to deliver systems tailored to their specific needs, backed by technical expertise and real-world experience.

Key Statistics:
- 50K+ Systems Installed
- 20+ Years Active
- 36 States Covered

Our Story

PRAG Power Engineering was founded in 2005 by a team of electrical engineers who were frustrated with the poor quality of power solutions being installed across Nigeria. They saw expensive imported equipment failing because installers didn't understand Nigerian power conditions. They saw families and businesses suffering from systems that were never properly designed.

We started with a simple mission: engineer power systems that actually work in Nigerian conditions. Not imported cookie-cutter solutions, but systems designed specifically for the voltage fluctuations, frequent outages, and harsh environments we face here.

Twenty years later, we've installed over 50,000 systems across 36 states. Our engineers hold COREN certifications and international qualifications. Our systems are running in homes, hospitals, hotels, banks, factories, and data centers across Nigeria.

We've grown, but our mission hasn't changed: reliable power engineering, done right.

Our Core Values

Built on Principles That Deliver Reliable Results

Our work is guided by a commitment to quality, precision, and long-term performance.

Core Values:
- Engineering for Reliable Power: Engineering Power Systems with Precision, Technical Expertise, and a Focus on Long-Term Performance
- Reliable Power Systems You Trust: Building Reliable Power Solutions That Perform Consistently Under Real-World Conditions
- Practical Solutions for Real Conditions: Delivering Practical Power Solutions Designed for Real Environments, Not Just Ideal Scenarios
- Designed to Meet Your Needs: Putting Client Needs First by Designing Power Systems Around Real Challenges and Requirements`,
    lastUpdated: new Date().toISOString(),
  },
  {
    slug: 'faq',
    title: 'FAQ',
    content: `Frequently Asked Questions

Answers to common questions about PRAG products, warranty, installation, and support.

Q: What is the warranty period on PRAG products?
A: All PRAG products come with a standard 5-year warranty covering manufacturing defects and component failures under normal use conditions.

Q: Do you offer installation services?
A: Yes, PRAG offers professional installation services through our certified engineers and authorized partner network across Nigeria. Contact us or visit a PRAG store to schedule an installation.

Q: Can I get bulk pricing for large orders?
A: Yes, we offer competitive bulk pricing for businesses, contractors, and distributors. Please reach out to our sales team via the enquiry form or email sales@prag.global for a custom quote.

Q: Do you ship internationally?
A: Currently, PRAG primarily serves customers within Nigeria. For international inquiries, please contact us directly and our team will assess feasibility and provide shipping options.

Q: What payment methods do you accept?
A: We accept bank transfers, card payments (Visa/Mastercard), and USSD payments. For large corporate orders, we also support purchase orders and invoice-based payments.

Q: How do I request technical support?
A: You can request technical support by calling our support line at +2348032170129, emailing sales@prag.global, or submitting a request through the contact form.`,
    lastUpdated: new Date().toISOString(),
  },
  {
    slug: 'shipping-policy',
    title: 'Shipping Policy',
    content: `Shipping Policy

Shipping Areas
We currently ship to all states in Nigeria. Our primary distribution centers are located in Lagos, Abuja, and Port Harcourt to ensure faster delivery times across the country.

Delivery Timeframes
- Lagos & Environs: 1-2 business days for standard delivery
- Major Cities (Abuja, Port Harcourt, Kano, Ibadan): 2-4 business days for standard delivery
- Other States: 3-7 business days for standard delivery

Shipping Costs
Shipping costs are calculated based on the weight and dimensions of your order, as well as your delivery location. The exact shipping cost will be displayed at checkout before you complete your purchase.

Free Shipping on orders above ₦500,000 within Lagos

Order Tracking
Once your order has been shipped, you will receive a confirmation email with a tracking number. You can use this number to track your package's journey to your doorstep through our website or the courier's tracking portal.

Damaged or Lost Packages
If your package arrives damaged or goes missing during transit, please contact our customer support team within 48 hours of the expected delivery date. We will work with the courier to investigate and resolve the issue promptly. You may be eligible for a replacement or full refund.

Delivery & Installation

Delivery
- Available nationwide
- Delivery fees vary by location
- Timelines will be communicated at order confirmation

Installation
- Installation is not mandatory through PRAG
- Customers are responsible for ensuring proper installation

Disclaimer
PRAG is not liable for issues resulting from: Poor installation, Incorrect system configuration, Load mismatch

Contact Us
If you have any questions about our shipping policy, please contact our customer support team at sales@prag.global or call us at +2348032170129.`,
    lastUpdated: new Date().toISOString(),
  },
  {
    slug: 'return-policy',
    title: 'Return Policy',
    content: `Return Policy

Return Eligibility
Returns are accepted only where:
- The product is unused
- The product is in original packaging
- The request is made within 7 days of purchase

Non-Returnable Items
The following are not eligible for return:
- Installed products
- Used or damaged products
- Custom or special-order items

Refunds
Approved returns may be:
- Exchanged, or
- Refunded via the original payment method

Important Notice
Once a product has been installed, it is deemed accepted and cannot be returned.

Contact Us
If you have any questions about our return policy, please contact our customer support team at sales@prag.global or call us at +2348032170129.`,
    lastUpdated: new Date().toISOString(),
  },
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    content: `Privacy Policy

Information We Collect
We may collect the following types of information:
- Personal details (name, email address, phone number)
- Billing and shipping information
- Order and transaction history
- Website usage data (via cookies and analytics tools)

How We Use Your Information
Your information is used to:
- Process and deliver your orders
- Provide customer support
- Improve our products and services
- Send updates, promotions, and important notifications
- Ensure website security and prevent fraud

Sharing Your Information
We do not sell or rent your personal data.
We may share your information with:
- Logistics and delivery partners
- Payment processors
- Service providers assisting in operations

All third parties are required to handle your data securely.

Data Security
We implement appropriate technical and organizational measures to protect your personal data from unauthorized access, loss, or misuse. However, no system is completely secure, and we cannot guarantee absolute security.

Cookies & Tracking Technologies
Our website uses cookies to enhance your browsing experience, analyze traffic, and personalize content. You can manage or disable cookies through your browser settings.

Your Rights
You have the right to:
- Access the personal data we hold about you
- Request corrections or updates
- Request deletion of your data (where applicable)
- Opt out of marketing communications

Data Retention
We retain your information only for as long as necessary to fulfill the purposes outlined in this policy or as required by law.

Updates to This Policy
We may update this Privacy Policy from time to time. Any changes will be posted on this page.

Contact Us
If you have any questions, please contact our customer support team at sales@prag.global or call us at +2348032170129.`,
    lastUpdated: new Date().toISOString(),
  },
  {
    slug: 'terms-of-use',
    title: 'Terms of Use',
    content: `Terms of Use

Terms of Use
Please read these Terms of Use carefully before using this website. By accessing and using this website, you agree to be bound by these terms and all applicable laws and regulations.

Use of Our Website
By using this website, you agree:
- Not to misuse or alter the platform
- Not to copy or reproduce content without permission

All content remains the property of PRAG.

Limitation of Liability
PRAG is not liable for:
- Website interruptions
- Errors in content
- Reliance on website information

Terms of Sale

Orders & Payments
- Orders are subject to confirmation and availability
- Full payment is required before delivery, unless otherwise agreed

Pricing
- Prices may change without notice
- Pricing errors may be corrected at any time

Delivery
- Nationwide delivery is available
- Delivery timelines are estimates and only

Risk Transfer
- Responsibility for products passes to the customer upon delivery
- Customers are advised to inspect items immediately upon receipt

Installation
- Customers may use any qualified installer
- PRAG may recommend installers but is not responsible for third-party installation outcomes

Product Performance
- Performance depends on:
- Installation quality
- System configuration
- Environmental conditions

Warranty Policy

Warranty Coverage
At PRAG (Pragmatic Technologies Ltd.), we stand behind the quality of our products:
- All PRAG inverters: 1-year Limited Warranty
- Lithium Batteries: 5-Year Limited Warranty

This warranty covers manufacturing defects under normal and proper use.

Conditions for Warranty
What Is Not Covered
The warranty does not cover issues arising from:
- Misuse or poor installation
- Incorrect system configuration
- Exposure to water, fire, or physical damage
- Power conditions outside product rating
- Unauthorized repairs or modifications
- Normal wear and tear

Warranty Claims
To make a claim:
- Contact our support team
- Provide proof of purchase
- Allow product inspection

Repairs or replacements will be handled at PRAG's discretion.

General Disclaimer
PRAG products operate within defined specifications. Performance may vary depending on installation, usage, and environmental conditions.

Contact Us
If you have any questions about our terms of use, please contact our customer support team at sales@prag.global or call us at +2348032170129.`,
    lastUpdated: new Date().toISOString(),
  },
];

// In a real implementation, this would be stored in a database
// For now, we'll use in-memory storage with persistence to a file
// eslint-disable-next-line prefer-const
let pages: PageContent[] = [...DEFAULT_PAGES];

export async function GET() {
  return NextResponse.json({ pages });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { slug, title, content } = body;

    if (!slug || !title || content === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, title, content' },
        { status: 400 }
      );
    }

    const pageIndex = pages.findIndex(p => p.slug === slug);
    if (pageIndex === -1) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    // Update the page
    pages[pageIndex] = {
      ...pages[pageIndex],
      title,
      content,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json({ 
      success: true, 
      page: pages[pageIndex] 
    });
  } catch (error) {
    console.error('Failed to update page:', error);
    return NextResponse.json(
      { error: 'Failed to update page' },
      { status: 500 }
    );
  }
}
