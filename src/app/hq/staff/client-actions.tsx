"use client";

import { deleteStaff } from "@/app/hq/actions";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function DeleteStaffAction({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this staff member?")) {
      setIsDeleting(true);
      await deleteStaff(id);
      setIsDeleting(false);
    }
  };

  return (
    <Button 
      size="sm" 
      onClick={handleDelete} 
      disabled={isDeleting}
      className="bg-red-600 hover:bg-red-500 text-white"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </Button>
  );
}
