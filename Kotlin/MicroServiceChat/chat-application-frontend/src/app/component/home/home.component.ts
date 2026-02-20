import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
<div class="home" [class.scrolled]="scrolled">

  <!-- ── GRID LINES ──────────────────────────────────────────── -->
  <div class="grid-overlay" aria-hidden="true">
    <div class="grid-line" *ngFor="let l of gridLines" [style.left.%]="l"></div>
  </div>

  <!-- ── NAV ────────────────────────────────────────────────── -->
  <nav class="nav">
    <div class="nav-logo">
      <span class="nav-logo-hex">⬡</span>
      <span class="nav-logo-name">Nexus</span>
    </div>
    <div class="nav-links">
      <a href="#features">Features</a>
      <a href="#how">How it works</a>
    </div>
    <div class="nav-cta">
      <a class="btn-ghost" routerLink="/auth/login">Sign in</a>
      <a class="btn-solid" routerLink="/auth/register">Get started</a>
    </div>
  </nav>

  <!-- ── HERO ───────────────────────────────────────────────── -->
  <section class="hero">
    <div class="hero-left">
      <div class="hero-eyebrow">
        <span class="eyebrow-dot"></span>
        Real-time collaboration
      </div>
      <h1 class="hero-title">
        <span class="title-line title-line--1">Talk.</span>
        <span class="title-line title-line--2">Share.</span>
        <span class="title-line title-line--3">Connect.</span>
      </h1>
      <p class="hero-body">
        Nexus brings your team together with live chat, peer-to-peer video calls,
        voice messages, and shared file storage — all in one place.
      </p>
      <div class="hero-actions">
        <a class="cta-primary" routerLink="/auth/register">
          Start for free
          <span class="cta-arrow">→</span>
        </a>
        <a class="cta-secondary" routerLink="/auth/login">
          Sign in
        </a>
      </div>
      <div class="hero-proof">
        <div class="proof-avatars">
          <div class="proof-av" *ngFor="let c of avatarColors" [style.background]="c">
            {{ c.charAt(1).toUpperCase() }}
          </div>
        </div>
        <span class="proof-text">Trusted by teams everywhere</span>
      </div>
    </div>

    <div class="hero-right">
      <!-- Animated phone mockup -->
      <div class="mockup">
        <div class="mockup-frame">
          <!-- Call screen -->
          <div class="mock-call" [class.mock-call--visible]="activeCard === 'call'">
            <div class="mock-avatar-ring">
              <div class="ring ring--1"></div>
              <div class="ring ring--2"></div>
              <div class="ring ring--3"></div>
              <div class="mock-avatar">J</div>
            </div>
            <div class="mock-name">Julia Reyes</div>
            <div class="mock-status">{{ callStatus }}</div>
            <div class="mock-call-btns">
              <button class="mcb mcb--end">✕</button>
              <button class="mcb mcb--mic">🎤</button>
              <button class="mcb mcb--cam">📷</button>
            </div>
          </div>
          <!-- Chat screen -->
          <div class="mock-chat" [class.mock-chat--visible]="activeCard === 'chat'">
            <div class="mock-msg mock-msg--in">Hey! Did you see the new designs?</div>
            <div class="mock-msg mock-msg--out">Just reviewed them — incredible work 🎉</div>
            <div class="mock-msg mock-msg--in">
              <div class="mock-voice">
                <span class="mv-play">▶</span>
                <div class="mv-bars">
                  <div class="mv-bar" *ngFor="let h of voiceBars" [style.height.px]="h"></div>
                </div>
                <span class="mv-dur">0:12</span>
              </div>
            </div>
            <div class="mock-msg mock-msg--out">Love the voice note feature!</div>
          </div>
          <!-- Files screen -->
          <div class="mock-files" [class.mock-files--visible]="activeCard === 'files'">
            <div class="mock-file-row" *ngFor="let f of mockFiles">
              <span class="mfr-icon">{{ f.icon }}</span>
              <div class="mfr-info">
                <div class="mfr-name">{{ f.name }}</div>
                <div class="mfr-size">{{ f.size }}</div>
              </div>
              <span class="mfr-dl">⬇</span>
            </div>
          </div>
        </div>
        <!-- Tab switcher -->
        <div class="mockup-tabs">
          <button [class.active]="activeCard==='call'"   (click)="activeCard='call'">📞 Call</button>
          <button [class.active]="activeCard==='chat'"   (click)="activeCard='chat'">💬 Chat</button>
          <button [class.active]="activeCard==='files'"  (click)="activeCard='files'">📁 Files</button>
        </div>
      </div>

      <!-- Floating stat chips -->
      <div class="stat-chip stat-chip--1">
        <span class="sc-num">48ms</span>
        <span class="sc-label">avg latency</span>
      </div>
      <div class="stat-chip stat-chip--2">
        <span class="sc-num">E2E</span>
        <span class="sc-label">encrypted</span>
      </div>
    </div>
  </section>

  <!-- ── MARQUEE ─────────────────────────────────────────────── -->
  <div class="marquee-wrap" aria-hidden="true">
    <div class="marquee-track">
      <span *ngFor="let w of marqueeWords" class="marquee-word">{{ w }}</span>
      <span *ngFor="let w of marqueeWords" class="marquee-word">{{ w }}</span>
    </div>
  </div>

  <!-- ── FEATURES ────────────────────────────────────────────── -->
  <section class="features" id="features">
    <div class="features-header">
      <span class="section-tag">Features</span>
      <h2 class="features-title">Everything your team needs</h2>
    </div>

    <div class="feat-grid">
      <div class="feat-card feat-card--large feat-card--chat">
        <div class="feat-icon">💬</div>
        <h3>Live Chat Rooms</h3>
        <p>Public and private rooms with real-time messaging. See who's typing. Never miss a message.</p>
        <div class="feat-tag">WebSocket · STOMP</div>
      </div>

      <div class="feat-card feat-card--call">
        <div class="feat-icon">📞</div>
        <h3>Video &amp; Voice Calls</h3>
        <p>Peer-to-peer calls with zero server relay. Crystal clear, low-latency, end-to-end.</p>
        <div class="feat-tag">WebRTC · P2P</div>
      </div>

      <div class="feat-card feat-card--voice">
        <div class="feat-icon">🎙</div>
        <h3>Voice Messages</h3>
        <p>Record and send audio clips. Animated waveform playback. Faster than typing.</p>
        <div class="feat-tag">MediaRecorder API</div>
      </div>

      <div class="feat-card feat-card--large feat-card--files">
        <div class="feat-icon">📁</div>
        <h3>File Manager</h3>
        <p>Upload, organize, and share files across your team. 10 MB per file, unlimited storage.</p>
        <div class="feat-tag">Spring Boot · PostgreSQL</div>
      </div>

      <div class="feat-card feat-card--dm">
        <div class="feat-icon">✉️</div>
        <h3>Direct Messages</h3>
        <p>Private 1-on-1 conversations with read receipts and file sharing built in.</p>
        <div class="feat-tag">End-to-end private</div>
      </div>

      <div class="feat-card feat-card--admin">
        <div class="feat-icon">⚙️</div>
        <h3>Admin Dashboard</h3>
        <p>Manage users, review statistics, suspend accounts, and control your platform.</p>
        <div class="feat-tag">Role-based access</div>
      </div>
    </div>
  </section>

  <!-- ── HOW IT WORKS ──────────────────────────────────────────── -->
  <section class="how" id="how">
    <span class="section-tag">How it works</span>
    <h2 class="how-title">Up in seconds</h2>

    <div class="steps">
      <div class="step" *ngFor="let s of steps; let i = index">
        <div class="step-num">{{ (i + 1).toString().padStart(2, '0') }}</div>
        <div class="step-content">
          <div class="step-icon">{{ s.icon }}</div>
          <h4>{{ s.title }}</h4>
          <p>{{ s.body }}</p>
        </div>
        <div class="step-line" *ngIf="i < steps.length - 1"></div>
      </div>
    </div>
  </section>

  <!-- ── CTA BANNER ──────────────────────────────────────────── -->
  <section class="cta-banner">
    <div class="cta-banner-bg"></div>
    <h2 class="cta-banner-title">Ready to connect?</h2>
    <p class="cta-banner-sub">Free to join. No credit card required.</p>
    <a class="cta-primary cta-primary--large" routerLink="/auth/register">
      Create your account
      <span class="cta-arrow">→</span>
    </a>
  </section>

  <!-- ── FOOTER ──────────────────────────────────────────────── -->
  <footer class="footer">
    <div class="footer-logo">
      <span class="nav-logo-hex">⬡</span>
      <span class="nav-logo-name">Nexus</span>
    </div>
    <p class="footer-copy">© {{ year }} Nexus. Built with Spring Boot &amp; Angular.</p>
    <div class="footer-links">
      <a routerLink="/auth/login">Sign in</a>
      <a routerLink="/auth/register">Register</a>
    </div>
  </footer>

