"use client";

import { togglePublishPost, deletePost } from "@/app/admin/actions";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PostActions({ id, published }: { id: string; published: boolean }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
    setIsUpdating(true);
    await togglePublishPost(id, !published);
    setIsUpdating(false);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this post?")) {
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
        {published ? "Unpublish" : "Publish"}
      </Button>
      <Button 
        size="sm" 
        onClick={handleDelete} 
        disabled={isUpdating}
        className="bg-red-600 hover:bg-red-500 text-white"
      >
        Delete
      </Button>
    </div>
  );
}
