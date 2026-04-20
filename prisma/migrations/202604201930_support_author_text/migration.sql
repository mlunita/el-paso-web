-- Add custom author text storage for support entries
ALTER TABLE "SupportEntry" ADD COLUMN "authorName" TEXT;

UPDATE "SupportEntry" AS "SupportEntry"
SET "authorName" = COALESCE("User"."name", "User"."email", 'El Paso RP Team')
FROM "User"
WHERE "SupportEntry"."authorId" = "User"."id";

UPDATE "SupportEntry"
SET "authorName" = COALESCE("authorName", 'El Paso RP Team');

ALTER TABLE "SupportEntry"
ALTER COLUMN "authorName" SET NOT NULL;

ALTER TABLE "SupportEntry"
ALTER COLUMN "authorId" DROP NOT NULL;

ALTER TABLE "SupportEntry" DROP CONSTRAINT "SupportEntry_authorId_fkey";

ALTER TABLE "SupportEntry"
ADD CONSTRAINT "SupportEntry_authorId_fkey"
FOREIGN KEY ("authorId") REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
