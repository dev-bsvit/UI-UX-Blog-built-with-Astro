// Утилиты для улучшения accessibility

/**
 * Генерирует уникальный ID для элемента
 */
export function generateId(prefix: string = 'element'): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Проверяет контрастность цветов (упрощенная версия)
 * @param foreground - цвет текста в HEX
 * @param background - цвет фона в HEX
 * @returns объект с информацией о контрастности
 */
export function checkContrast(foreground: string, background: string) {
  // Функция для конвертации HEX в RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Функция для расчета относительной яркости
  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);

  if (!fg || !bg) {
    throw new Error('Invalid color format. Use HEX format (#RRGGBB)');
  }

  const fgLuminance = getLuminance(fg.r, fg.g, fg.b);
  const bgLuminance = getLuminance(bg.r, bg.g, bg.b);

  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);
  const contrast = (lighter + 0.05) / (darker + 0.05);

  return {
    ratio: Math.round(contrast * 100) / 100,
    AA: contrast >= 4.5,
    AAA: contrast >= 7,
    AALarge: contrast >= 3, // для крупного текста (18pt+ или 14pt+ bold)
  };
}

/**
 * Создает описательный alt-текст для изображений
 */
export function generateAltText(
  context: 'decorative' | 'informative' | 'functional',
  description?: string
): string {
  switch (context) {
    case 'decorative':
      return ''; // Пустой alt для декоративных изображений
    case 'informative':
      return description || 'Информативное изображение';
    case 'functional':
      return description || 'Интерактивное изображение';
    default:
      return description || '';
  }
}

/**
 * Генерирует ARIA-метки для навигации
 */
export function getNavigationAria(
  currentPage: string,
  totalPages: number,
  itemsPerPage: number = 10
) {
  const current = parseInt(currentPage);
  const startItem = (current - 1) * itemsPerPage + 1;
  const endItem = Math.min(current * itemsPerPage, totalPages * itemsPerPage);

  return {
    'aria-label': `Страница ${current} из ${totalPages}`,
    'aria-describedby': `pagination-info-${current}`,
    'aria-current': 'page',
    'role': 'navigation',
    'data-page-info': `Показаны элементы ${startItem}-${endItem}`
  };
}

/**
 * Создает skip-link для быстрой навигации
 */
export function createSkipLink(targetId: string, label: string) {
  return {
    href: `#${targetId}`,
    className: 'skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded-md z-50',
    'aria-label': label,
    tabIndex: 0
  };
}

/**
 * Валидирует и улучшает структуру заголовков
 */
export function validateHeadingStructure(headings: Array<{level: number, text: string}>) {
  const issues: string[] = [];
  
  if (headings.length === 0) {
    return { valid: true, issues: [] };
  }

  // Проверяем, что первый заголовок - H1
  if (headings[0].level !== 1) {
    issues.push('Страница должна начинаться с заголовка H1');
  }

  // Проверяем, что есть только один H1
  const h1Count = headings.filter(h => h.level === 1).length;
  if (h1Count > 1) {
    issues.push('На странице должен быть только один заголовок H1');
  }

  // Проверяем последовательность уровней
  for (let i = 1; i < headings.length; i++) {
    const currentLevel = headings[i].level;
    const prevLevel = headings[i - 1].level;
    
    if (currentLevel > prevLevel + 1) {
      issues.push(
        `Пропущен уровень заголовка: после H${prevLevel} следует H${currentLevel}. ` +
        `Используйте H${prevLevel + 1} вместо H${currentLevel}`
      );
    }
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Создает корректные ARIA-атрибуты для форм
 */
export function getFormAria(fieldName: string, options: {
  required?: boolean;
  invalid?: boolean;
  describedBy?: string;
  errorMessage?: string;
} = {}) {
  const { required = false, invalid = false, describedBy, errorMessage } = options;
  
  const aria: Record<string, string | boolean> = {
    'aria-required': required,
  };

  if (invalid) {
    aria['aria-invalid'] = true;
    if (errorMessage) {
      aria['aria-describedby'] = `${fieldName}-error`;
    }
  }

  if (describedBy) {
    aria['aria-describedby'] = aria['aria-describedby'] 
      ? `${aria['aria-describedby']} ${describedBy}`
      : describedBy;
  }

  return aria;
}

/**
 * Создает live region для динамических обновлений
 */
export function createLiveRegion(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) {
  return {
    'aria-live': priority,
    'aria-atomic': 'true',
    'role': priority === 'assertive' ? 'alert' : 'status',
    children: message
  };
}

/**
 * Генерирует корректные атрибуты для модальных окон
 */
export function getModalAria(modalId: string, titleId: string, descriptionId?: string) {
  return {
    modal: {
      'role': 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': titleId,
      'aria-describedby': descriptionId,
      'id': modalId,
      'tabIndex': -1
    },
    backdrop: {
      'aria-hidden': 'true',
      'onClick': `closeModal('${modalId}')`
    },
    closeButton: {
      'aria-label': 'Закрыть модальное окно',
      'type': 'button'
    }
  };
}

/**
 * Проверяет доступность интерактивных элементов
 */
export function validateInteractiveElement(element: {
  tagName: string;
  hasAriaLabel?: boolean;
  hasVisibleText?: boolean;
  hasAltText?: boolean;
  isKeyboardAccessible?: boolean;
}) {
  const issues: string[] = [];
  const { tagName, hasAriaLabel, hasVisibleText, hasAltText, isKeyboardAccessible } = element;

  // Проверяем наличие доступного имени
  if (['button', 'a', 'input'].includes(tagName.toLowerCase())) {
    if (!hasAriaLabel && !hasVisibleText && !hasAltText) {
      issues.push(`Элемент ${tagName} должен иметь доступное имя (aria-label, видимый текст или alt)`);
    }
  }

  // Проверяем клавиатурную доступность
  if (!isKeyboardAccessible && ['button', 'a', 'input', 'select', 'textarea'].includes(tagName.toLowerCase())) {
    issues.push(`Элемент ${tagName} должен быть доступен с клавиатуры`);
  }

  return {
    valid: issues.length === 0,
    issues
  };
} 