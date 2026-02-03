
export const VENDOR_OPTIONS = [
  { id: "COSTCO", name: "Costco Wholesale", logo: '/vendors/Costco-Logo.png'},
  { id: "ALDI", name: "ALDI U.S.", logo: '/vendors/Aldi-Logo.png' },
  { id: "TARGET", name: "Target" , logo: '/vendors/Target-Logo.png'},
  { id: "WALMART", name: "Walmart", logo: '/vendors/Walmart-Logo.png' },
] as const;

export const PRODUCT_CATEGORIES = {
    CHICKEN: ['WINGS', 'DRUMSTICKS', 'BREASTS', 'WHOLE CHICKEN'],
    BEEF:    ['PATTIES', 'SHORT RIBS','RIBEYE STEAKS', 'SIRLOINS STEAKS'],
} as const;

export type MainCategory = keyof typeof PRODUCT_CATEGORIES;

export const PRODUCT_IMAGES: Record<string, string> = {
    'WINGS': '/products/chicken wings.webp',
    'DRUMSTICKS': '/products/chicken drumsticks.webp',
    'BREASTS': '/products/chicken breasts.webp',
    'WHOLE CHICKEN': '/products/whole chicken.webp',
    'PATTIES': '/products/beef patties.webp',
    'SHORT RIBS': '/products/beef short ribs.webp',
    'RIBEYE STEAKS': '/products/beef ribeye steak.webp',
    'SIRLOINS STEAKS': '/products/beef sirloin steaks.webp',
}