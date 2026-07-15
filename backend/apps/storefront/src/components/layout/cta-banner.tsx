import { getActiveCustomer } from "@/lib/vendure/actions";
import { CtaBannerContent } from "@/components/layout/cta-banner-content";

export async function CtaBanner() {
  const customer = await getActiveCustomer();

  return <CtaBannerContent isLoggedIn={!!customer} />;
}
