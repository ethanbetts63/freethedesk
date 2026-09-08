import Image from "next/image";

export function GoogleLogo({ size = 28 }: { size?: number }) {
  return <Image src="/google-icon.svg" alt="" width={size} height={size} />;
}
