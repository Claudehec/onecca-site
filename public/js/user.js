// Page d'accueil utilisateur
let currentFilters = {
    search: '',
    category: '',
    city: '',
    limit: 20,
    offset: 0
};

let totalMembers = 0;

async function loadMembers() {
    showLoading();
    try {
        const response = await api.getMembers(currentFilters);
        totalMembers = response.total;
        displayMembers(response.members);
        updatePagination();
    } catch (error) {
        showError('Erreur lors du chargement des membres');
    }
    hideLoading();
}

function displayMembers(members) {
    const container = document.getElementById('membersContainer');
    if (!container) return;

    if (members.length === 0) {
        container.innerHTML = '<div class="alert alert-info">Aucun membre trouvé</div>';
        return;
    }

    container.innerHTML = members.map(member => `
        <div class="member-card">
            <h3>${escapeHtml(member.full_name)}</h3>
            <span class="badge badge-${member.category}">${getCategoryLabel(member.category)}</span>
            <p><strong>N°:</strong> ${member.registration_number || '-'}</p>
            <p><strong>Ville:</strong> ${member.city || '-'}</p>
            <p><strong>Quartier:</strong> ${member.quartier || '-'}</p>
            <button onclick="viewMember(${member.id})" class="btn btn-outline" style="margin-top: 1rem; width: 100%;">
                Voir détails
            </button>
        </div>
    `).join('');
}

function getCategoryLabel(category) {
    const labels = {
        'liberal': 'Expert-comptable libéral',
        'societe': 'Société d\'expertise',
        'salarie': 'Expert-comptable salarié',
        'stagiaire': 'Stagiaire',
        'gouvernance': 'Gouvernance'
    };
    return labels[category] || category;
}

async function viewMember(id) {
    try {
        const member = await api.getMember(id);
        
        const modal = document.getElementById('memberModal');
        const modalBody = document.getElementById('modalBody');
        
        let contactInfo = '';
        if (member.phone || member.email || member.postal_address) {
            contactInfo = `
                <div class="card" style="margin-top: 1rem;">
                    <div class="card-header">Coordonnées</div>
                    ${member.phone ? `<p><strong>Téléphone:</strong> ${member.phone}</p>` : ''}
                    ${member.email ? `<p><strong>Email:</strong> ${member.email}</p>` : ''}
                    ${member.postal_address ? `<p><strong>Adresse postale:</strong> ${member.postal_address}</p>` : ''}
                    ${member.address_line1 ? `<p><strong>Adresse:</strong> ${member.address_line1}</p>` : ''}
                    ${member.website ? `<p><strong>Site web:</strong> <a href="${member.website}" target="_blank">${member.website}</a></p>` : ''}
                </div>
            `;
        }
        
        modalBody.innerHTML = `
            <h2>${escapeHtml(member.full_name)}</h2>
            <p><strong>Catégorie:</strong> ${getCategoryLabel(member.category)}</p>
            <p><strong>N° d'inscription:</strong> ${member.registration_number || '-'}</p>
            <p><strong>Date d'inscription:</strong> ${member.registration_date || '-'}</p>
            <p><strong>Ville:</strong> ${member.city || '-'}</p>
            <p><strong>Quartier:</strong> ${member.quartier || '-'}</p>
            ${contactInfo}
            ${member.requires_access ? `
                <div class="alert alert-info" style="margin-top: 1rem;">
                    <strong>Accès restreint</strong><br>
                    Pour voir les coordonnées complètes de ce membre, veuillez faire une demande d'accès.
                    <button onclick="requestMemberAccess(${member.id})" class="btn btn-primary" style="margin-top: 0.5rem;">
                        Demander l'accès
                    </button>
                </div>
            ` : ''}
        `;
        
        modal.classList.add('active');
    } catch (error) {
        showError('Erreur lors du chargement des détails');
    }
}

async function requestMemberAccess(memberId) {
    try {
        await api.requestAccess(memberId);
        showSuccess('Demande d\'accès envoyée. L\'administrateur va la traiter.');
        setTimeout(() => {
            document.getElementById('memberModal').classList.remove('active');
        }, 2000);
    } catch (error) {
        showError(error.message);
    }
}

async function loadFilters() {
    try {
        const [categories, cities] = await Promise.all([
            api.getCategories(),
            api.getCities()
        ]);
        
        const categorySelect = document.getElementById('categoryFilter');
        const citySelect = document.getElementById('cityFilter');
        
        if (categorySelect) {
            categorySelect.innerHTML = '<option value="">Toutes les catégories</option>' +
                categories.map(cat => `<option value="${cat.category}">${getCategoryLabel(cat.category)} (${cat.count})</option>`).join('');
        }
        
        if (citySelect) {
            citySelect.innerHTML = '<option value="">Toutes les villes</option>' +
                cities.map(city => `<option value="${city.city}">${city.city} (${city.count})</option>`).join('');
        }
    } catch (error) {
        console.error('Erreur lors du chargement des filtres:', error);
    }
}

function searchMembers() {
    currentFilters.search = document.getElementById('searchInput')?.value || '';
    currentFilters.category = document.getElementById('categoryFilter')?.value || '';
    currentFilters.city = document.getElementById('cityFilter')?.value || '';
    currentFilters.offset = 0;
    loadMembers();
}

function updatePagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(totalMembers / currentFilters.limit);
    const currentPage = Math.floor(currentFilters.offset / currentFilters.limit) + 1;
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '<div style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 2rem;">';
    
    if (currentPage > 1) {
        html += `<button class="btn btn-outline" onclick="goToPage(${currentPage - 1})">Précédent</button>`;
    }
    
    html += `<span style="padding: 0.5rem 1rem;">Page ${currentPage} / ${totalPages}</span>`;
    
    if (currentPage < totalPages) {
        html += `<button class="btn btn-outline" onclick="goToPage(${currentPage + 1})">Suivant</button>`;
    }
    
    html += '</div>';
    pagination.innerHTML = html;
}

function goToPage(page) {
    currentFilters.offset = (page - 1) * currentFilters.limit;
    loadMembers();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
    if (!await auth.checkAuth()) return;
    
    await loadFilters();
    await loadMembers();
    initNavigation();
});