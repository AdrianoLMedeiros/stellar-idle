import { getOfficerAbility } from '../data/abilities';
import { HERO_TEMPLATES } from '../data/heroes';
import { OPERATIONAL_FOCUSES, getOperationalFocus } from '../data/operationalFocus';
import { getOfficerSkills } from '../data/skills';
import { STORE_ITEMS } from '../data/store';
import { TACTICAL_ACTIONS, getTacticalAction } from '../data/tacticalActions';
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

const BRIDGE_STATION_LAYOUT: Record<string, string> = {
  nova: 'captain',
  vex: 'weapons',
  aria: 'engineering',
  lyra: 'support',
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
  private upgradeEmpty = document.getElementById('upgrade-empty')!;
  private resCredits = document.querySelector('#res-credits .value')!;
  private resCrystals = document.querySelector('#res-crystals .value')!;
  private resDps = document.querySelector('#res-dps .value')!;
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
  private tacticalActionList = document.getElementById('tactical-action-list')!;
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
  private bridgeToggle = document.getElementById('bridge-toggle') as HTMLButtonElement;
  private bridgeOverlay = document.getElementById('bridge-overlay')!;
  private bridgeClose = document.getElementById('bridge-close') as HTMLButtonElement;
  private bridgeZone = document.getElementById('bridge-zone')!;
  private bridgeEnemy = document.getElementById('bridge-enemy')!;
  private bridgeHull = document.getElementById('bridge-hull')!;
  private bridgeShield = document.getElementById('bridge-shield')!;
  private bridgeDps = document.getElementById('bridge-dps')!;
  private bridgeHullBar = document.getElementById('bridge-hull-bar')!;
  private bridgeShieldBar = document.getElementById('bridge-shield-bar')!;
  private bridgeWeaponBar = document.getElementById('bridge-weapon-bar')!;
  private bridgeFocus = document.getElementById('bridge-focus')!;
  private bridgeEffects = document.getElementById('bridge-effects')!;
  private bridgeReadiness = document.getElementById('bridge-readiness')!;
  private bridgeStations = document.getElementById('bridge-stations')!;
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
  private exportSaveBtn = document.getElementById('export-save-btn') as HTMLButtonElement;
  private importSaveBtn = document.getElementById('import-save-btn') as HTMLButtonElement;
  private importSaveFile = document.getElementById('import-save-file') as HTMLInputElement;
  private resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
  private statusMessage = document.getElementById('status-message')!;
  private offlineBanner = document.getElementById('offline-banner')!;
  private currentState: GameState | null = null;
  private selectedHeroId: string | null = null;
  private heroOverlayRenderKey = '';

  constructor(
    private onUpgrade: (id: string) => void,
    private onUnlockSkill: (heroId: string, skillId: string) => void,
    private onActivateAbility: (heroId: string) => void,
    private onActivateTacticalAction: (actionId: string) => void,
    private onSetOperationalFocus: (focusId: string) => void,
    private onClaimStoreItem: (itemId: string) => void,
    private onPrestige: () => void,
    private onSave: () => void,
    private onExportSave: () => void,
    private onImportSave: (raw: string) => void,
    private onReset: () => void,
  ) {
    this.prestigeBtn.addEventListener('click', () => this.onPrestige());
    this.bridgeToggle.addEventListener('click', () => this.openBridgeOverlay());
    this.bridgeClose.addEventListener('click', () => this.closeBridgeOverlay());
    this.bridgeOverlay.addEventListener('click', (event) => {
      if (event.target === this.bridgeOverlay) this.closeBridgeOverlay();
    });
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
      this.closeBridgeOverlay();
      this.closeStoreOverlay();
      this.closeCommandOverlay();
    });
    this.saveBtn.addEventListener('click', () => this.onSave());
    this.exportSaveBtn.addEventListener('click', () => this.onExportSave());
    this.importSaveBtn.addEventListener('click', () => this.importSaveFile.click());
    this.importSaveFile.addEventListener('change', () => this.importSelectedSave());
    this.resetBtn.addEventListener('click', () => this.confirmReset());
    this.buildStaticLists();
    this.buildTacticalActions();
    this.buildBridgeFocus();
    this.buildZoneRoute();
    this.buildStoreList();
    this.buildBridgeStations();
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
            <button class="btn secondary hero-ability-btn" data-hero-ability="${hero.id}">
              ${getOfficerAbility(hero.id).shortName}
            </button>
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
        <article class="upgrade-card" data-upgrade-card="${upgrade.id}">
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

    this.crewList.querySelectorAll<HTMLButtonElement>('[data-hero-ability]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const heroId = btn.dataset.heroAbility;
        if (heroId) this.onActivateAbility(heroId);
      });
    });
  }

  private buildTacticalActions(): void {
    this.tacticalActionList.innerHTML = TACTICAL_ACTIONS.map((action) => `
      <button class="btn secondary tactical-action-btn" data-tactical-action="${action.id}" title="${action.description}">
        ${action.shortName}
      </button>
    `).join('');

    this.tacticalActionList.querySelectorAll<HTMLButtonElement>('[data-tactical-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const actionId = btn.dataset.tacticalAction;
        if (actionId) this.onActivateTacticalAction(actionId);
      });
    });
  }

  private buildBridgeFocus(): void {
    this.bridgeFocus.innerHTML = OPERATIONAL_FOCUSES.map((focus) => `
      <button class="bridge-focus-btn" data-bridge-focus="${focus.id}" title="${focus.description}">
        <strong>${focus.shortName}</strong>
        <span>${focus.description}</span>
      </button>
    `).join('');

    this.bridgeFocus.querySelectorAll<HTMLButtonElement>('[data-bridge-focus]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const focusId = btn.dataset.bridgeFocus;
        if (focusId) this.onSetOperationalFocus(focusId);
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

  private buildBridgeStations(): void {
    this.bridgeStations.innerHTML = HERO_TEMPLATES.map((hero) => `
      <button class="bridge-station ${BRIDGE_STATION_LAYOUT[hero.id] ?? ''}" data-bridge-hero="${hero.id}">
        <span class="station-light" aria-hidden="true"></span>
        <canvas class="bridge-portrait" width="64" height="64" data-bridge-canvas="${hero.id}"></canvas>
        <span class="station-body">
          <span class="station-label">${CREW_STATIONS[hero.id] ?? hero.roleLabel}</span>
          <strong>${hero.name}</strong>
          <span class="station-meta">
            Nv. <span data-bridge-level="${hero.id}">1</span>
            <span data-bridge-alert="${hero.id}" class="station-alert hidden">PH</span>
          </span>
          <span class="station-xp">
            <span data-bridge-xp="${hero.id}"></span>
          </span>
        </span>
      </button>
    `).join('');

    for (const hero of HERO_TEMPLATES) {
      const canvas = this.bridgeStations.querySelector<HTMLCanvasElement>(
        `[data-bridge-canvas="${hero.id}"]`,
      );
      if (!canvas) continue;
      const ctx = canvas.getContext('2d');
      if (ctx) drawCrewPortrait(ctx, hero.color, hero.accent, hero.role);
    }

    this.bridgeStations.querySelectorAll<HTMLButtonElement>('[data-bridge-hero]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const heroId = btn.dataset.bridgeHero;
        if (heroId) this.openHeroOverlay(heroId);
      });
    });
  }

  update(state: GameState): void {
    this.currentState = state;

    this.resCredits.textContent = formatNumber(state.credits);
    this.resCrystals.textContent = formatNumber(state.quantumCrystals);
    this.resDps.textContent = formatNumber(getFleetDps(state));

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
      const abilityBtn = this.crewList.querySelector<HTMLButtonElement>(`[data-hero-ability="${hero.id}"]`);
      const nextLevelXp = xpToLevel(hero.level);
      const ability = getOfficerAbility(hero.id);
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
      if (abilityBtn) {
        const cooldown = Math.ceil(hero.abilityCooldown ?? 0);
        abilityBtn.disabled = cooldown > 0;
        abilityBtn.classList.toggle('cooling-down', cooldown > 0);
        abilityBtn.textContent = cooldown > 0 ? `${cooldown}s` : ability.shortName;
        abilityBtn.title = cooldown > 0
          ? `${ability.name} recarregando.`
          : `${ability.name}: ${ability.description}`;
      }
    }

    for (const actionState of state.tacticalActions) {
      const action = getTacticalAction(actionState.id);
      const btn = this.tacticalActionList.querySelector<HTMLButtonElement>(
        `[data-tactical-action="${actionState.id}"]`,
      );
      if (!btn) continue;
      const cooldown = Math.ceil(actionState.cooldown);
      btn.disabled = cooldown > 0;
      btn.classList.toggle('cooling-down', cooldown > 0);
      btn.textContent = cooldown > 0 ? `${cooldown}s` : action.shortName;
      btn.title = cooldown > 0
        ? `${action.name} recarregando.`
        : `${action.name}: ${action.description}`;
    }

    let affordableUpgradeCount = 0;
    for (const upgrade of UPGRADE_TEMPLATES) {
      const level = getUpgradeLevel(state, upgrade.id);
      const cost = getUpgradeCost(upgrade.id, level);
      const canAfford = state.credits >= cost;
      const levelEl = this.upgradeList.querySelector(`[data-upgrade-level="${upgrade.id}"]`);
      const costEl = this.upgradeList.querySelector(`[data-upgrade-cost="${upgrade.id}"]`);
      const btn = this.upgradeList.querySelector<HTMLButtonElement>(`[data-upgrade="${upgrade.id}"]`);
      const card = this.upgradeList.querySelector<HTMLElement>(`[data-upgrade-card="${upgrade.id}"]`);
      if (levelEl) levelEl.textContent = String(level);
      if (costEl) costEl.textContent = formatNumber(cost);
      if (btn) btn.disabled = !canAfford;
      if (card) card.classList.toggle('hidden', !canAfford);
      if (canAfford) affordableUpgradeCount += 1;
    }
    this.upgradeEmpty.classList.toggle('hidden', affordableUpgradeCount > 0);

    const gain = estimatePrestigeGain(state);
    this.prestigeGain.textContent = `+${gain}`;
    this.prestigeBonus.textContent = `+${getPrestigeBonusPercent(state)}%`;
    this.prestigeBtn.disabled = !canPrestige(state);

    this.totalDefeated.textContent = formatNumber(state.totalEnemiesDefeated);
    this.prestigeCount.textContent = formatNumber(state.prestigeCount);
    this.lastSave.textContent = formatRelativeSaveTime(state.lastSave);
    this.updateHeroOverlay();
    this.updateStoreOverlay();
    this.updateBridgeOverlay();
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

  private importSelectedSave(): void {
    const file = this.importSaveFile.files?.[0];
    this.importSaveFile.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      const raw = typeof reader.result === 'string' ? reader.result : '';
      if (!raw) {
        this.setStatus('Arquivo de save vazio ou inválido.');
        return;
      }

      try {
        this.onImportSave(raw);
        this.setStatus('Save importado com sucesso.');
      } catch {
        this.setStatus('Não foi possível importar este save.');
      }
    });
    reader.readAsText(file);
  }

  private openCommandOverlay(): void {
    this.commandOverlay.classList.remove('hidden');
    this.commandOverlay.setAttribute('aria-hidden', 'false');
  }

  private closeCommandOverlay(): void {
    this.commandOverlay.classList.add('hidden');
    this.commandOverlay.setAttribute('aria-hidden', 'true');
  }

  private openBridgeOverlay(): void {
    this.bridgeOverlay.classList.remove('hidden');
    this.bridgeOverlay.setAttribute('aria-hidden', 'false');
    this.updateBridgeOverlay();
  }

  private closeBridgeOverlay(): void {
    this.bridgeOverlay.classList.add('hidden');
    this.bridgeOverlay.setAttribute('aria-hidden', 'true');
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
      step.classList.toggle('hud-visible', zoneId === state.combat.zoneId || zoneId === state.combat.zoneId + 1);
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

  private updateBridgeOverlay(): void {
    if (!this.currentState || this.bridgeOverlay.classList.contains('hidden')) return;

    const state = this.currentState;
    const zone = getZone(state.combat.zoneId);
    const hullPercent = (state.ship.hull / state.ship.maxHull) * 100;
    const shieldPercent = (state.ship.shield / state.ship.maxShield) * 100;
    const weaponReadiness = Math.min(
      100,
      (state.ship.weaponTimer / getShipWeaponInterval(state)) * 100,
    );

    this.bridgeZone.textContent = zone.name;
    this.bridgeEnemy.textContent = state.combat.isBoss ? `BOSS: ${state.combat.enemyName}` : state.combat.enemyName;
    this.bridgeHull.textContent = `${formatNumber(state.ship.hull)} / ${formatNumber(state.ship.maxHull)}`;
    this.bridgeShield.textContent = `${formatNumber(state.ship.shield)} / ${formatNumber(state.ship.maxShield)}`;
    this.bridgeDps.textContent = formatNumber(getFleetDps(state));
    this.bridgeHullBar.style.width = `${Math.max(0, hullPercent)}%`;
    this.bridgeShieldBar.style.width = `${Math.max(0, shieldPercent)}%`;
    this.bridgeWeaponBar.style.width = `${weaponReadiness}%`;
    this.updateBridgeFocus(state);
    this.bridgeEffects.innerHTML = this.renderBridgeEffects(state);
    this.bridgeReadiness.innerHTML = this.renderBridgeReadiness(state);

    for (const hero of state.heroes) {
      const levelEl = this.bridgeStations.querySelector(`[data-bridge-level="${hero.id}"]`);
      const xpEl = this.bridgeStations.querySelector(`[data-bridge-xp="${hero.id}"]`);
      const alertEl = this.bridgeStations.querySelector<HTMLElement>(`[data-bridge-alert="${hero.id}"]`);
      const stationEl = this.bridgeStations.querySelector<HTMLElement>(`[data-bridge-hero="${hero.id}"]`);
      const nextLevelXp = xpToLevel(hero.level);
      const hasAvailableSkill = getOfficerSkills(hero.id).some((skill) => {
        return !hero.unlockedSkills.includes(skill.id)
          && hero.level >= skill.requiredLevel
          && hero.skillPoints >= skill.cost;
      });

      if (levelEl) levelEl.textContent = String(hero.level);
      if (xpEl) xpEl.textContent = `XP ${formatNumber(hero.xp)} / ${formatNumber(nextLevelXp)}`;
      if (alertEl) alertEl.classList.toggle('hidden', !hasAvailableSkill);
      if (stationEl) stationEl.classList.toggle('has-upgrade', hasAvailableSkill);
    }
  }

  private updateBridgeFocus(state: GameState): void {
    const focus = getOperationalFocus(state.operationalFocusId);
    this.bridgeFocus.querySelectorAll<HTMLButtonElement>('[data-bridge-focus]').forEach((btn) => {
      const isActive = btn.dataset.bridgeFocus === focus.id;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
  }

  private renderBridgeEffects(state: GameState): string {
    const effects = [
      ...state.activeAbilityEffects.map((effect) => ({
        name: effect.name,
        remaining: effect.remaining,
      })),
      ...state.activeTacticalEffects.map((effect) => ({
        name: effect.name,
        remaining: effect.remaining,
      })),
    ];

    if (effects.length === 0) {
      return '<div class="bridge-empty">Nenhum efeito ativo.</div>';
    }

    return effects.map((effect) => `
      <div class="bridge-effect-chip">
        <strong>${effect.name}</strong>
        <span>${Math.ceil(effect.remaining)}s</span>
      </div>
    `).join('');
  }

  private renderBridgeReadiness(state: GameState): string {
    const officerReadiness = state.heroes.map((hero) => {
      const template = HERO_TEMPLATES.find((candidate) => candidate.id === hero.id);
      const ability = getOfficerAbility(hero.id);
      const cooldown = Math.ceil(hero.abilityCooldown ?? 0);
      return {
        name: template?.name ?? hero.id,
        label: ability.shortName,
        cooldown,
      };
    });
    const tacticalReadiness = state.tacticalActions.map((actionState) => {
      const action = getTacticalAction(actionState.id);
      return {
        name: action.shortName,
        label: 'Tática',
        cooldown: Math.ceil(actionState.cooldown),
      };
    });

    return [...officerReadiness, ...tacticalReadiness].map((item) => `
      <div class="bridge-readiness-item ${item.cooldown > 0 ? 'cooling-down' : 'ready'}">
        <span>${item.label}</span>
        <strong>${item.cooldown > 0 ? `${item.cooldown}s` : 'Pronto'}</strong>
        <small>${item.name}</small>
      </div>
    `).join('');
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
