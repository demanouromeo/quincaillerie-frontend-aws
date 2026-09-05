import { DatePipe } from '@angular/common';
import { Component, inject, input, output, signal } from '@angular/core';

import { ParametresService } from '../../core/api/parametres.service';
import { ParametresResponse, VenteResponse } from '../../core/models';

// Repris si /api/parametres n'a pas encore repondu au moment de l'impression
// (le recu s'affiche des la vente validee ; l'appel peut etre en cours) —
// memes valeurs par defaut que le seed backend (V6__parametres_magasin_nom_domaine.sql),
// pour qu'il n'y ait pas de flash de contenu different dans le cas courant.
const PARAMETRES_PAR_DEFAUT: ParametresResponse = {
  nom: 'QUINCAILLERIE MVOGT',
  domaine: 'Materiaux de construction & quincaillerie generale',
  telephone: '+237 677 28 29 27',
  ville: 'Yaounde',
  email: 'qmvogt@gmail.com'
};

// Meme marquage que public/logo.svg, duplique ici en dur plutot que
// charge par URL : la fenetre d'impression est peuplee via document.write
// sur un document sans veritable navigation HTTP, ou un <img src="..."> —
// meme vers une image du meme serveur — peut echouer a charger (verifie :
// fetch() y leve "Failed to fetch"). Un SVG inline elimine toute
// dependance reseau pour ce document autonome.
const LOGO_SVG = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Quincaillerie Mvogt">
  <rect x="3" y="3" width="94" height="94" rx="16" fill="#1e2126"/>
  <polygon points="50,15 78,31 78,65 50,81 22,65 22,31"
           fill="none" stroke="#e4581c" stroke-width="4.5" stroke-linejoin="round"/>
  <circle cx="50" cy="15" r="4" fill="#e4581c"/>
  <g transform="rotate(-45 50 48)">
    <rect x="46.5" y="22" width="7" height="44" rx="2.5" fill="#f2ede2"/>
    <rect x="37" y="16" width="26" height="13" rx="2.5" fill="#f2ede2"/>
    <circle cx="50" cy="22.5" r="2" fill="#e4581c"/>
  </g>
  <g transform="rotate(45 50 48)">
    <rect x="46.5" y="26" width="7" height="40" rx="2.5" fill="#b8430f"/>
    <path d="M38 15 a5 5 0 0 1 5 -5 h14 a5 5 0 0 1 5 5 a7 7 0 0 1 -3 6 a10 10 0 0 1 -18 0 a7 7 0 0 1 -3 -6 z"
          fill="#b8430f"/>
  </g>
