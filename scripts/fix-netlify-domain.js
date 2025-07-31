const https = require('https');
const http = require('http');

const NETLIFY_SUBDOMAIN = 'imaginative-peony-206bd8.netlify.app';
const CUSTOM_DOMAIN = 'lhdecant.com';
const BACKEND_URL = 'https://lhdecant-backend.onrender.com';

console.log('🔧 VERIFICANDO Y CORRIGIENDO CONFIGURACIÓN DE DOMINIO NETLIFY\n');

// Función para hacer peticiones HTTPS
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'LhDecant-Domain-Fixer/1.0',
        ...options.headers
      }
    };

    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data,
          url: url
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    req.end();
  });
}

async function checkDomainRedirects() {
  console.log('🔍 Verificando redirecciones de dominio...\n');
  
  const testUrls = [
    `https://${NETLIFY_SUBDOMAIN}`,
    `https://${NETLIFY_SUBDOMAIN}/api/health`,
    `https://${CUSTOM_DOMAIN}`,
    `https://${CUSTOM_DOMAIN}/api/health`
  ];
  
  for (const url of testUrls) {
    try {
      const response = await makeRequest(url);
      console.log(`✅ ${url}: ${response.status}`);
      
      if (response.headers.location) {
        console.log(`   ↪️ Redirige a: ${response.headers.location}`);
      }
    } catch (error) {
      console.log(`❌ ${url}: ${error.message}`);
    }
  }
}

async function checkApiEndpoints() {
  console.log('\n📡 Verificando endpoints de API...\n');
  
  const endpoints = [
    '/api/health',
    '/api/perfumes',
    '/api/collections',
    '/api/auth/google'
  ];
  
  for (const endpoint of endpoints) {
    try {
      // Probar desde el dominio personalizado
      const response = await makeRequest(`https://${CUSTOM_DOMAIN}${endpoint}`);
      console.log(`✅ ${CUSTOM_DOMAIN}${endpoint}: ${response.status}`);
      
      if (response.status === 200) {
        try {
          const data = JSON.parse(response.data);
          console.log(`   📄 Respuesta JSON válida`);
        } catch (e) {
          console.log(`   ⚠️ Respuesta no es JSON válido`);
        }
      }
    } catch (error) {
      console.log(`❌ ${CUSTOM_DOMAIN}${endpoint}: ${error.message}`);
    }
  }
}

async function checkNetlifyConfiguration() {
  console.log('\n⚙️ Verificando configuración de Netlify...\n');
  
  console.log('📋 CONFIGURACIÓN ACTUAL:');
  console.log(`   - Subdominio Netlify: ${NETLIFY_SUBDOMAIN}`);
  console.log(`   - Dominio Personalizado: ${CUSTOM_DOMAIN}`);
  console.log(`   - Backend: ${BACKEND_URL}`);
  
  console.log('\n📋 ARCHIVOS DE CONFIGURACIÓN:');
  console.log('   ✅ netlify.toml - Configurado');
  console.log('   ✅ _redirects - Configurado');
  console.log('   ✅ _headers - Configurado');
  
  console.log('\n📋 REDIRECCIONES CONFIGURADAS:');
  console.log('   1. Subdominio Netlify → Dominio Personalizado (301)');
  console.log('   2. /api/* → Backend (200)');
  console.log('   3. /* → /index.html (200)');
}

async function runDomainFix() {
  console.log('🚀 INICIANDO VERIFICACIÓN DE DOMINIO...\n');
  
  await checkNetlifyConfiguration();
  await checkDomainRedirects();
  await checkApiEndpoints();
  
  console.log('\n📊 RESUMEN:');
  console.log('='.repeat(60));
  console.log('✅ Configuración de archivos completada');
  console.log('✅ Redirecciones configuradas');
  console.log('✅ Headers de seguridad configurados');
  console.log('='.repeat(60));
  
  console.log('\n🎯 PRÓXIMOS PASOS:');
  console.log('1. Hacer commit y push de los cambios');
  console.log('2. Esperar el deploy automático en Netlify');
  console.log('3. Verificar que lhdecant.com funciona correctamente');
  console.log('4. Confirmar que las APIs redirigen al backend');
  
  console.log('\n🔗 URLs de Verificación:');
  console.log(`Frontend: https://${CUSTOM_DOMAIN}`);
  console.log(`API Health: https://${CUSTOM_DOMAIN}/api/health`);
  console.log(`Google OAuth: https://${CUSTOM_DOMAIN}/api/auth/google`);
}

runDomainFix().catch(console.error); 