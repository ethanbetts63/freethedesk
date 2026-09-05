import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to the Free the Desk dealer portal or staff dashboard.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
