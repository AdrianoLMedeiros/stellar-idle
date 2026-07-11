# Workflow de Desenvolvimento

A partir da fase alfa, cada nova feature deve nascer de uma issue e seguir por branch e pull request.

## Fluxo

1. Criar uma issue descrevendo valor para o jogador, escopo e critérios de aceite.
2. Criar uma branch a partir de `main`.
3. Implementar commits pequenos e funcionais.
4. Abrir PR vinculando a issue.
5. Validar localmente com `npm run build`.
6. Aguardar checks automatizados do PR.
7. Revisar apontamentos do SonarCloud e do GitHub Codex Connector.
8. Fazer merge apenas quando a feature estiver jogável, documentada quando necessário e sem feedback acionável pendente.

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

## Revisão Automatizada

Antes do merge, confira os sinais automatizados do PR:

- **Vercel**: o preview deve estar publicado com sucesso.
- **SonarCloud/SonarQube**: o Quality Gate deve passar. Issues novas devem ser corrigidas ou justificadas no PR.
- **GitHub Codex Connector**: comentários de revisão devem ser lidos e classificados entre acionáveis, informativos ou falsos positivos.

Quando houver feedback acionável:

1. Corrija em commits pequenos no mesmo branch do PR.
2. Rode `npm run build` novamente.
3. Faça push e aguarde nova rodada de checks.
4. Só prossiga para merge quando SonarCloud, Vercel e feedbacks do Codex estiverem resolvidos ou explicitamente justificados.

Comentários do Codex que afetem gameplay, persistência, balanceamento ou fluxo do usuário têm prioridade sobre ajustes cosméticos de código.

## Releases Alfa

Versões alfa usam tags anotadas:

```text
v0.1.0-alpha.1
v0.1.0-alpha.2
```
