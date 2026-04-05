-- Création de la base de données
CREATE DATABASE IF NOT EXISTS onecca_db;
USE onecca_db;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role ENUM('admin', 'user') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des membres (experts-comptables, sociétés, stagiaires)
CREATE TABLE IF NOT EXISTS members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    registration_number VARCHAR(50),
    registration_date VARCHAR(50),
    full_name VARCHAR(255) NOT NULL,
    category ENUM('liberal', 'societe', 'salarie', 'stagiaire', 'gouvernance') DEFAULT 'liberal',
    postal_address VARCHAR(255),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    phone VARCHAR(255),
    email VARCHAR(255),
    website VARCHAR(255),
    city VARCHAR(100),
    quartier VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Table des demandes d'accès aux coordonnées
CREATE TABLE IF NOT EXISTS access_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    member_id INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    approved_by INT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (member_id) REFERENCES members(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    UNIQUE KEY unique_request (user_id, member_id)
);

-- Insertion de l'admin par défaut (email: admin@onecca.cm, mot de passe: Admin123!)
INSERT INTO users (email, password, full_name, role) VALUES 
('admin@onecca.cm', '$2b$10$YourHashedPasswordHere', 'Administrateur ONECCA', 'admin');

-- Insertion des données extraites du PDF (échantillon - à compléter avec le script d'import)
INSERT INTO members (registration_number, registration_date, full_name, category, postal_address, address_line1, phone, email, city) VALUES
('182 ECP', '31/07/2013', 'ABEGE Patrick AGI', 'liberal', 'BP: 745 Bda', 'Opposite Main Market commercial avenue', '679 62 69 13, 652 91 13 07', 'abegepat20@yahoo.com', 'Bamenda'),
('305 ECP', '17/04/2024', 'ACHU PATRICE MBUH', 'liberal', 'BP: 952 Dla', '301, Résidence le FIGARO derrière Tradex', '677 66 63 32', 'patriceachu@gmail.com', 'Douala'),
('135 ECP', '21/12/2009', 'ABUNAW Lawrence', 'liberal', 'BP: 4649 Dla', '407 Avenue Générale de Gaulle Bonanjo', '233 43 24 43, 233 43 24 45', 'lawrence.abunaw@gmail.com', 'Douala'),
('028 ECP', '24/06/1993', 'ACHA Paul NZOGO', 'liberal', 'BP: 359 Lbé', 'Entreprise House, Sokolo', '677 73 38 47', 'pacha1919@yahoo.com', 'Limbé');

-- Insertion des sociétés
INSERT INTO members (registration_number, registration_date, full_name, category, postal_address, address_line1, phone, email, city) VALUES
('048 SEC', '04/05/2017', 'ACN & CO', 'societe', 'BP: 183 Buéa', 'MAHAN House Molyko - 1st Floor', '676 54 87 77', 'cawungjia@acncoaccountants.com', 'Buéa'),
('069 SEC', '17/07/2024', 'AUDIT DE FINANCE & DE GESTION "AFG GROUP" SARL', 'societe', 'BP: 13254 Dla', 'Douala', '699 65 23 31', 'afg_group@yahoo.com', 'Douala');

-- Insertion des stagiaires
INSERT INTO members (registration_number, registration_date, full_name, category, phone, email, city) VALUES
('024 ECS', '29/01/2018', 'BOUBAKARY ABASSY', 'stagiaire', '699 05 12 35', 'boubakaryabb@yahoo.fr', 'Yaoundé'),
('025 ECS', '17/04/2018', 'ESONE ENONGEN', 'stagiaire', '677 94 11 66', 'esome2004@yahoo.com', 'Douala');

-- Insertion des salariés
INSERT INTO members (registration_number, registration_date, full_name, category, phone, email, city) VALUES
('011 ECNP', '12/04/2023', 'AGEN TEGWI Racheal', 'salarie', '653 05 10 30', 'mbahgwei@yahoo.com', 'Douala'),
('014 ECNP', '12/04/2023', 'ALUNGE NNANGSOPE Gayshan Dione', 'salarie', '670 20 73 77', 'gayshandione@gmail.com', 'Douala');

-- Insertion gouvernance
INSERT INTO members (full_name, category, city) VALUES
('David FOTSO', 'gouvernance', 'Douala'),
('TINA POBOU Richard', 'gouvernance', 'Douala'),
('NZITSA Michel', 'gouvernance', 'Yaoundé');

SELECT 'Base de données créée avec succès !' as message;