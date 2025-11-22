#!/bin/bash
# Batch convert all screen files to use dynamic theme-aware styles

APP_DIR="apps/mobile/app"
CONVERTED=0
FAILED=0

echo "=== Converting StyleSheets to Dynamic Styles ==="
echo ""

# Function to convert a single file
convert_file() {
    local file="$1"
    local filename=$(basename "$file")

    # Check if file has StyleSheet.create
    if ! grep -q "StyleSheet.create" "$file"; then
        echo "⊘ Skipped $filename (no StyleSheet)"
        return
    fi

    # Check if already converted
    if grep -q "const useStyles = ()" "$file"; then
        echo "✓ Already converted: $filename"
        return
    fi

    echo "→ Converting $filename..."

    # Create backup
    cp "$file" "${file}.bak"

    # Step 1: Replace "const styles = StyleSheet.create({" with useStyles hook start
    sed -i 's/const styles = StyleSheet\.create({/const useStyles = () => {\n  const { colors } = useTheme();\n\n  return StyleSheet.create({/' "$file"

    # Step 2: Replace closing "}); " at end of stylesheet with useStyles closing
    # This is tricky - we need to find the right closing

    # Step 3: Replace all COLORS. with colors. in StyleSheet
    # Only within the StyleSheet block (after useStyles declaration)
    perl -i -pe 's/COLORS\./colors./g if /useStyles/../^};/' "$file"

    # Step 4: Add const styles = useStyles(); to component
    # Find line with "const { colors } = useTheme();" and add after it
    sed -i '/const { colors } = useTheme();/a\  const styles = useStyles();' "$file"

    if [ $? -eq 0 ]; then
        echo "✓ Converted: $filename"
        ((CONVERTED++))
        rm "${file}.bak"
    else
        echo "✗ Failed: $filename (restored from backup)"
        mv "${file}.bak" "$file"
        ((FAILED++))
    fi
}

# Find all .tsx files in app directory
find "$APP_DIR" -name "*.tsx" -type f | while read file; do
    convert_file "$file"
done

echo ""
echo "=== Summary ==="
echo "Converted: $CONVERTED files"
echo "Failed: $FAILED files"
