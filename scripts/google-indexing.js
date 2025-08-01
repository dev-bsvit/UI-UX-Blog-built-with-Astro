#!/usr/bin/env node

/**
 * Google Indexing API Script
 * Автоматически уведомляет Google о новых/обновленных страницах
 */

import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Конфигурация
const CONFIG = {
  siteUrl: process.env.SITE_URL || 'https://your-domain.com',
  serviceAccountKey: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
  maxRequestsPerBatch: 100,
  requestDelayMs: 1000, // Задержка между запросами
};

/**
 * Инициализация Google API клиента
 */
async function initializeGoogleAuth() {
  try {
    if (!CONFIG.serviceAccountKey) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is required');
    }

    const credentials = JSON.parse(
      Buffer.from(CONFIG.serviceAccountKey, 'base64').toString('utf-8')
    );

    const jwtClient = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      ['https://www.googleapis.com/auth/indexing']
    );

    await jwtClient.authorize();
    
    console.log('✅ Google API authentication successful');
    return google.indexing({ version: 'v3', auth: jwtClient });
  } catch (error) {
    console.error('❌ Google API authentication failed:', error.message);
    throw error;
  }
}

/**
 * Получение всех URL для индексации
 */
async function getAllUrls() {
  const urls = [];
  
  try {
    // Основные страницы
    const staticPages = [
      '',
      '/about',
      '/posts',
      '/categories',
      '/tags'
    ];

    staticPages.forEach(page => {
      urls.push({
        url: `${CONFIG.siteUrl}${page}`,
        type: 'URL_UPDATED'
      });
    });

    // Получаем посты из content/posts
    const postsDir = path.join(__dirname, '../src/content/posts');
    
    try {
      const postFiles = await fs.readdir(postsDir);
      const mdxFiles = postFiles.filter(file => file.endsWith('.mdx'));
      
      for (const file of mdxFiles) {
        const slug = file.replace('.mdx', '');
        urls.push({
          url: `${CONFIG.siteUrl}/posts/${slug}`,
          type: 'URL_UPDATED'
        });
      }
      
      console.log(`📄 Found ${mdxFiles.length} blog posts to index`);
    } catch (error) {
      console.warn('⚠️ Could not read posts directory:', error.message);
    }

    // RSS и Sitemap
    urls.push(
      {
        url: `${CONFIG.siteUrl}/rss.xml`,
        type: 'URL_UPDATED'
      },
      {
        url: `${CONFIG.siteUrl}/sitemap-index.xml`,
        type: 'URL_UPDATED'
      }
    );

    console.log(`🔗 Total URLs to index: ${urls.length}`);
    return urls;
  } catch (error) {
    console.error('❌ Error getting URLs:', error.message);
    throw error;
  }
}

/**
 * Отправка URL в Google Indexing API
 */
async function submitUrlToGoogle(indexingService, urlData) {
  try {
    const response = await indexingService.urlNotifications.publish({
      requestBody: urlData
    });

    if (response.status === 200) {
      console.log(`✅ Successfully indexed: ${urlData.url}`);
      return { success: true, url: urlData.url };
    } else {
      console.warn(`⚠️ Unexpected response for ${urlData.url}:`, response.status);
      return { success: false, url: urlData.url, error: response.status };
    }
  } catch (error) {
    console.error(`❌ Failed to index ${urlData.url}:`, error.message);
    return { success: false, url: urlData.url, error: error.message };
  }
}

/**
 * Пакетная отправка URL с задержками
 */
