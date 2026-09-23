# InstExport

[English](#english) · [Русский](#ru)

> ### ⬇️ [Download the latest release / Скачать последний релиз](../../releases/latest)
>
> **Photoshop 25.0+ · `.ccx` installer / установочный файл**

<a id="english"></a>

### Make Instagram-ready photos and carousel slides right inside Photoshop

A wide photograph should not mean drawing guides, cutting squares, and saving every slide by hand. **InstExport** prepares a regular Instagram photo or a swipeable panorama carousel from the document you already have open in Photoshop. You see the preview, padding, sizes, and filenames **before** you save.

## What will I get?

Choose the option that matches the post you want to make:

| You want to…                                          | Choose        | InstExport saves                                                                                                                                                               |
| ----------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Publish a single portrait, square, or landscape photo | **Universal** | One JPEG. The photo keeps its proportions when they fit between 3:4 and 1.91:1. More extreme shapes get white padding instead of being cropped. Small photos are not enlarged. |
| Turn one wide photo into a swipeable carousel         | **Panorama**  | A full panorama JPEG **plus** numbered 1080 × 1080 square slides. The number of slides is calculated for you.                                                                  |

For example, a **6000 × 2000** panorama named `coast.psd` produces a full `coast.jpg` and three slides: `coast-1.jpg`, `coast-2.jpg`, and `coast-3.jpg`. The full panorama is prepared at **2160 × 1132**; the slides are **1080 × 1080** each.

Every export uses maximum JPEG quality (**12/12**) with an embedded **sRGB** profile. White fills transparent or padded areas. The original Photoshop document is processed through temporary copies, so your source layers and edits are intended to stay as they were.

## From open photo to saved files

1. Open your edited photo in Photoshop and open the **InstExport** panel from the **Plugins** menu.
2. Choose **Universal** or **Panorama**. Check the preview, output sizes, filenames, and any warnings.
3. Choose a destination folder and press **Save**.
4. If a filename already exists, choose whether to replace it. Review the saved-file list when export finishes.

The panel can be switched between **English and Russian** with the flags in its header.

## Getting InstExport

You need **Adobe Photoshop 25.0 or newer**. InstExport is a Photoshop desktop plugin; it does not run in a web browser or on a phone.

If you have an InstExport **`.ccx` installer**, double-click it and follow the prompts in Adobe Creative Cloud. Then open the panel from Photoshop's **Plugins** menu. See [Adobe's installation instructions](https://developer.adobe.com/uxp/guides/how-to/distribution/install/) if Creative Cloud does not open.

**Current availability:** this repository does not publish a verified ready-to-install package. The code can be built and loaded with Adobe UXP Developer Tool; instructions are below for anyone who wants to try the current version. Installation and real JPEG output still need testing in Photoshop before a public release.

## Good to know before you export

- InstExport works with the **active document**, one photo at a time. It does not batch-process a folder.
- Documents must use **square pixels**, have **no artboards**, and be **8-bit or 16-bit** in RGB, CMYK, Lab, or Grayscale. Convert 32-bit HDR images first.
- Universal mode adds white padding when needed; it does not crop the photo to force a ratio. Panorama mode deliberately divides a wide image into square slides.
- Carousel exports save several separate files. If an export stops halfway through, files already saved remain in the chosen folder and appear in the report.
- Instagram can still compress or reframe an uploaded image. Check the finished post in Instagram before publishing it.

<details>
<summary>Build and load the current source version</summary>

Install [Adobe UXP Developer Tool](https://developer.adobe.com/uxp/guides/how-to/developer-tools/) and enable Developer Mode in both the tool and Photoshop. With Node.js 20.19+ or 22.12+ and Yarn installed, run:

```sh
yarn install --frozen-lockfile
yarn build
```

In UXP Developer Tool, select **Add Plugin**, choose `dist/manifest.json`, then select **Load**. Open **InstExport** from Photoshop's **Plugins** menu. `yarn dev` rebuilds the panel when source files change; reload the plugin to see those changes.

For contributors: `yarn typecheck`, `yarn lint`, and `yarn test` run the project checks. `yarn package` creates a local `.ccx` in `release/`; that installer has not been verified for distribution. The interface uses React, TypeScript, Zustand, and i18next.

See the [release process](docs/RELEASING.md) for the GitHub Actions checks, package draft, and manual Photoshop verification.

</details>

<a id="ru"></a>

---

### Готовьте фотографии и слайды карусели для Instagram прямо в Photoshop

Чтобы опубликовать широкую фотографию, больше не нужно вручную ставить направляющие, нарезать изображение на квадраты и сохранять каждый слайд отдельно. **InstExport** готовит обычную фотографию или панораму для карусели из документа, открытого в Photoshop. **До сохранения** вы видите предпросмотр, поля, размеры и имена будущих файлов.

### Что получится после экспорта?

Выберите режим под свою публикацию:

| Что хотите опубликовать                               | Режим             | Что сохранит InstExport                                                                                                                                                                              |
| ----------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Один вертикальный, квадратный или горизонтальный кадр | **Универсальный** | Один JPEG. Если пропорции находятся в диапазоне от 3:4 до 1,91:1, фотография сохраняет их. Для более вытянутого кадра добавляются белые поля вместо обрезки. Небольшие изображения не увеличиваются. |
| Широкую фотографию в виде карусели                    | **Панорама**      | Полный JPEG панорамы **и** пронумерованные квадратные слайды 1080 × 1080. Количество слайдов рассчитывается автоматически.                                                                           |

Например, из панорамы **6000 × 2000** с именем `coast.psd` получатся полная версия `coast.jpg` и три слайда: `coast-1.jpg`, `coast-2.jpg` и `coast-3.jpg`. Полная версия подготавливается в размере **2160 × 1132**, каждый слайд — **1080 × 1080**.

Файлы сохраняются в JPEG с максимальным качеством (**12/12**) и встроенным профилем **sRGB**. Прозрачные области и поля заполняются белым. Обработка выполняется на временных копиях документа Photoshop, чтобы слои и правки исходника остались без изменений.

### От открытой фотографии до готовых файлов

1. Откройте обработанную фотографию в Photoshop и панель **InstExport** через меню **Плагины**.
2. Выберите **«Универсальный»** или **«Панорама»**. Проверьте предпросмотр, размеры, имена файлов и предупреждения.
3. Выберите папку для экспорта и нажмите **«Сохранить»**.
4. Если файл с таким именем уже существует, подтвердите или отмените замену. После экспорта проверьте список сохранённых файлов.

Язык панели переключается между **русским и английским** флагами в шапке.

### Как получить InstExport

Нужен **Adobe Photoshop версии 25.0 или новее**. Это плагин для настольного Photoshop; в браузере или на телефоне он не работает.

Если у вас уже есть установочный файл InstExport **`.ccx`**, откройте его двойным щелчком и следуйте подсказкам Adobe Creative Cloud. Затем откройте панель через меню **Плагины** в Photoshop. Если Creative Cloud не запускается, обратитесь к [инструкции Adobe по установке](https://developer.adobe.com/uxp/guides/how-to/distribution/install/).

**Текущая доступность:** в этом репозитории пока нет проверенного пакета для простой установки. Текущую версию можно собрать из исходного кода и загрузить через Adobe UXP Developer Tool — инструкция ниже. Перед публичным релизом ещё нужно проверить установку и фактические JPEG-файлы в Photoshop.

### Что важно знать перед экспортом

- InstExport работает с **активным документом**, по одной фотографии за раз. Пакетной обработки папки нет.
- Нужен документ с **квадратными пикселями**, **без монтажных областей**, глубиной **8 или 16 бит** в режимах RGB, CMYK, Lab или Grayscale. Документы HDR с глубиной 32 бита сначала нужно преобразовать.
- Универсальный режим при необходимости добавляет белые поля и не обрезает фотографию ради нужных пропорций. Режим панорамы намеренно делит широкий кадр на квадратные слайды.
- Карусель сохраняется несколькими отдельными файлами. Если экспорт остановится на середине, уже сохранённые файлы останутся в выбранной папке и будут перечислены в отчёте.
- Instagram может дополнительно сжать или кадрировать загруженное изображение. Проверьте готовую публикацию в приложении перед её размещением.

<details>
<summary>Сборка и запуск текущей версии из исходного кода</summary>

Установите [Adobe UXP Developer Tool](https://developer.adobe.com/uxp/guides/how-to/developer-tools/) и включите режим разработчика в нём и в Photoshop. При установленных Node.js 20.19+ или 22.12+ и Yarn выполните:

```sh
yarn install --frozen-lockfile
yarn build
```

В UXP Developer Tool выберите **Add Plugin**, укажите `dist/manifest.json` и нажмите **Load**. Откройте **InstExport** через меню **Плагины** Photoshop. Команда `yarn dev` пересобирает панель после изменений исходного кода; чтобы увидеть изменения, перезагрузите плагин.

Для участников разработки: `yarn typecheck`, `yarn lint` и `yarn test` запускают проверки проекта. `yarn package` создаёт локальный `.ccx` в папке `release/`; этот установочный файл ещё не проверен для распространения. Интерфейс написан на React, TypeScript, Zustand и i18next.

Проверки GitHub Actions, создание черновика релиза и проверка в Photoshop описаны в [инструкции по выпуску версии](docs/RELEASING.md).

</details>
