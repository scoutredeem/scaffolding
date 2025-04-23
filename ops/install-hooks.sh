#!/bin/bash
# File: install-hooks.sh
# Purpose: Install Git hooks for the repository

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Create prepare-commit-msg hook
cat > .git/hooks/prepare-commit-msg << 'EOF'
#!/bin/bash
# Validate commit messages according to semantic conventions

COMMIT_MSG_FILE=$1
COMMIT_SOURCE=$2

# Skip validation for specific scenarios
if [ "$COMMIT_SOURCE" = "merge" ] || [ "$COMMIT_SOURCE" = "squash" ]; then
  exit 0
fi

# Define valid types
VALID_TYPES="revert|fix|feat|increment|ops|qa|refactor"

# Extract the first line of the commit message
FIRST_LINE=$(head -n 1 "$COMMIT_MSG_FILE")

# Check if commit message follows semantic convention
if ! echo "$FIRST_LINE" | grep -qE "^($VALID_TYPES)(\(.+\))?: .+$"; then
  echo "Error: Commit message does not follow semantic convention."
  echo "Valid format: <type>[optional scope]: <description>"
  echo "Valid types: revert, fix, feat, increment, ops, qa, refactor"
  echo "Example: feat: add new feature"
  echo "Your commit message: $FIRST_LINE"
  exit 1
fi

exit 0
EOF

# Create pre-push hook
cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash
# Validate branch naming and prevent direct pushes to main

# Read the target branch
read local_ref local_sha remote_ref remote_sha

# If pushing to main branch, abort
if [[ "$remote_ref" == *"/main" ]]; then
  echo "Error: Direct push to main branch is not allowed."
  echo "Please create a pull request instead."
  exit 1
fi

exit 0
EOF

# Make hooks executable
chmod +x .git/hooks/prepare-commit-msg
chmod +x .git/hooks/pre-push

echo "Git hooks installed successfully!"
