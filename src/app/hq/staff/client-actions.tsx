"use client";

import { deleteStaff } from "@/app/hq/actions";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n-provider";

export function DeleteStaffAction({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { t } = useI18n();

  const handleDelete = async () => {
    if (confirm(t.admin.staff.confirmDelete)) {
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
      {isDeleting ? t.common.deleting : t.common.delete}
    </Button>
  );
}
