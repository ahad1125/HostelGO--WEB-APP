const mysql = require("mysql2/promise");

// Railway MySQL configuration
// Support both Railway auto-provided vars and custom vars
const dbConfig = {
    host: process.env.DB_HOST || process.env.MYSQLHOST,
    user: process.env.DB_USER || process.env.MYSQLUSER,
    password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
    database: process.env.DB_NAME || process.env.MYSQLDATABASE,
    port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};

// Log configuration (without password) for debugging
console.log("🔧 Database Config:", {
    host: dbConfig.host,
    user: dbConfig.user,
    database: dbConfig.database,
    port: dbConfig.port,
    hasPassword: !!dbConfig.password
});

const pool = mysql.createPool(dbConfig);

// Add error handler for pool
pool.on('connection', (connection) => {
    console.log('🔌 New MySQL connection established');
});

pool.on('error', (err) => {
    console.error('❌ MySQL pool error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error('Database connection was lost.');
    }
    if (err.code === 'ECONNREFUSED') {
        console.error('Database connection was refused. Check if MySQL is running.');
    }
});

// Test database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        await connection.query("SELECT 1 as test");
        connection.release();
        console.log("✅ Database connection test successful");
        return true;
    } catch (err) {
        console.error("❌ Database connection test failed:", err.message);
        throw err;
    }
}

// Initialize tables ONLY (no DB creation)
async function initializeDatabase() {
    // First test the connection
    await testConnection();
    
    const connection = await pool.getConnection();
    try {
        // USERS
        await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('student','owner','admin') NOT NULL,
        contact_number VARCHAR(20)
      )
    `);

        // HOSTELS
        await connection.query(`
      CREATE TABLE IF NOT EXISTS hostels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        city VARCHAR(255) NOT NULL,
        rent INT NOT NULL,
        facilities TEXT,
        owner_id INT NOT NULL,
        contact_number VARCHAR(20),
        is_verified TINYINT(1) DEFAULT 0,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

        // REVIEWS
        await connection.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        rating INT NOT NULL,
        comment TEXT,
        hostel_id INT NOT NULL,
        student_id INT NOT NULL,
        FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

        // BOOKINGS
        await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        hostel_id INT NOT NULL,
        student_id INT NOT NULL,
        status ENUM('pending','confirmed','cancelled') DEFAULT 'pending',
        FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

        // ENQUIRIES
        await connection.query(`
      CREATE TABLE IF NOT EXISTS enquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        hostel_id INT NOT NULL,
        student_id INT NOT NULL,
        type ENUM('enquiry','schedule_visit') NOT NULL,
        message TEXT,
        scheduled_date DATETIME,
        reply TEXT,
        status ENUM('pending','responded') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        replied_at TIMESTAMP NULL,
        FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

        // SEED ONLY ONCE
        const [[{ count }]] = await connection.query(
            "SELECT COUNT(*) AS count FROM users"
        );

        if (count === 0) {
            await connection.query(
                "INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",
                ["Admin", "admin.pk@example.com", "admin123", "admin"]
            );
        }

        console.log("✅ Database initialized on Railway");
        
        // Verify tables exist
        const [tables] = await connection.query("SHOW TABLES");
        console.log("📊 Tables created:", tables.map(t => Object.values(t)[0]).join(", "));
        
    } catch (err) {
        console.error("❌ DB init failed:", err);
        console.error("Error code:", err.code);
        console.error("Error SQL state:", err.sqlState);
        throw err;
    } finally {
        connection.release();
    }
}

// Database ready promise - export this so server can wait
let dbReady = false;
const dbReadyPromise = initializeDatabase()
    .then(() => {
        dbReady = true;
        console.log("✅ Database ready!");
        return true;
    })
    .catch((err) => {
        console.error("❌ Database initialization failed!");
        console.error("Error details:", err.message);
        console.error("Full error:", err);
        console.error("\n💡 Check Railway environment variables:");
        console.error("   - MYSQLHOST or DB_HOST");
        console.error("   - MYSQLUSER or DB_USER");
        console.error("   - MYSQLPASSWORD or DB_PASSWORD");
        console.error("   - MYSQLDATABASE or DB_NAME");
        console.error("   - MYSQLPORT or DB_PORT");
        process.exit(1);
    });

module.exports = pool;
module.exports.ready = dbReadyPromise;
module.exports.isReady = () => dbReady;
