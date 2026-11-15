/** How to reach freethedesk, as the contact page and the call booking section show it. */
export const CONTACT = {
  phone: '0423 853 830',
  phoneHref: 'tel:+61423853830',
  email: 'hello@freethedesk.com.au',
  emailHref: 'mailto:hello@freethedesk.com.au',
  based: 'Dianella, Perth WA',
} as const;

/**
 * The Google rating the site shows, with no review count (owner's choice, 2026-11-15). Typed, not
 * fetched: when a review arrives, check the profile and change `rating` if it moved, so the
 * badge never claims more than Google shows. 5.0 from 3 reviews on 2026-11-15. The link is the
 * Maps listing, by its CID.
 */
export const GOOGLE_RATING = {
  rating: '5.0',
  reviewsUrl: 'https://maps.google.com/?cid=1789607743995245540',
} as const;
