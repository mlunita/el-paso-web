-- Add optional Discord profile linkage for staff members.
ALTER TABLE "StaffMember" ADD COLUMN "discordId" TEXT;
