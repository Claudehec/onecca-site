const express = require('express');
const User = require('../models/User');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Obtenir tous les utilisateurs (admin uniquement)
router.get('/', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { limit = 100, offset = 0 } = req.query;
        const users = await User.getAll(parseInt(limit), parseInt(offset));
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
    }
});

// Supprimer un utilisateur (admin uniquement)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const deleted = await User.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        res.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
});

module.exports = router;