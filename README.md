# Stellar Idle RPG

Idle RPG sci-fi para navegador com combate automático, equipe de 4 heróis, sprites 2D em canvas e sistema de **Salto Quântico** (prestígio).

## Como jogar

1. Instale dependências: `npm install`
2. Inicie o servidor: `npm run dev`
3. Abra o endereço exibido no terminal (geralmente `http://localhost:5173`)

## Mecânicas

- **Tripulação**: 4 heróis atacam automaticamente com intervalos diferentes.
- **Créditos**: moeda principal para melhorias da nave.
- **Zonas**: avance derrotando ondas; a cada 10 ondas você desbloqueia um novo setor.
- **Melhorias**: armas, escudos, scanner de loot e simulador tático.
- **Salto Quântico**: reinicia progresso em troca de Cristais Quânticos (+5% de poder permanente por cristal).
- **Offline**: até 8 horas de progresso são calculadas ao voltar.

## Stack

- Vite + TypeScript
- Canvas 2D (sprites procedurais sci-fi)
- `localStorage` para save automático

## Scripts

- `npm run dev` — desenvolvimento
- `npm run build` — build de produção
- `npm run preview` — preview do build
