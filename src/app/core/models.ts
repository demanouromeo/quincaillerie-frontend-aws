export type Role = 'VENDEUR' | 'GESTIONNAIRE' | 'ADMIN';

export interface LoginRequest {
  login: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: Role;
}

export interface MessageResponse {
  message: string;
}

export interface ChangePasswordRequest {
  ancienMotDePasse: string;
  nouveauMotDePasse: string;
}

export interface UtilisateurRequest {
  nom: string;
  login: string;
  email: string;
  motDePasse: string | null;
  role: Role;
  actif: boolean;
}

export interface UtilisateurResponse {
  id: number;
  nom: string;
  login: string;
  email: string;
  role: Role;
  actif: boolean;
}

export interface CategorieRequest {
  nom: string;
}

export interface CategorieResponse {
  id: number;
  nom: string;
}

export interface ProduitRequest {
  reference: string;
  nom: string;
  categorieId: number | null;
  unite: string;
  prixAchat: number;
  prixVente: number;
  seuilAlerte: number;
  stockActuel: number;
}

export interface ProduitResponse {
  id: number;
  reference: string;
  nom: string;
  categorieId: number | null;
  categorieNom: string | null;
  unite: string;
  prixAchat: number;
  prixVente: number;
  seuilAlerte: number;
  stockActuel: number;
}

export interface FournisseurRequest {
  nom: string;
  contact: string | null;
  adresse: string | null;
}

export interface FournisseurResponse {
  id: number;
  nom: string;
  contact: string | null;
  adresse: string | null;
}

export interface LigneVenteRequest {
  produitId: number;
  quantite: number;
}

export interface LigneVenteResponse {
  produitId: number;
  produitNom: string;
  quantite: number;
  prixVenteUnitaire: number;
  sousTotal: number;
}

export interface VenteRequest {
  lignes: LigneVenteRequest[];
}

export interface VenteResponse {
  id: number;
  dateVente: string;
  vendeurLogin: string;
  montantTotal: number;
  lignes: LigneVenteResponse[];
}

export interface LigneApprovisionnementRequest {
  produitId: number;
  quantite: number;
  prixAchatUnitaire: number;
}

export interface LigneApprovisionnementResponse {
  produitId: number;
  produitNom: string;
  quantite: number;
  prixAchatUnitaire: number;
  sousTotal: number;
}

export interface ApprovisionnementRequest {
  fournisseurId: number;
  lignes: LigneApprovisionnementRequest[];
}

export interface ApprovisionnementResponse {
  id: number;
  dateAppro: string;
  fournisseurId: number;
  fournisseurNom: string;
  gestionnaireLogin: string;
  montantTotal: number;
  lignes: LigneApprovisionnementResponse[];
}

export interface ErrorResponse {
  message: string;
}

export interface ParametresRequest {
  nom: string;
  domaine: string;
  telephone: string;
  ville: string;
  email: string;
}

export interface ParametresResponse {
  nom: string;
  domaine: string;
  telephone: string;
  ville: string;
  email: string;
}
