import { integer, sqliteTable, text, uniqueIndex, index } from "drizzle-orm/sqlite-core";

export const vaults = sqliteTable("vaults", {
  id: text("id").primaryKey(),
  tokenHash: text("token_hash").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const updates = sqliteTable("updates", {
  seq: integer("seq").primaryKey({ autoIncrement: true }),
  vaultId: text("vault_id").notNull(),
  updateId: text("update_id").notNull(),
  iv: text("iv").notNull(),
  objectKey: text("object_key").notNull(),
  cipherLength: integer("cipher_length").notNull(),
  createdAt: integer("created_at").notNull(),
}, (table) => [
  uniqueIndex("idx_updates_vault_update").on(table.vaultId, table.updateId),
  index("idx_updates_vault_seq").on(table.vaultId, table.seq),
]);

export const blobChunks = sqliteTable("blob_chunks", {
  vaultId: text("vault_id").notNull(),
  blobId: text("blob_id").notNull(),
  chunkNo: integer("chunk_no").notNull(),
  iv: text("iv").notNull(),
  objectKey: text("object_key").notNull(),
  createdAt: integer("created_at").notNull(),
}, (table) => [uniqueIndex("idx_blob_chunks_key").on(table.vaultId, table.blobId, table.chunkNo)]);
