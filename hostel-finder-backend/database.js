const sqlite3 = require("sqlite3").verbose();

// Connect to SQLite database (will create hostel.db if it doesn't exist)
const db = new sqlite3.Database("./hostel.db");

// Initialize all database tables
db.serialize(() => {
    // Users table: stores all user accounts (students, owners, admins)
    // role can be: 'student', 'owner', 'admin'
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('student', 'owner', 'admin'))
        )
    `);

    // Hostels table: stores hostel listings
    // is_verified: 0 = unverified, 1 = verified (only verified hostels visible to students)
    // owner_id: foreign key to users table (the hostel owner)
    db.run(`
        CREATE TABLE IF NOT EXISTS hostels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            address TEXT NOT NULL,
            city TEXT NOT NULL,
            rent INTEGER NOT NULL,
            facilities TEXT,
            owner_id INTEGER NOT NULL,
            is_verified INTEGER DEFAULT 0,
            FOREIGN KEY (owner_id) REFERENCES users(id)
        )
    `);

    // Reviews table: stores student reviews for hostels
    // rating: typically 1-5 stars
    // student_id: foreign key to users table (the student who wrote the review)
    // hostel_id: foreign key to hostels table
    db.run(`
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
            comment TEXT,
            hostel_id INTEGER NOT NULL,
            student_id INTEGER NOT NULL,
            FOREIGN KEY (hostel_id) REFERENCES hostels(id),
            FOREIGN KEY (student_id) REFERENCES users(id)
        )
    `);

    // Bookings table: stores booking records
    // status: can be 'pending', 'confirmed', 'cancelled'
    // student_id: foreign key to users table (the student who made the booking)
    // hostel_id: foreign key to hostels table
    db.run(`
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            hostel_id INTEGER NOT NULL,
            student_id INTEGER NOT NULL,
            status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'cancelled')),
            FOREIGN KEY (hostel_id) REFERENCES hostels(id),
            FOREIGN KEY (student_id) REFERENCES users(id)
        )
    `);

    // Seed initial data (Pakistani hostels) if database is empty
    db.get("SELECT COUNT(*) as count FROM users", (err, userRow) => {
        if (err) {
            console.error("Error checking users count:", err);
            return;
        }

        // Only seed when there are no users yet (fresh database)
        if (userRow.count === 0) {
            console.log("Seeding initial users and hostels data...");

            // Create some owner accounts for Pakistani hostels
            const owners = [
                { name: "Ali Khan", email: "ali.owner@example.com", password: "password123", role: "owner" },
                { name: "Sara Ahmed", email: "sara.owner@example.com", password: "password123", role: "owner" },
                { name: "Usman Malik", email: "usman.owner@example.com", password: "password123", role: "owner" }
            ];

            const admin = { name: "Admin", email: "admin.pk@example.com", password: "admin123", role: "admin" };
            const student = { name: "ahad", email: "ahad@gmail.com", password: "1234", role: "student" };

            db.serialize(() => {
                const insertUserStmt = db.prepare(`
                    INSERT INTO users (name, email, password, role)
                    VALUES (?, ?, ?, ?)
                `);

                owners.forEach((o) => {
                    insertUserStmt.run(o.name, o.email, o.password, o.role);
                });
                insertUserStmt.run(admin.name, admin.email, admin.password, admin.role);
                insertUserStmt.run(student.name, student.email, student.password, student.role);
                insertUserStmt.finalize();

                // After inserting users, check if hostels table is empty before seeding hostels
                db.get("SELECT COUNT(*) as count FROM hostels", (err, hostelRow) => {
                    if (err) {
                        console.error("Error checking hostels count:", err);
                        return;
                    }

                    if (hostelRow.count === 0) {
                        // Fetch owner IDs by email so foreign keys are valid
                        db.all(
                            "SELECT id, email FROM users WHERE email IN (?, ?, ?)",
                            [
                                "ali.owner@example.com",
                                "sara.owner@example.com",
                                "usman.owner@example.com"
                            ],
                            (err, ownerRows) => {
                                if (err) {
                                    console.error("Error fetching owner IDs:", err);
                                    return;
                                }

                                const getOwnerId = (email) => {
                                    const row = ownerRows.find((r) => r.email === email);
                                    return row ? row.id : null;
                                };

                                const seedHostels = [
                                    {
                                        name: "Gulberg Boys Hostel",
                                        address: "Near Liberty Market, Gulberg III, Lahore, Punjab, Pakistan",
                                        city: "Lahore",
                                        rent: 15000,
                                        facilities: "Wifi, AC, Laundry, Mess, 24/7 Security",
                                        ownerEmail: "ali.owner@example.com",
                                        is_verified: 1
                                    },
                                    {
                                        name: "Johar Town Student Hostel",
                                        address: "Block R1, Johar Town, Lahore, Punjab, Pakistan",
                                        city: "Lahore",
                                        rent: 12000,
                                        facilities: "Wifi, Mess, Study Room, CCTV",
                                        ownerEmail: "ali.owner@example.com",
                                        is_verified: 1
                                    },
                                    {
                                        name: "DHA Girls Hostel",
                                        address: "Phase 5, DHA, Lahore, Punjab, Pakistan",
                                        city: "Lahore",
                                        rent: 18000,
                                        facilities: "Wifi, AC, Mess, Generator Backup, Laundry",
                                        ownerEmail: "sara.owner@example.com",
                                        is_verified: 1
                                    },
                                    {
                                        name: "G-10 Student Hostel",
                                        address: "Street 43, Sector G-10/2, Islamabad, Pakistan",
                                        city: "Islamabad",
                                        rent: 14000,
                                        facilities: "Wifi, Mess, Hot Water, UPS Backup",
                                        ownerEmail: "usman.owner@example.com",
                                        is_verified: 1
                                    },
                                    {
                                        name: "Blue Area Boys Hostel",
                                        address: "Near Jinnah Avenue, Blue Area, Islamabad, Pakistan",
                                        city: "Islamabad",
                                        rent: 16000,
                                        facilities: "Wifi, AC, Mess, Parking, 24/7 Security",
                                        ownerEmail: "usman.owner@example.com",
                                        is_verified: 0
                                    },
                                    {
                                        name: "University Road Hostel",
                                        address: "Near NIPA Chowrangi, University Road, Karachi, Sindh, Pakistan",
                                        city: "Karachi",
                                        rent: 13000,
                                        facilities: "Wifi, Mess, Laundry, CCTV",
                                        ownerEmail: "sara.owner@example.com",
                                        is_verified: 1
                                    },
                                    {
                                        name: "PECHS Girls Hostel",
                                        address: "Block 6, PECHS, Karachi, Sindh, Pakistan",
                                        city: "Karachi",
                                        rent: 17000,
                                        facilities: "Wifi, AC, Mess, Generator Backup, Housekeeping",
                                        ownerEmail: "sara.owner@example.com",
                                        is_verified: 1
                                    },
                                    {
                                        name: "Saddar Student Lodge",
                                        address: "Near Mall Road, Saddar, Rawalpindi, Punjab, Pakistan",
                                        city: "Rawalpindi",
                                        rent: 11000,
                                        facilities: "Wifi, Mess, Study Room, CCTV",
                                        ownerEmail: "ali.owner@example.com",
                                        is_verified: 0
                                    }
                                ];

                                const insertHostelStmt = db.prepare(`
                                    INSERT INTO hostels (name, address, city, rent, facilities, owner_id, is_verified)
                                    VALUES (?, ?, ?, ?, ?, ?, ?)
                                `);

                                seedHostels.forEach((h) => {
                                    const ownerId = getOwnerId(h.ownerEmail);
                                    if (!ownerId) {
                                        console.error("Missing owner for hostel:", h.name, "ownerEmail:", h.ownerEmail);
                                        return;
                                    }
                                    insertHostelStmt.run(
                                        h.name,
                                        h.address,
                                        h.city,
                                        h.rent,
                                        h.facilities,
                                        ownerId,
                                        h.is_verified
                                    );
                                });

                                insertHostelStmt.finalize(() => {
                                    console.log("Seeded Pakistani hostel data successfully.");
                                });
                            }
                        );
                    }
                });
            });
        }
    });
});

module.exports = db;
