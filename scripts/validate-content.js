#!/usr/bin/env node

/**
 * Content Validation Script
 * Проверяет качество контента, SEO оптимизацию и accessibility
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Конфигурация валидации
const CONFIG = {
  contentDir: path.join(__dirname, '../src/content/posts'),
  minTitleLength: 10,
  maxTitleLength: 60,
  minDescriptionLength: 50,
  maxDescriptionLength: 160,
  minExcerptLength: 100,
  maxExcerptLength: 300,
  minContentLength: 500,
  maxTagsCount: 8,
  requiredCategories: ['Дизайн', 'Дослідження', 'Доступність', 'Розробка'],
  bannedWords: ['click here', 'read more', 'very', 'really', 'just'],
  seoKeywords: {
    minDensity: 0.5, // %
    maxDensity: 3.0  // %
  }
};

/**
 * Парсинг frontmatter из MDX файла
 */
function parseFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    return { frontmatter: null, content: content };
  }

  const frontmatterText = frontmatterMatch[1];
  const bodyContent = content.slice(frontmatterMatch[0].length).trim();
  
  // Простой YAML parser для frontmatter
  const frontmatter = {};
  const lines = frontmatterText.split('\n');
  let currentKey = null;
  let isInObject = false;
  let currentObject = {};
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    if (trimmed.includes(':') && !isInObject) {
      const [key, ...valueParts] = trimmed.split(':');
      const value = valueParts.join(':').trim();
      
      if (key.trim() === 'author' || key.trim() === 'seo') {
        currentKey = key.trim();
        isInObject = true;
        currentObject = {};
        continue;
      }
      
      // Парсинг значений
      let parsedValue = value;
      if (value.startsWith('[') && value.endsWith(']')) {
        // Массив
        parsedValue = value.slice(1, -1).split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      } else if (value.startsWith('"') && value.endsWith('"')) {
        // Строка
        parsedValue = value.slice(1, -1);
      } else if (value === 'true' || value === 'false') {
        // Boolean
        parsedValue = value === 'true';
      } else if (!isNaN(value) && value !== '') {
        // Число
        parsedValue = Number(value);
      }
      
      frontmatter[key.trim()] = parsedValue;
    } else if (isInObject && trimmed.includes(':')) {
      const [key, ...valueParts] = trimmed.split(':');
      const value = valueParts.join(':').trim().replace(/^"|"$/g, '');
      currentObject[key.trim()] = value;
    } else if (trimmed === '---' || (!trimmed.includes(':') && isInObject)) {
      if (currentKey && Object.keys(currentObject).length > 0) {
        frontmatter[currentKey] = currentObject;
        currentKey = null;
        isInObject = false;
        currentObject = {};
      }
    }
  }
  
  // Добавляем последний объект если есть
  if (currentKey && Object.keys(currentObject).length > 0) {
    frontmatter[currentKey] = currentObject;
  }
  
  return { frontmatter, content: bodyContent };
}

/**
 * Подсчет слов в тексте
 */
function countWords(text) {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Анализ плотности ключевых слов
 */
function analyzeKeywordDensity(content, keywords) {
  const words = content.toLowerCase().split(/\s+/);
  const totalWords = words.length;
  const keywordCounts = {};
  
  keywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase();
    const count = content.toLowerCase().split(keywordLower).length - 1;
    const density = (count / totalWords) * 100;
    keywordCounts[keyword] = { count, density: density.toFixed(2) };
  });
  
  return keywordCounts;
}

/**
 * Проверка структуры заголовков
 */
