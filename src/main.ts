import { GameLoop } from './game/loop';
import { BattleRenderer } from './render/canvas';
import { UIManager } from './ui/ui';

const canvas = document.getElementById('battle-canvas') as HTMLCanvasElement;
const renderer = new BattleRenderer(canvas);

const loop = new GameLoop(
  (state, delta) => {
    ui.update(state, (heroId) => loop.getHeroAtk(heroId));
    renderer.render(state, delta);
  },
  (result) => {
    renderer.addCombatFX(result.damageEvents, result.projectiles);
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
