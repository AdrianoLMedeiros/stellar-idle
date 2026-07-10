import { HERO_TEMPLATES } from '../data/heroes';
import { UPGRADE_TEMPLATES } from '../data/upgrades';
import { ZONES, getZone } from '../data/zones';
import { getFleetDps, getUpgradeCost, getUpgradeLevel, xpToLevel } from '../game/progression';
import { getPrestigeBonusPercent } from '../game/prestige';
import { canPrestige, estimatePrestigeGain } from '../game/state';
import type { GameState } from '../game/types';
import { drawCrewPortrait } from '../render/sprites';

const WAVES_PER_AREA = 10;

const UPGRADE_ICON_LABELS: Record<string, string> = {
  weapons: 'ATK',
  shields: 'SPD',
  scanner: 'CR',
  training: 'XP',
};

function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 10_000) return `${(value / 1_000).toFixed(1)}K`;
  return Math.floor(value).toLocaleString('pt-BR');
}

function formatRelativeSaveTime(timestamp: number): string {
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (elapsedSeconds < 5) return 'agora';
  if (elapsedSeconds < 60) return `${elapsedSeconds}s`;
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 60) return `${elapsedMinutes}min`;
  return `${Math.floor(elapsedMinutes / 60)}h`;
}

export class UIManager {
  private crewList = document.getElementById('crew-list')!;
  private upgradeList = document.getElementById('upgrade-list')!;
  private resCredits = document.querySelector('#res-credits .value')!;
  private resCrystals = document.querySelector('#res-crystals .value')!;
  private resDps = document.querySelector('#res-dps .value')!;
  private zoneLabel = document.getElementById('zone-label')!;
  private enemyName = document.getElementById('enemy-name')!;
  private enemyHp = document.getElementById('enemy-hp')!;
  private waveLabel = document.getElementById('wave-label')!;
  private enemyHpBar = document.getElementById('enemy-hp-bar')!;
  private zoneRoute = document.getElementById('zone-route')!;
  private areaProgressLabel = document.getElementById('area-progress-label')!;
  private areaProgressFill = document.getElementById('area-progress-fill')!;
  private prestigeGain = document.getElementById('prestige-gain')!;
  private prestigeBonus = document.getElementById('prestige-bonus')!;
  private prestigeBtn = document.getElementById('prestige-btn') as HTMLButtonElement;
  private totalDefeated = document.getElementById('total-defeated')!;
  private prestigeCount = document.getElementById('prestige-count')!;
  private lastSave = document.getElementById('last-save')!;
  private saveBtn = document.getElementById('save-btn') as HTMLButtonElement;
  private resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
  private statusMessage = document.getElementById('status-message')!;
  private offlineBanner = document.getElementById('offline-banner')!;

  constructor(
    private onUpgrade: (id: string) => void,
    private onPrestige: () => void,
    private onSave: () => void,
    private onReset: () => void,
  ) {
    this.prestigeBtn.addEventListener('click', () => this.onPrestige());
    this.saveBtn.addEventListener('click', () => this.onSave());
    this.resetBtn.addEventListener('click', () => this.confirmReset());
    this.buildStaticLists();
    this.buildZoneRoute();
  }

