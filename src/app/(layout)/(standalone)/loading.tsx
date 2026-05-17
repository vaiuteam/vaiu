import { StandaloneFormSkeleton } from "@/components/loading-skeletons";

export default function Loading() {
  return (
    <div className="w-full max-w-xl animate-in fade-in-0 duration-300 px-4">
      <StandaloneFormSkeleton caption="Preparing workspace utilities" narrow />
    </div>
  );
}
