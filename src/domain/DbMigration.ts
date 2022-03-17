import { pool } from "../domain/DbConnection.js";

export interface DbMigration {
    version: number;
    statements: Array<string>;
}

const migrations: Array<DbMigration> = [
    {
        version: 0.1,
        statements: [
            "ALTER TABLE help_for_ukraine.person ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false"
        ]
    }
];

export const runMigrations = async (targetVersion: number): Promise<void> => {
    console.log("Checking DB Version");

    const result = await pool.query("SELECT MAX(version_number) as version_number FROM help_for_ukraine.version");
    const version = result.rows.length ? (result.rows[0].version_number ?? 0) : 0;

    console.log(`Found DB version number ${version}`);

    const migrationsToRun = migrations.filter(m => m.version > version);

    for (const migration of migrationsToRun) {
        console.log(`Running migrations for version ${migration.version}`);

        for (const query of migration.statements) {
            console.log(`Running query '${query}'`);
            await pool.query(query);
        }
    }

    console.log(`Setting version number '${targetVersion}'`);
    await pool.query("INSERT INTO help_for_ukraine.version (version_number) VALUES ($1) ON CONFLICT DO NOTHING", [ targetVersion ]);
};