# Alpha 0.1.0

Esta versão é uma build alfa jogável de Stellar Idle RPG.

## Escopo

- Combate automático no navegador.
- Ações táticas leves durante o combate.
- Progresso local com `localStorage`.
- Backup manual via exportação/importação de arquivo JSON.
- Monetização apenas simulada em modo dev, sem pagamentos reais.

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
