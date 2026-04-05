const express = require('express');
const AccessRequest = require('../models/AccessRequest');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Demander l'accès à un membre
router.post('/:memberId', authenticateToken, async (req, res) => {
    try {
        const existingRequest = await AccessRequest.getByUserAndMember(req.user.id, req.params.memberId);
        
        if (existingRequest) {
            if (existingRequest.status === 'pending') {
                return res.status(400).json({ error: 'Demande déjà en attente' });
            }
            if (existingRequest.status === 'approved') {
                return res.status(400).json({ error: 'Accès déjà accordé' });
            }
        }
        
        const requestId = await AccessRequest.create(req.user.id, req.params.memberId);
        res.status(201).json({ 
            message: 'Demande d\'accès envoyée avec succès',
            request_id: requestId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la création de la demande' });
    }
});

// Obtenir mes demandes d'accès
router.get('/my/requests', authenticateToken, async (req, res) => {
    try {
        const requests = await AccessRequest.getByUser(req.user.id);
        res.json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des demandes' });
    }
});

// Admin : obtenir toutes les demandes en attente
router.get('/admin/pending', authenticateToken, isAdmin, async (req, res) => {
    try {
        const requests = await AccessRequest.getAllPending();
        res.json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des demandes' });
    }
});

// Admin : approuver une demande
router.put('/admin/:requestId/approve', authenticateToken, isAdmin, async (req, res) => {
    try {
        const approved = await AccessRequest.approve(req.params.requestId, req.user.id);
        if (!approved) {
            return res.status(404).json({ error: 'Demande non trouvée' });
        }
        res.json({ message: 'Demande approuvée avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de l\'approbation' });
    }
});

// Admin : rejeter une demande
router.put('/admin/:requestId/reject', authenticateToken, isAdmin, async (req, res) => {
    try {
        const rejected = await AccessRequest.reject(req.params.requestId);
        if (!rejected) {
            return res.status(404).json({ error: 'Demande non trouvée' });
        }
        res.json({ message: 'Demande rejetée' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors du rejet' });
    }
});

module.exports = router;