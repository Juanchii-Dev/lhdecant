#!/bin/bash

# Script para construir el cliente con verificación de Vite
set -e

echo "🔧 Verificando instalación de Vite..."

# Navegar al directorio del cliente
cd client

# Verificar si Vite está instalado
if ! command -v vite &> /dev/null; then
    echo "📦 Vite no encontrado, instalando dependencias..."
    npm install
fi

# Verificar que Vite esté en node_modules
if [ ! -f "node_modules/.bin/vite" ]; then
    echo "📦 Vite no está en node_modules, reinstalando..."
    rm -rf node_modules package-lock.json
    npm install
fi

echo "🚀 Construyendo cliente con Vite..."
npm run build

echo "✅ Build del cliente completado" 