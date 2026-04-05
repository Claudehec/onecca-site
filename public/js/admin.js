// Admin Dashboard
let currentMemberPage = 0;
let membersPerPage = 20;

async function loadAdminStats() {
    try {
        const members = await api.getMembers({ limit: 1 });
        const users = await api.getUsers();
        const pendingRequests = await api.getPendingRequests();
        
        document.getElementById('totalMembers').textContent = members.total || 0;
        document.getElementById('totalUsers').textContent = users.length || 0;
        document.getElementById('pendingRequests').textContent = pendingRequests.length || 0;
    } catch (error) {
        console.error('Erreur lors du chargement des stats:', error);
    }
}

async function loadMembersList() {
    showLoading();
    try {
        const response = await api.getMembers({ 
            limit: membersPerPage, 
            offset: currentMemberPage * membersPerPage 
        });
        displayMembersTable(response.members);
    } catch (error) {
        showError('Erreur lors du chargement des membres');
    }
    hideLoading();
}

function displayMembersTable(members) {
    const container = document.getElementById('membersTable');
    if (!container) return;
    
    if (members.length === 0) {
        container.innerHTML = '<tr><td colspan="7">Aucun membre trouvé</td></tr>';
        return;
    }
    
    container.innerHTML = members.map(member => `
        <tr>
            <td>${escapeHtml(member.registration_number || '-')}</td>
            <td>${escapeHtml(member.full_name)}</td>
            <td>${getCategoryLabel(member.category)}</td>
            <td>${escapeHtml(member.city || '-')}</td>
            <td>
                <button class="btn btn-outline" onclick="editMember(${member.id})" style="margin-right: 0.5rem;">Modifier</button>
                <button class="btn btn-danger" onclick="deleteMember(${member.id})">Supprimer</button>
            </td>
        </tr>
    `).join('');
}

async function loadPendingRequests() {
    try {
        const requests = await api.getPendingRequests();
        displayRequestsTable(requests);
    } catch (error) {
        console.error('Erreur lors du chargement des demandes:', error);
    }
}

function displayRequestsTable(requests) {
    const container = document.getElementById('requestsTable');
    if (!container) return;
    
    if (requests.length === 0) {
        container.innerHTML = '<tr><td colspan="5">Aucune demande en attente</td></tr>';
        return;
    }
    
    container.innerHTML = requests.map(req => `
        <tr>
            <td>${escapeHtml(req.user_name)}</td>
            <td>${escapeHtml(req.user_email)}</td>
            <td>${escapeHtml(req.member_name)}</td>
            <td>${new Date(req.requested_at).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-success" onclick="approveRequest(${req.id})" style="margin-right: 0.5rem;">Approuver</button>
                <button class="btn btn-danger" onclick="rejectRequest(${req.id})">Rejeter</button>
            </td>
        </tr>
    `).join('');
}

async function approveRequest(requestId) {
    if (!confirm('Confirmer l\'approbation de cette demande ?')) return;
    
    try {
        await api.approveRequest(requestId);
        showSuccess('Demande approuvée avec succès');
        loadPendingRequests();
    } catch (error) {
        showError('Erreur lors de l\'approbation');
    }
}

async function rejectRequest(requestId) {
    if (!confirm('Confirmer le rejet de cette demande ?')) return;
    
    try {
        await api.rejectRequest(requestId);
        showSuccess('Demande rejetée');
        loadPendingRequests();
    } catch (error) {
        showError('Erreur lors du rejet');
    }
}

function showAddMemberModal() {
    const modal = document.getElementById('memberFormModal');
    const modalBody = document.getElementById('memberFormBody');
    
    modalBody.innerHTML = `
        <form id="memberForm">
            <div class="form-group">
                <label>Nom complet *</label>
                <input type="text" name="full_name" required>
            </div>
            <div class="form-group">
                <label>Catégorie *</label>
                <select name="category" required>
                    <option value="liberal">Expert-comptable libéral</option>
                    <option value="societe">Société d'expertise</option>
                    <option value="salarie">Expert-comptable salarié</option>
                    <option value="stagiaire">Stagiaire</option>
                    <option value="gouvernance">Gouvernance</option>
                </select>
            </div>
            <div class="form-group">
                <label>N° d'inscription</label>
                <input type="text" name="registration_number">
            </div>
            <div class="form-group">
                <label>Date d'inscription</label>
                <input type="text" name="registration_date" placeholder="DD/MM/YYYY">
            </div>
            <div class="form-group">
                <label>Ville</label>
                <input type="text" name="city">
            </div>
            <div class="form-group">
                <label>Quartier</label>
                <input type="text" name="quartier">
            </div>
            <div class="form-group">
                <label>Téléphone</label>
                <input type="text" name="phone">
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" name="email">
            </div>
            <div class="form-group">
                <label>Adresse postale</label>
                <input type="text" name="postal_address">
            </div>
            <div class="form-group">
                <label>Adresse ligne 1</label>
                <input type="text" name="address_line1">
            </div>
            <div class="form-group">
                <label>Adresse ligne 2</label>
                <input type="text" name="address_line2">
            </div>
            <div class="form-group">
                <label>Site web</label>
                <input type="url" name="website">
            </div>
        </form>
    `;
    
    modal.classList.add('active');
}

