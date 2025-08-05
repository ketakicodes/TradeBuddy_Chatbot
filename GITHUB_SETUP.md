# GitHub CLI Setup Guide for Gemini Chatbot

Follow these steps to create a new GitHub repository and push your Gemini chatbot project.

## Prerequisites

1. **Install GitHub CLI** (if not already installed):
   ```bash
   # macOS (using Homebrew)
   brew install gh
   
   # Or download from: https://cli.github.com/
   ```

2. **Authenticate with GitHub**:
   ```bash
   gh auth login
   ```
   Follow the prompts to authenticate via browser or token.

## Step-by-Step Instructions

### 1. Navigate to your project
```bash
cd /Users/andersonwestfield/Desktop/chatbottemplate
```

### 2. Remove existing git repository (if you want a fresh start)
Since this project is already connected to a repository, you have two options:

**Option A: Create a completely new repository (recommended)**
```bash
# Remove existing git repository
rm -rf .git

# Initialize a new git repository
git init
```

**Option B: Change the remote to point to your new repository**
```bash
# Remove existing remote
git remote remove origin
```

### 3. Stage all your changes
```bash
# Add all files to git
git add .

# Verify files are staged correctly
git status
```

### 4. Create initial commit
```bash
git commit -m "Initial commit: Gemini AI chatbot with multimodal support"
```

### 5. Create GitHub repository using GitHub CLI
```bash
# Create a public repository
gh repo create geminichatbot --public --source=. --remote=origin --push

# Or create a private repository
gh repo create geminichatbot --private --source=. --remote=origin --push
```

This command will:
- Create a new repository named "geminichatbot" on GitHub
- Set it as the origin remote
- Push your code to the main branch

### 6. Verify the repository was created
```bash
# Open the repository in your browser
gh repo view --web
```

## Alternative: Manual Repository Creation

If you prefer to create the repository manually:

### 1. Create repository on GitHub
```bash
# Create repository without pushing
gh repo create geminichatbot --public

# Or use the GitHub website
```

### 2. Add remote and push
```bash
# Add the remote
git remote add origin https://github.com/YOUR_USERNAME/geminichatbot.git

# Push to main branch
git push -u origin main
```

## Additional Commands

### Set repository description
```bash
gh repo edit --description "AI chatbot with multimodal support using Google Gemini and Next.js"
```

### Add topics/tags
```bash
gh repo edit --add-topic "nextjs,gemini-ai,chatbot,react,typescript,ai,multimodal"
```

### Create initial issues (optional)
```bash
# Create a feature request issue
gh issue create --title "Add conversation export feature" --body "Allow users to export chat history"

# Create a documentation issue
gh issue create --title "Add API documentation" --body "Document the API endpoints in detail"
```

## Troubleshooting

### If you get permission errors:
```bash
# Check your authentication status
gh auth status

# Re-authenticate if needed
gh auth login
```

### If push fails due to large files:
```bash
# Check file sizes
find . -type f -size +100M

# Add large files to .gitignore if needed
echo "large-file.mp4" >> .gitignore
```

### If you want to rename the project folder:
```bash
# Move to parent directory
cd ..

# Rename the folder
mv chatbottemplate geminichatbot

# Enter the renamed directory
cd geminichatbot
```

## Next Steps

After creating the repository:

1. **Add collaborators** (if needed):
   ```bash
   gh repo add-collaborator USERNAME
   ```

2. **Enable GitHub Pages** (optional):
   ```bash
   gh repo edit --enable-pages
   ```

3. **Create a release**:
   ```bash
   gh release create v1.0.0 --title "Initial Release" --notes "First release of Gemini AI Chatbot"
   ```

4. **Set up GitHub Actions** for CI/CD (create `.github/workflows/deploy.yml`)

## Quick One-Liner

If you want to do everything in one go (fresh repository):
```bash
rm -rf .git && git init && git add . && git commit -m "Initial commit: Gemini AI chatbot" && gh repo create geminichatbot --public --source=. --remote=origin --push
```

Your repository will be available at: `https://github.com/YOUR_USERNAME/geminichatbot`