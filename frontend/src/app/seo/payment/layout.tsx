import { AuthProvider } from "@/context/AuthContext";

/* Checkout is signed-in territory, so the auth context starts here rather than
   in the root layout - the marketing pages that link into it do not need it. */
export default function SeoPaymentLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
