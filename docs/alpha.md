# Alpha 0.1.0

Esta versão é uma build alfa jogável de Stellar Idle RPG.

## Escopo

- Combate automático no navegador.
- Ações táticas leves durante o combate.
- Ordens rápidas contextuais com FX e indicadores de impacto no canvas.
- Passadiço com leitura operacional de efeitos ativos e prontidão.
- Foco operacional persistido para ajustar prioridade da nave.
- Oficiais com XP, pontos de habilidade, passivas desbloqueáveis e especiais ativos.
- Bosses no encerramento das áreas.
- Progresso local com `localStorage`.
- Backup manual via exportação/importação de arquivo JSON.
- Monetização apenas simulada em modo dev, sem pagamentos reais.

## Loop Atual

1. A nave combate automaticamente a ameaça atual.
2. O jogador usa créditos para melhorar sistemas da nave.
3. Oficiais recebem XP e desbloqueiam habilidades que potencializam sistemas.
4. Ações táticas e ordens rápidas permitem intervenção manual durante o combate.
5. O passadiço permite ajustar o foco operacional e consultar prontidão.
6. O Salto Quântico reinicia progresso em troca de bônus permanentes.

## Persistência

O save é salvo automaticamente no navegador e também pode ser exportado pelo painel **Comando**. A importação aceita saves exportados pelo próprio jogo e saves locais antigos sem envelope versionado.

Limitações conhecidas:

- O progresso local não sincroniza entre dispositivos.
- Limpar dados do navegador remove o save local.
- Compras e moedas premium ainda não devem ser consideradas seguras para produção sem backend.

## Deploy

Build padrão:

```bash
npm run build
```

Deploy atual:

```text
https://stellar-ten-nu.vercel.app/
```
