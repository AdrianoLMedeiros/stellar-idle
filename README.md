# Stellar Idle RPG

Idle RPG sci-fi para navegador com combate automático entre uma nave expedicionária e ameaças cibernéticas. A tripulação não luta corpo a corpo: cada oficial potencializa sistemas da nave, como casco, escudos, armas, treinamento e suporte.

## Como jogar

1. Instale dependências: `npm install`
2. Inicie o servidor: `npm run dev`
3. Abra `http://127.0.0.1:5176`

## Mecânicas

- **Nave**: possui casco, escudo, regeneração e armas automáticas.
- **Tripulação**: 4 oficiais evoluem com XP e amplificam sistemas da nave.
- **Habilidades**: oficiais ganham pontos ao subir de nível e desbloqueiam passivas.
- **Créditos**: moeda principal para melhorias da nave.
- **Zonas**: avance derrotando ondas; cada área termina com um boss.
- **Melhorias**: armas, escudos, scanner de loot e simulador tático.
- **Salto Quântico**: reinicia progresso em troca de Cristais Quânticos (+5% de poder permanente por cristal).
- **Offline**: até 8 horas de progresso são calculadas ao voltar.
- **Suprimentos**: base dev para monetização futura com boosts e cosméticos simulados localmente.

## Interface

- **Comando**: overlay com dados da campanha, salvar e resetar.
- **Tripulação**: cada oficial tem um overlay com XP, pontos, contribuição e habilidades.
- **Suprimentos**: overlay de loja dev; não processa pagamento real.

## Monetização

O projeto começou a preparar uma base de monetização sem gateway real. A regra atual é preservar um core gratuito justo e usar compras futuras para conveniência, ritmo e cosméticos. Veja [docs/monetization.md](docs/monetization.md).

## Stack

- Vite + TypeScript
- Canvas 2D (sprites procedurais sci-fi)
- `localStorage` para save automático

## Scripts

- `npm run dev` — desenvolvimento em `http://127.0.0.1:5176`
- `npm run build` — build de produção
- `npm run preview` — preview do build
