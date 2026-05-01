# KaylaFlow

Sistema web para **crear, almacenar, renderizar y editar formularios dinámicos** definidos por un schema. Construido con Nuxt 4, Nuxt UI 4 y SQLite.

Permite diseñar formularios desde una interfaz web (sin escribir código), guardarlos en base de datos, rellenarlos y persistir las respuestas.

## Características

- **Editor visual de schemas**: define el formulario campo por campo desde el navegador.
- **Tipos de campo soportados**:
  - `text` — texto corto
  - `textarea` — texto largo
  - `number` — numérico
  - `date` — fecha
  - `select` — dropdown
  - `radio` — elección única (radio group)
  - `checkbox` — elección múltiple (checkbox group)
  - `boolean` — interruptor (switch)
  - `object` — objeto anidado
  - `array` — lista de objetos (formularios anidados repetibles)
  - `file` — adjuntar uno o varios ficheros (almacenados en base64 dentro de la respuesta)
- **Validaciones por campo**: `name`, `displayName`, `required`, `min`/`max` (longitud para texto, rango para número, cantidad para listas y ficheros), `pattern` (regex) para textos y para validar nombre/extensión de ficheros, y `options` para selects/radios/checkboxes.
- **Anidamiento recursivo**: los campos `object` y `array` admiten cualquier combinación de sub-campos, también `object` y `array`. La creación/edición de estos campos se hace mediante **modal**, manteniendo un draft que solo se persiste al confirmar.
- **Persistencia en SQLite** (`better-sqlite3`) con archivo local en `data/kayla-flow.sqlite`.
- **API REST** integrada en Nitro (`/api/forms`, `/api/forms/:id/submissions`, `/api/stats`).
- **Internacionalización** con `@nuxtjs/i18n`: Português, English, Español, Français. Switcher en el header.
- **Modo claro / oscuro** vía `UColorModeButton`.
- **Componentes Nuxt UI 4** (`UCard`, `UModal`, `UFormField`, `UInput`, `USelect`, `URadioGroup`, `UCheckboxGroup`, `USwitch`, `UTextarea`, `UNavigationMenu`, `UHeader`, etc.).

## Stack

| Pieza | Versión |
| --- | --- |
| Nuxt | 4 |
| Nuxt UI | 4 |
| Tailwind CSS | 4 |
| Vue | 3.5 |
| @nuxtjs/i18n | 10 |
| better-sqlite3 | 12 |
| TypeScript | 5 |

## Estructura del proyecto

```
form-builder/
├─ app/
│  ├─ app.vue                    # raíz (UApp + NuxtLayout)
│  ├─ app.config.ts              # color primary
│  ├─ assets/css/main.css        # tailwind + nuxt ui
│  ├─ layouts/
│  │  └─ default.vue             # header con nav, switcher i18n y color mode
│  ├─ pages/
│  │  ├─ index.vue               # Inicio: dashboard con totales y formularios recientes
│  │  └─ forms/
│  │     ├─ index.vue            # listado de formularios
│  │     ├─ new.vue              # crear nuevo schema
│  │     └─ [id]/
│  │        ├─ index.vue         # ver schema + preview
│  │        ├─ edit.vue          # editar schema
│  │        └─ fill.vue          # rellenar y enviar respuesta
│  ├─ components/form-builder/
│  │  ├─ SchemaEditor.vue        # edita título/descripción + lista de campos
│  │  ├─ FieldEditor.vue         # editor recursivo de un campo
│  │  ├─ FormRenderer.vue        # renderiza un schema completo + valida + emite submit
│  │  └─ FieldRenderer.vue       # renderiza un campo (object/array vía modal)
│  ├─ composables/
│  │  ├─ useFieldTypes.ts        # catálogo de tipos + helpers
│  │  └─ useFormValidation.ts    # validación required/min/max/pattern recursiva
│  └─ types/index.d.ts           # FormField, FormSchema, StoredForm, StoredSubmission
├─ server/
│  ├─ utils/db.ts                # better-sqlite3, esquema, helpers de mapeo
│  └─ api/
│     ├─ stats.get.ts            # totales para el dashboard
│     └─ forms/
│        ├─ index.get.ts         # listar
│        ├─ index.post.ts        # crear
│        ├─ [id].get.ts          # obtener
│        ├─ [id].put.ts          # actualizar
│        ├─ [id].delete.ts       # eliminar (cascada en submissions)
│        └─ [id]/
│           └─ submissions.post.ts  # guardar respuesta
├─ i18n/locales/                  # pt.json, en.json, es.json, fr.json
├─ data/                          # SQLite (creado al primer arranque)
└─ nuxt.config.ts
```

