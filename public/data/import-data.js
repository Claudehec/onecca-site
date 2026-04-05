const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration de la base de données
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

// Données extraites du PDF (à compléter)
const membersData = [
    // Experts-comptables libéraux (extraits du PDF)
    {
        registration_number: '182 ECP',
        registration_date: '31/07/2013',
        full_name: 'ABEGE Patrick AGI',
        category: 'liberal',
        postal_address: 'BP: 745 Bda',
        address_line1: 'Opposite Main Market commercial avenue',
        phone: '679 62 69 13, 652 91 13 07',
        email: 'abegepat20@yahoo.com',
        city: 'Bamenda'
    },
    {
        registration_number: '305 ECP',
        registration_date: '17/04/2024',
        full_name: 'ACHU PATRICE MBUH',
        category: 'liberal',
        postal_address: 'BP: 952 Dla',
        address_line1: '301, Résidence le FIGARO derrière Tradex',
        phone: '677 66 63 32',
        email: 'patriceachu@gmail.com',
        city: 'Douala'
    },
    {
        registration_number: '135 ECP',
        registration_date: '21/12/2009',
        full_name: 'ABUNAW Lawrence',
        category: 'liberal',
        postal_address: 'BP: 4649 Dla',
        address_line1: '407 Avenue Générale de Gaulle Bonanjo',
        phone: '233 43 24 43, 233 43 24 45',
        email: 'lawrence.abunaw@gmail.com',
        city: 'Douala'
    },
    {
        registration_number: '028 ECP',
        registration_date: '24/06/1993',
        full_name: 'ACHA Paul NZOGO',
        category: 'liberal',
        postal_address: 'BP: 359 Lbé',
        address_line1: 'Entreprise House, Sokolo',
        phone: '677 73 38 47',
        email: 'pacha1919@yahoo.com',
        city: 'Limbé'
    },
    {
        registration_number: '235 ECP',
        registration_date: '16/06/2017',
        full_name: 'AGUME Eugene',
        category: 'liberal',
        postal_address: 'BP: 2513 Ydé',
        address_line1: 'Nlongkak derrière OAPI, Rue CEPER (1036)',
        phone: '652 62 51 96',
        email: 'agumemambo@yahoo.com',
        city: 'Yaoundé'
    },
    {
        registration_number: '327 ECP',
        registration_date: '02/06/2025',
        full_name: 'ALHADJ MOUHAMMADOU Liman',
        category: 'liberal',
        postal_address: 'BP: 12372 Ydé',
        address_line1: 'Yaoundé, Quartier Mimboman MAETUR',
        phone: '677 34 49 38',
        email: 'almoli2001@yahoo.fr',
        city: 'Yaoundé'
    },
    {
        registration_number: '120 ECP',
        registration_date: '04/09/2008',
        full_name: 'AMBASSA Léonard',
        category: 'liberal',
        postal_address: 'BP: 185 Ydé',
        address_line1: 'Imm. de la Procure au-dessus de la Librairie St Paul',
        phone: '222 22 17 14, 222 23 30 08',
        email: 'ambassacig@yahoo.fr',
        city: 'Yaoundé'
    },
    // Ajoutez ici les autres membres du PDF...
];

// Sociétés
const societiesData = [
    {
        registration_number: '048 SEC',
        registration_date: '04/05/2017',
        full_name: 'ACN & CO',
        category: 'societe',
        postal_address: 'BP: 183 Buéa',
        address_line1: 'MAHAN House Molyko - 1st Floor',
        phone: '676 54 87 77',
        email: 'cawungjia@acncoaccountants.com',
        city: 'Buéa'
    },
    {
        registration_number: '069 SEC',
        registration_date: '17/07/2024',
        full_name: 'AUDIT DE FINANCE & DE GESTION "AFG GROUP" SARL',
        category: 'societe',
        postal_address: 'BP: 13254 Dla',
        address_line1: 'Douala',
        phone: '699 65 23 31',
        email: 'afg_group@yahoo.com',
        city: 'Douala'
    },
    // Ajoutez les autres sociétés...
];

// Stagiaires
const traineesData = [
    {
        registration_number: '024 ECS',
        registration_date: '29/01/2018',
        full_name: 'BOUBAKARY ABASSY',
        category: 'stagiaire',
        phone: '699 05 12 35',
        email: 'boubakaryabb@yahoo.fr',
        city: 'Yaoundé'
    },
    {
        registration_number: '025 ECS',
        registration_date: '17/04/2018',
        full_name: 'ESONE ENONGEN',
        category: 'stagiaire',
        phone: '677 94 11 66',
        email: 'esome2004@yahoo.com',
        city: 'Douala'
    },
    // Ajoutez les autres stagiaires...
];

// Salariés
const employeesData = [
    {
        registration_number: '011 ECNP',
        registration_date: '12/04/2023',
        full_name: 'AGEN TEGWI Racheal',
        category: 'salarie',
        phone: '653 05 10 30',
        email: 'mbahgwei@yahoo.com',
        city: 'Douala'
    },
    {
        registration_number: '014 ECNP',
        registration_date: '12/04/2023',
        full_name: 'ALUNGE NNANGSOPE Gayshan Dione',
        category: 'salarie',
        phone: '670 20 73 77',
        email: 'gayshandione@gmail.com',
        city: 'Douala'
    },
    // Ajoutez les autres salariés...
];

// Gouvernance
const governanceData = [
    { full_name: 'David FOTSO', category: 'gouvernance', city: 'Douala' },
    { full_name: 'TINA POBOU Richard', category: 'gouvernance', city: 'Douala' },
    { full_name: 'NZITSA Michel', category: 'gouvernance', city: 'Yaoundé' },
    { full_name: 'SOHAING TAYOU André', category: 'gouvernance', city: 'Douala' },
    { full_name: 'EWANDE Dorette Germaine', category: 'gouvernance', city: 'Douala' },
    { full_name: 'POUOKAM KOUAM Michaël', category: 'gouvernance', city: 'Douala' },
    { full_name: 'NGUE Remy Emmanuel', category: 'gouvernance', city: 'Douala' },
    { full_name: 'SIMO MAMO Claudine', category: 'gouvernance', city: 'Douala' },
    { full_name: 'NKEN Robert', category: 'gouvernance', city: 'Douala' },
    { full_name: 'FANSI Jean Marie', category: 'gouvernance', city: 'Douala' }
];

async function importData() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connecté à la base de données');
        
        // Nettoyer les tables existantes
        await connection.execute('DELETE FROM access_requests');
        await connection.execute('DELETE FROM members');
        console.log('Tables nettoyées');
        
        // Importer les membres
        const allMembers = [...membersData, ...societiesData, ...traineesData, ...employeesData, ...governanceData];
        
        for (const member of allMembers) {
            const [result] = await connection.execute(
                `INSERT INTO members 
                (registration_number, registration_date, full_name, category, postal_address, 
                 address_line1, phone, email, city) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    member.registration_number || null,
                    member.registration_date || null,
                    member.full_name,
                    member.category,
                    member.postal_address || null,
                    member.address_line1 || null,
                    member.phone || null,
                    member.email || null,
                    member.city || null
                ]
            );
            console.log(`Importé: ${member.full_name}`);
        }
        
        console.log(`Import terminé ! ${allMembers.length} membres importés.`);
        
    } catch (error) {
        console.error('Erreur lors de l\'import:', error);
    } finally {
        if (connection) await connection.end();
    }
}

// Exécuter l'import
importData();