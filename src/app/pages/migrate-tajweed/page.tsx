import { Suspense } from "react";
import MigrateTajweedPage from "../../components/MigrateTajweedPage";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 20 }}>Loading...</div>}>
      <MigrateTajweedPage />
    </Suspense>
  );
}