## Modelo de datos

### `FormField`

```ts
type FieldType =
  | 'text' | 'textarea' | 'number' | 'date'
  | 'select' | 'radio' | 'checkbox' | 'boolean'
  | 'object' | 'array' | 'file'

interface FormField {
  id: string
  name: string
  displayName: string
  type: FieldType
  required?: boolean
  min?: number          // longitud (text/textarea), rango (number), tamaño (array/file)
  max?: number
  pattern?: string      // regex para text/textarea, o para validar nombres/extensiones (file)
  options?: { label: string; value: string }[]   // select/radio/checkbox
  fields?: FormField[]                           // object/array (recursivo)
  defaultValue?: any
}

interface FormSchema {
  title: string
  description?: string
  fields: FormField[]
}
```

### Tablas SQLite

```sql
CREATE TABLE forms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  schema TEXT NOT NULL,           -- FormSchema serializado en JSON
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  form_id INTEGER NOT NULL,
  data TEXT NOT NULL,             -- respuesta serializada en JSON
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);
```

## API REST

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET`    | `/api/forms`                       | Lista todos los formularios |
| `POST`   | `/api/forms`                       | Crea un formulario (`{ title, description?, schema }`) |
| `GET`    | `/api/forms/:id`                   | Obtiene un formulario |
| `PUT`    | `/api/forms/:id`                   | Actualiza un formulario |
| `DELETE` | `/api/forms/:id`                   | Elimina un formulario y sus respuestas |
| `POST`   | `/api/forms/:id/submissions`       | Registra una respuesta (`{ data }`) |
| `GET`    | `/api/stats`                       | Totales (forms, submissions, campos definidos) |

## Páginas

| Ruta | Descripción |
| --- | --- |
| `/` | **Inicio** — dashboard con contadores (formularios, respuestas, campos), formularios recientes con accesos rápidos a *fill* y *edit*, e información del sistema (versión, idioma, tema, almacenamiento). |
| `/forms` | Listado completo con acciones *Fill / Edit / Delete*. |
| `/forms/new` | Crear schema con `SchemaEditor` y preview en vivo. |
| `/forms/:id` | Ver schema + preview + JSON. |
| `/forms/:id/edit` | Editar schema existente. |
| `/forms/:id/fill` | Rellenar el formulario, validar y enviar respuesta. |

## Internacionalización

Idiomas: `pt` (default), `en`, `es`, `fr`. Estrategia `no_prefix` con detección automática del navegador y cookie `i18n_redirected`. Switcher visible en el header.

## Tema claro / oscuro

`UColorModeButton` en el header. La preferencia se persiste y respeta `prefers-color-scheme`.

## Setup

Requisitos: Node 20+ y `pnpm`.

```bash
pnpm install
```

`better-sqlite3` se compila como native addon durante la instalación.

## Desarrollo

```bash
pnpm dev
```

Servidor en `http://localhost:3000`. La base SQLite se crea automáticamente en `data/kayla-flow.sqlite` al primer request.

## Producción

```bash
pnpm build
pnpm preview
```

## Notas

- Las utilidades del servidor (`server/utils/db.ts`) usan **auto-imports** de Nitro: `useDb()`, `rowToForm()` y `rowToSubmission()` se referencian directamente sin `import`.
- En los formularios, los campos `object` y `array` se editan **siempre vía modal**: el modal mantiene un draft local y solo persiste al confirmar (`Save`); `Cancel` descarta los cambios.
- La validación es recursiva: errores en sub-campos de `object`/`array` se propagan al campo padre.
