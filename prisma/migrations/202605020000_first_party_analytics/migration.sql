-- Create first-party analytics tables.
CREATE TABLE "AnalyticsVisitor" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "country" TEXT,
    "region" TEXT,
    "city" TEXT,
    "timezone" TEXT,
    "language" TEXT,
    "deviceType" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsVisitor_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AnalyticsSession" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "entryPath" TEXT,
    "exitPath" TEXT,
    "referrer" TEXT,
    "source" TEXT NOT NULL DEFAULT 'direct',
    "medium" TEXT NOT NULL DEFAULT 'none',
    "campaign" TEXT,
    "country" TEXT,
    "region" TEXT,
    "city" TEXT,
    "deviceType" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "language" TEXT,
    "timezone" TEXT,

    CONSTRAINT "AnalyticsSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AnalyticsPageView" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "title" TEXT,
    "referrer" TEXT,
    "country" TEXT,
    "region" TEXT,
    "city" TEXT,
    "deviceType" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "language" TEXT,
    "timezone" TEXT,
    "viewportWidth" INTEGER,
    "viewportHeight" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsPageView_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT,
    "sessionId" TEXT,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "path" TEXT,
    "label" TEXT,
    "value" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AnalyticsWebVital" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT,
    "sessionId" TEXT,
    "metricId" TEXT,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "delta" DOUBLE PRECISION,
    "rating" TEXT,
    "navigationType" TEXT,
    "path" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsWebVital_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AnalyticsVisitor_clientId_key" ON "AnalyticsVisitor"("clientId");
CREATE INDEX "AnalyticsVisitor_firstSeenAt_idx" ON "AnalyticsVisitor"("firstSeenAt");
CREATE INDEX "AnalyticsVisitor_lastSeenAt_idx" ON "AnalyticsVisitor"("lastSeenAt");
CREATE INDEX "AnalyticsVisitor_country_idx" ON "AnalyticsVisitor"("country");
CREATE INDEX "AnalyticsVisitor_deviceType_idx" ON "AnalyticsVisitor"("deviceType");

CREATE UNIQUE INDEX "AnalyticsSession_sessionId_key" ON "AnalyticsSession"("sessionId");
CREATE INDEX "AnalyticsSession_startedAt_idx" ON "AnalyticsSession"("startedAt");
CREATE INDEX "AnalyticsSession_lastSeenAt_idx" ON "AnalyticsSession"("lastSeenAt");
CREATE INDEX "AnalyticsSession_source_medium_idx" ON "AnalyticsSession"("source", "medium");
CREATE INDEX "AnalyticsSession_country_idx" ON "AnalyticsSession"("country");
CREATE INDEX "AnalyticsSession_deviceType_idx" ON "AnalyticsSession"("deviceType");

CREATE INDEX "AnalyticsPageView_createdAt_idx" ON "AnalyticsPageView"("createdAt");
CREATE INDEX "AnalyticsPageView_path_createdAt_idx" ON "AnalyticsPageView"("path", "createdAt");
CREATE INDEX "AnalyticsPageView_country_createdAt_idx" ON "AnalyticsPageView"("country", "createdAt");
CREATE INDEX "AnalyticsPageView_deviceType_createdAt_idx" ON "AnalyticsPageView"("deviceType", "createdAt");
CREATE INDEX "AnalyticsPageView_visitorId_createdAt_idx" ON "AnalyticsPageView"("visitorId", "createdAt");
CREATE INDEX "AnalyticsPageView_sessionId_createdAt_idx" ON "AnalyticsPageView"("sessionId", "createdAt");

CREATE INDEX "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt");
CREATE INDEX "AnalyticsEvent_name_createdAt_idx" ON "AnalyticsEvent"("name", "createdAt");
CREATE INDEX "AnalyticsEvent_category_createdAt_idx" ON "AnalyticsEvent"("category", "createdAt");
CREATE INDEX "AnalyticsEvent_path_createdAt_idx" ON "AnalyticsEvent"("path", "createdAt");

CREATE INDEX "AnalyticsWebVital_createdAt_idx" ON "AnalyticsWebVital"("createdAt");
CREATE INDEX "AnalyticsWebVital_name_createdAt_idx" ON "AnalyticsWebVital"("name", "createdAt");
CREATE INDEX "AnalyticsWebVital_rating_createdAt_idx" ON "AnalyticsWebVital"("rating", "createdAt");
CREATE INDEX "AnalyticsWebVital_path_createdAt_idx" ON "AnalyticsWebVital"("path", "createdAt");

ALTER TABLE "AnalyticsSession" ADD CONSTRAINT "AnalyticsSession_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "AnalyticsVisitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AnalyticsPageView" ADD CONSTRAINT "AnalyticsPageView_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "AnalyticsVisitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AnalyticsPageView" ADD CONSTRAINT "AnalyticsPageView_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AnalyticsSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "AnalyticsVisitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AnalyticsSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AnalyticsWebVital" ADD CONSTRAINT "AnalyticsWebVital_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "AnalyticsVisitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AnalyticsWebVital" ADD CONSTRAINT "AnalyticsWebVital_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AnalyticsSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
