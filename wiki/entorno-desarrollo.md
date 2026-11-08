# Entorno de desarrollo

Cómo se trabaja en La Paz Sí Pasa: máquina, servicios locales, agentes, herramientas y calidad. Vigente desde el 2026-11-08 (migración FSE en `feat/wordpress-fse`).

## Máquina y herramientas base

| Herramienta | Versión | Uso |
|---|---|---|
| macOS | 26.6 | — |
| Docker Desktop | Docker 29.7, Compose 5.5 | todos los servicios y las herramientas de calidad corren en contenedores |
| Node | 24 en la máquina; 22.23.4 en contenedores y CI | Astro, Stylelint, ESLint, TypeScript y las pruebas E2E |
| Google Chrome | estable | pruebas E2E y visuales vía CDP (headless) |
| Orca | 1.4 | terminales, worktrees y paneles de agentes |
| Claude Code | 2.1 | agente principal: implementa, coordina y verifica |
| Codex CLI | 0.166 | agente de apoyo para tareas acotadas |
| AGY (Antigravity CLI) | 1.5 | agente de apoyo para tareas acotadas |

PHP, Composer, wp-cli y los linters no se instalan en la máquina: van en imágenes Docker con versión fija.

## Servicios locales

| Servicio | URL | Cómo se levanta | Para qué |
|---|---|---|---|
| WordPress FSE (tema `lapaz`) | http://localhost:8090 | `cd apps/wp-fse && docker compose up -d --build` | la migración en curso |
| WordPress headless (actual) | http://localhost:8080 | `docker compose up -d cms db` (raíz) | el CMS de producción hoy; no se toca durante la prueba |
| Astro (actual) | http://localhost:4321 | `cd apps/frontend && npm ci && npx astro dev --port 4321` | referencia visual; sin WordPress usa los mocks |

Los dos WordPress son proyectos de compose separados (`lapaz-fse` y el de la raíz), con volúmenes, bases y puertos propios. Pueden correr a la vez.

### WordPress FSE, primera vez

```bash
cd apps/wp-fse
cp .env.example .env          # poner contraseñas de la base y WP_ADMIN_EMAIL
docker compose up -d --build  # compose.yaml + compose.override.yaml (local)
docker compose exec -u www-data cms lapaz-setup
```

- `lapaz-setup` es idempotente. Instala WordPress en español, activa el tema y crea la página "Proyectos destacados" y el menú "Principal". Solo en local agrega además Query Monitor y Create Block Theme.
- La contraseña de admin se genera una vez y se guarda en `apps/wp-fse/credenciales-local.txt`, que git ignora. Para cambiarla:

  ```bash
  docker compose exec -u www-data cms wp user update admin --user_pass='…'
  ```
- **Lo que solo existe en local** (`compose.override.yaml`):
  - puerto 8090;
  - bind mount del tema, así lo editado se ve sin reconstruir;
  - `WP_DEBUG`;
  - `WP_DEVELOPMENT_MODE=theme`, para que WordPress no cachee `theme.json` ni las plantillas.
