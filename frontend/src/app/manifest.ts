import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'freethedesk',
    short_name: 'freethedesk',
    description:
      'Websites, SEO reports and business automation for Perth businesses, plus dealership websites and online vehicle licensing.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0b64d6',
    icons: [
      { src: '/logo-48x48.png', sizes: '48x48', type: 'image/png' },
      { src: '/logo-96x96.png', sizes: '96x96', type: 'image/png' },
      { src: '/logo-144x144.png', sizes: '144x144', type: 'image/png' },
      { src: '/logo-180x180.png', sizes: '180x180', type: 'image/png' },
      { src: '/logo-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/logo-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
