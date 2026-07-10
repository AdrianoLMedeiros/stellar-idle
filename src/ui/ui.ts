import { HERO_TEMPLATES } from '../data/heroes';
import { getOfficerSkills } from '../data/skills';
import { STORE_ITEMS } from '../data/store';
import { UPGRADE_TEMPLATES } from '../data/upgrades';
import { ZONES, getZone } from '../data/zones';
import {
  getShipMaxHull,
  getShipMaxShield,
  getFleetDps,
  getShipShieldRegen,
  getShipWeaponDamage,
  getShipWeaponInterval,
  getUpgradeCost,
  getUpgradeLevel,
  xpToLevel,
} from '../game/progression';
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

const CREW_STATIONS: Record<string, string> = {
  nova: 'Comando',
  vex: 'Artilharia',
  aria: 'Engenharia',
  lyra: 'Suporte',
};

const SKILL_EFFECT_LABELS: Record<string, string> = {
  ship_hull: 'Casco maximo',
  ship_shield: 'Escudo maximo',
  shield_regen: 'Regeneracao de escudo',
  weapon_damage: 'Dano das armas',
  weapon_speed: 'Cadencia das armas',
  xp_gain: 'Ganho de XP',
  credit_gain: 'Creditos de combate',
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

function formatDuration(seconds: number): string {
  if (seconds <= 0) return 'expirado';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}min`;
  return `${Math.max(1, minutes)}min`;
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
  private shipHull = document.getElementById('ship-hull')!;
  private shipShield = document.getElementById('ship-shield')!;
  private shipHullBar = document.getElementById('ship-hull-bar')!;
  private shipShieldBar = document.getElementById('ship-shield-bar')!;
  private shipDamage = document.getElementById('ship-damage')!;
  private shipInterval = document.getElementById('ship-interval')!;
  private shipRegen = document.getElementById('ship-regen')!;
  private zoneRoute = document.getElementById('zone-route')!;
  private areaProgressLabel = document.getElementById('area-progress-label')!;
  private areaProgressFill = document.getElementById('area-progress-fill')!;
  private prestigeGain = document.getElementById('prestige-gain')!;
  private prestigeBonus = document.getElementById('prestige-bonus')!;
  private prestigeBtn = document.getElementById('prestige-btn') as HTMLButtonElement;
  private totalDefeated = document.getElementById('total-defeated')!;
  private prestigeCount = document.getElementById('prestige-count')!;
  private lastSave = document.getElementById('last-save')!;
  private commandToggle = document.getElementById('command-toggle') as HTMLButtonElement;
  private commandOverlay = document.getElementById('command-overlay')!;
  private commandClose = document.getElementById('command-close') as HTMLButtonElement;
  private storeToggle = document.getElementById('store-toggle') as HTMLButtonElement;
  private storeOverlay = document.getElementById('store-overlay')!;
  private storeClose = document.getElementById('store-close') as HTMLButtonElement;
  private storeList = document.getElementById('store-list')!;
  private activeBoostList = document.getElementById('active-boost-list')!;
  private heroOverlay = document.getElementById('hero-overlay')!;
  private heroDetailClose = document.getElementById('hero-detail-close') as HTMLButtonElement;
  private heroDetailPortrait = document.getElementById('hero-detail-portrait') as HTMLCanvasElement;
  private heroDetailName = document.getElementById('hero-detail-name')!;
  private heroDetailRole = document.getElementById('hero-detail-role')!;
  private heroDetailLevel = document.getElementById('hero-detail-level')!;
  private heroDetailXp = document.getElementById('hero-detail-xp')!;
  private heroDetailPoints = document.getElementById('hero-detail-points')!;
  private heroDetailXpBar = document.getElementById('hero-detail-xpbar')!;
  private heroDetailContribution = document.getElementById('hero-detail-contribution')!;
  private heroDetailSkills = document.getElementById('hero-detail-skills')!;
  private saveBtn = document.getElementById('save-btn') as HTMLButtonElement;
  private resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
  private statusMessage = document.getElementById('status-message')!;
  private offlineBanner = document.getElementById('offline-banner')!;
  private currentState: GameState | null = null;
  private selectedHeroId: string | null = null;
  private heroOverlayRenderKey = '';

  constructor(
    private onUpgrade: (id: string) => void,
    private onUnlockSkill: (heroId: string, skillId: string) => void,
    private onClaimStoreItem: (itemId: string) => void,
    private onPrestige: () => void,
    private onSave: () => void,
    private onReset: () => void,
  ) {
    this.prestigeBtn.addEventListener('click', () => this.onPrestige());
    this.storeToggle.addEventListener('click', () => this.openStoreOverlay());
    this.storeClose.addEventListener('click', () => this.closeStoreOverlay());
    this.storeOverlay.addEventListener('click', (event) => {
      if (event.target === this.storeOverlay) this.closeStoreOverlay();
    });
    this.commandToggle.addEventListener('click', () => this.openCommandOverlay());
    this.commandClose.addEventListener('click', () => this.closeCommandOverlay());
    this.commandOverlay.addEventListener('click', (event) => {
      if (event.target === this.commandOverlay) this.closeCommandOverlay();
    });
    this.heroDetailClose.addEventListener('click', () => this.closeHeroOverlay());
    this.heroOverlay.addEventListener('click', (event) => {
      if (event.target === this.heroOverlay) this.closeHeroOverlay();
    });
    this.heroDetailSkills.addEventListener('click', (event) => {
      const btn = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-skill]');
      if (!btn || !this.selectedHeroId) return;
      const skillId = btn.dataset.skill;
      if (skillId) this.onUnlockSkill(this.selectedHeroId, skillId);
    });
    window.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      this.closeHeroOverlay();
      this.closeStoreOverlay();
      this.closeCommandOverlay();
    });
    this.saveBtn.addEventListener('click', () => this.onSave());
    this.resetBtn.addEventListener('click', () => this.confirmReset());
    this.buildStaticLists();
    this.buildZoneRoute();
    this.buildStoreList();
  }

  private buildStaticLists(): void {
    this.crewList.innerHTML = HERO_TEMPLATES.map((hero) => {
      return `
        <article class="crew-card" data-hero="${hero.id}">
          <canvas class="crew-sprite" width="56" height="56" data-hero-canvas="${hero.id}"></canvas>
          <div>
            <p class="crew-name">${hero.name}</p>
            <p class="crew-role">${CREW_STATIONS[hero.id] ?? hero.roleLabel}</p>
            <span class="crew-level">Nv. <span data-hero-level="${hero.id}">1</span></span>
            <div class="crew-xp">
              <span data-hero-xp-label="${hero.id}">XP 0 / 40</span>
              <div class="crew-xp-bar">
                <div data-hero-xp-bar="${hero.id}"></div>
              </div>
            </div>
          </div>
          <div class="crew-meta">
            <span class="muted">Posto</span>
            <strong data-hero-station="${hero.id}">${CREW_STATIONS[hero.id] ?? hero.roleLabel}</strong>
            <button class="btn secondary hero-info-btn" data-hero-open="${hero.id}">Info</button>
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

    this.crewList.querySelectorAll<HTMLButtonElement>('[data-hero-open]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const heroId = btn.dataset.heroOpen;
        if (heroId) this.openHeroOverlay(heroId);
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

  private buildStoreList(): void {
    this.storeList.innerHTML = STORE_ITEMS.map((item) => `
      <article class="store-card">
        <div>
          <div class="store-card-title">
            <strong>${item.name}</strong>
            <span>${this.getStoreCategoryLabel(item.category)}</span>
          </div>
          <p>${item.description}</p>
          <small>${item.priceLabel}</small>
        </div>
        <button class="btn secondary store-claim" data-store-item="${item.id}">Ativar</button>
      </article>
    `).join('');

    this.storeList.querySelectorAll<HTMLButtonElement>('[data-store-item]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const itemId = btn.dataset.storeItem;
        if (itemId) this.onClaimStoreItem(itemId);
      });
    });
  }

  update(state: GameState): void {
    this.currentState = state;
    const zone = getZone(state.combat.zoneId);

    this.resCredits.textContent = formatNumber(state.credits);
    this.resCrystals.textContent = formatNumber(state.quantumCrystals);
    this.resDps.textContent = formatNumber(getFleetDps(state));

    this.zoneLabel.textContent = `${zone.name} — ${zone.description}`;
    this.enemyName.textContent = state.combat.isBoss ? `BOSS: ${state.combat.enemyName}` : state.combat.enemyName;
    this.enemyHp.textContent = `${formatNumber(state.combat.enemyHp)} / ${formatNumber(state.combat.enemyMaxHp)}`;
    this.waveLabel.textContent = String(state.combat.wave);

    const hpPercent = (state.combat.enemyHp / state.combat.enemyMaxHp) * 100;
    this.enemyHpBar.style.width = `${Math.max(0, hpPercent)}%`;
    this.updateShipPanel(state);
    this.updateAreaProgress(state);

    for (const hero of state.heroes) {
      const levelEl = this.crewList.querySelector(`[data-hero-level="${hero.id}"]`);
      const xpLabelEl = this.crewList.querySelector(`[data-hero-xp-label="${hero.id}"]`);
      const xpBarEl = this.crewList.querySelector<HTMLElement>(`[data-hero-xp-bar="${hero.id}"]`);
      const infoBtn = this.crewList.querySelector<HTMLButtonElement>(`[data-hero-open="${hero.id}"]`);
      const nextLevelXp = xpToLevel(hero.level);
      if (levelEl) levelEl.textContent = String(hero.level);
      if (xpLabelEl) {
        xpLabelEl.textContent = `XP ${formatNumber(hero.xp)} / ${formatNumber(nextLevelXp)} • PH ${hero.skillPoints}`;
      }
      if (xpBarEl) xpBarEl.style.width = `${Math.min(100, (hero.xp / nextLevelXp) * 100)}%`;
      if (infoBtn) {
        const hasAvailableSkill = getOfficerSkills(hero.id).some((skill) => {
          return !hero.unlockedSkills.includes(skill.id)
            && hero.level >= skill.requiredLevel
            && hero.skillPoints >= skill.cost;
        });
        infoBtn.classList.toggle('has-upgrade', hasAvailableSkill);
        infoBtn.title = hasAvailableSkill
          ? 'Habilidade disponivel para desbloquear'
          : 'Ver informacoes do oficial';
      }
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
    this.updateHeroOverlay();
    this.updateStoreOverlay();
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
    this.closeCommandOverlay();
  }

  private openCommandOverlay(): void {
    this.commandOverlay.classList.remove('hidden');
    this.commandOverlay.setAttribute('aria-hidden', 'false');
  }

  private closeCommandOverlay(): void {
    this.commandOverlay.classList.add('hidden');
    this.commandOverlay.setAttribute('aria-hidden', 'true');
  }

  private openStoreOverlay(): void {
    this.storeOverlay.classList.remove('hidden');
    this.storeOverlay.setAttribute('aria-hidden', 'false');
    this.updateStoreOverlay();
  }

  private closeStoreOverlay(): void {
    this.storeOverlay.classList.add('hidden');
    this.storeOverlay.setAttribute('aria-hidden', 'true');
  }

  private openHeroOverlay(heroId: string): void {
    this.selectedHeroId = heroId;
    this.heroOverlayRenderKey = '';
    this.heroOverlay.classList.remove('hidden');
    this.heroOverlay.setAttribute('aria-hidden', 'false');
    this.updateHeroOverlay();
  }

  private closeHeroOverlay(): void {
    this.heroOverlay.classList.add('hidden');
    this.heroOverlay.setAttribute('aria-hidden', 'true');
    this.selectedHeroId = null;
    this.heroOverlayRenderKey = '';
  }

  private updateAreaProgress(state: GameState): void {
    const waveInArea = ((state.combat.wave - 1) % WAVES_PER_AREA) + 1;
    const areaProgress = Math.min(100, (waveInArea / WAVES_PER_AREA) * 100);

    this.areaProgressLabel.textContent = state.combat.isBoss
      ? `BOSS ${waveInArea} / ${WAVES_PER_AREA}`
      : `Onda ${waveInArea} / ${WAVES_PER_AREA}`;
    this.areaProgressFill.style.width = `${areaProgress}%`;
    this.areaProgressFill.classList.toggle('boss-alert', state.combat.isBoss);

    this.zoneRoute.querySelectorAll<HTMLElement>('[data-zone-step]').forEach((step) => {
      const zoneId = Number(step.dataset.zoneStep);
      step.classList.toggle('completed', zoneId < state.combat.zoneId);
      step.classList.toggle('current', zoneId === state.combat.zoneId);
      step.classList.toggle('locked', zoneId > state.combat.zoneId);
      step.classList.toggle('boss-alert', zoneId === state.combat.zoneId && state.combat.isBoss);
    });
  }

  private updateShipPanel(state: GameState): void {
    const hullPercent = (state.ship.hull / state.ship.maxHull) * 100;
    const shieldPercent = (state.ship.shield / state.ship.maxShield) * 100;
    this.shipHull.textContent = `${formatNumber(state.ship.hull)} / ${formatNumber(state.ship.maxHull)}`;
    this.shipShield.textContent = `${formatNumber(state.ship.shield)} / ${formatNumber(state.ship.maxShield)}`;
    this.shipHullBar.style.width = `${Math.max(0, hullPercent)}%`;
    this.shipShieldBar.style.width = `${Math.max(0, shieldPercent)}%`;
    this.shipDamage.textContent = formatNumber(getShipWeaponDamage(state));
    this.shipInterval.textContent = `${getShipWeaponInterval(state).toFixed(2)}s`;
    this.shipRegen.textContent = `${getShipShieldRegen(state).toFixed(1)}/s`;
  }

  private updateHeroOverlay(): void {
    if (!this.currentState || !this.selectedHeroId || this.heroOverlay.classList.contains('hidden')) return;

    const hero = this.currentState.heroes.find((candidate) => candidate.id === this.selectedHeroId);
    const template = HERO_TEMPLATES.find((candidate) => candidate.id === this.selectedHeroId);
    if (!hero || !template) return;

    const renderKey = this.getHeroOverlayRenderKey(hero, this.currentState);
    if (renderKey === this.heroOverlayRenderKey) return;
    this.heroOverlayRenderKey = renderKey;

    const ctx = this.heroDetailPortrait.getContext('2d');
    if (ctx) drawCrewPortrait(ctx, template.color, template.accent, template.role);

    const nextLevelXp = xpToLevel(hero.level);
    this.heroDetailName.textContent = template.name;
    this.heroDetailRole.textContent = `${CREW_STATIONS[template.id] ?? template.roleLabel} da nave`;
    this.heroDetailLevel.textContent = String(hero.level);
    this.heroDetailXp.textContent = `${formatNumber(hero.xp)} / ${formatNumber(nextLevelXp)}`;
    this.heroDetailPoints.textContent = `${hero.skillPoints} PH`;
    this.heroDetailXpBar.style.width = `${Math.min(100, (hero.xp / nextLevelXp) * 100)}%`;
    this.heroDetailContribution.innerHTML = this.renderHeroContribution(template.id, this.currentState);
    this.heroDetailSkills.innerHTML = this.renderHeroSkillCards(hero);
  }

  private getHeroOverlayRenderKey(hero: GameState['heroes'][number], state: GameState): string {
    return [
      hero.id,
      hero.level,
      hero.xp,
      hero.skillPoints,
      hero.unlockedSkills.join(','),
      getShipMaxHull(state),
      getShipMaxShield(state),
      getShipWeaponDamage(state),
      getShipWeaponInterval(state).toFixed(3),
      getShipShieldRegen(state).toFixed(3),
    ].join('|');
  }

  private updateStoreOverlay(): void {
    if (!this.currentState || this.storeOverlay.classList.contains('hidden')) return;

    const now = Date.now();
    const activeBoosts = this.currentState.premium.activeBoosts
      .filter((boost) => boost.expiresAt > now)
      .map((boost) => {
        const remainingSeconds = Math.ceil((boost.expiresAt - now) / 1000);
        return `
          <div>
            <span class="muted">${boost.name}</span>
            <strong>${Math.round((boost.multiplier - 1) * 100)}% • ${formatDuration(remainingSeconds)}</strong>
          </div>
        `;
      }).join('');

    this.activeBoostList.innerHTML = activeBoosts || `
      <div class="empty-boosts">
        Nenhum boost ativo.
      </div>
    `;

    this.storeList.querySelectorAll<HTMLButtonElement>('[data-store-item]').forEach((btn) => {
      const item = STORE_ITEMS.find((candidate) => candidate.id === btn.dataset.storeItem);
      const isCosmeticOwned = item?.grants.some((grant) => {
        return !('effect' in grant)
          && this.currentState?.premium.entitlements.some((entitlement) => entitlement.id === grant.id);
      }) ?? false;
      btn.disabled = isCosmeticOwned;
      btn.textContent = isCosmeticOwned ? 'Obtido' : 'Ativar';
    });
  }

  private getStoreCategoryLabel(category: string): string {
    if (category === 'boost') return 'Boost';
    if (category === 'cosmetic') return 'Cosmetico';
    return 'Conveniencia';
  }

  private renderHeroContribution(heroId: string, state: GameState): string {
    if (heroId === 'nova') {
      return this.renderContributionItems([
        ['Casco max.', formatNumber(getShipMaxHull(state))],
        ['Dano das armas', formatNumber(getShipWeaponDamage(state))],
        ['Foco', 'Comando e disciplina de frota'],
      ]);
    }

    if (heroId === 'vex') {
      return this.renderContributionItems([
        ['Dano das armas', formatNumber(getShipWeaponDamage(state))],
        ['Recarga', `${getShipWeaponInterval(state).toFixed(2)}s`],
        ['Foco', 'Artilharia e cadencia'],
      ]);
    }

    if (heroId === 'aria') {
      return this.renderContributionItems([
        ['Escudo max.', formatNumber(getShipMaxShield(state))],
        ['Casco max.', formatNumber(getShipMaxHull(state))],
        ['Foco', 'Integridade e engenharia'],
      ]);
    }

    return this.renderContributionItems([
      ['Regeneracao', `${getShipShieldRegen(state).toFixed(1)}/s`],
      ['Escudo max.', formatNumber(getShipMaxShield(state))],
      ['Foco', 'Sustentacao da tripulacao'],
    ]);
  }

  private renderContributionItems(items: Array<[string, string]>): string {
    return items.map(([label, value]) => `
      <div>
        <span class="muted">${label}</span>
        <strong>${value}</strong>
      </div>
    `).join('');
  }

  private renderHeroSkillCards(hero: GameState['heroes'][number]): string {
    return getOfficerSkills(hero.id).map((skill) => {
      const unlocked = hero.unlockedSkills.includes(skill.id);
      const available = hero.level >= skill.requiredLevel && hero.skillPoints >= skill.cost;
      const effects = skill.effects.map((effect) => {
        const label = SKILL_EFFECT_LABELS[effect.type] ?? effect.type;
        return `${label}: +${Math.round(effect.value * 100)}%`;
      }).join(' • ');
      const status = unlocked
        ? 'Desbloqueada'
        : `Requer Nv. ${skill.requiredLevel} e ${skill.cost} PH`;
      const action = unlocked ? 'Ativa' : 'Desbloquear';

      return `
        <article class="hero-skill-card ${unlocked ? 'unlocked' : ''}">
          <div>
            <div class="hero-skill-title">
              <strong>${skill.name}</strong>
              <span>${status}</span>
            </div>
            <p>${skill.description}</p>
            <small>${effects}</small>
          </div>
          <button class="btn secondary" data-skill="${skill.id}" ${unlocked || !available ? 'disabled' : ''}>
            ${action}
          </button>
        </article>
      `;
    }).join('');
  }
}