  private buildStaticLists(): void {
    this.crewList.innerHTML = HERO_TEMPLATES.map((hero) => {
      return `
        <article class="crew-card" data-hero="${hero.id}">
          <canvas class="crew-sprite" width="56" height="56" data-hero-canvas="${hero.id}"></canvas>
          <div>
            <p class="crew-name">${hero.name}</p>
            <p class="crew-role">${hero.roleLabel}</p>
            <span class="crew-level">Nv. <span data-hero-level="${hero.id}">1</span></span>
            <div class="crew-xp">
              <span data-hero-xp-label="${hero.id}">XP 0 / 40</span>
              <div class="crew-xp-bar">
                <div data-hero-xp-bar="${hero.id}"></div>
              </div>
            </div>
          </div>
          <div class="crew-meta">
            <span class="muted">ATK</span>
            <strong data-hero-atk="${hero.id}">0</strong>
          </div>
        </article>
      `;
    }).join('');

    for (const hero of HERO_TEMPLATES) {
      const canvas = this.crewList.querySelector<HTMLCanvasElement>(
        `[data-hero-canvas="${hero.id}"]`,
      );
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) drawCrewPortrait(ctx, hero.color, hero.accent, hero.role);
      }
    }

    this.upgradeList.innerHTML = UPGRADE_TEMPLATES.map((upgrade) => {
      const iconLabel = UPGRADE_ICON_LABELS[upgrade.id] ?? 'UP';
      return `
        <article class="upgrade-card">
          <div class="upgrade-icon" aria-hidden="true">${iconLabel}</div>
          <div>
            <p class="upgrade-name">${upgrade.name}</p>
            <p class="upgrade-desc">${upgrade.description}</p>
            <span class="crew-level">Nv. <span data-upgrade-level="${upgrade.id}">0</span></span>
          </div>
          <button class="btn upgrade" data-upgrade="${upgrade.id}">
            <span data-upgrade-cost="${upgrade.id}">0</span> ₡
          </button>
        </article>
      `;
    }).join('');

    this.upgradeList.querySelectorAll<HTMLButtonElement>('[data-upgrade]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.upgrade;
        if (id) this.onUpgrade(id);
      });
    });
  }

  private buildZoneRoute(): void {
    this.zoneRoute.innerHTML = ZONES.map((zone) => {
      return `
        <div class="zone-step" data-zone-step="${zone.id}">
          <span class="zone-step-node">${zone.id}</span>
          <span class="zone-step-name">${zone.name}</span>
        </div>
      `;
    }).join('');
  }

  update(state: GameState, getHeroAtk: (heroId: string) => number): void {
    const zone = getZone(state.combat.zoneId);

    this.resCredits.textContent = formatNumber(state.credits);
    this.resCrystals.textContent = formatNumber(state.quantumCrystals);
    this.resDps.textContent = formatNumber(getFleetDps(state));

    this.zoneLabel.textContent = `${zone.name} — ${zone.description}`;
    this.enemyName.textContent = state.combat.enemyName;
    this.enemyHp.textContent = `${formatNumber(state.combat.enemyHp)} / ${formatNumber(state.combat.enemyMaxHp)}`;
    this.waveLabel.textContent = String(state.combat.wave);

    const hpPercent = (state.combat.enemyHp / state.combat.enemyMaxHp) * 100;
    this.enemyHpBar.style.width = `${Math.max(0, hpPercent)}%`;
    this.updateAreaProgress(state);

    for (const hero of state.heroes) {
      const levelEl = this.crewList.querySelector(`[data-hero-level="${hero.id}"]`);
      const atkEl = this.crewList.querySelector(`[data-hero-atk="${hero.id}"]`);
      const xpLabelEl = this.crewList.querySelector(`[data-hero-xp-label="${hero.id}"]`);
      const xpBarEl = this.crewList.querySelector<HTMLElement>(`[data-hero-xp-bar="${hero.id}"]`);
      const nextLevelXp = xpToLevel(hero.level);
      if (levelEl) levelEl.textContent = String(hero.level);
      if (atkEl) atkEl.textContent = String(getHeroAtk(hero.id));
      if (xpLabelEl) xpLabelEl.textContent = `XP ${formatNumber(hero.xp)} / ${formatNumber(nextLevelXp)}`;
      if (xpBarEl) xpBarEl.style.width = `${Math.min(100, (hero.xp / nextLevelXp) * 100)}%`;
    }

    for (const upgrade of UPGRADE_TEMPLATES) {
      const level = getUpgradeLevel(state, upgrade.id);
      const cost = getUpgradeCost(upgrade.id, level);
      const levelEl = this.upgradeList.querySelector(`[data-upgrade-level="${upgrade.id}"]`);
      const costEl = this.upgradeList.querySelector(`[data-upgrade-cost="${upgrade.id}"]`);
      const btn = this.upgradeList.querySelector<HTMLButtonElement>(`[data-upgrade="${upgrade.id}"]`);
      if (levelEl) levelEl.textContent = String(level);
      if (costEl) costEl.textContent = formatNumber(cost);
      if (btn) btn.disabled = state.credits < cost;
    }

    const gain = estimatePrestigeGain(state);
    this.prestigeGain.textContent = `+${gain}`;
    this.prestigeBonus.textContent = `+${getPrestigeBonusPercent(state)}%`;
    this.prestigeBtn.disabled = !canPrestige(state);

    this.totalDefeated.textContent = formatNumber(state.totalEnemiesDefeated);
    this.prestigeCount.textContent = formatNumber(state.prestigeCount);
    this.lastSave.textContent = formatRelativeSaveTime(state.lastSave);
  }

  setStatus(message: string): void {
    this.statusMessage.textContent = message;
  }

  showOfflineReward(kills: number, elapsedHours: number): void {
    if (kills <= 0) {
      this.offlineBanner.classList.add('hidden');
      return;
    }
    this.offlineBanner.textContent = `Progresso offline: ${kills} vitórias em ${elapsedHours.toFixed(1)}h`;
    this.offlineBanner.classList.remove('hidden');
  }

  private confirmReset(): void {
    const confirmed = window.confirm('Resetar todo o progresso salvo e começar uma nova campanha?');
    if (!confirmed) return;
    this.onReset();
  }

  private updateAreaProgress(state: GameState): void {
    const waveInArea = ((state.combat.wave - 1) % WAVES_PER_AREA) + 1;
    const areaProgress = Math.min(100, (waveInArea / WAVES_PER_AREA) * 100);

    this.areaProgressLabel.textContent = `Onda ${waveInArea} / ${WAVES_PER_AREA}`;
    this.areaProgressFill.style.width = `${areaProgress}%`;

    this.zoneRoute.querySelectorAll<HTMLElement>('[data-zone-step]').forEach((step) => {
      const zoneId = Number(step.dataset.zoneStep);
      step.classList.toggle('completed', zoneId < state.combat.zoneId);
      step.classList.toggle('current', zoneId === state.combat.zoneId);
      step.classList.toggle('locked', zoneId > state.combat.zoneId);
    });
  }
}
