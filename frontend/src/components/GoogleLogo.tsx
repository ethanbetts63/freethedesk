import Image from "next/image";

import GoogleIcon from "../../assets/google-icon.svg";

export function GoogleLogo({ size = 28 }: { size?: number }) {
  return <Image src={GoogleIcon} alt="" width={size} height={size} />;
}
