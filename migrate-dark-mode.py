#!/usr/bin/env python3
"""
Dark Mode Migration Script
Systematically updates all React Native TSX files to use dynamic theme colors
from useTheme() hook instead of static COLORS imports.
"""

import re
import os
import glob

def update_file_for_dark_mode(file_path):
    """Update a single file to support dark mode"""

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Skip if already has useTheme hook
    if 'const { colors } = useTheme();' in content or 'const { colors, isDark } = useTheme();' in content:
        print(f"  ⏭️  Already migrated: {os.path.basename(file_path)}")
        return False

    # Skip settings.tsx and _layout.tsx (already have theme infrastructure)
    basename = os.path.basename(file_path)
    if basename in ['settings.tsx', '_layout.tsx', 'ThemeContext.tsx']:
        print(f"  ⏭️  Skipping infrastructure file: {basename}")
        return False

    # Step 1: Update imports
    # Remove COLORS from imports if present
    content = re.sub(
        r"from '@/constants/branding'",
        r"from '@/constants/branding'",
        content
    )

    # Add useTheme import if not present
    if "import { useTheme } from '@/contexts/ThemeContext';" not in content:
        # Find the last import statement
        import_pattern = r'(import[^;]+;)\n(?!import)'
        def add_theme_import(match):
            return match.group(1) + "\nimport { useTheme } from '@/contexts/ThemeContext';\n"
        content = re.sub(import_pattern, add_theme_import, content, count=1)

    # Step 2: Add useTheme hook in component
    # Find the component function and add hook after other hooks
    component_pattern = r'(export default function \w+\([^)]*\) \{[^\n]*\n(?:  [^\n]+\n)*?)(  const \[|  useEffect|  useFocusEffect|  if \()'
    def add_use_theme_hook(match):
        return match.group(1) + "  const { colors } = useTheme();\n" + match.group(2)

    if 'export default function' in content and 'const { colors } = useTheme();' not in content:
        content = re.sub(component_pattern, add_use_theme_hook, content, count=1)

    # Step 3: Replace COLORS references in JSX with colors
    # This is complex - only replace in JSX attributes, not in StyleSheet

    # Common patterns in JSX attributes:
    replacements = [
        # Icon colors
        (r'color={COLORS\.(\w+)}', r'color={colors.\1}'),
        # Inline styles with COLORS
        (r'backgroundColor: COLORS\.(\w+)', r'backgroundColor: colors.\1}'),
        (r'color: COLORS\.(\w+)', r'color: colors.\1}'),
        (r'borderColor: COLORS\.(\w+)', r'borderColor: colors.\1}'),
        (r'borderBottomColor: COLORS\.(\w+)', r'borderBottomColor: colors.\1}'),
        (r'borderTopColor: COLORS\.(\w+)', r'borderTopColor: colors.\1}'),
        (r'tintColor={COLORS\.(\w+)}', r'tintColor={colors.\1}'),
        (r'placeholderTextColor={COLORS\.(\w+)}', r'placeholderTextColor={colors.\1}'),
    ]

    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)

    # Save if changed
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✅ Updated: {os.path.basename(file_path)}")
        return True
    else:
        print(f"  ➖ No changes: {os.path.basename(file_path)}")
        return False

def main():
    """Main migration function"""
    app_dir = r'C:\ClaudeCodeProject\FishLog\apps\mobile\app'

    # Get all TSX files
    tsx_files = glob.glob(os.path.join(app_dir, '**/*.tsx'), recursive=True)

    print(f"Found {len(tsx_files)} TSX files to process\n")

    updated_count = 0
    for tsx_file in sorted(tsx_files):
        if update_file_for_dark_mode(tsx_file):
            updated_count += 1

    print(f"\n✨ Migration complete!")
    print(f"   Updated: {updated_count} files")
    print(f"   Total: {len(tsx_files)} files")

if __name__ == '__main__':
    main()
