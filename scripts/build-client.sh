#!/bin/bash

# Script para construir el cliente con verificación de Vite
set -e

echo "🔧 Verificando instalación de Vite..."

# Navegar al directorio del cliente
cd client

# Verificar que Vite esté en node_modules
if [ ! -f "node_modules/.bin/vite" ]; then
    echo "📦 Vite no está en node_modules, instalando dependencias..."
    npm install
fi

# Verificar que Vite esté disponible
if ! npx vite --version &> /dev/null; then
    echo "📦 Vite no está disponible, reinstalando..."
    rm -rf node_modules package-lock.json
    npm install
fi

echo "🚀 Construyendo cliente con Vite..."
npx vite build

echo "✅ Build del cliente completado" 