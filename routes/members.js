const express = require('express');
const Member = require('../models/Member');
const AccessRequest = require('../models/AccessRequest');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Obtenir tous les membres (avec filtres)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { category, city, search, limit = 50, offset = 0 } = req.query;
        
        const filters = {};
        if (category) filters.category = category;
        if (city) filters.city = city;
        if (search) filters.search = search;
        
        const members = await Member.getAll(filters, parseInt(limit), parseInt(offset));
        
        // Masquer les coordonnées privées
        const membersWithLimitedInfo = members.map(member => ({
            id: member.id,
            registration_number: member.registration_number,
            registration_date: member.registration_date,
            full_name: member.full_name,
            category: member.category,
            city: member.city,
            quartier: member.quartier,
            has_private_info: true
        }));
        
        res.json({
            members: membersWithLimitedInfo,
            total: await Member.count(filters),
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des membres' });
    }
});

// Obtenir les détails d'un membre
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const member = await Member.getById(req.params.id);
        if (!member) {
            return res.status(404).json({ error: 'Membre non trouvé' });
        }
        
        const hasAccess = await AccessRequest.hasAccess(req.user.id, member.id);
        
        if (hasAccess || req.user.role === 'admin') {
            // Données complètes
            res.json(member);
        } else {
            // Données limitées
            const { phone, email, postal_address, address_line1, address_line2, website, ...limitedMember } = member;
            res.json({
                ...limitedMember,
                requires_access: true,
                message: 'Demandez l\'accès pour voir les coordonnées complètes'
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération du membre' });
    }
});

// Créer un membre (admin uniquement)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
    try {
        const memberData = { ...req.body, created_by: req.user.id };
        const memberId = await Member.create(memberData);
        const newMember = await Member.getById(memberId);
        res.status(201).json(newMember);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la création du membre' });
    }
});

// Mettre à jour un membre (admin uniquement)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const updated = await Member.update(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({ error: 'Membre non trouvé' });
        }
        const member = await Member.getById(req.params.id);
        res.json(member);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
});

// Supprimer un membre (admin uniquement)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const deleted = await Member.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Membre non trouvé' });
        }
        res.json({ message: 'Membre supprimé avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
});

// Obtenir les catégories et villes pour les filtres
router.get('/filters/categories', authenticateToken, async (req, res) => {
    try {
        const categories = await Member.getCategories();
        res.json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des catégories' });
    }
});

router.get('/filters/cities', authenticateToken, async (req, res) => {
    try {
        const cities = await Member.getCities();
        res.json(cities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des villes' });
    }
});

module.exports = router;