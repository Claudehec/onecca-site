const db = require('../config/database');

class Member {
    static async create(memberData) {
        const {
            registration_number, registration_date, full_name, category,
            postal_address, address_line1, address_line2, phone,
            email, website, city, quartier, created_by
        } = memberData;

        const [result] = await db.execute(
            `INSERT INTO members 
            (registration_number, registration_date, full_name, category, postal_address, 
             address_line1, address_line2, phone, email, website, city, quartier, created_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [registration_number, registration_date, full_name, category, postal_address,
             address_line1, address_line2, phone, email, website, city, quartier, created_by]
        );
        return result.insertId;
    }

    static async getAll(filters = {}, limit = 100, offset = 0) {
        let query = 'SELECT * FROM members WHERE status = "active"';
        const params = [];

        if (filters.category) {
            query += ' AND category = ?';
            params.push(filters.category);
        }
        if (filters.city) {
            query += ' AND city = ?';
            params.push(filters.city);
        }
        if (filters.search) {
            query += ' AND (full_name LIKE ? OR registration_number LIKE ? OR city LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        query += ' ORDER BY full_name ASC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [rows] = await db.execute(query, params);
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.execute('SELECT * FROM members WHERE id = ?', [id]);
        return rows[0];
    }

    static async update(id, memberData) {
        const fields = [];
        const values = [];

        const allowedFields = ['registration_number', 'registration_date', 'full_name', 'category',
                               'postal_address', 'address_line1', 'address_line2', 'phone',
                               'email', 'website', 'city', 'quartier', 'status'];

        for (const field of allowedFields) {
            if (memberData[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(memberData[field]);
            }
        }

        if (fields.length === 0) return 0;

        values.push(id);
        const [result] = await db.execute(
            `UPDATE members SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await db.execute('DELETE FROM members WHERE id = ?', [id]);
        return result.affectedRows;
    }

    static async count(filters = {}) {
        let query = 'SELECT COUNT(*) as total FROM members WHERE status = "active"';
        const params = [];

        if (filters.category) {
            query += ' AND category = ?';
            params.push(filters.category);
        }
        if (filters.city) {
            query += ' AND city = ?';
            params.push(filters.city);
        }

        const [rows] = await db.execute(query, params);
        return rows[0].total;
    }

    static async getCategories() {
        const [rows] = await db.execute(
            'SELECT DISTINCT category, COUNT(*) as count FROM members WHERE status = "active" GROUP BY category'
        );
        return rows;
    }

    static async getCities() {
        const [rows] = await db.execute(
            'SELECT DISTINCT city, COUNT(*) as count FROM members WHERE city IS NOT NULL AND status = "active" GROUP BY city ORDER BY count DESC LIMIT 20'
        );
        return rows;
    }
}

module.exports = Member;