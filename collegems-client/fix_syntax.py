import os, glob

base_dir = "src"

files = []
for root, _, filenames in os.walk(base_dir):
    for f in filenames:
        if f.endswith(('.tsx', '.ts')):
            files.append(os.path.join(root, f))

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()

    lines = content.split('\n')
    new_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if line.startswith('import { extractArray } from "../utils/apiHelpers";') and i > 0 and lines[i-1].strip() == 'import {':
            # Remove the bad import statement from here
            # And add it at the top of the file
            new_lines.insert(0, 'import { extractArray } from "../utils/apiHelpers";')
            pass # skip adding this line
        else:
            new_lines.append(line)
        i += 1
        
    new_content = '\n'.join(new_lines)
    
    # Check for another pattern
    new_content = new_content.replace(
        'import api from "../api/axios";\nimport { extractArray } from "../utils/apiHelpers";\nimport { extractArray } from "../utils/apiHelpers";',
        'import api from "../api/axios";\nimport { extractArray } from "../utils/apiHelpers";'
    )
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Fixed syntax in {filepath}")

