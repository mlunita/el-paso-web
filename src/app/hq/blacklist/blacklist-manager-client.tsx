"use client";
import { BlacklistClient } from "@/app/(public)/blacklist/blacklist-client";
import { addBlacklistUser, updateBlacklistUser, deleteBlacklistUser, fetchDiscordUser, fetchRobloxUser } from "./actions";

export function BlacklistManagerClient({ initialUsers }: { initialUsers: any }) {
  const handleSaveUser = async (user: any, isNew: boolean) => {
    if (isNew) {
      await addBlacklistUser(user);
    } else {
      await updateBlacklistUser(user.id, user);
    }
  };

  const handleDeleteUser = async (id: string) => {
    await deleteBlacklistUser(id);
  };

  return (
    <BlacklistClient 
      initialUsers={initialUsers} 
      readOnly={false} 
      onSaveUser={handleSaveUser} 
      onDeleteUser={handleDeleteUser} 
      onFetchDiscordUser={fetchDiscordUser}
      onFetchRobloxUser={fetchRobloxUser}
    />
  );
}