- **Producción (Dokploy)** usa solo `compose.yaml`: el tema va horneado en la imagen, sin puertos publicados. Ver [buenas prácticas, sección Dokploy](buenas-practicas-wordpress.md#7-despliegue-en-dokploy).

### Comandos útiles

```bash
cd apps/wp-fse
docker compose exec -u www-data cms wp …         # wp-cli (va dentro de la imagen)
docker compose logs -f cms                       # logs de Apache/PHP
docker compose -f compose.yaml up -d --build     # probar la imagen tal como la correría Dokploy
docker compose down                              # detener (los datos quedan en los volúmenes)
docker compose down -v                           # borrar también la base y uploads (WordPress en cero)
```

## Calidad: el criterio de "hecho"

```bash
apps/wp-fse/bin/check                              # 13 capas de análisis estático, todo en Docker
cd apps/wp-fse && node tests/e2e/navbar.mjs        # comportamiento (con el stack en :8090)
cd apps/wp-fse && node tests/e2e/navbar.mjs --visual   # y comparación de píxeles con Astro
```

- Sin `bin/check` en verde no se cierra una etapa ni se abre un PR.
- La CI (`.github/workflows/wp-fse.yml`) repite el chequeo y las pruebas de comportamiento.
- Las reglas se endurecen; nunca se relajan para que pase un cambio.
- Detalle de cada capa: [etapa 1.5](specs/wordpress-fse/etapa-1-5-calidad.md).

**Antes de retirar Astro**, se capturan sus bases visuales:

```bash
node tests/e2e/navbar.mjs --baseline http://127.0.0.1:4321
```

## Agentes

**Claude implementa.** Tiene más cuota y lleva el contexto del proyecto. Codex y AGY reciben tareas acotadas cuando conviene trabajar en paralelo.

Cómo se delega, siempre en la misma ventana de Orca para ver a todos trabajar:

1. Se escribe el brief en un archivo: objetivo, archivos asignados sin solaparse, contrato con las otras piezas, y la regla de no hacer commit, push ni correr docker.
2. Se abre el agente en un **panel dividido del mismo worktree**:

   ```bash
   orca terminal split --terminal <panel-de-claude> --direction vertical \
     --command "codex --sandbox workspace-write --ask-for-approval on-request \"\$(cat brief.md)\""
   orca terminal split --terminal <panel> --direction horizontal \
     --command "agy --mode accept-edits -i \"\$(cat brief.md)\""
   orca terminal set-pane-title --terminal <handle> --title "CODEX · infra"
   ```
3. Claude sigue el avance con `orca terminal read --terminal <handle> --screen`, revisa lo entregado y verifica con `bin/check`. Solo Claude hace commit.

No se usan otras pestañas ni worktrees para delegar, salvo que se pida.

### Skills

| Skill | Dónde | Para qué |
|---|---|---|
| `wp-block-development`, `wp-block-themes`, `wp-performance`, `wp-wpcli-and-ops`, `wp-project-triage` | `.claude/skills/` (oficiales de WordPress, no versionadas) | reglas actuales de bloques, temas, rendimiento y wp-cli |
| `project`, `documentador` | globales | flujo de rama → PR → merge y wiki del proyecto |
| `orca-cli` | global | terminales y paneles de agentes |
| `wordpress-scf-headless`, `astro-wordpress-headless` | `skills/` del repo | stack headless actual; la segunda se retira en la etapa 8 |

Para reinstalar las skills de WordPress:

```bash
npx skills add WordPress/agent-skills --skill wp-block-development wp-block-themes wp-performance wp-wpcli-and-ops wp-project-triage -a claude-code -y
```

### MCP y conectores

- **Dokploy MCP:** dominios, deploys, logs, volúmenes y backups. Se usa en la etapa de staging y cambio de dominio.
- **Claude in Chrome:** la extensión no estaba conectada el 2026-11-08. Las pruebas visuales usan Chrome headless por CDP (`tests/e2e/navbar.mjs`), que no depende de la extensión.
- **Se descartaron:** los MCP de WordPress (mcp-adapter, Playground). wp-cli por `docker compose exec` cubre lo mismo con menos riesgo.

## Documentación

- Todo vive en `wiki/` dentro de la rama: specs por etapa, decisiones, buenas prácticas y este archivo.
- Las decisiones se basan en la documentación oficial de WordPress, enlazada en [buenas-practicas-wordpress.md](buenas-practicas-wordpress.md).
- Se avanza etapa por etapa: documento de la etapa, aprobación, construcción, `bin/check` en verde, resultado documentado.

## Secretos

- `.env`, `.env.*` (menos `.env.example`), `credenciales*.txt` y `docs/` están en `.gitignore`. El repo es público.
- En Dokploy, los secretos van solo en las variables de entorno del servicio.
