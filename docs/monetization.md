# Monetizacao

## Estado Atual

A monetizacao ainda e apenas uma base de produto. O jogo possui um overlay de **Suprimentos** em modo dev, com itens simulados localmente e sem processamento real de pagamento.

Nenhuma compra real existe nesta fase alfa.

## Principios

- O jogo precisa continuar divertido sem compra.
- Compras nao devem bloquear progresso principal, bosses, prestigio ou habilidades essenciais.
- Beneficios pagos podem acelerar ritmo, melhorar conveniencia ou liberar cosmeticos.
- Dano, casco, escudo e progressao podem receber bonus leves e temporarios, mas nunca devem substituir o loop de jogo.
- Toda compra real futura deve ter descricao clara, duracao clara e impacto numerico visivel.
- Ordens rapidas, acoes taticas e habilidades essenciais devem continuar acessiveis pelo jogo base.

## Categorias permitidas

- Cosmeticos: skins de nave, molduras de oficiais, trilhas visuais e temas de interface.
- Aceleradores temporarios: bonus de creditos, XP ou progresso offline por tempo limitado.
- Qualidade de vida: automacoes, presets, filas e relatorios extras.
- Conteudo premium: setores, campanhas ou eventos laterais que nao bloqueiem a campanha base.

## Categorias proibidas

- Venda direta de vitoria contra boss.
- Itens com chance aleatoria paga sem transparencia total.
- Upgrade permanente que torne a progressao gratuita irrelevante.
- Pressao por perda: timers punitivos, perda de progresso evitavel apenas com pagamento.

## Primeira implementacao

Nesta fase, a loja e apenas uma simulacao local para desenvolvimento.

- `StoreItem`: item exibido no overlay de Suprimentos.
- `Entitlement`: direito permanente, como cosmetico ou qualidade de vida.
- `ActiveBoost`: beneficio temporario com expiracao por timestamp.
- `PremiumState`: estado salvo com entitlements e boosts ativos.

Os botoes de compra usam modo dev e nao processam pagamento real.

## Requisitos Antes de Pagamento Real

- Backend para validar compras, moedas premium e entitlements.
- Autenticacao ou identificador confiavel de jogador.
- Politica clara de reembolso/suporte.
- Auditoria de balanceamento para evitar vantagem permanente excessiva.
- Separacao entre save local e dados economicos sensiveis.
