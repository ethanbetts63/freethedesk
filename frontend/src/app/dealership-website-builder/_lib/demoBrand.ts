const FALLBACK_BRAND = "yourdealership";

export function getDemoBrandIdentity(brandName: string, currentUrl = "") {
  const displayName = brandName.trim() || "Your dealership";
  const slug =
    brandName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 18) || FALLBACK_BRAND;
  const enteredAddress = currentUrl
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "");

  return {
    displayName,
    email: `hello@${slug}.com.au`,
    websiteAddress: enteredAddress || `www.${slug}.com.au`,
  };
}