</div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Instrument+Sans:wght@400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    a { text-decoration: none; color: inherit; }

    /* ── ROOT ──────────────────────────────────────────────────── */
    .home {
      min-height: 100vh;
      background: #0c0c0e;
      color: #ede8df;
      font-family: 'Instrument Sans', sans-serif;
      overflow-x: hidden;
      position: relative;
    }

    /* ── GRID OVERLAY ──────────────────────────────────────────── */
    .grid-overlay {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
    }
    .grid-line {
      position: absolute;
      top: 0; bottom: 0;
      width: 1px;
      background: rgba(255,255,255,0.04);
    }

    /* ── NAV ───────────────────────────────────────────────────── */
    .nav {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 60px;
      transition: background 0.3s, border-color 0.3s;
    }
    .scrolled .nav {
      background: rgba(12,12,14,0.92);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .nav-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: 'Playfair Display', serif;
      font-weight: 900;
      font-size: 22px;
      letter-spacing: -0.02em;
    }
    .nav-logo-hex {
      background: linear-gradient(135deg, #c8a96e, #f0e0b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-size: 28px;
      line-height: 1;
    }
    .nav-logo-name { color: #ede8df; }
    .nav-links {
      display: flex;
      gap: 32px;
    }
    .nav-links a {
      font-size: 14px;
      font-weight: 500;
      color: rgba(237,232,223,0.55);
      transition: color 0.15s;
    }
    .nav-links a:hover { color: #ede8df; }
    .nav-cta {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .btn-ghost {
      padding: 9px 20px;
      border-radius: 50px;
      font-size: 14px;
      font-weight: 500;
      color: rgba(237,232,223,0.7);
      border: 1px solid rgba(255,255,255,0.12);
      transition: all 0.15s;
    }
    .btn-ghost:hover {
      color: #ede8df;
      border-color: rgba(255,255,255,0.28);
      background: rgba(255,255,255,0.05);
    }
    .btn-solid {
      padding: 9px 22px;
      border-radius: 50px;
      font-size: 14px;
      font-weight: 600;
      background: #c8a96e;
      color: #0c0c0e;
      transition: all 0.15s;
    }
    .btn-solid:hover {
      background: #f0e0b8;
      transform: translateY(-1px);
    }

    /* ── HERO ──────────────────────────────────────────────────── */
    .hero {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      align-items: center;
      padding: 130px 60px 80px;
      position: relative;
      z-index: 1;
    }
    .hero-eyebrow {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #c8a96e;
      margin-bottom: 28px;
    }
    .eyebrow-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #c8a96e;
      animation: blink 2s ease-in-out infinite;
    }
    @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }

    .hero-title {
      font-family: 'Playfair Display', serif;
      font-weight: 900;
      font-size: clamp(64px, 7vw, 108px);
      line-height: 0.95;
      letter-spacing: -0.03em;
      margin-bottom: 28px;
    }
    .title-line {
      display: block;
      animation: slideIn 0.8s cubic-bezier(0.16,1,0.3,1) both;
    }
    .title-line--1 { animation-delay: 0.0s; color: #ede8df; }
    .title-line--2 { animation-delay: 0.12s; color: #c8a96e; font-style: italic; }
    .title-line--3 { animation-delay: 0.24s; color: rgba(237,232,223,0.35); }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(40px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .hero-body {
      font-size: 17px;
      line-height: 1.7;
      color: rgba(237,232,223,0.55);
      max-width: 420px;
      margin-bottom: 36px;
      animation: slideIn 0.8s cubic-bezier(0.16,1,0.3,1) 0.36s both;
    }

    .hero-actions {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 36px;
      animation: slideIn 0.8s cubic-bezier(0.16,1,0.3,1) 0.48s both;
    }
    .cta-primary {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 14px 28px;
      border-radius: 50px;
      background: #c8a96e;
      color: #0c0c0e;
      font-weight: 700;
      font-size: 15px;
      transition: all 0.2s ease;
    }
    .cta-primary:hover {
      background: #f0e0b8;
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(200,169,110,0.35);
    }
    .cta-arrow { font-size: 18px; transition: transform 0.15s; }
    .cta-primary:hover .cta-arrow { transform: translateX(4px); }
    .cta-primary--large {
      padding: 18px 36px;
      font-size: 17px;
    }
    .cta-secondary {
      font-size: 15px;
      font-weight: 500;
      color: rgba(237,232,223,0.5);
      padding: 14px 4px;
      border-bottom: 1px solid rgba(237,232,223,0.2);
      transition: all 0.15s;
    }
    .cta-secondary:hover { color: #ede8df; border-color: rgba(237,232,223,0.6); }

    .hero-proof {
      display: flex;
      align-items: center;
      gap: 12px;
      animation: slideIn 0.8s cubic-bezier(0.16,1,0.3,1) 0.6s both;
    }
    .proof-avatars {
      display: flex;
    }
    .proof-av {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 2px solid #0c0c0e;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      color: #0c0c0e;
      margin-left: -8px;
    }
    .proof-av:first-child { margin-left: 0; }
    .proof-text {
      font-size: 13px;
      color: rgba(237,232,223,0.4);
    }

    /* ── MOCKUP ──────────────────────────────────────────────── */
    .hero-right {
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      animation: floatIn 1s cubic-bezier(0.16,1,0.3,1) 0.2s both;
    }
    @keyframes floatIn {
      from { opacity: 0; transform: translateY(60px) scale(0.95); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    .mockup {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    .mockup-frame {
      width: 320px;
      height: 420px;
      background: #131316;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 28px;
      overflow: hidden;
      position: relative;
      box-shadow:
        0 0 0 1px rgba(200,169,110,0.12),
        0 40px 80px rgba(0,0,0,0.6),
        inset 0 1px 0 rgba(255,255,255,0.06);
    }

    /* Shared card styles */
    .mock-call, .mock-chat, .mock-files {
      position: absolute;
      inset: 0;
      padding: 28px;
      opacity: 0;
      transform: scale(0.96) translateY(12px);
      transition: opacity 0.4s ease, transform 0.4s ease;
      pointer-events: none;
    }
    .mock-call--visible, .mock-chat--visible, .mock-files--visible {
      opacity: 1;
      transform: scale(1) translateY(0);
      pointer-events: auto;
    }

    /* Call screen */
    .mock-call {
      background: linear-gradient(160deg, #0e1a2b, #091320);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
    .mock-avatar-ring {
      position: relative;
      width: 100px;
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ring {
      position: absolute;
      border-radius: 50%;
      border: 1px solid rgba(45,200,154,0.4);
      animation: ripple 2.4s ease-out infinite;
    }
    .ring--1 { width: 100px; height: 100px; animation-delay: 0s; }
    .ring--2 { width: 130px; height: 130px; animation-delay: 0.6s; }
    .ring--3 { width: 160px; height: 160px; animation-delay: 1.2s; }
    @keyframes ripple {
      0%   { opacity: 0.8; transform: scale(0.9); }
      100% { opacity: 0;   transform: scale(1.1); }
    }
    .mock-avatar {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2dc89a, #5b6ef5);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Playfair Display', serif;
      font-weight: 700;
      font-size: 28px;
      color: white;
      z-index: 1;
    }
    .mock-name {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 18px;
      font-weight: 600;
      color: white;
    }
    .mock-status {
      font-size: 12px;
      color: rgba(255,255,255,0.4);
      letter-spacing: 0.06em;
    }
    .mock-call-btns {
      display: flex;
      gap: 16px;
      margin-top: 20px;
    }
    .mcb {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      font-size: 20px;
      transition: transform 0.15s;
    }
    .mcb:hover { transform: scale(1.1); }
    .mcb--end { background: #ef4444; color: white; }
    .mcb--mic, .mcb--cam { background: rgba(255,255,255,0.1); }

    /* Chat screen */
    .mock-chat {
      background: #0c0c0e;
      display: flex;
      flex-direction: column;
      gap: 10px;
      justify-content: flex-end;
      padding-bottom: 24px;
    }
    .mock-msg {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 18px;
      font-size: 13px;
      line-height: 1.45;
    }
    .mock-msg--in {
      background: #1e1e24;
      color: #e0dbd4;
      border-bottom-left-radius: 4px;
      align-self: flex-start;
    }
    .mock-msg--out {
      background: #c8a96e;
      color: #0c0c0e;
      font-weight: 500;
      border-bottom-right-radius: 4px;
      align-self: flex-end;
    }
    .mock-voice {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .mv-play { font-size: 11px; }
    .mv-bars {
      display: flex;
      align-items: center;
      gap: 2px;
    }
    .mv-bar {
      width: 2px;
      background: rgba(237,232,223,0.5);
      border-radius: 1px;
    }
    .mv-dur { font-size: 11px; color: rgba(237,232,223,0.5); }

    /* Files screen */
    .mock-files {
      background: #0c0c0e;
      display: flex;
      flex-direction: column;
      gap: 0;
      justify-content: center;
    }
    .mock-file-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 0;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .mock-file-row:last-child { border-bottom: none; }
    .mfr-icon { font-size: 24px; }
    .mfr-info { flex: 1; }
    .mfr-name { font-size: 13px; font-weight: 500; color: #ede8df; }
    .mfr-size { font-size: 11px; color: rgba(237,232,223,0.35); margin-top: 2px; }
    .mfr-dl { color: rgba(237,232,223,0.3); font-size: 15px; }

    .mockup-tabs {
      display: flex;
      gap: 8px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 50px;
      padding: 4px;
    }
    .mockup-tabs button {
      padding: 8px 16px;
      border-radius: 50px;
      border: none;
      background: none;
      font-size: 12px;
      font-weight: 500;
      color: rgba(237,232,223,0.4);
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: 'Instrument Sans', sans-serif;
    }
    .mockup-tabs button.active {
      background: #c8a96e;
      color: #0c0c0e;
    }

    .stat-chip {
      position: absolute;
      background: rgba(19,19,22,0.9);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 10px 16px;
      backdrop-filter: blur(12px);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .stat-chip--1 { top: 40px; right: -20px; animation: float1 5s ease-in-out infinite; }
    .stat-chip--2 { bottom: 80px; left: -30px; animation: float2 6s ease-in-out infinite; }
    @keyframes float1 { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
    @keyframes float2 { 0%,100% { transform: translateY(0); } 50% { transform: translateY(8px); } }
    .sc-num { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #c8a96e; }
    .sc-label { font-size: 10px; color: rgba(237,232,223,0.4); letter-spacing: 0.06em; text-transform: uppercase; }

    /* ── MARQUEE ─────────────────────────────────────────────── */
    .marquee-wrap {
      overflow: hidden;
      border-top: 1px solid rgba(255,255,255,0.06);
      border-bottom: 1px solid rgba(255,255,255,0.06);
      padding: 14px 0;
      position: relative;
      z-index: 1;
    }
    .marquee-track {
      display: flex;
      gap: 40px;
      animation: marquee 24s linear infinite;
      white-space: nowrap;
    }
    @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
    .marquee-word {
      font-family: 'Playfair Display', serif;
      font-size: 13px;
      font-style: italic;
      color: rgba(237,232,223,0.2);
      letter-spacing: 0.08em;
    }

    /* ── FEATURES ─────────────────────────────────────────────── */
    .features {
      padding: 100px 60px;
      position: relative;
      z-index: 1;
    }
    .features-header {
      margin-bottom: 48px;
    }
    .section-tag {
      display: inline-block;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #c8a96e;
      border: 1px solid rgba(200,169,110,0.3);
      padding: 4px 12px;
      border-radius: 50px;
      margin-bottom: 16px;
    }
    .features-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(36px, 4vw, 56px);
      font-weight: 700;
      color: #ede8df;
      letter-spacing: -0.02em;
    }

    .feat-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: auto auto;
      gap: 16px;
    }
    .feat-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 20px;
      padding: 32px 28px;
      transition: all 0.25s ease;
      position: relative;
      overflow: hidden;
    }
    .feat-card::before {
      content: '';
      position: absolute;
      inset: 0;
      opacity: 0;
      transition: opacity 0.3s;
    }
    .feat-card:hover { border-color: rgba(200,169,110,0.25); transform: translateY(-4px); }
    .feat-card:hover::before { opacity: 1; }
    .feat-card--large { grid-column: span 2; }
    .feat-card--chat::before   { background: radial-gradient(circle at top left, rgba(91,110,245,0.08), transparent 60%); }
    .feat-card--call::before   { background: radial-gradient(circle at top left, rgba(45,200,154,0.08), transparent 60%); }
    .feat-card--voice::before  { background: radial-gradient(circle at top left, rgba(200,169,110,0.08), transparent 60%); }
    .feat-card--files::before  { background: radial-gradient(circle at top left, rgba(251,146,60,0.08), transparent 60%); }
    .feat-card--dm::before     { background: radial-gradient(circle at top left, rgba(236,72,153,0.08), transparent 60%); }
    .feat-card--admin::before  { background: radial-gradient(circle at top left, rgba(167,139,250,0.08), transparent 60%); }

    .feat-icon {
      font-size: 32px;
      margin-bottom: 16px;
      display: block;
    }
    .feat-card h3 {
      font-family: 'Playfair Display', serif;
      font-size: 22px;
      font-weight: 700;
      color: #ede8df;
      margin-bottom: 10px;
      letter-spacing: -0.01em;
    }
    .feat-card p {
      font-size: 14px;
      line-height: 1.7;
      color: rgba(237,232,223,0.45);
    }
    .feat-tag {
      margin-top: 20px;
      display: inline-block;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(237,232,223,0.25);
    }

    /* ── HOW IT WORKS ────────────────────────────────────────── */
    .how {
      padding: 100px 60px;
      position: relative;
      z-index: 1;
    }
    .how-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(36px, 4vw, 56px);
      font-weight: 700;
      color: #ede8df;
      margin-bottom: 64px;
      margin-top: 16px;
      letter-spacing: -0.02em;
    }
    .steps {
      display: flex;
      gap: 0;
      align-items: flex-start;
    }
    .step {
      flex: 1;
      display: flex;
      gap: 0;
      align-items: flex-start;
      position: relative;
    }
    .step-num {
      font-family: 'Playfair Display', serif;
      font-size: 56px;
      font-weight: 900;
      color: rgba(200,169,110,0.12);
      line-height: 1;
      flex-shrink: 0;
      margin-right: 16px;
      margin-top: -6px;
    }
    .step-content { flex: 1; }
    .step-icon { font-size: 28px; margin-bottom: 12px; }
    .step-content h4 {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      font-weight: 700;
      color: #ede8df;
      margin-bottom: 8px;
    }
    .step-content p { font-size: 14px; line-height: 1.65; color: rgba(237,232,223,0.45); }
    .step-line {
      width: 1px;
      height: 60px;
      background: rgba(255,255,255,0.08);
      margin: 0 28px;
      flex-shrink: 0;
      margin-top: 14px;
    }

    /* ── CTA BANNER ───────────────────────────────────────────── */
    .cta-banner {
      margin: 0 60px 80px;
      border-radius: 28px;
      background: #131316;
      border: 1px solid rgba(200,169,110,0.2);
      padding: 80px 60px;
      text-align: center;
      position: relative;
      overflow: hidden;
      z-index: 1;
    }
    .cta-banner-bg {
      position: absolute;
      inset: -50%;
      background: radial-gradient(circle, rgba(200,169,110,0.06) 0%, transparent 65%);
    }
    .cta-banner-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(36px, 4vw, 56px);
      font-weight: 700;
      color: #ede8df;
      margin-bottom: 12px;
      letter-spacing: -0.02em;
      position: relative;
    }
    .cta-banner-sub {
      font-size: 16px;
      color: rgba(237,232,223,0.45);
      margin-bottom: 36px;
      position: relative;
    }

    /* ── FOOTER ──────────────────────────────────────────────── */
    .footer {
      padding: 32px 60px;
      border-top: 1px solid rgba(255,255,255,0.06);
      display: flex;
      align-items: center;
      gap: 24px;
      position: relative;
      z-index: 1;
    }
    .footer-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: 'Playfair Display', serif;
      font-size: 16px;
      font-weight: 700;
    }
    .footer-copy { font-size: 13px; color: rgba(237,232,223,0.3); flex: 1; }
    .footer-links {
      display: flex;
      gap: 20px;
    }
    .footer-links a { font-size: 13px; color: rgba(237,232,223,0.4); transition: color 0.15s; }
    .footer-links a:hover { color: #ede8df; }

    /* ── RESPONSIVE ──────────────────────────────────────────── */
    @media (max-width: 1024px) {
      .nav { padding: 20px 32px; }
      .hero { grid-template-columns: 1fr; padding: 130px 32px 60px; }
      .hero-right { display: none; }
      .feat-grid { grid-template-columns: 1fr 1fr; }
      .feat-card--large { grid-column: span 1; }
      .features, .how { padding: 80px 32px; }
      .cta-banner { margin: 0 32px 60px; padding: 60px 32px; }
      .footer { padding: 24px 32px; flex-wrap: wrap; }
    }
    @media (max-width: 640px) {
      .nav { padding: 16px 20px; }
      .nav-links { display: none; }
      .hero { padding: 110px 20px 50px; }
      .feat-grid { grid-template-columns: 1fr; }
      .steps { flex-direction: column; gap: 36px; }
      .step-line { display: none; }
      .cta-banner { margin: 0 20px 50px; padding: 48px 24px; }
      .footer { flex-direction: column; align-items: flex-start; gap: 12px; padding: 24px 20px; }
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {

  scrolled = false;
  activeCard: 'call' | 'chat' | 'files' = 'call';
  callStatus = 'Connecting…';
  year = new Date().getFullYear();

  gridLines = [16.6, 33.3, 50, 66.6, 83.3];
  avatarColors = ['#c8a96e', '#5b6ef5', '#2dc89a', '#e05cf0', '#fb923c'];
  voiceBars = [8, 14, 20, 12, 18, 24, 16, 10, 22, 14, 8, 18, 12, 20, 16];
  marqueeWords = [
    'Real-time chat', '·', 'Video calls', '·', 'Voice messages', '·',
    'File sharing', '·', 'Team collaboration', '·', 'Secure', '·',
    'WebRTC', '·', 'Spring Boot', '·', 'Angular'
  ];
  mockFiles = [
    { icon: '🖼️', name: 'design-v3.png', size: '2.4 MB' },
    { icon: '📄', name: 'proposal.pdf', size: '840 KB' },
    { icon: '📊', name: 'data.xlsx', size: '1.1 MB' },
    { icon: '🎬', name: 'demo.mp4', size: '8.7 MB' },
  ];
  steps = [
    { icon: '✍️', title: 'Create account', body: 'Register in seconds. No credit card, no verification delays.' },
    { icon: '💬', title: 'Join a room', body: 'Browse public rooms or create your own private space for your team.' },
    { icon: '📞', title: 'Call your team', body: 'One click to start a peer-to-peer video or audio call with anyone online.' },
    { icon: '📁', title: 'Share anything', body: 'Drop files into any conversation. They\'re stored and available forever.' },
  ];

  private cardInterval: ReturnType<typeof setInterval> | null = null;
  private callInterval: ReturnType<typeof setInterval> | null = null;
  private callStatuses = ['Connecting…', 'Ringing…', 'Connected — 0:12', 'Connected — 0:13', 'Connected — 0:14'];
  private callIdx = 0;

  @HostListener('window:scroll')
  onScroll() { this.scrolled = window.scrollY > 20; }

  ngOnInit() {
    // Auto-cycle mockup tabs
    this.cardInterval = setInterval(() => {
      const order: ('call' | 'chat' | 'files')[] = ['call', 'chat', 'files'];
      const cur = order.indexOf(this.activeCard);
      this.activeCard = order[(cur + 1) % 3];
    }, 3200);

    // Animate call status
    this.callInterval = setInterval(() => {
      this.callIdx = (this.callIdx + 1) % this.callStatuses.length;
      this.callStatus = this.callStatuses[this.callIdx];
    }, 1200);
  }

  ngOnDestroy() {
    if (this.cardInterval) clearInterval(this.cardInterval);
    if (this.callInterval) clearInterval(this.callInterval);
  }
}