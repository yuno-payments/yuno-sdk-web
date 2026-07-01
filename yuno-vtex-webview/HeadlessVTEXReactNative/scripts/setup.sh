#!/bin/bash

# Script de setup para la app de ejemplo del SDK de Yuno React Native

set -e

echo "🚀 Iniciando setup de Yuno SDK Example App..."
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "Este script debe ejecutarse desde el directorio example/"
    exit 1
fi

# Paso 1: Verificar Node.js
print_step "Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_success "Node.js instalado: $NODE_VERSION"
else
    print_error "Node.js no está instalado. Por favor instala Node.js >= 16"
    exit 1
fi

# Paso 2: Instalar dependencias de Node
print_step "Instalando dependencias de Node..."
npm install
print_success "Dependencias de Node instaladas"

# Paso 3: Compilar el SDK principal
print_step "Compilando el SDK principal..."
cd ..
if [ ! -d "node_modules" ]; then
    npm install
fi
npm run prepack
print_success "SDK compilado"
cd example

# Paso 4: Setup de Android
print_step "Configurando Android..."
if [ ! -f "android/app/debug.keystore" ]; then
    print_warning "Generando debug keystore..."
    cd android/app
    keytool -genkey -v -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US" 2>/dev/null || true
    cd ../..
fi

if command -v gradle &> /dev/null || [ -f "android/gradlew" ]; then
    print_success "Gradle disponible"
else
    print_warning "Gradle no encontrado, se descargará al compilar"
fi

# Paso 5: Setup de iOS (solo en macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    print_step "Configurando iOS..."
    
    if command -v pod &> /dev/null; then
        print_success "CocoaPods instalado"
        
        print_step "Instalando pods..."
        cd ios
        pod install
        cd ..
        print_success "Pods instalados"
    else
        print_warning "CocoaPods no está instalado. Instálalo con: sudo gem install cocoapods"
    fi
else
    print_warning "No estás en macOS, saltando configuración de iOS"
fi

# Resumen
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_success "¡Setup completado!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Para ejecutar la app:"
echo ""
echo "  Android:  npm run android"
echo "  iOS:      npm run ios"
echo ""
echo "🔧 Para desarrollo:"
echo ""
echo "  Metro:    npm start"
echo "  Logs:     adb logcat (Android) o Xcode Console (iOS)"
echo ""
echo "📚 Para más información, consulta README.md o SETUP.md"
echo ""

