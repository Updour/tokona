import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Find all fully qualified class names
    fqcn_pattern = r'\\(App\\[a-zA-Z0-9_\\]+|Illuminate\\[a-zA-Z0-9_\\]+)'
    matches = re.findall(fqcn_pattern, content)
    if not matches:
        return False
        
    unique_fqcns = set(matches)
    
    # Extract existing use statements
    existing_imports_raw = re.findall(r'^use\s+(.*?);', content, flags=re.MULTILINE)
    existing_imports = []
    for imp in existing_imports_raw:
        parts = imp.split(' as ')
        existing_imports.append(parts[0].strip())
        
    actual_imports_to_add = []
    for fqcn in unique_fqcns:
        if fqcn not in existing_imports:
            actual_imports_to_add.append(f"use {fqcn};")

    new_content = content
    for fqcn in unique_fqcns:
        class_name = fqcn.split('\\')[-1]
        escaped_fqcn = "\\\\" + fqcn.replace("\\", "\\\\")
        # Replace only exact matches, ensuring they don't continue with more backslashes or letters
        new_content = re.sub(escaped_fqcn + r'(?![a-zA-Z0-9_\\])', class_name, new_content)

    if not actual_imports_to_add and new_content == content:
        return False
        
    lines = new_content.split('\n')
    
    # Insert new imports at the end of the existing ones
    insert_idx = -1
    for i, line in enumerate(lines):
        if line.startswith('use ') and ';' in line:
            insert_idx = i
            
    if insert_idx == -1:
        for i, line in enumerate(lines):
            if line.startswith('namespace '):
                insert_idx = i
                break
                
    if insert_idx != -1:
        for imp in sorted(list(set(actual_imports_to_add))):
            if imp not in new_content:
                lines.insert(insert_idx + 1, imp)
                insert_idx += 1
            
    with open(filepath, 'w') as f:
        f.write('\n'.join(lines))
        
    return True

import sys

if __name__ == '__main__':
    directories = sys.argv[1:] if len(sys.argv) > 1 else ['app/Http/Controllers']
    for directory in directories:
        for root, dirs, files in os.walk(directory):
            for file in files:
                if file.endswith('.php'):
                    filepath = os.path.join(root, file)
                    if process_file(filepath):
                        print(f"Fixed {filepath}")
