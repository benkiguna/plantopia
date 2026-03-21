import { MobileShell } from "@/components/MobileShell";
import { AddPlantFlow } from "@/components/add-plant";

export default function AddPlantPage() {
  return (
    <MobileShell title="Add Plant" showBack>
      <div className="px-4 py-2">
        <AddPlantFlow />
      </div>
    </MobileShell>
  );
}
