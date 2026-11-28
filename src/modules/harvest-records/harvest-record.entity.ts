import { harvestRecordsTable } from "@/db/schema";

export type HarvestRecordDatabaseRow = typeof harvestRecordsTable.$inferSelect;