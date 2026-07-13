# Issues do Roadmap

Rascunhos prontos para abrir no GitHub, seguindo `.github/ISSUE_TEMPLATE/feature.yml` e a convenção de branch de `docs/workflow.md`. Ajuste números de issue conforme forem criadas.

---

## Estória

### `feat: lore por zona e boss`

**Branch sugerida:** `feat/NN-zone-lore`

**Resumo**
Adicionar 2-3 linhas de lore por zona (ao chegar) e por boss (ao derrotar), exibidas no passadiço.

**Valor para o jogador**
Dá contexto narrativo ao progresso, sem depender de cutscenes ou texto longo que quebre o ritmo idle.

**Escopo**

Entra:
- Texto de chegada por zona (`ZoneTemplate`)
- Texto de vitória por boss
- Exibição no passadiço, sem bloquear o combate

Fora:
- Voice over ou animação
- Cutscenes

**Critérios de aceite**
- Build passa
- Cada zona exibe texto de chegada
- Cada boss exibe texto de vitória ao ser derrotado
- Texto não interrompe o loop de combate automático

---

### `feat: onboarding guiado pela Nova`

**Branch sugerida:** `feat/NN-guided-onboarding`

**Resumo**
Tutorial contextual nos primeiros 60s de jogo, guiado por texto da Comandante Nova, sem modais sequenciais.

**Valor para o jogador**
Reduz fricção de entrada sem recorrer a telas explicativas que o jogador ignora.

**Escopo**

Entra:
- Sequência de dicas contextuais (HUD, créditos, ordens rápidas)
- Gatilho por progresso real (ex.: ordens rápidas só aparecem quando há créditos suficientes)

Fora:
- Tutorial replayável via menu
- Localização para outros idiomas

**Critérios de aceite**
- Build passa
- Novo jogador vê as dicas na primeira sessão
- Dicas não reaparecem em sessões seguintes
- Nenhuma dica bloqueia interação com o HUD

---

## Mecânica

### `feat: herói tático/piloto`

**Branch sugerida:** `feat/NN-hero-tactician`

**Resumo**
Adicionar novo oficial com papel de manobra evasiva, reduzindo dano recebido pela nave por tempo limitado.

**Valor para o jogador**
Amplia a composição de tripulação com um papel defensivo distinto de escudo/casco.

**Escopo**

Entra:
- Novo `HeroTemplate`
- Especial do tipo `timed_effect` (redução de dano)
- Skills passivas do oficial

Fora:
- Balanceamento final de custo/XP
- Novas zonas ou inimigos

**Critérios de aceite**
- Build passa
- Oficial aparece na tripulação e pode ser evoluído
- Especial reduz dano recebido durante sua duração
- Persistência do save inclui o novo oficial

---

### `feat: herói hacker/sabotador e novo tipo de habilidade debuff`

**Branch sugerida:** `feat/NN-hero-hacker`

**Resumo**
Adicionar oficial com habilidade que reduz a defesa do inimigo atual, e o novo `kind: debuff_enemy` em `OfficerAbility`.

**Valor para o jogador**
Introduz interação com o inimigo além de dano/recuperação, abrindo espaço para combos futuros.

**Escopo**

Entra:
- Novo `HeroTemplate`
- Novo `kind: debuff_enemy` no tipo `OfficerAbility`
- Aplicação do debuff no cálculo de combate

Fora:
- Sistema de combos (issue separada)
- Inimigos com resistência a debuff

**Critérios de aceite**
- Build passa
- Habilidade reduz defesa do inimigo por tempo determinado
- Efeito visível no HUD/canvas
- Debuff expira corretamente

---

### `feat: sistema de afinidades entre oficiais`

**Branch sugerida:** `feat/NN-officer-affinities`

**Resumo**
Agrupar oficiais por afinidade de sistema (Armas / Defesa / Suporte / Tática) e conceder bônus de sinergia quando 2+ oficiais da mesma afinidade estão ativos.

**Valor para o jogador**
Cria decisões de composição de tripulação, não só progressão individual.

**Escopo**

Entra:
- Campo de afinidade em `HeroTemplate`
- Cálculo de bônus de sinergia reaproveitando `SkillEffectType`
- Indicação visual da afinidade ativa

Fora:
- Rebalanceamento de skills existentes
- Novos heróis

**Critérios de aceite**
- Build passa
- Bônus de sinergia é aplicado corretamente quando há 2+ oficiais da mesma afinidade
- HUD indica quando a sinergia está ativa

---

### `feat: sistema de combos entre habilidades ativas`

