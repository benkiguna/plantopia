import { Suspense } from "react";
import { MobileShell } from "@/components/MobileShell";
import { GardenView } from "@/components/GardenView";
import { SuccessToast } from "@/components/SuccessToast";

export default function HomePage() {
  return (
    <MobileShell title="My Garden">
      <GardenView />
      <Suspense fallback={null}>
        <SuccessToast />
      </Suspense>
    </MobileShell>
  );
}
