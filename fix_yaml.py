import re

files = [
    'skills/vercel-deploy-claimable/SKILL.md',
    'skills/readme/SKILL.md'
]

for file in files:
    with open(file, 'r') as f:
        content = f.read()

    # We will simply change the inner double quotes to single quotes in the description line
    if 'description: "Deploy applications' in content:
        content = content.replace('such as "Deploy my app", "Deploy this to production", "Create a preview deployment", "Deploy and give me the link", or "Push this live".', 'such as \'Deploy my app\', \'Deploy this to production\', \'Create a preview deployment\', \'Deploy and give me the link\', or \'Push this live\'.')

    if 'description: "When the user wants to' in content:
        content = content.replace('says "write readme," "create readme," "document this project," "project documentation,"', 'says \'write readme,\' \'create readme,\' \'document this project,\' \'project documentation,\'')

    with open(file, 'w') as f:
        f.write(content)

print("YAML fixed")