**Branch sugerida:** `feat/NN-ability-combos`

**Resumo**
Janela de combo: habilidades ativas de afinidades complementares disparadas dentro de um intervalo curto geram efeito bônus.

**Valor para o jogador**
Recompensa jogo ativo (timing de habilidades) além do loop passivo.

**Escopo**

Entra:
- Janela de tempo entre acionamentos (ex.: 3s)
- Tabela de pares de combo e efeito bônus
- Feedback visual/FX no canvas quando o combo acontece

Fora:
- Combos com 3+ habilidades
- Balanceamento fino de valores

**Critérios de aceite**
- Build passa
- Combo é detectado corretamente dentro da janela definida
- Efeito bônus é aplicado uma única vez por ativação de combo
- FX indica o combo ao jogador

---

### `feat: inimigos elite nas zonas existentes`

**Branch sugerida:** `feat/NN-elite-enemies`

**Resumo**
Adicionar variante elite de inimigos nas zonas atuais, com recompensa maior e resistência a um sistema específico.

**Valor para o jogador**
Quebra a repetição das ondas comuns e cria pequenos picos de desafio antes do boss.

**Escopo**

Entra:
- Variante elite por zona (`ZoneTemplate`)
- Multiplicador de drop
- Resistência a um sistema (ex.: armas ou escudo)

Fora:
- Novas zonas
- Sistema de combos (dependência apenas conceitual)

**Critérios de aceite**
- Build passa
- Inimigo elite aparece com frequência configurável por zona
- Drop de créditos/XP reflete o multiplicador
- Resistência é aplicada corretamente no cálculo de combate

---

## Monetização

### `feat: cosméticos de casco e moldura de oficial`

**Branch sugerida:** `feat/NN-cosmetics-hull-frame`

**Resumo**
Adicionar skins de casco por zona/afinidade e molduras de oficial por marco de progresso, seguindo `docs/monetization.md`.

**Valor para o jogador**
Permite personalização sem impacto em progressão ou combate.

**Escopo**

Entra:
- Novos itens em `StoreItem` (categoria `cosmetic`)
- Molduras ganháveis por marco de progresso (não só compradas)
- Aplicação visual no HUD

Fora:
- Pagamento real (depende de backend, já listado em `docs/monetization.md`)
- Sistema de raridade

**Critérios de aceite**
- Build passa
- Cosméticos aparecem em Suprimentos em modo dev
- Pelo menos um cosmético é obtido por progresso, sem compra
- Nenhum cosmético afeta estatísticas de combate

---

### `feat: boost temporário de drop de relíquia`

**Branch sugerida:** `feat/NN-boost-relic-drop`

**Resumo**
Novo item de acelerador temporário que aumenta a chance de drop de relíquia, com teto e duração visíveis.

**Valor para o jogador**
Oferece conveniência opcional sem interferir na progressão gratuita.

**Escopo**

Entra:
- Novo `StoreItem` (categoria `boost`)
- Integração com `ActiveBoost` existente
- Exibição clara de duração e multiplicador

Fora:
- Sistema de relíquias em si (dependência de outra issue)
- Pagamento real

**Critérios de aceite**
- Build passa
- Boost aparece em Suprimentos em modo dev
- Duração e efeito numérico são exibidos claramente
- Boost expira corretamente ao fim da duração

---

### `feat: zona lateral premium opcional`

**Branch sugerida:** `feat/NN-premium-side-zone`

**Resumo**
Zona opcional fora da campanha principal, categorizada como conteúdo premium, sem bloquear progresso da campanha base.

**Valor para o jogador**
Oferece conteúdo extra para quem quiser, sem penalizar quem não comprar.

**Escopo**

Entra:
- Nova `ZoneTemplate` marcada como opcional/lateral
- Acesso via Suprimentos em modo dev
- Confirmação de que a campanha principal funciona sem essa zona

Fora:
- Pagamento real
- Balanceamento de recompensas da zona

**Critérios de aceite**
- Build passa
- Zona lateral é acessível sem afetar progresso das 4 zonas principais
- Zona aparece corretamente identificada como conteúdo opcional na navegação

---

## Observações gerais

- Cada issue deve ser aberta individualmente no GitHub usando o template `feature.yml`.
- Numerar branches conforme o número real da issue (`feat/12-zone-lore`, por exemplo).
- Atualizar `CHANGELOG.md`, `README.md` e o doc relevante (`alpha.md` ou `monetization.md`) junto de cada entrega, conforme `docs/workflow.md`.
