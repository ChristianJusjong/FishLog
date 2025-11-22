#!/usr/bin/env python3
"""
Script to convert static StyleSheets to dynamic useStyles hooks in React Native files.
This enables theme-aware dark mode support.
"""

import os
import re
import sys

def convert_file_to_dynamic_styles(file_path):
    """Convert a file's StyleSheet to use dynamic styles."""

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if file has StyleSheet.create
    if 'StyleSheet.create' not in content:
        return False, "No StyleSheet.create found"

    # Check if already converted (has useStyles)
    if 'const useStyles = ()' in content or 'function useStyles()' in content:
        return False, "Already converted"

    # Find the StyleSheet.create block
    stylesheet_pattern = r'const styles = StyleSheet\.create\({[\s\S]*?\n}\);'
    stylesheet_match = re.search(stylesheet_pattern, content)

    if not stylesheet_match:
        return False, "Could not find StyleSheet pattern"

    stylesheet_block = stylesheet_match.group(0)

    # Extract just the styles object
    styles_object = stylesheet_block.replace('const styles = StyleSheet.create({', '').rstrip(');')

    # Create useStyles hook
    use_styles_hook = f"""const useStyles = () => {{
  const {{ colors }} = useTheme();

  return StyleSheet.create({{
{styles_object}
  }});
}};"""

    # Replace the old StyleSheet with the new useStyles hook
    new_content = content.replace(stylesheet_block, use_styles_hook)

    # Replace COLORS. with colors. in the StyleSheet
    # Only replace within the useStyles function
    new_content = re.sub(r'COLORS\.', 'colors.', new_content)

    # Find the component function and add const styles = useStyles();
    # Look for common React Native component patterns
    component_patterns = [
        r'(export default function \w+\([^)]*\) {[\s\S]*?)(const { colors } = useTheme\(\);)',
        r'(export default function \w+\([^)]*\) {[\s\S]*?)(const router = useRouter\(\);)',
        r'(export default function \w+\([^)]*\) {[\s\S]*?)(const \w+ = use\w+\(\);)',
    ]

    for pattern in component_patterns:
        match = re.search(pattern, new_content)
        if match:
            # Add const styles = useStyles(); after the matched hook
            insertion_point = match.end(2)
            new_content = new_content[:insertion_point] + '\n  const styles = useStyles();' + new_content[insertion_point:]
            break

    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

    return True, "Converted successfully"

def main():
    app_dir = r'C:\ClaudeCodeProject\FishLog\apps\mobile\app'

    # Find all .tsx files with StyleSheet
    converted_count = 0
    skipped_count = 0
    error_count = 0

    for root, dirs, files in os.walk(app_dir):
        for file in files:
            if file.endswith('.tsx'):
                file_path = os.path.join(root, file)
                try:
                    success, message = convert_file_to_dynamic_styles(file_path)
                    if success:
                        print(f"✓ Converted: {file_path}")
                        converted_count += 1
                    else:
                        print(f"- Skipped {file_path}: {message}")
                        skipped_count += 1
                except Exception as e:
                    print(f"✗ Error {file_path}: {e}")
                    error_count += 1

    print(f"\n=== Summary ===")
    print(f"Converted: {converted_count}")
    print(f"Skipped: {skipped_count}")
    print(f"Errors: {error_count}")

if __name__ == '__main__':
    main()
