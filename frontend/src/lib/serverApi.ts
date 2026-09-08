import type { PublicSiteSettings } from "./api";

   
                                                                                
                                                                        
  
                                                                              
                                                                 
  
                                                                   
   
/**
 * Pricing is read fresh on every request rather than cached, so a change in the
 * admin is live immediately. This also means the pages that call it never
 * prerender, which is deliberate: the production build no longer fails when the
 * Django API is unreachable. Their route files set `dynamic = "force-dynamic"`
 * to make that explicit rather than leaving it implied by this fetch option.
 */
export async function getSiteSettingsServer(): Promise<PublicSiteSettings> {
  const base = process.env.DJANGO_API_URL ?? "http://127.0.0.1:8000";
  const response = await fetch(`${base}/api/site-settings/`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Site settings request failed with ${response.status}.`);
  return response.json();
}

export { formatPrice } from "./api";
