import { requireAdminSession } from "@/lib/auth";
import { getBannedUsers } from "../banned-users-actions";
import BannedUsersClient from "./banned-users-client";

export default async function BannedUsersPage(props: {
  searchParams: Promise<{ page?: string }>;
}) {
  const searchParams = await props.searchParams;
  await requireAdminSession();
  const page = parseInt(searchParams.page || "1", 10);
  const { users, total } = await getBannedUsers(page, 50);

  return <BannedUsersClient initialUsers={users} total={total} currentPage={page} />;
}
