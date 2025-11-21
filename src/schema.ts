import { sqliteTable, text } from "drizzle-orm/sqlite-core";

// D1 / SQLite テーブル: Scoopマニフェスト保存
export const manifests = sqliteTable("manifests", {
	name: text("name").primaryKey(),
	version: text("version").notNull(),
	manifest_json: text("manifest_json").notNull(), // JSON文字列
	created_at: text("created_at").notNull(),
	updated_at: text("updated_at").notNull(),
});

// 生成予定のSQL (参考)
// CREATE TABLE IF NOT EXISTS manifests (
//   name TEXT PRIMARY KEY,
//   version TEXT NOT NULL,
//   manifest_json TEXT NOT NULL,
//   created_at TEXT NOT NULL,
//   updated_at TEXT NOT NULL
// );