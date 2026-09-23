"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/input";

export function BusinessSwitcher({
  businesses,
  value,
  basePath,
}: {
  businesses: { id: string; name: string }[];
  value: string;
  basePath: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onChange(nextId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("businessId", nextId);
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <Select value={value} onChange={(e) => onChange(e.target.value)} className="w-auto">
      {businesses.map((b) => (
        <option key={b.id} value={b.id}>{b.name}</option>
      ))}
    </Select>
  );
}
