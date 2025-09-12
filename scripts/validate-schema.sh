#!/bin/bash

# Schema validation script for XMRig for Android
# Validates all schema files using AJV

set -e

echo "🔍 Starting schema validation..."

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
SCHEMAS_DIR="$ROOT_DIR/schemas"

# Check if schemas directory exists
if [ ! -d "$SCHEMAS_DIR" ]; then
    echo "❌ Schemas directory not found: $SCHEMAS_DIR"
    exit 1
fi

# Check if npx is available
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js and npm."
    exit 1
fi

# Find all schema files
SCHEMA_FILES=$(find "$SCHEMAS_DIR" -name "*.schema*.json" -type f)

if [ -z "$SCHEMA_FILES" ]; then
    echo "❌ No schema files found in $SCHEMAS_DIR"
    exit 1
fi

echo "📋 Found schema files:"
echo "$SCHEMA_FILES" | sed 's/^/  - /'

# Validate each schema file
VALIDATION_ERRORS=0
for schema_file in $SCHEMA_FILES; do
    echo ""
    echo "✅ Validating: $(basename "$schema_file")"
    
    if npx ajv compile -s "$schema_file" --strict=false --all-errors; then
        echo "   ✓ Schema is valid"
    else
        echo "   ❌ Schema validation failed"
        VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
    fi
done

echo ""
if [ $VALIDATION_ERRORS -eq 0 ]; then
    echo "🎉 All schemas are valid!"
    exit 0
else
    echo "💥 $VALIDATION_ERRORS schema(s) failed validation"
    exit 1
fi