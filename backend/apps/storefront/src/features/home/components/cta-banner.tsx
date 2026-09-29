import { getActiveCustomer } from "@/features/auth/server";
import { CtaBannerContent } from "@/features/home/components/cta-banner-content";

export async function CtaBanner() {
  const customer = await getActiveCustomer();

  return <CtaBannerContent isLoggedIn={!!customer} />;
}
