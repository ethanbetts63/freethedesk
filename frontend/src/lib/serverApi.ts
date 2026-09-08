import type { PublicSiteSettings } from "./api";

   
                                                                                
                                                                        
  
                                                                              
                                                                 
  
                                                                   
   
export async function getSiteSettingsServer(): Promise<PublicSiteSettings> {
  const base = process.env.DJANGO_API_URL ?? "http://127.0.0.1:8000";
  const response = await fetch(`${base}/api/site-settings/`, { next: { revalidate: 300 } });
  if (!response.ok) throw new Error(`Site settings request failed with ${response.status}.`);
  return response.json();
}

export { formatPrice } from "./api";
