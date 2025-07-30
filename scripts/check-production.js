#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración para producción...\n');

const checks = [
  {
    name: 'Package.json principal',
    file: 'package.json',
    check: () => {
      const content = fs.readFileSync('package.json', 'utf8');
      const data = JSON.parse(content);
      return data.scripts && data.scripts.build && data.scripts.start;
    }
  },
  {
    name: 'Package.json del cliente',
    file: 'client/package.json',
    check: () => {
      const content = fs.readFileSync('client/package.json', 'utf8');
      const data = JSON.parse(content);
      return data.scripts && data.scripts.build;
    }
  },
  {
    name: 'Configuración de Vite',
    file: 'client/vite.config.ts',
    check: () => {
      const content = fs.readFileSync('client/vite.config.ts', 'utf8');
      return content.includes('build') && content.includes('outDir');
    }
  },
  {
    name: 'Configuración de Netlify',
    file: 'client/netlify.toml',
    check: () => {
      const content = fs.readFileSync('client/netlify.toml', 'utf8');
      return content.includes('publish = "dist"') && content.includes('command = "npm run build"');
    }
  },
  {
    name: 'Configuración de Render',
    file: 'render.yaml',
    check: () => {
      const content = fs.readFileSync('render.yaml', 'utf8');
      return content.includes('buildCommand: npm run build') && content.includes('startCommand: npm start');
    }
  },
  {
    name: 'Variables de entorno de producción',
    file: 'client/env.production',
    check: () => {
      const content = fs.readFileSync('client/env.production', 'utf8');
      return content.includes('VITE_API_URL=https://lhdecant-backend.onrender.com') && 
             content.includes('VITE_STRIPE_PUBLISHABLE_KEY=');
    }
  },
  {
    name: 'Servidor principal',
    file: 'server/index.ts',
    check: () => {
      const content = fs.readFileSync('server/index.ts', 'utf8');
      return content.includes('helmet') && content.includes('compression') && content.includes('/api/health');
    }
  },
  {
    name: 'README actualizado',
    file: 'README.md',
    check: () => {
      const content = fs.readFileSync('README.md', 'utf8');
      return content.includes('🚀 Despliegue en Producción') && 
             content.includes('Netlify') && 
             content.includes('Render');
    }
  }
];

let passedChecks = 0;
let totalChecks = checks.length;

checks.forEach(check => {
  try {
    if (!fs.existsSync(check.file)) {
      console.log(`❌ ${check.name}: Archivo no encontrado (${check.file})`);
      return;
    }

    if (check.check()) {
      console.log(`✅ ${check.name}: OK`);
      passedChecks++;
    } else {
      console.log(`❌ ${check.name}: Verificación fallida`);
    }
  } catch (error) {
    console.log(`❌ ${check.name}: Error - ${error.message}`);
  }
});

console.log(`\n📊 Resultado: ${passedChecks}/${totalChecks} verificaciones pasaron`);

if (passedChecks === totalChecks) {
  console.log('\n🎉 ¡La aplicación está lista para producción!');
  console.log('\n📋 Próximos pasos:');
  console.log('1. Commit y push de los cambios');
  console.log('2. Configurar variables de entorno en Render');
  console.log('3. Configurar variables de entorno en Netlify');
  console.log('4. Desplegar el backend en Render');
  console.log('5. Desplegar el frontend en Netlify');
  console.log('6. Configurar webhooks de Stripe');
  console.log('7. Configurar Google OAuth2');
} else {
  console.log('\n⚠️  Hay problemas que deben resolverse antes del despliegue');
  process.exit(1);
} 