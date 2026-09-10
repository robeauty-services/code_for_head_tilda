# code_for_head_tilda

Скрипти, що вставляються в `<head>` сторінок Тільди: пікселі, збереження кошика,
список відвіданих сторінок.

Два сайти, два незалежні бандли з одного репо:

| Сайт | Джерело | Бандл | Інлайн-частина в `<head>` |
| --- | --- | --- | --- |
| robeauty.me (Tilda 2095616) | `src/head.js` | `dist/head.min.js` | `tilda_head_without_scripts/tilda_head.html` |
| maneraparfum.com (Tilda 9787525) | `src/manera-head.js` | `dist/manera.min.js` | `tilda_head_without_scripts/manera_head.html` |

Номери секцій у двох джерельних файлах збігаються (3 — FB, 4 — TikTok,
5 — кошик, 7 — посилання на товари), щоб їх можна було діфати між собою.

## Що лишається інлайном у `<head>` і чому

Не все можна винести в бандл:

- `<meta name="facebook-domain-verification">` — має бути справжнім тегом у HTML.
- `<noscript>` з піксельною картинкою — за визначенням не працює через JS.
- **Growthbook** (тільки robeauty) — `trackingCallback` мусить існувати до того,
  як відпрацює auto-бандл, а сам бандл читає `data-client-key` зі свого ж
  тега `<script>`. Зовнішній файл не дає ні першого, ні другого.
- Clarity (тільки manera) — лишили інлайном, щоб запис сесії стартував не
  чекаючи запиту до CDN.

## Реліз

Одна команда на сайт. Реліз — це дві фази, бо між ними стоїть людський мердж:
тег мусить вказувати на коміт у `main` з перезібраним бандлом, саме його
jsDelivr роздає назавжди.

```bash
npm run pins                      # хто на якому тезі зараз (нічого не змінює)

npm run release:manera 1.0.1      # фаза 1: збірка -> перепін -> коміт -> PR
# ...мерджиш PR...
git checkout main && git pull
npm run release:manera            # фаза 2: ставить і пушить тег manera-v1.0.1
```

Далі — вставити `tilda_head_without_scripts/manera_head.html` у налаштування
сайту на Тільді (Site settings → More → HEAD code). До цього моменту для
відвідувачів не змінюється нічого.

Для robeauty так само: `npm run release:robeauty 1.0.7`.

Фаза 2 відмовиться працювати, якщо ти не на `main`, дерево брудне, `main`
розійшовся з `origin`, тег уже існує, або закомічений `dist/` не збігається зі
свіжою збіркою. Ці перевірки й є сенсом скрипта — вони роблять «затегав старий
бандл» неможливим станом.

**Теги незмінні.** jsDelivr кешує `@tag` назавжди, тому ніколи не переміщуй уже
випущений тег — завжди роби новий.

## Перевірити збірку, нічого не релізячи

```bash
npm run build:robeauty   # src/head.js        -> dist/head.min.js
npm run build:manera     # src/manera-head.js -> dist/manera.min.js
```
