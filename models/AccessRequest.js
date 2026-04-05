const db = require('../config/database');

class AccessRequest {
    static async create(userId, memberId) {
        const [result] = await db.execute(
            'INSERT INTO access_requests (user_id, member_id) VALUES (?, ?)',
            [userId, memberId]
        );
        return result.insertId;
    }

    static async getByUserAndMember(userId, memberId) {
        const [rows] = await db.execute(
            'SELECT * FROM access_requests WHERE user_id = ? AND member_id = ?',
            [userId, memberId]
        );
        return rows[0];
    }

    static async getByUser(userId) {
        const [rows] = await db.execute(
            `SELECT ar.*, m.full_name, m.registration_number, m.category 
             FROM access_requests ar
             JOIN members m ON ar.member_id = m.id
             WHERE ar.user_id = ?
             ORDER BY ar.requested_at DESC`,
            [userId]
        );
        return rows;
    }

    static async getAllPending() {
        const [rows] = await db.execute(
            `SELECT ar.*, u.full_name as user_name, u.email as user_email, 
                    m.full_name as member_name, m.registration_number
             FROM access_requests ar
             JOIN users u ON ar.user_id = u.id
             JOIN members m ON ar.member_id = m.id
             WHERE ar.status = 'pending'
             ORDER BY ar.requested_at ASC`,
            []
        );
        return rows;
    }

    static async approve(id, adminId) {
        const [result] = await db.execute(
            'UPDATE access_requests SET status = "approved", approved_at = NOW(), approved_by = ? WHERE id = ?',
            [adminId, id]
        );
        return result.affectedRows;
    }

    static async reject(id) {
        const [result] = await db.execute(
            'UPDATE access_requests SET status = "rejected" WHERE id = ?',
            [id]
        );
        return result.affectedRows;
    }

    static async hasAccess(userId, memberId) {
        const [rows] = await db.execute(
            'SELECT * FROM access_requests WHERE user_id = ? AND member_id = ? AND status = "approved"',
            [userId, memberId]
        );
        return rows.length > 0;
    }
}

module.exports = AccessRequest;