import Banner from "../components/Banner";
import ProductGrid from "../components/ProductGrid";

const SUPABASE_URL = "https://tivmmjeukvkwlydvunqr.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpdm1tamV1a3Zrd2x5ZHZ1bnFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4OTI5MTAsImV4cCI6MjA3NDQ2ODkxMH0.SxnQ5jvy4y9Hl97n3R-cLnQT69MLU9narXtM_5cGM_c";

export default async function Page() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/products?select=*`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      next: { revalidate: 3600 },
    }
  );
  const products = res.ok ? await res.json() : [];

  return (
    <div>
      <Banner />
      <ProductGrid products={products} />
    </div>
  );
}
