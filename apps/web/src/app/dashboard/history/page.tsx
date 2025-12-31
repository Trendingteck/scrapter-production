"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import HistoryData from "@/components/dashboard/HistoryData";

export default function HistoryPage() {
  const searchParams = useSearchParams();
  const runIdFromQuery = searchParams.get("runId");
  const [selectedRunId, setSelectedRunId] = useState<string | null>(
    runIdFromQuery,
  );

  return (
    <HistoryData selectedRunId={selectedRunId} onSelectRun={setSelectedRunId} />
  );
}
