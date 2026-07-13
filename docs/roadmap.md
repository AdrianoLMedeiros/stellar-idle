# Roadmap de Desenvolvimento

Este documento organiza a evolução do jogo em três vertentes: estória, mecânica e monetização. Complementa `docs/alpha.md` (escopo atual) e `docs/monetization.md` (princípios de loja), sem substituí-los.

## 1. Estória

### Fio narrativo

O arco atual segue as 4 zonas existentes:

- **Ato 1 — Estação Órbita-7**: descoberta. Drones isolados, primeiro sinal de ameaça.
- **Ato 2 — Cinturão de Asteroides**: conflito. Piratas xeno revelam que a ameaça é maior que um incidente local.
- **Ato 3 — Nebulosa Kryon**: escalada. Máquinas corrompidas indicam que uma inteligência central está por trás dos ataques.
- **Ato 4 — Núcleo da Singularidade**: confronto. Revelação da IA central como vilã.

Cada zona e cada boss devem ganhar 2-3 linhas de lore, exibidas no passadiço ao chegar na zona e ao derrotar o boss.

### Onboarding

- Primeiros 60 segundos guiados pela Comandante Nova via texto contextual (sem modais sequenciais).
- Tutorial por desbloqueio real: ordens rápidas aparecem quando o jogador já tem créditos suficientes para sentir o impacto; ações táticas, na primeira ameaça relevante.

### Faseamento

| Fase | Escopo |
|---|---|
| Alpha (atual) | Loop core + 4 zonas, sem lore amarrada |
| Beta narrativa | Lore por zona/boss, eventos de história lateral |
| Launch | 6+ zonas, arco fechado, epílogo pós-Singularidade (gancho de expansão) |

### Arte

Paleta sóbria alinhada ao que já existe: azul da Nova como cor primária, cinza/metálico de nave, dourado/prata como accent de raridade em upgrades e cosméticos. Mantém identidade visual coerente sem introduzir ruído.

## 2. Mecânica

### Novos heróis

Preenchem lacunas de papel na tripulação atual (comandante, artilheiro, engenheira, médica):

| Herói | Papel | Especial |
|---|---|---|
| Tático/Piloto | manobra evasiva, reduz dano recebido | `timed_effect` (redução de dano) |
| Hacker/Sabotador | debuff no inimigo, reduz defesa dele | novo `kind: debuff_enemy` |
| Intendente | multiplica créditos/loot por tempo | `timed_effect` (credit_gain) |

### Afinidades

As skills já afetam sistemas da nave (`weapon_damage`, `ship_shield`, `shield_regen`, `credit_gain`, `xp_gain`). Proposta: agrupar oficiais por afinidade de sistema (Armas / Defesa / Suporte / Tática) e conceder bônus de sinergia quando 2+ oficiais da mesma afinidade estão ativos. Reaproveita a estrutura de `SkillEffectType` existente.

### Combos

Janela de combo: se duas habilidades ativas (`OfficerAbility`) de afinidades complementares disparam dentro de um intervalo curto (ex.: 3s), gera efeito bônus (ex.: Ordem de Combate + Rajada Focada = dano crítico extra). Baixo custo de implementação, já que as habilidades rastreiam timestamp de cooldown.

### Outras mecânicas

- Inimigos elite dentro das zonas existentes (drop maior, resistência a um sistema específico).
- Modificadores de zona pós-Salto Quântico (ex.: zona com escudo inimigo reforçado).
- Relíquias ganhas com Cristais Quânticos, complementando o bônus fixo de +5% poder.

## 3. Monetização

Extensão do `docs/monetization.md`, sem alterar seus princípios (sem venda de vitória, sem RNG pago opaco, sem pressão por perda):

- **Cosméticos**: skins de casco por zona/afinidade, molduras de oficial por marco de progresso (algumas ganháveis, não só compradas).
- **Aceleradores temporários**: além dos já existentes (créditos, XP, offline), boost de drop de relíquia — sempre com teto e duração visíveis.
- **Qualidade de vida**: fila de ações táticas, presets de foco operacional, relatório de combate detalhado.
- **Conteúdo premium**: zona lateral opcional, que não bloqueia a campanha principal.

Os requisitos de backend, autenticação e reembolso já listados em `docs/monetization.md` continuam como pré-condição antes de qualquer SKU virar compra real.
