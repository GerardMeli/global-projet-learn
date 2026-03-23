// src/app/agriculture/agriculture.component.ts
import { Component, OnInit, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-agriculture',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agriculture-component.html',
  styleUrl: './agriculture-component.scss',
})
export class AgricultureComponent implements OnInit, AfterViewInit, OnDestroy {

  // ── État navbar ─────────────────────────────────────────────────────────
  navScrolled   = false;
  menuOpen      = false;
  activeSection = 'accueil';

  // ── État chat ───────────────────────────────────────────────────────────
  chatOpen   = false;
  chatLoaded = false;
  chatIframeSrc = '';

  // ── Config ──────────────────────────────────────────────────────────────
  private readonly CHAT_BASE_URL  = 'http://web-chat.connecttechnology.io';
  private readonly CHAT_REDIRECT  = '/private/1';
  private readonly AGRI_API_URL   = 'http://web-agriculture.connecttechnology.io';
  private readonly TOKEN_KEYS     = ['access_token', 'token', 'jwt', 'authToken'];

  // ── Sections pour scroll-spy ─────────────────────────────────────────────
  readonly sections = ['accueil', 'produits', 'methodes', 'territoire', 'contact'];

  // ── Reveal observer ──────────────────────────────────────────────────────
  private revealObserver!: IntersectionObserver;

  // ── Resize & drag state ──────────────────────────────────────────────────
  private isResizing = false;
  private isDragging = false;
  private rX = 0; private rY = 0; private rW = 0; private rH = 0;
  private dX = 0; private dY = 0; private pR = 0; private pB = 0;

  // ── Formulaire ───────────────────────────────────────────────────────────
  formSubmitting  = false;
  formSuccess     = false;

  // ── Produits data ────────────────────────────────────────────────────────
  readonly produits = [
    { cls: 'p1', emoji: '🌾', cat: 'Céréales',           titre: 'Blé tendre & Épeautre',    desc: 'Variétés ancestrales sélectionnées pour leur goût et leur robustesse. Cultivées sans intrants chimiques de synthèse.',   tags: ['Sans glyphosate', 'Semences locales'] },
    { cls: 'p2', emoji: '🫒', cat: 'Oléagineux',          titre: 'Tournesol & Colza',         desc: 'Huiles vierges de première pression extraites à froid pour préserver tous les arômes et nutriments.',                   tags: ['Pression à froid', 'Non OGM'] },
    { cls: 'p3', emoji: '🥬', cat: 'Maraîchage',          titre: 'Légumes de saison',         desc: 'Production en rotation sur nos parcelles maraîchères. Récoltes hebdomadaires disponibles en panier direct.',             tags: ['Saison', 'Circuit court'] },
    { cls: 'p4', emoji: '🌿', cat: 'Plantes aromatiques', titre: 'Herbes & Infusions',        desc: 'Lavande, thym, mélisse et romarin cultivés en bordure de parcelles pour favoriser la biodiversité.',                    tags: ['Séchage naturel', 'Artisanal'] },
    { cls: 'p5', emoji: '🍎', cat: 'Verger',              titre: 'Fruits & Conserves',        desc: 'Pommiers, poiriers et pruniers centenaires. Confitures et compotes préparées selon des recettes familiales.',            tags: ['Vieux vergers', 'Fait maison'] },
    { cls: 'p6', emoji: '🐄', cat: 'Élevage',             titre: 'Œufs & Produits laitiers', desc: 'Poules élevées en plein air et vaches nourries à l\'herbe de nos prairies permanentes. Filière courte garantie.',        tags: ['Plein air', 'Bien-être animal'] },
  ];

  // ── Méthodes data ────────────────────────────────────────────────────────
  readonly methodes = [
    { num: '01', titre: 'Agroécologie & biodiversité',  texte: 'Haies bocagères, bandes fleuries et jachères tournantes pour préserver les auxiliaires naturels et la faune du sol.' },
    { num: '02', titre: 'Travail du sol raisonné',       texte: 'Labour minimal pour préserver la structure et la vie microbienne. Recours au semis direct sur couverture végétale depuis 2015.' },
    { num: '03', titre: 'Gestion intégrée de l\'eau',   texte: 'Bassins de rétention, irrigation goutte-à-goutte et monitoring des nappes phréatiques.' },
    { num: '04', titre: 'Compostage & circularité',      texte: 'Valorisation de 100 % des résidus de culture et effluents d\'élevage en compost mature.' },
  ];

  // ── Stats méthodes ───────────────────────────────────────────────────────
  readonly statsMethodes = [
    { val: '−70%', label: 'Érosion des sols' },
    { val: '−45%', label: 'Consommation eau' },
    { val: '+60',  label: 'Espèces pollinisateurs' },
    { val: '100%', label: 'Compostage interne' },
  ];

  // ── Zone cards ───────────────────────────────────────────────────────────
  readonly zoneCards = [
    { titre: 'Sol argilo-calcaire',  desc: 'pH 7.2 · Riche en calcium · Favorable aux légumineuses' },
    { titre: 'Sol limoneux profond', desc: 'pH 6.8 · Forte capacité hydrique · Céréales, oléagineux' },
    { titre: 'Prairie permanente',   desc: '30 ha classés · Pâturage extensif · Carbone stocké' },
    { titre: 'Boisements & haies',   desc: '12 km de haies replantées depuis 2010' },
  ];

