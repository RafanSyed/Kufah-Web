import { Suspense } from "react";
import MigrateFiqhPage from "../../components/MigrateFiqhPage";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 20 }}>Loading...</div>}>
      <MigrateFiqhPage />
    </Suspense>
  );
}