async function submitUrlsBatch(indexingService, urls) {
  const results = [];
  const batches = [];
  
  // Разбиваем на батчи
  for (let i = 0; i < urls.length; i += CONFIG.maxRequestsPerBatch) {
    batches.push(urls.slice(i, i + CONFIG.maxRequestsPerBatch));
  }

  console.log(`📦 Processing ${batches.length} batches...`);

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    console.log(`\n🔄 Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} URLs)`);

    for (const urlData of batch) {
      const result = await submitUrlToGoogle(indexingService, urlData);
      results.push(result);
      
      // Задержка между запросами для избежания rate limiting
      if (CONFIG.requestDelayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, CONFIG.requestDelayMs));
      }
    }

    // Задержка между батчами
    if (batchIndex < batches.length - 1) {
      console.log(`⏳ Waiting before next batch...`);
      await new Promise(resolve => setTimeout(resolve, CONFIG.requestDelayMs * 2));
    }
  }

  return results;
}

/**
 * Получение статуса индексации URL
 */
async function getIndexingStatus(indexingService, url) {
  try {
    const response = await indexingService.urlNotifications.getMetadata({
      url: url
    });
    
    return {
      url: url,
      lastUpdateTime: response.data.latestUpdate?.notifyTime,
      status: 'indexed'
    };
  } catch (error) {
    return {
      url: url,
      status: 'not_found',
      error: error.message
    };
  }
}

/**
 * Создание отчета о результатах
 */
function generateReport(results) {
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  const report = {
    timestamp: new Date().toISOString(),
    total: results.length,
    successful: successful.length,
    failed: failed.length,
    successRate: ((successful.length / results.length) * 100).toFixed(2),
    results: results
  };

  console.log('\n📊 INDEXING REPORT');
  console.log('==================');
  console.log(`Total URLs: ${report.total}`);
  console.log(`Successful: ${report.successful}`);
  console.log(`Failed: ${report.failed}`);
  console.log(`Success Rate: ${report.successRate}%`);
  
  if (failed.length > 0) {
    console.log('\n❌ Failed URLs:');
    failed.forEach(f => console.log(`  - ${f.url}: ${f.error}`));
  }

  return report;
}

/**
 * Сохранение отчета в файл
 */
async function saveReport(report) {
  try {
    const reportsDir = path.join(__dirname, '../reports');
    await fs.mkdir(reportsDir, { recursive: true });
    
    const filename = `indexing-report-${new Date().toISOString().slice(0, 10)}.json`;
    const filepath = path.join(reportsDir, filename);
    
    await fs.writeFile(filepath, JSON.stringify(report, null, 2));
    console.log(`💾 Report saved to: ${filepath}`);
  } catch (error) {
    console.error('❌ Failed to save report:', error.message);
  }
}

/**
 * Проверка статуса индексации нескольких URL
 */
async function checkIndexingStatus(indexingService, urls) {
  console.log('\n🔍 Checking indexing status...');
  
  const statuses = [];
  for (const url of urls.slice(0, 5)) { // Проверяем только первые 5 для примера
    const status = await getIndexingStatus(indexingService, url);
    statuses.push(status);
    console.log(`${status.status === 'indexed' ? '✅' : '❓'} ${url}: ${status.status}`);
  }
  
  return statuses;
}

/**
 * Основная функция
 */
async function main() {
  try {
    console.log('🚀 Starting Google Indexing process...\n');
    
    // Инициализация Google API
    const indexingService = await initializeGoogleAuth();
    
    // Получение всех URL
    const urls = await getAllUrls();
    
    if (urls.length === 0) {
      console.log('⚠️ No URLs found to index');
      return;
    }

    // Отправка URL в Google
    console.log('\n📤 Submitting URLs to Google Indexing API...');
    const results = await submitUrlsBatch(indexingService, urls);
    
    // Генерация отчета
    const report = generateReport(results);
    await saveReport(report);
    
    // Проверка статуса (опционально)
    if (process.env.CHECK_STATUS === 'true') {
      await checkIndexingStatus(indexingService, urls.map(u => u.url));
    }
    
    console.log('\n🎉 Google Indexing process completed!');
    
    // Возвращаем код ошибки, если есть неудачные запросы
    const failedCount = results.filter(r => !r.success).length;
    if (failedCount > 0) {
      console.log(`⚠️ ${failedCount} URLs failed to index`);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
}

// Запуск скрипта
main(); 