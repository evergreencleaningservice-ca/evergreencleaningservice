export const site = {
  name: 'Evergreen Office Cleaning',
  /* The business renamed itself: 2023 captures title every page "… - Evergreen
     Cleaning Service", 2025 captures title them "… - Evergreen Office
     Cleaning". `name` is the current one and is what titles use; `legalName`
     is kept for the few places the old name is still the copy. */
  legalName: 'Evergreen Cleaning Service',
  url: 'https://www.evergreencleaningservice.ca',
  tagline: 'Leaders in Commercial Cleaning and Building Maintenance in Toronto and the GTA',
  description:
    'Looking for commercial cleaning, office cleaning or janitorial services in Toronto and the GTA? Visit us to learn more about our services.',
  phone: '(416) 803-4880',
  // The original writes `tel://416-803-4880`. The `//` turns the number into a
  // URL authority, so it is dropped here; the digits are otherwise untouched,
  // which is what every `tel:` link on the old site dials.
  phoneHref: 'tel:416-803-4880',
  email: 'evergreencleaning416@gmail.com',
  logo: '/images/cropped-evergreen-cleaning-toronto-logo-banner.jpg',
  since: 1989,
  gtmId: 'GTM-5PRC4HBV',
} as const;

export const social = [
  { name: 'Facebook', href: 'https://www.facebook.com/Evergreen-Cleaning-Service-104007224426820' },
  { name: 'Twitter', href: 'https://twitter.com/EvergreenClean8/' },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/company/evergreen-cleaning-service-toronto/' },
] as const;

/** Footer service-area list, in the order the original site shows it. */
export const footerAreas = [
  'Toronto',
  'Greater Toronto Area',
  'Mississauga',
  'Etobicoke',
  'Richmond Hill',
  'Markham',
  'Vaughan',
  'Scarborough',
] as const;

/** Longer service-area line used in the contact section. */
export const serviceAreas =
  'Toronto, East York, Etobicoke, North York, Scarborough, York, Mississauga, Vaughan, Brampton, Markham, Oakville, Richmond Hill';

export type NavItem = {
  label: string;
  href?: string;
  children?: NavItem[];
};

export const nav: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: `Call Now: ${site.phone}`, href: site.phoneHref },
  {
    label: 'About',
    href: '/about-us/',
    children: [
      { label: 'Green Clean Products', href: '/green-clean-products/' },
      { label: 'Submit Your Testimonial', href: '/testimonials/' },
    ],
  },
  {
    label: 'Services',
    children: [
      { label: 'Disinfection Cleaning', href: '/services/disinfection-cleaning-service/' },
      { label: 'Office Cleaning', href: '/services/office-cleaning/' },
      { label: 'Emergency Cleaning', href: '/services/emergency-cleaning-services/' },
      { label: 'Commercial Cleaning', href: '/services/commercial-cleaning/' },
      { label: 'Industrial Cleaning', href: '/services/industrial-cleaning/' },
      {
        label: 'Property Management and Building Maintenance',
        href: '/services/building-maintenance/',
      },
    ],
  },
  { label: 'Blog', href: '/category/blog/' },
  { label: 'Contact Us', href: '/contact-us/' },
];
