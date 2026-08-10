export interface Service {
  name: string;
  price: string;
  desc?: string;
}

export interface Testimonial {
  name: string;
  text: string;
}

export interface CustomerConfig {
  package: 'basic' | 'pro' | 'custom';
  businessName: string;
  tagline: string;
  description: string;
  template: 'barber' | 'restaurant' | 'professional' | 'bakery' | 'rental' | 'gamecafe' | 'gym' | 'petshop' | 'custom';
  customDomain?: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  contact: {
    whatsapp: string;
    address: string;
    mapsLink: string;
    instagram?: string;
    facebook?: string;
  };
  services: Service[];
  catalog?: {
    name: string;
    price: string;
    desc?: string;
    image: string;
  }[];
  testimonials?: Testimonial[];
  images?: {
    hero?: string;
    gallery?: string[];
    ambiance?: string;
  };
}