async function saveMember() {
    const form = document.getElementById('memberForm');
    const formData = new FormData(form);
    const memberData = Object.fromEntries(formData.entries());
    
    try {
        await api.createMember(memberData);
        showSuccess('Membre ajouté avec succès');
        document.getElementById('memberFormModal').classList.remove('active');
        loadMembersList();
    } catch (error) {
        showError('Erreur lors de l\'ajout');
    }
}

async function editMember(id) {
    try {
        const member = await api.getMember(id);
        
        const modal = document.getElementById('memberFormModal');
        const modalBody = document.getElementById('memberFormBody');
        
        modalBody.innerHTML = `
            <form id="memberForm">
                <input type="hidden" name="id" value="${member.id}">
                <div class="form-group">
                    <label>Nom complet *</label>
                    <input type="text" name="full_name" value="${escapeHtml(member.full_name || '')}" required>
                </div>
                <div class="form-group">
                    <label>Catégorie *</label>
                    <select name="category" required>
                        <option value="liberal" ${member.category === 'liberal' ? 'selected' : ''}>Expert-comptable libéral</option>
                        <option value="societe" ${member.category === 'societe' ? 'selected' : ''}>Société d'expertise</option>
                        <option value="salarie" ${member.category === 'salarie' ? 'selected' : ''}>Expert-comptable salarié</option>
                        <option value="stagiaire" ${member.category === 'stagiaire' ? 'selected' : ''}>Stagiaire</option>
                        <option value="gouvernance" ${member.category === 'gouvernance' ? 'selected' : ''}>Gouvernance</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>N° d'inscription</label>
                    <input type="text" name="registration_number" value="${escapeHtml(member.registration_number || '')}">
                </div>
                <div class="form-group">
                    <label>Date d'inscription</label>
                    <input type="text" name="registration_date" value="${escapeHtml(member.registration_date || '')}">
                </div>
                <div class="form-group">
                    <label>Ville</label>
                    <input type="text" name="city" value="${escapeHtml(member.city || '')}">
                </div>
                <div class="form-group">
                    <label>Quartier</label>
                    <input type="text" name="quartier" value="${escapeHtml(member.quartier || '')}">
                </div>
                <div class="form-group">
                    <label>Téléphone</label>
                    <input type="text" name="phone" value="${escapeHtml(member.phone || '')}">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value="${escapeHtml(member.email || '')}">
                </div>
                <div class="form-group">
                    <label>Adresse postale</label>
                    <input type="text" name="postal_address" value="${escapeHtml(member.postal_address || '')}">
                </div>
                <div class="form-group">
                    <label>Adresse ligne 1</label>
                    <input type="text" name="address_line1" value="${escapeHtml(member.address_line1 || '')}">
                </div>
                <div class="form-group">
                    <label>Adresse ligne 2</label>
                    <input type="text" name="address_line2" value="${escapeHtml(member.address_line2 || '')}">
                </div>
                <div class="form-group">
                    <label>Site web</label>
                    <input type="url" name="website" value="${escapeHtml(member.website || '')}">
                </div>
            </form>
        `;
        
        modal.classList.add('active');
    } catch (error) {
        showError('Erreur lors du chargement du membre');
    }
}

async function updateMember() {
    const form = document.getElementById('memberForm');
    const formData = new FormData(form);
    const memberData = Object.fromEntries(formData.entries());
    const id = memberData.id;
    delete memberData.id;
    
    try {
        await api.updateMember(id, memberData);
        showSuccess('Membre modifié avec succès');
        document.getElementById('memberFormModal').classList.remove('active');
        loadMembersList();
    } catch (error) {
        showError('Erreur lors de la modification');
    }
}

async function deleteMember(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) return;
    
    try {
        await api.deleteMember(id);
        showSuccess('Membre supprimé avec succès');
        loadMembersList();
    } catch (error) {
        showError('Erreur lors de la suppression');
    }
}

// Initialisation Admin
document.addEventListener('DOMContentLoaded', async () => {
    if (!await auth.checkAuth()) return;
    if (!auth.isAdmin()) {
        window.location.href = '/pages/user-dashboard.html';
        return;
    }
    
    await loadAdminStats();
    await loadMembersList();
    await loadPendingRequests();
    initNavigation();
});