#!/bin/bash

# Forzar uso de npm
export npm_config_package_manager=npm

echo "🔧 Forzando uso de npm..."
echo "📦 Instalando dependencias del servidor..."
npm install

echo "🏗️ Construyendo servidor..."
npm run server:build

echo "📦 Instalando dependencias del cliente..."
cd client
npm install --force

echo "🏗️ Construyendo cliente..."
npm run build

echo "✅ Build completado exitosamente!" 