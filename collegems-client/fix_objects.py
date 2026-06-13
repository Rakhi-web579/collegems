import os
import re

base_dir = "src"

files = []
for root, _, filenames in os.walk(base_dir):
    for f in filenames:
        if f.endswith(('.tsx', '.ts')):
            files.append(os.path.join(root, f))

# A list of setters that we want to revert from extractArray(res.data) to res.data
# These are ones where the state is known to be an object, not an array.
setters_to_revert = [
    "setStats",
    "setFullProfile",
    "setSelectedComplaint",
    "setProfileData",
    "setData",
    "setFilterOptions",
    "setFee",
    "setAttendanceData" # Check Attendance.tsx where we had setAttendanceData(extractArray(res.data))
]

count = 0
for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()

    new_content = content
    for setter in setters_to_revert:
        # We look for: setter(extractArray(res.data)) or setter(extractArray(response.data))
        pattern = rf"{setter}\(extractArray\((res|response|cRes)\.data\)\)"
        new_content = re.sub(pattern, rf"{setter}(\1.data)", new_content)
        
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Reverted object setter in {filepath}")
        count += 1

print(f"Total reverted: {count}")
