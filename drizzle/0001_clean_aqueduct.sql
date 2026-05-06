ALTER TABLE "trips" ADD COLUMN "public_report_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "public_report_token" text;--> statement-breakpoint
CREATE UNIQUE INDEX "trips_public_report_token_unique" ON "trips" USING btree ("public_report_token");