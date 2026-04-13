"use client";

import { updateApplicationStatus } from "@/app/admin/actions";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ApplicationActions({ id, currentStatus }: { id: string; currentStatus: string }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatus = async (status: string) => {
    setIsUpdating(true);
    await updateApplicationStatus(id, status);
    setIsUpdating(false);
  };

  return (
    <div className="flex gap-2">
      <Button 
        size="sm" 
        onClick={() => handleStatus("APPROVED")} 
        disabled={isUpdating || currentStatus === "APPROVED"}
        className="bg-green-600 hover:bg-green-500 text-white"
      >
        Approve
      </Button>
      <Button 
        size="sm" 
        onClick={() => handleStatus("REJECTED")} 
        disabled={isUpdating || currentStatus === "REJECTED"}
        className="bg-red-600 hover:bg-red-500 text-white"
      >
        Reject
      </Button>
      <Button 
        size="sm" 
        onClick={() => handleStatus("REVIEWED")} 
        disabled={isUpdating || currentStatus === "REVIEWED"}
        className="bg-yellow-600 hover:bg-yellow-500 text-white"
      >
        Mark Reviewed
      </Button>
    </div>
  );
}