function validateHeadingStructure(content) {
  const headings = content.match(/^#{1,6}\s+.+$/gm) || [];
  const issues = [];
  
  if (headings.length === 0) {
    issues.push('No headings found in content');
    return { valid: false, issues };
  }
  
  const levels = headings.map(h => h.match(/^#+/)[0].length);
  
  // Проверяем, что начинается с H1
  if (levels[0] !== 1) {
    issues.push('Content should start with H1 heading');
  }
  
  // Проверяем последовательность уровней
  for (let i = 1; i < levels.length; i++) {
    const prevLevel = levels[i - 1];
    const currentLevel = levels[i];
    
    if (currentLevel > prevLevel + 1) {
      issues.push(`Heading level jump from H${prevLevel} to H${currentLevel} at position ${i + 1}`);
    }
  }
  
  return {
    valid: issues.length === 0,
    issues,
    headings: headings.map((h, i) => ({ level: levels[i], text: h.replace(/^#+\s+/, '') }))
  };
}

/**
 * Проверка ссылок и изображений
 */
function validateLinksAndImages(content) {
  const issues = [];
  
  // Проверка изображений без alt-текста
  const imagesWithoutAlt = content.match(/<img[^>]*(?<!alt="[^"]*")(?<!alt='[^']*')>/g) || [];
  if (imagesWithoutAlt.length > 0) {
    issues.push(`${imagesWithoutAlt.length} images without alt text found`);
  }
  
  // Проверка ссылок без описательного текста
  const badLinks = content.match(/\[(?:click here|read more|here|link)\]/gi) || [];
  if (badLinks.length > 0) {
    issues.push(`${badLinks.length} non-descriptive link texts found`);
  }
  
  // Проверка внешних ссылок без rel="noopener"
  const externalLinks = content.match(/<a[^>]*href="https?:\/\/[^"]*"[^>]*(?!.*rel=)/g) || [];
  if (externalLinks.length > 0) {
    issues.push(`${externalLinks.length} external links without rel="noopener" found`);
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Проверка качества контента
 */
function validateContentQuality(content) {
  const issues = [];
  const warnings = [];
  
  // Проверка на запрещенные слова
  CONFIG.bannedWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = content.match(regex);
    if (matches) {
      warnings.push(`Found "${word}" ${matches.length} times - consider more specific language`);
    }
  });
  
  // Проверка длины предложений
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const longSentences = sentences.filter(s => countWords(s) > 30);
  if (longSentences.length > 0) {
    warnings.push(`${longSentences.length} sentences are very long (>30 words)`);
  }
  
  // Проверка повторяющихся слов
  const words = content.toLowerCase().match(/\b\w+\b/g) || [];
  const wordCounts = {};
  words.forEach(word => {
    if (word.length > 4) { // Игнорируем короткие слова
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  });
  
  const overusedWords = Object.entries(wordCounts)
    .filter(([word, count]) => count > 5)
    .sort((a, b) => b[1] - a[1]);
    
  if (overusedWords.length > 0) {
    warnings.push(`Overused words: ${overusedWords.slice(0, 3).map(([word, count]) => `${word}(${count})`).join(', ')}`);
  }
  
  return {
    valid: issues.length === 0,
    issues,
    warnings
  };
}

/**
 * Валидация одного поста
 */
async function validatePost(filepath) {
  const filename = path.basename(filepath);
  const results = {
    filename,
    valid: true,
    errors: [],
    warnings: [],
    stats: {},
    seo: {}
  };
  
  try {
    const content = await fs.readFile(filepath, 'utf8');
    const { frontmatter, content: bodyContent } = parseFrontmatter(content);
    
    if (!frontmatter) {
      results.valid = false;
      results.errors.push('No frontmatter found');
      return results;
    }
    
    // Валидация frontmatter
    const requiredFields = ['title', 'description', 'publishedAt', 'author', 'tags', 'category', 'readingTime', 'excerpt'];
    requiredFields.forEach(field => {
      if (!frontmatter[field]) {
        results.errors.push(`Missing required field: ${field}`);
        results.valid = false;
      }
    });
    
    // Проверка заголовка
    if (frontmatter.title) {
      if (frontmatter.title.length < CONFIG.minTitleLength) {
        results.errors.push(`Title too short (${frontmatter.title.length} < ${CONFIG.minTitleLength})`);
        results.valid = false;
      }
      if (frontmatter.title.length > CONFIG.maxTitleLength) {
        results.warnings.push(`Title too long (${frontmatter.title.length} > ${CONFIG.maxTitleLength}) - may be truncated in search results`);
      }
    }
    
    // Проверка описания
    if (frontmatter.description) {
      if (frontmatter.description.length < CONFIG.minDescriptionLength) {
        results.warnings.push(`Description too short (${frontmatter.description.length} < ${CONFIG.minDescriptionLength})`);
      }
      if (frontmatter.description.length > CONFIG.maxDescriptionLength) {
        results.warnings.push(`Description too long (${frontmatter.description.length} > ${CONFIG.maxDescriptionLength}) - may be truncated`);
      }
    }
    
    // Проверка excerpt
    if (frontmatter.excerpt) {
      if (frontmatter.excerpt.length < CONFIG.minExcerptLength) {
        results.warnings.push(`Excerpt too short (${frontmatter.excerpt.length} < ${CONFIG.minExcerptLength})`);
      }
      if (frontmatter.excerpt.length > CONFIG.maxExcerptLength) {
        results.warnings.push(`Excerpt too long (${frontmatter.excerpt.length} > ${CONFIG.maxExcerptLength})`);
      }
    }
    
    // Проверка тегов
    if (frontmatter.tags) {
      if (frontmatter.tags.length > CONFIG.maxTagsCount) {
        results.warnings.push(`Too many tags (${frontmatter.tags.length} > ${CONFIG.maxTagsCount})`);
      }
    }
    
    // Проверка категории
    if (frontmatter.category && !CONFIG.requiredCategories.includes(frontmatter.category)) {
      results.warnings.push(`Unknown category: ${frontmatter.category}. Allowed: ${CONFIG.requiredCategories.join(', ')}`);
    }
    
    // Проверка автора
    if (frontmatter.author && !frontmatter.author.name) {
      results.errors.push('Author name is required');
      results.valid = false;
    }
    
    // Валидация контента
    const wordCount = countWords(bodyContent);
    if (wordCount < CONFIG.minContentLength) {
      results.errors.push(`Content too short (${wordCount} words < ${CONFIG.minContentLength})`);
      results.valid = false;
    }
    
    // Анализ структуры заголовков
    const headingValidation = validateHeadingStructure(bodyContent);
    if (!headingValidation.valid) {
      results.warnings.push(...headingValidation.issues);
    }
    
    // Проверка ссылок и изображений
    const linkValidation = validateLinksAndImages(bodyContent);
    if (!linkValidation.valid) {
      results.warnings.push(...linkValidation.issues);
    }
    
    // Анализ качества контента
    const qualityValidation = validateContentQuality(bodyContent);
    results.warnings.push(...qualityValidation.warnings);
    
    // SEO анализ
    if (frontmatter.tags && frontmatter.tags.length > 0) {
      const keywordAnalysis = analyzeKeywordDensity(bodyContent, frontmatter.tags);
      results.seo.keywords = keywordAnalysis;
      
      // Проверка плотности ключевых слов
      Object.entries(keywordAnalysis).forEach(([keyword, data]) => {
        if (data.density < CONFIG.seoKeywords.minDensity) {
          results.warnings.push(`Keyword "${keyword}" density too low (${data.density}%)`);
        }
        if (data.density > CONFIG.seoKeywords.maxDensity) {
          results.warnings.push(`Keyword "${keyword}" density too high (${data.density}%) - may be seen as spam`);
        }
      });
    }
    
    // Статистика
    results.stats = {
      wordCount,
      characterCount: bodyContent.length,
      readingTime: Math.ceil(wordCount / 200), // ~200 слов в минуту
      headingCount: headingValidation.headings?.length || 0,
      imageCount: (bodyContent.match(/<img|!\[/g) || []).length,
      linkCount: (bodyContent.match(/\[.*?\]|\<a /g) || []).length
    };
    
  } catch (error) {
    results.valid = false;
    results.errors.push(`Failed to process file: ${error.message}`);
  }
  
  return results;
}

/**
 * Генерация отчета о валидации
 */
function generateValidationReport(results) {
  const totalPosts = results.length;
  const validPosts = results.filter(r => r.valid).length;
  const invalidPosts = totalPosts - validPosts;
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: totalPosts,
      valid: validPosts,
      invalid: invalidPosts,
      validationRate: ((validPosts / totalPosts) * 100).toFixed(2)
    },
    details: results
  };
  
  console.log('\n📊 CONTENT VALIDATION REPORT');
  console.log('============================');
  console.log(`Total posts: ${report.summary.total}`);
  console.log(`Valid posts: ${report.summary.valid}`);
  console.log(`Invalid posts: ${report.summary.invalid}`);
  console.log(`Validation rate: ${report.summary.validationRate}%`);
  
  // Показываем проблемы
  const invalidFiles = results.filter(r => !r.valid);
  if (invalidFiles.length > 0) {
    console.log('\n❌ Files with errors:');
    invalidFiles.forEach(file => {
      console.log(`\n📄 ${file.filename}:`);
      file.errors.forEach(error => console.log(`  ❌ ${error}`));
      file.warnings.forEach(warning => console.log(`  ⚠️  ${warning}`));
    });
  }
  
  // Показываем предупреждения для валидных файлов
  const filesWithWarnings = results.filter(r => r.valid && r.warnings.length > 0);
  if (filesWithWarnings.length > 0) {
    console.log('\n⚠️  Files with warnings:');
    filesWithWarnings.forEach(file => {
      console.log(`\n📄 ${file.filename}:`);
      file.warnings.forEach(warning => console.log(`  ⚠️  ${warning}`));
    });
  }
  
  return report;
}

/**
 * Сохранение отчета в файл
 */
async function saveValidationReport(report) {
  try {
    const reportsDir = path.join(__dirname, '../reports');
    await fs.mkdir(reportsDir, { recursive: true });
    
    const filename = `content-validation-${new Date().toISOString().slice(0, 10)}.json`;
    const filepath = path.join(reportsDir, filename);
    
    await fs.writeFile(filepath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Validation report saved to: ${filepath}`);
  } catch (error) {
    console.error('❌ Failed to save validation report:', error.message);
  }
}

/**
 * Основная функция
 */
async function main() {
  try {
    console.log('🔍 Starting content validation...\n');
    
    // Получение всех MDX файлов
    const files = await fs.readdir(CONFIG.contentDir);
    const mdxFiles = files.filter(file => file.endsWith('.mdx'));
    
    if (mdxFiles.length === 0) {
      console.log('⚠️ No MDX files found in content directory');
      return;
    }
    
    console.log(`📄 Found ${mdxFiles.length} posts to validate`);
    
    // Валидация каждого файла
    const results = [];
    for (const file of mdxFiles) {
      const filepath = path.join(CONFIG.contentDir, file);
      console.log(`🔍 Validating ${file}...`);
      const result = await validatePost(filepath);
      results.push(result);
    }
    
    // Генерация отчета
    const report = generateValidationReport(results);
    await saveValidationReport(report);
    
    console.log('\n🎉 Content validation completed!');
    
    // Возвращаем код ошибки если есть невалидные файлы
    const invalidCount = results.filter(r => !r.valid).length;
    if (invalidCount > 0) {
      console.log(`\n⚠️ ${invalidCount} files failed validation`);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
}

// Запуск скрипта
main(); 