</svg>`;

@Component({
  selector: 'app-receipt-view',
  imports: [DatePipe],
  templateUrl: './receipt-view.html',
  styleUrl: './receipt-view.scss'
})
export class ReceiptView {
  private readonly parametresService = inject(ParametresService);

  readonly vente = input.required<VenteResponse>();
  readonly clientNom = input<string>('');
  readonly fermer = output<void>();

  protected readonly parametres = signal<ParametresResponse>(PARAMETRES_PAR_DEFAUT);

  constructor() {
    this.parametresService.recuperer().subscribe({
      next: (reponse) => this.parametres.set(reponse),
      // Pas bloquant : le recu reste imprimable avec les valeurs par defaut.
      error: () => undefined
    });
  }

  /**
   * Imprime dans une fenetre separee, dont le document ne contient QUE le
   * recu — plutot que d'essayer de masquer le reste de la page avec du CSS
   * @media print. Cette derniere approche a ete tentee mais garde un defaut
   * intrinseque : `visibility: hidden` ne retire pas les elements masques
   * du flux, donc la hauteur totale de la page (produits, panier, etc.)
   * reste celle de l'ecran point de vente — l'impression genere alors des
   * pages en plus (vides ou partielles) autour du recu au lieu d'un ticket
   * seul. Une fenetre dediee, sans aucun autre element du DOM de l'appli,
   * elimine ce probleme a la racine.
   */
  protected imprimer(): void {
    const fenetre = window.open('about:blank', '_blank', 'width=420,height=720');
    if (!fenetre) {
      return;
    }

    fenetre.document.open();
    fenetre.document.write(this.construireHtmlImpression());
    fenetre.document.close();

    fenetre.onafterprint = () => fenetre.close();

    // Laisser le temps a la fenetre de mettre en page le contenu (et de
    // charger le logo) avant d'imprimer : appeler print() immediatement
    // apres document.write peut declencher l'impression avant la fin du
    // rendu dans certains navigateurs.
    setTimeout(() => {
      fenetre.focus();
      fenetre.print();
    }, 200);
  }

  private construireHtmlImpression(): string {
    const vente = this.vente();
    const parametres = this.parametres();

    const clientRow = this.clientNom()
      ? `<div class="row"><span>Client</span><span>${this.echapper(this.clientNom())}</span></div>`
      : '';

    const lignes = vente
      .lignes.map(
        (ligne) => `
        <div class="ligne">
          <span class="ligne-nom">${this.echapper(ligne.produitNom)}</span>
          <span class="ligne-detail">
            ${ligne.quantite} x ${ligne.prixVenteUnitaire}
            <span class="ligne-total">${ligne.sousTotal}</span>
          </span>
        </div>`
      )
      .join('');

    return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<title>Recu vente #${vente.id}</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 20px; font-family: 'Consolas', 'Courier New', monospace; font-size: 12px; color: #111; }
  .header { text-align: center; }
  .header svg { width: 46px; height: 46px; margin-bottom: 8px; }
  .store { margin: 0; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
  .slogan { margin: 3px 0 0; font-size: 10px; color: #555; font-style: italic; }
  .contact { margin: 8px 0 0; font-size: 10px; color: #555; line-height: 1.5; }
  .rule { border-top: 1px dashed #999; margin: 12px 0; }
  .summary { font-size: 11.5px; }
  .row { display: flex; justify-content: space-between; gap: 12px; margin: 3px 0; }
  .row span:first-child { color: #666; }
  .row span:last-child { font-weight: 600; text-align: right; }
  .ligne { margin: 8px 0; }
  .ligne-nom { display: block; font-weight: 600; }
  .ligne-detail { display: flex; justify-content: space-between; color: #444; margin-top: 2px; }
  .ligne-total { color: #111; font-weight: 600; }
  .total { display: flex; justify-content: space-between; font-weight: 700; font-size: 14px; }
  .footer { margin-top: 10px; text-align: center; font-size: 10.5px; color: #555; }
  @page { margin: 8mm; }
</style>
</head>
<body>
  <div class="header">
    ${LOGO_SVG}
    <p class="store">${this.echapper(parametres.nom)}</p>
    <p class="slogan">${this.echapper(parametres.domaine)}</p>
    <div class="contact">
      <div>${this.echapper(parametres.ville)}</div>
      <div>Tel : ${this.echapper(parametres.telephone)}</div>
      <div>${this.echapper(parametres.email)}</div>
    </div>
  </div>
  <div class="rule"></div>
  <div class="summary">
    <div class="row"><span>Vente</span><span>#${vente.id}</span></div>
    <div class="row"><span>Date</span><span>${this.formaterDate(vente.dateVente)}</span></div>
    <div class="row"><span>Vendeur</span><span>${this.echapper(vente.vendeurLogin)}</span></div>
    ${clientRow}
  </div>
  <div class="rule"></div>
  ${lignes}
  <div class="rule"></div>
  <div class="total"><span>Total</span><span>${vente.montantTotal} FCFA</span></div>
  <div class="rule"></div>
  <p class="footer">Merci de votre achat.</p>
</body>
</html>`;
  }

  private formaterDate(dateIso: string): string {
    const date = new Date(dateIso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  private echapper(valeur: string): string {
    const div = document.createElement('div');
    div.textContent = valeur;
    return div.innerHTML;
  }
}
