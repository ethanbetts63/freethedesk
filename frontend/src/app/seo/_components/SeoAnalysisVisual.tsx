import Image from 'next/image';

/**
 * The sources an audit reads, as one picture in the guides' line-art style: the site on a laptop
 * and a phone on one side, the ranked list on the other, the data flowing between them. It
 * replaced a tile mosaic naming every source (owner, 2026-11-07): twelve tiles read as a product
 * grid and said less than the sentence beside them. The package cards name what each audit reads.
 * Drawn in the guide pictures' frame; the affiliates page shows it too.
 */
export function SeoAnalysisVisual() {
  return (
    <Image
      src="/images/seo/what-google-looks-at.webp"
      alt=""
      width={1536}
      height={1024}
      sizes="(min-width: 1024px) 55vw, 100vw"
      className="aspect-[3/2] h-auto w-full rounded-lg border border-border-default object-cover"
    />
  );
}
