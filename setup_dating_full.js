const { Pool } = require('pg');
require('dotenv').config({ path: '/root/dating-app/.env.local' }); // Use dating app env

const pool = new Pool({
  connectionString: 'postgresql://postgres:new_root_pass_2026@localhost:5433/piata_db',
  ssl: false,
});

const profiles = [
  {
    name: 'Ana (TEST PROFILE)',
    age: 24,
    bio: 'Pasionată de artă digitală și AI. Caut pe cineva cu care să explorez viitorul. 🎨✨ #Artist',
    photos: [
      'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1391498/pexels-photo-1391498.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1382734/pexels-photo-1382734.jpeg?auto=compress&cs=tinysrgb&w=800'
    ]
  },
  {
    name: 'Andrei (TEST PROFILE)',
    age: 29,
    bio: 'Programator și explorator urban. Îmi place să rezolv probleme complexe, inclusiv puzzle-ul inimii tale. 💻🏙️',
    photos: [
      'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1192609/pexels-photo-1192609.jpeg?auto=compress&cs=tinysrgb&w=800'
    ]
  },
  {
    name: 'Elena (TEST PROFILE)',
    age: 26,
    bio: 'Iubitoare de natură și tehnologie sustenabilă. Să plantăm împreună semințele unei relații durabile. 🌱☀️',
    photos: [
      'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=800'
    ]
  },
  {
    name: 'Marius (TEST PROFILE)',
    age: 31,
    bio: 'Antreprenor în serie. Caut o parteneră strategică pentru viață. ROI garantat: iubire și respect. 📈❤️',
    photos: [
      'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/937481/pexels-photo-937481.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=800'
    ]
  },
  {
    name: 'Clara (TEST PROFILE)',
    age: 23,
    bio: 'Studentă la psihologie. Îmi place să citesc oamenii și cărțile. Vrei să fim pe aceeași pagină? 📚🧠',
    photos: [
      'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=800'
    ]
  }
];

async function setup() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Creating/Updating tables...');

    // 1. Matches Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS matches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user1_id UUID NOT NULL,
        user2_id UUID NOT NULL,
        status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, rejected
        initiated_by UUID NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user1_id, user2_id)
      );
    `);

    // 2. Messages Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        match_id UUID NOT NULL, -- Link to match (optional fk if match deleted?)
        sender_id UUID NOT NULL,
        receiver_id UUID, -- Optional, derived from match
        content TEXT NOT NULL,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 3. Profiles (Refresh)
    // Clear old test profiles to avoid duplicates or mixed languages
    await client.query("DELETE FROM dating_profiles WHERE name LIKE '%(TEST PROFILE)'");

    for (const p of profiles) {
      await client.query(`
        INSERT INTO dating_profiles (name, age, bio, photos, user_id)
        VALUES ($1, $2, $3, $4, gen_random_uuid())
      `, [p.name, p.age, p.bio, p.photos]);
    }

    await client.query('COMMIT');
    console.log('Setup complete: Tables created, Romanian profiles inserted.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error:', err);
  } finally {
    client.release();
    pool.end();
  }
}

setup();
