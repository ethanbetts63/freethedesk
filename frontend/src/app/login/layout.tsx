import type { Metadata } from "next";

import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to the freethedesk dealer portal or staff dashboard.",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
