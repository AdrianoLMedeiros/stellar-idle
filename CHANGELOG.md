# Changelog

## Unreleased

### Adicionado

- Escalonamento por ciclo: ao completar as 4 zonas e retornar para a primeira, inimigos ficam mais fortes (HP e ataque) e as recompensas de créditos/XP aumentam, mantendo o Salto Quântico relevante em vez de repetir o mesmo desafio indefinidamente. O ciclo atual aparece no painel de Navegação.
- Ações táticas acionáveis durante o combate: reparo, barreira, sobrecarga e varredura.
- Cooldowns e efeitos temporários persistidos no save local.
- Passadiço operacional com efeitos ativos e prontidão de oficiais/ações táticas.
- Foco operacional do Passadiço com posturas equilibrada, ofensiva, defensiva e exploração.
- Ordens rápidas de combate com Fogo Concentrado, Escudos à Frente e Manobra Evasiva.
- FX no canvas para acionamento de ordens táticas contextuais.
- Indicadores flutuantes de impacto para ordens rápidas no canvas.
- Workflow documentado com revisão por Vercel, SonarCloud/SonarQube e GitHub Codex Connector.
- Vercel Analytics inicializado no bootstrap do app para métricas de uso do deploy alfa.

### Documentação

- README, alpha, monetização e workflow atualizados com o estado atual do projeto.

### Alterado

- Layout reorganizado em grade fixa: painel superior (título, menu e recursos), coluna esquerda (nave, status e navegação), área central (canvas de batalha e tripulação) e coluna direita (melhorias e salto quântico), substituindo os painéis flutuantes sobrepostos ao canvas.
- Nome da zona e alerta de chefe no canvas de batalha centralizados e reposicionados mais próximos do topo, liberando espaço para a cena de combate; nome da zona com fonte maior e alerta de chefe com brilho avermelhado.

### Corrigido

- Canvas de batalha mantém a proporção correta em qualquer viewport, sem esticar os sprites da nave e do inimigo.

### Alterado

- Painéis do HUD principal (nave, melhorias, tripulação, navegação) ~10% mais compactos na largura padrão de desktop, deixando mais da cena de batalha visível.

## 0.1.0-alpha.1

Primeira versão alfa jogável publicada.

### Adicionado

- HUD em tela cheia com canvas como área principal de combate.
- Nave como entidade central de combate, com casco, escudo, armas e regeneração.
- Tripulação com XP, habilidades passivas, especiais ativos e overlay de detalhes.
- Passadiço da nave como overlay de leitura tática e estações dos oficiais.
- Bosses ao final de cada área.
- Suprimentos em modo dev para preparar monetização futura.
- Save local versionado em `localStorage`.
- Exportação e importação de backup de save pelo painel Comando.

### Alterado

- Painéis principais reposicionados como HUD flutuante sobre o canvas.
- Navegação compactada para fase atual e próxima.
- Melhorias da nave passam a mostrar apenas opções compráveis.

### Corrigido

- Texto de fase e alerta de boss deixam de ficar escondidos pelos painéis superiores.
- Cards de tripulação receberam mais altura para evitar corte dos botões.
