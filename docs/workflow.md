# Workflow de Desenvolvimento

A partir da fase alfa, cada nova feature deve nascer de uma issue e seguir por branch e pull request.

## Fluxo

1. Criar uma issue descrevendo valor para o jogador, escopo e critérios de aceite.
2. Criar uma branch a partir de `main`.
3. Implementar commits pequenos e funcionais.
4. Abrir PR vinculando a issue.
5. Validar com `npm run build`.
6. Fazer merge apenas quando a feature estiver jogável e documentada quando necessário.

## Branches

Use nomes curtos e rastreáveis:

```text
feat/12-tactical-actions
fix/18-crew-card-overflow
docs/21-alpha-notes
```

## Commits

Prefira commits atômicos:

```text
feat: add tactical action state
feat: render tactical action controls
fix: prevent crew action button overflow
docs: update alpha changelog
```

## Pull Requests

Todo PR deve conter:

- resumo do que mudou;
- issue vinculada;
- validação executada;
- screenshots quando houver mudança visual.

## Releases Alfa

Versões alfa usam tags anotadas:

```text
v0.1.0-alpha.1
v0.1.0-alpha.2
```
