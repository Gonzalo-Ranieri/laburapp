#!/bin/bash

echo "🧪 Ejecutando suite completa de tests para LaburApp..."

# Limpiar caché
echo "🧹 Limpiando caché..."
npm run clean

# Tests unitarios
echo "🔬 Ejecutando tests unitarios..."
npm run test:coverage

# Tests de API
echo "🌐 Ejecutando tests de API..."
npm run test:api

# Tests de componentes
echo "🎨 Ejecutando tests de componentes..."
npm run test:components

# Tests de integración
echo "🔗 Ejecutando tests de integración..."
npm run test:integration

# Tests E2E
echo "🎭 Ejecutando tests E2E..."
npm run test:e2e

# Generar reporte de cobertura
echo "📊 Generando reporte de cobertura..."
npm run test:coverage -- --coverageReporters=html

echo "✅ Suite de tests completada!"
echo "📈 Reporte de cobertura disponible en: coverage/lcov-report/index.html"
