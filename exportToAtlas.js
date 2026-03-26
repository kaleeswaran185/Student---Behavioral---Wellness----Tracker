/**
 * Migration Script: Local MongoDB → MongoDB Atlas
 * Run: node exportToAtlas.js
 */
const mongoose = require('mongoose');

const LOCAL_URI = 'mongodb://localhost:27017/student_wellness';
const ATLAS_URI = 'mongodb+srv://kaleeswaranm185_db_user:kalees185@student-welness.c7tnoqx.mongodb.net/student_wellness?retryWrites=true&w=majority&appName=student-welness';

async function migrate() {
    console.log('🔌 Connecting to local MongoDB...');
    const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log('✅ Connected to local MongoDB');

    console.log('🔌 Connecting to MongoDB Atlas...');
    const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
    console.log('✅ Connected to MongoDB Atlas');

    // Get all collections from local DB
    const collections = await localConn.db.listCollections().toArray();
    console.log(`\n📦 Found ${collections.length} collections: ${collections.map(c => c.name).join(', ')}\n`);

    let totalMigrated = 0;

    for (const col of collections) {
        const name = col.name;
        console.log(`⏳ Migrating collection: ${name}`);

        const docs = await localConn.db.collection(name).find({}).toArray();
        
        if (docs.length === 0) {
            console.log(`   ⚠️  No documents found in ${name}, skipping.`);
            continue;
        }

        // Drop existing collection in Atlas before inserting (clean migration)
        try {
            await atlasConn.db.collection(name).drop();
            console.log(`   🗑️  Cleared existing ${name} in Atlas`);
        } catch (e) {
            // Collection might not exist yet, that's fine
        }

        await atlasConn.db.collection(name).insertMany(docs);
        console.log(`   ✅ Migrated ${docs.length} documents → ${name}`);
        totalMigrated += docs.length;
    }

    console.log(`\n🎉 Migration complete! Total documents migrated: ${totalMigrated}`);

    await localConn.close();
    await atlasConn.close();
    process.exit(0);
}

migrate().catch((err) => {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
});
