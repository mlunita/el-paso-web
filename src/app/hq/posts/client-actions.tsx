"use client";

import { togglePublishPost, deletePost } from "@/app/hq/actions";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n-provider";

export function PostActions({ id, published }: { id: string; published: boolean }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { t } = useI18n();

  const handleToggle = async () => {
    setIsUpdating(true);
    await togglePublishPost(id, !published);
    setIsUpdating(false);
  };

  const handleDelete = async () => {
    if (confirm(t.admin.posts.confirmDelete)) {
      setIsUpdating(true);
      await deletePost(id);
      setIsUpdating(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Button 
        size="sm" 
        onClick={handleToggle} 
        disabled={isUpdating}
        className={published ? "bg-yellow-600 hover:bg-yellow-500 text-white" : "bg-green-600 hover:bg-green-500 text-white"}
      >
        {published ? t.admin.posts.unpublish : t.admin.posts.publish}
      </Button>
      <Button 
        size="sm" 
        onClick={handleDelete} 
        disabled={isUpdating}
        className="bg-red-600 hover:bg-red-500 text-white"
      >
        {t.common.delete}
      </Button>
    </div>
  );
}
