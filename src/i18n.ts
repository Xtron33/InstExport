import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      header: {
        subtitle: 'Photos ready to publish',
        language: 'Language',
        russian: 'Russian',
        english: 'English',
      },
      app: {
        mode: 'Mode',
        preview: 'Preview',
        saving: 'Saving…',
        preparing: 'Preparing…',
        save: 'Save',
        quality: 'JPEG · maximum quality · sRGB',
        sourceUnchanged: 'The original document remains unchanged',
      },
      modes: {
        universal: 'Universal',
        universalDescription: 'Keep proportions. Add a background if needed.',
        panorama: 'Panorama',
        panoramaDescription: 'Full image and square slides.',
      },
      document: { open: 'Open a photo in Photoshop', required: 'An image must be open.' },
      export: {
        title: 'Export',
        chooseFolder: 'Choose folder',
        folderPrompt: 'A folder will be chosen when you save',
        preparing: 'Preparing…',
        complete: 'Done · files saved: {{count}}',
        incomplete: 'Export was not completed',
        savingFile: 'Saving {{current}}/{{total}}: {{name}}',
        preparingPhoto: 'Preparing photo…',
        preparingStrip: 'Preparing a strip of {{count}} squares…',
        closeTemporaryFailed: 'Could not close the temporary document: {{message}}',
        restoreSourceFailed: 'Could not reactivate the original document: {{message}}',
        saved: 'Saved: {{name}}',
        close: 'Close',
      },
      confirmation: {
        title: 'Replace existing files?',
        existing: 'The selected folder already contains:',
        cancel: 'Cancel',
        replace: 'Replace {{count}}',
      },
      error: { title: 'Error' },
      preview: {
        result: 'RESULT',
        files_one: '{{count}} file',
        files_other: '{{count}} files',
        noPadding: 'No padding',
        padding: 'Padding: left {{left}}, right {{right}}, top {{top}}, bottom {{bottom}} px',
        imageAlt: 'Preview of the active document',
        loading: 'Loading…',
        unavailable: 'Preview unavailable',
        slices: 'Slices · {{count}} squares',
        full: 'Full image',
      },
      plan: {
        invalidSize: 'Document dimensions must be between 1 and 300,000 pixels.',
        outsideCanvas: 'The image extends beyond the canvas.',
        horizontalRequired: 'Open a horizontal image to create slices.',
        panoramaTooLarge: 'The panorama exceeds Photoshop’s maximum canvas size.',
        edgePadding: 'The outer squares will have white padding.',
        manySquares:
          'More than 20 squares: check the carousel limit in your Instagram account; you may need multiple posts.',
        mixedRatios:
          'The full panorama and squares have different aspect ratios. Instagram may crop them to one format in a single carousel.',
        noUpscale:
          'The image will not be enlarged; its original resolution is preserved within the selected canvas.',
        upscale: 'The source image will be enlarged to the export size.',
      },
      photoshop: {
        operationFailed: 'Photoshop could not complete the operation.',
        artboards: 'Create a regular document without artboards first.',
        squarePixels: 'Export requires square pixels (Pixel Aspect Ratio: Square).',
        bitDepth:
          'Only 8- and 16-bit documents are supported. Tone-map 32-bit HDR documents first.',
        colorMode: 'Convert the document to RGB, CMYK, Lab, or Grayscale before exporting.',
        sourceClosed: 'The source document has been closed. Refresh and try again.',
        sourceChanged: 'The document has changed. Refresh the plan before exporting.',
        cancelled: 'Export was cancelled.',
        canvasSize: 'Photoshop returned an unexpected canvas size. Export stopped.',
        sliceSize: 'Invalid square size after slicing.',
        command: 'InstaSaver — photo export',
        previewCommand: 'Update preview',
      },
      storage: {
        folderConflict: 'The name “{{name}}” is used by a folder. Choose another export folder.',
      },
    },
  },
  ru: {
    translation: {
      header: {
        subtitle: 'Фотографии, готовые к публикации',
        language: 'Язык',
        russian: 'Русский',
        english: 'Английский',
      },
      app: {
        mode: 'Режим',
        preview: 'Предпросмотр',
        saving: 'Сохраняем…',
        preparing: 'Подготовка…',
        save: 'Сохранить',
        quality: 'JPEG · максимальное качество · sRGB',
        sourceUnchanged: 'Исходный документ остаётся без изменений',
      },
      modes: {
        universal: 'Универсальный',
        universalDescription: 'Сохранить пропорции. Фон — если нужен.',
        panorama: 'Панорама',
        panoramaDescription: 'Полная версия и квадратные слайды.',
      },
      document: {
        open: 'Открой фотографию в Photoshop',
        required: 'Изображение должно быть открыто.',
      },
      export: {
        title: 'Экспорт',
        chooseFolder: 'Выбрать папку',
        folderPrompt: 'Папка будет выбрана при сохранении',
        preparing: 'Подготовка…',
        complete: 'Готово · сохранено файлов: {{count}}',
        incomplete: 'Экспорт не завершён',
        savingFile: 'Сохранение {{current}}/{{total}}: {{name}}',
        preparingPhoto: 'Подготовка фотографии…',
        preparingStrip: 'Подготовка полосы из {{count}} квадратов…',
        closeTemporaryFailed: 'Не удалось закрыть временный документ: {{message}}',
        restoreSourceFailed: 'Не удалось активировать исходный документ: {{message}}',
        saved: 'Сохранён: {{name}}',
        close: 'Закрыть',
      },
      confirmation: {
        title: 'Заменить существующие файлы?',
        existing: 'В выбранной папке уже есть:',
        cancel: 'Отмена',
        replace: 'Заменить {{count}}',
      },
      error: { title: 'Ошибка' },
      preview: {
        result: 'РЕЗУЛЬТАТ',
        files_one: '{{count}} файл',
        files_few: '{{count}} файла',
        files_many: '{{count}} файлов',
        files_other: '{{count}} файлов',
        noPadding: 'Без полей',
        padding: 'Поля: слева {{left}}, справа {{right}}, сверху {{top}}, снизу {{bottom}} px',
        imageAlt: 'Предпросмотр активного документа',
        loading: 'Загрузка…',
        unavailable: 'Предпросмотр недоступен',
        slices: 'Нарезка · {{count}} квадратов',
        full: 'Общее изображение',
      },
      plan: {
        invalidSize: 'Размеры документа должны быть от 1 до 300 000 пикселей.',
        outsideCanvas: 'Изображение выходит за границы холста.',
        horizontalRequired: 'Для нарезки открой горизонтальное изображение.',
        panoramaTooLarge: 'Панорама превышает максимальный размер рабочего холста Photoshop.',
        edgePadding: 'Крайние квадраты будут дополнены белым фоном.',
        manySquares:
          'Более 20 квадратов: проверь лимит карусели в своём Instagram; может понадобиться несколько публикаций.',
        mixedRatios:
          'Полная панорама и квадраты имеют разные пропорции. При общей карусели Instagram может привести их к одному формату.',
        noUpscale:
          'Изображение не увеличивается: сохраняем исходное разрешение внутри выбранного холста.',
        upscale: 'Исходник будет увеличен до размера экспорта.',
      },
      photoshop: {
        operationFailed: 'Photoshop не смог выполнить операцию.',
        artboards: 'Сначала создай обычный документ без монтажных областей.',
        squarePixels: 'Для экспорта нужны квадратные пиксели (Pixel Aspect Ratio: Square).',
        bitDepth:
          'Поддерживаются документы 8 и 16 бит/канал. Для HDR 32 бит сначала выполни тональное преобразование.',
        colorMode: 'Перед экспортом переведи документ в RGB, CMYK, Lab или Grayscale.',
        sourceClosed: 'Исходный документ уже закрыт. Обнови данные и повтори экспорт.',
        sourceChanged: 'Документ изменился. Обнови расчёт перед экспортом.',
        cancelled: 'Экспорт отменён.',
        canvasSize: 'Photoshop вернул неожиданный размер холста. Экспорт остановлен.',
        sliceSize: 'Неверный размер квадрата после нарезки.',
        command: 'InstaSaver — экспорт фотографий',
        previewCommand: 'Обновление предпросмотра',
      },
      storage: { folderConflict: 'Имя «{{name}}» занято папкой. Выбери другую папку сохранения.' },
    },
  },
};

function savedLanguage(): 'en' | 'ru' {
  try {
    return localStorage.getItem('language') === 'ru' ? 'ru' : 'en';
  } catch {
    return 'en';
  }
}

void i18next.use(initReactI18next).init({
  resources,
  lng: savedLanguage(),
  fallbackLng: 'en',
  supportedLngs: ['en', 'ru'],
  interpolation: { escapeValue: false },
});

export function changeLanguage(language: 'en' | 'ru') {
  void i18next.changeLanguage(language);
  try {
    localStorage.setItem('language', language);
  } catch {
    /* Language still changes for this session. */
  }
}

export default i18next;
