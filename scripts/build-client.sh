#!/bin/bash

# Script para construir el cliente con verificación de Vite
set -e

echo "🔧 Verificando instalación de Vite..."

# Navegar al directorio del cliente
cd client

echo "📦 Instalando dependencias del cliente..."
# Limpiar e instalar desde cero
rm -rf node_modules package-lock.json

# Instalar con --legacy-peer-deps para evitar conflictos
npm install --legacy-peer-deps

echo "🔍 Verificando que Vite esté instalado..."
# Verificar que Vite esté realmente disponible
if [ ! -f "node_modules/.bin/vite" ]; then
    echo "❌ Vite no está disponible después de npm install"
    echo "📋 Contenido de node_modules/.bin/:"
    ls -la node_modules/.bin/ || echo "Directorio no existe"
    echo "📋 Contenido de package.json devDependencies:"
    grep -A 10 "devDependencies" package.json
    echo "🔄 Intentando instalación forzada de Vite..."
    npm install vite@^5.0.8 --save-dev --legacy-peer-deps
    if [ ! -f "node_modules/.bin/vite" ]; then
        echo "❌ Vite aún no está disponible después de instalación forzada"
        exit 1
    fi
fi

echo "🚀 Construyendo cliente con Vite..."
# Usar la ruta directa a Vite
./node_modules/.bin/vite build

echo "✅ Build del cliente completado" 