import re, os, glob

base_dir = "src"

# Find all tsx/ts files
files = []
for root, _, filenames in os.walk(base_dir):
    for f in filenames:
        if f.endswith(('.tsx', '.ts')):
            files.append(os.path.join(root, f))

# regex to find patterns like setSomething(res.data) or setSomething(res.data || [])
pattern = re.compile(r'(set[A-Z][a-zA-Z0-9]*)\(\s*(res|response|cRes)\.data(?:\s*\|\|\s*\[\])?\s*\)')

count = 0
for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()

    matches = pattern.findall(content)
    if not matches:
        continue

    # Need to import extractArray if not already imported
    if 'extractArray' not in content:
        # Find where to insert import
        import_stmt = 'import { extractArray } from "../utils/apiHelpers";\n'
        
        # Try to find last import
        import_idx = content.rfind('import ')
        if import_idx != -1:
            end_of_line = content.find('\n', import_idx)
            content = content[:end_of_line+1] + import_stmt + content[end_of_line+1:]
        else:
            content = import_stmt + content

    # Replace all matches
    def replace_match(m):
        setter = m.group(1)
        var_name = m.group(2)
        return f"{setter}(extractArray({var_name}.data))"

    new_content = pattern.sub(replace_match, content)

    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        count += 1
        print(f"Fixed {filepath}")

print(f"Total fixed: {count}")
