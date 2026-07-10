import { GameLoop } from './game/loop';
import { BattleRenderer } from './render/canvas';
import { UIManager } from './ui/ui';

const canvas = document.getElementById('battle-canvas') as HTMLCanvasElement;
const renderer = new BattleRenderer(canvas);

const loop = new GameLoop(
  (state, delta) => {
    ui.update(state);
    renderer.render(state, delta);
  },
  (result) => {
    renderer.addCombatFX(result.damageEvents, result.projectiles);
    if (result.retreatCount > 0) {
      ui.setStatus('Casco crítico. A nave recuou para reparos emergenciais.');
    }
  },
);

const ui = new UIManager(
  (id) => {
    if (loop.tryUpgrade(id)) {
      ui.setStatus('Melhoria aplicada com sucesso.');
    } else {
      ui.setStatus('Créditos insuficientes para esta melhoria.');
    }
  },
  (heroId, skillId) => {
    if (loop.tryUnlockSkill(heroId, skillId)) {
      ui.setStatus('Habilidade de oficial desbloqueada.');
    } else {
      ui.setStatus('Habilidade indisponível para este oficial.');
    }
  },
  (heroId) => {
    const abilityName = loop.tryActivateOfficerAbility(heroId);
    if (abilityName) {
      ui.setStatus(`${abilityName} ativada.`);
    } else {
      ui.setStatus('Especial ainda em recarga.');
    }
  },
  (itemId) => {
    if (loop.tryClaimStoreItem(itemId)) {
      ui.setStatus('Suprimento ativado em modo dev.');
    } else {
      ui.setStatus('Suprimento indisponível.');
    }
  },
  () => {
    const gain = loop.tryPrestige();
    if (gain) {
      ui.setStatus(`Salto Quântico concluído! +${gain} Cristais Quânticos.`);
    }
  },
  () => {
    loop.saveNow();
    ui.setStatus('Progresso salvo manualmente.');
  },
  () => {
    const saveData = loop.exportSave();
    const blob = new Blob([saveData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `stellar-idle-save-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    ui.setStatus('Backup do save exportado.');
  },
  (raw) => {
    loop.importSave(raw);
  },
  () => {
    loop.resetProgress();
    ui.setStatus('Novo comando iniciado. Progresso reiniciado.');
  },
);

loop.onOffline = (kills, hours) => {
  ui.showOfflineReward(kills, hours);
  ui.setStatus(`Bem-vindo de volta! Sua frota venceu ${kills} batalhas offline.`);
};

ui.setStatus('Sistemas online. A tripulação está em combate automático.');
loop.start();

window.addEventListener('beforeunload', () => {
  loop.saveNow();
});
