-- Improve duplicate submission detection lookups
CREATE INDEX IF NOT EXISTS "submissions_widget_id_ip_hash_created_at_idx"
ON "submissions"("widget_id", "ip_hash", "created_at")
WHERE "deleted_at" IS NULL;

-- Improve analytics metadata filtering
CREATE INDEX IF NOT EXISTS "analytics_events_metadata_gin_idx"
ON "analytics_events" USING GIN ("metadata" jsonb_path_ops);

-- Improve soft-deleted workspace filtering
CREATE INDEX IF NOT EXISTS "workspaces_deleted_at_idx"
ON "workspaces"("deleted_at");