  // ── Contact infos ────────────────────────────────────────────────────────
  readonly contactInfos = [
    { icon: '📍', titre: 'Adresse',       texte: 'Ferme AgroTerre<br>Route des Champs, 41000<br>Blois, France' },
    { icon: '📞', titre: 'Téléphone',     texte: '+33 2 54 XX XX XX<br>Lun–Ven · 8h–18h' },
    { icon: '✉️', titre: 'Email',         texte: 'contact@agroterre.fr<br>Réponse sous 48h' },
    { icon: '🛒', titre: 'Vente directe', texte: 'Marché de Blois · Samedi 8h–13h<br>AMAP locale · Paniers hebdomadaires' },
  ];

  // ════════════════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ════════════════════════════════════════════════════════════════════════

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initRevealObserver();
    this.initResizeDrag();
  }

  ngOnDestroy(): void {
    this.revealObserver?.disconnect();
  }

  // ════════════════════════════════════════════════════════════════════════
  // SCROLL SPY
  // ════════════════════════════════════════════════════════════════════════

  @HostListener('window:scroll')
  onScroll(): void {
    this.navScrolled = window.scrollY > 60;
    this.updateActiveSection();
  }

  private updateActiveSection(): void {
    let current = 'accueil';
    this.sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 150) current = id;
    });
    this.activeSection = current;
  }

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.menuOpen = false;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  // ════════════════════════════════════════════════════════════════════════
  // REVEAL ON SCROLL
  // ════════════════════════════════════════════════════════════════════════

  private initRevealObserver(): void {
    this.revealObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          this.revealObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal').forEach(el => this.revealObserver.observe(el));
  }

  // ════════════════════════════════════════════════════════════════════════
  // FORMULAIRE
  // ════════════════════════════════════════════════════════════════════════

  handleSubmit(e: Event): void {
    e.preventDefault();
    this.formSubmitting = true;
    setTimeout(() => {
      this.formSubmitting = false;
      this.formSuccess    = true;
      setTimeout(() => this.formSuccess = false, 5000);
    }, 1500);
  }

  // ════════════════════════════════════════════════════════════════════════
  // CHAT
  // ════════════════════════════════════════════════════════════════════════

  toggleChat(): void {
    this.chatOpen = !this.chatOpen;
    if (this.chatOpen && !this.chatLoaded) {
      setTimeout(() => this.loadChat(), 300);
    }
  }

  minimizeChat(): void { this.chatOpen = false; }

  maximizeChat(): void {
    const panel = document.getElementById('chatPanel');
    if (!panel) return;
    if (panel.style.width === '100vw') {
      panel.style.cssText = '';
    } else {
      panel.style.cssText = 'width:100vw;height:100vh;bottom:0;right:0;opacity:1;transform:scale(1);pointer-events:all';
    }
  }

  private async loadChat(): Promise<void> {
    if (this.chatLoaded) return;

    const agriToken = this.TOKEN_KEYS.reduce<string | null>(
      (found, key) => found ?? localStorage.getItem(key) ?? sessionStorage.getItem(key),
      null
    );

    if (!agriToken) {
      this.chatIframeSrc = `${this.CHAT_BASE_URL}${this.CHAT_REDIRECT}`;
      this.chatLoaded    = true;
      return;
    }

    try {
      const resp = await fetch(`${this.AGRI_API_URL}/api/users/connectedUser`, {
        method:  'POST',
        headers: { 'Authorization': `Bearer ${agriToken}`, 'Content-Type': 'application/json' },
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();

      const uid   = data.userCode ?? data.id ?? data.userId ?? '';
      const email = data.userEmail ?? data.email ?? '';

      if (!uid || !email) throw new Error('uid/email manquant');

      const params = new URLSearchParams({ uid, email, token: agriToken, redirect: this.CHAT_REDIRECT });
      this.chatIframeSrc = `${this.CHAT_BASE_URL}/embed?${params.toString()}`;

    } catch (err) {
      console.error('[AgroChat]', err);
      this.chatIframeSrc = `${this.CHAT_BASE_URL}${this.CHAT_REDIRECT}`;
    }

    this.chatLoaded = true;
  }

  // ════════════════════════════════════════════════════════════════════════
  // RESIZE & DRAG
  // ════════════════════════════════════════════════════════════════════════

  private initResizeDrag(): void {
    const panel  = document.getElementById('chatPanel');
    const handle = document.getElementById('resizeHandle');
    const dragH  = document.getElementById('chatHeaderDrag');
    if (!panel || !handle || !dragH) return;

    handle.addEventListener('mousedown', (e: MouseEvent) => {
      this.isResizing = true;
      this.rX = e.clientX; this.rY = e.clientY;
      this.rW = panel.offsetWidth; this.rH = panel.offsetHeight;
      e.preventDefault();
    });

    dragH.addEventListener('mousedown', (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.chat-controls')) return;
      this.isDragging = true;
      this.dX = e.clientX; this.dY = e.clientY;
      const rect = panel.getBoundingClientRect();
      this.pR = window.innerWidth  - rect.right;
      this.pB = window.innerHeight - rect.bottom;
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e: MouseEvent) => {
      if (this.isResizing) {
        panel.style.width  = Math.max(300, Math.min(window.innerWidth  - 40, this.rW + (this.rX - e.clientX))) + 'px';
        panel.style.height = Math.max(400, Math.min(window.innerHeight - 100, this.rH + (this.rY - e.clientY))) + 'px';
      }
      if (this.isDragging) {
        panel.style.right  = Math.max(0, this.pR - (e.clientX - this.dX)) + 'px';
        panel.style.bottom = Math.max(0, this.pB - (e.clientY - this.dY)) + 'px';
      }
    });

    document.addEventListener('mouseup', () => {
      this.isResizing = false;
      this.isDragging = false;
    });
  }
}