const db = require('../config/database');
const bcrypt = require('bcrypt');

class User {
    static async create(userData) {
        const { email, password, full_name, phone, role = 'user' } = userData;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await db.execute(
            'INSERT INTO users (email, password, full_name, phone, role) VALUES (?, ?, ?, ?, ?)',
            [email, hashedPassword, full_name, phone, role]
        );
        return result.insertId;
    }

    static async findByEmail(email) {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT id, email, full_name, phone, role, is_active, created_at FROM users WHERE id = ?', [id]);
        return rows[0];
    }

    static async getAll(limit = 100, offset = 0) {
        const [rows] = await db.execute(
            'SELECT id, email, full_name, phone, role, is_active, created_at FROM users WHERE role = "user" ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [limit, offset]
        );
        return rows;
    }

    static async delete(id) {
        const [result] = await db.execute('DELETE FROM users WHERE id = ? AND role = "user"', [id]);
        return result.affectedRows;
    }

    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
}

module.exports = User;