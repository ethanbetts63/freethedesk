import Image from "next/image";

export type PortfolioImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
};

/**
 * The chrome-less browser mockup every case-study screenshot sits in. Shared by
 * the hero, the media features and the tour so the frame only exists once.
 */
export function BrowserFrame({
  image,
  browserUrl,
  hero = false,
}: {
  image: PortfolioImage;
  browserUrl: string;
  hero?: boolean;
}) {
  return (
    <div className={`case-browser${hero ? " case-browser-hero" : ""}`}>
      <div className="case-browser-bar">
        <i />
        <i />
        <i />
        <span>{browserUrl}</span>
      </div>
      <Image
        key={image.src}
        className={image.className}
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        priority={hero}
      />
    </div>
  );
}
