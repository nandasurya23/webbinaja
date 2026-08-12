import React from 'react';
import { CustomerConfig } from '@/types/config';
import { MAIN_DOMAIN } from '@/lib/customers';

export const JsonLd = ({ config, customerSlug }: { config: CustomerConfig; customerSlug: string }) => {
  if (!config.business) return null;

  // Resolve active domain for structured data URL
  const activeDomain = config.customDomain 
    ? `https://${config.customDomain}` 
    : `https://${customerSlug}.${MAIN_DOMAIN}`;

  // Use business details if available, fallback to config root properties
  const businessName = config.business.name || config.businessName;
  const description = config.business.description || config.description;
  const phone = config.business.phone || config.contact.whatsapp;

  // Choose schema type based on template
  let schemaType = 'LocalBusiness';
  if (config.template === 'restaurant' || config.template === 'bakery' || config.template === 'gamecafe') {
    schemaType = 'FoodEstablishment';
  } else if (config.template === 'professional') {
    schemaType = 'ProfessionalService';
  } else if (config.template === 'barber') {
    schemaType = 'Barbershop';
  }

  const jsonLdData: Record<string, string | string[] | object> = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: businessName,
    description: description,
    url: activeDomain,
    telephone: phone,
  };

  // Add address if provided in business object
  if (config.business.address) {
    jsonLdData.address = {
      '@type': 'PostalAddress',
      streetAddress: config.business.address.streetAddress,
      addressLocality: config.business.address.addressLocality,
      addressRegion: config.business.address.addressRegion,
      postalCode: config.business.address.postalCode,
      addressCountry: config.business.address.addressCountry || 'ID',
    };
  } else if (config.contact.address) {
    // Fallback to simple address string
    jsonLdData.address = config.contact.address;
  }

  // Add opening hours if available
  if (config.business.openingHours && config.business.openingHours.length > 0) {
    jsonLdData.openingHours = config.business.openingHours;
  }

  // Add image if available
  const imgUrl = config.seo?.ogImage || config.images?.hero;
  if (imgUrl) {
    jsonLdData.image = imgUrl;
  }

  // Add social links if available
  const socialLinks = [];
  if (config.contact.instagram) socialLinks.push(config.contact.instagram);
  if (config.contact.facebook) socialLinks.push(config.contact.facebook);
  if (config.contact.tiktok) socialLinks.push(config.contact.tiktok);
  if (config.business.socialLinks) socialLinks.push(...config.business.socialLinks);

  if (socialLinks.length > 0) {
    jsonLdData.sameAs = Array.from(new Set(socialLinks)); // remove duplicates
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
    />
  );
};
