"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteSupportCategory, deleteSupportEntry } from "@/app/hq/actions";

export function DeleteSupportCategoryAction({ id, name }: { id: string; name: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete "${name}"?`)) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteSupportCategory(id);
      toast.success("Category deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete category");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button size="sm" onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-500 text-white">
      {isDeleting ? "Deleting..." : "Delete"}
    </Button>
  );
}

export function DeleteSupportEntryAction({ id, title }: { id: string; title: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete "${title}"?`)) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteSupportEntry(id);
      toast.success("Entry deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete entry");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button size="sm" onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-500 text-white">
      {isDeleting ? "Deleting..." : "Delete"}
    </Button>
  );
}
