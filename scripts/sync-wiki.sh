#!/bin/bash

# 📚 Sync Wiki Script
# Sincroniza documentação local com GitHub Wiki

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📚 Sincronizando Documentação com Wiki${NC}"
echo ""

# Check if wiki directory exists
if [ ! -d "wiki" ]; then
    echo -e "${YELLOW}⚠️  Diretório wiki/ não encontrado. Clonando...${NC}"
    git clone https://github.com/bernardopg/mvp-estetoscopio.wiki.git wiki
    echo ""
fi

# Navigate to wiki
cd wiki

# Pull latest changes
echo -e "${BLUE}⬇️  Atualizando wiki local...${NC}"
git pull origin master || git pull origin main

# Go back to root
cd ..

# Sync documentation
echo -e "${BLUE}📝 Copiando documentação...${NC}"

# Create structure
mkdir -p wiki/user
mkdir -p wiki/developer
mkdir -p wiki/maintainer
mkdir -p wiki/releases

# Copy user docs
echo "  📄 Usuário..."
cp -v docs/user/*.md wiki/user/ 2>/dev/null || true

# Copy developer docs
echo "  📄 Desenvolvedor..."
cp -v docs/developer/*.md wiki/developer/ 2>/dev/null || true

# Copy maintainer docs
echo "  📄 Mantenedor..."
cp -v docs/maintainer/*.md wiki/maintainer/ 2>/dev/null || true

# Copy releases
echo "  📄 Releases..."
cp -v docs/releases/*.md wiki/releases/ 2>/dev/null || true

# Copy main README to Home
echo "  📄 Home..."
cp -v docs/README.md wiki/Home.md

# Create sidebar
echo "  📄 Sidebar..."
cat > wiki/_Sidebar.md << 'EOF'
## 📚 Documentação

### 👥 Usuário
- [Getting Started](user/getting-started)
- [User Guide](user/user-guide)
- [Examples](user/examples)
- [FAQ](user/faq)

### 💻 Desenvolvedor
- [Architecture](developer/architecture)
- [API Reference](developer/api-reference)
- [Migrations](developer/migrations)

### 🔧 Mantenedor
- [Agents](maintainer/agents)
- [Claude Context](maintainer/claude-context)
- [Release Guide](maintainer/release-guide)

### 🚀 Releases
- [v1.1.0](releases/v1.1.0)

---

[← Voltar ao Repositório](https://github.com/bernardopg/mvp-estetoscopio)
EOF

echo ""

# Navigate to wiki
cd wiki

# Check for changes
if [[ -z $(git status -s) ]]; then
    echo -e "${GREEN}✅ Wiki já está atualizado!${NC}"
    exit 0
fi

# Show changes
echo -e "${YELLOW}📊 Mudanças detectadas:${NC}"
git status -s
echo ""

# Commit and push
echo -e "${BLUE}📤 Fazendo commit e push...${NC}"
git add .
git commit -m "📚 Sync documentation from docs/ [$(date +%Y-%m-%d\ %H:%M:%S)]"
git push

cd ..

echo ""
echo -e "${GREEN}✅ Wiki sincronizado com sucesso!${NC}"
echo -e "${BLUE}🌐 Acesse: https://github.com/bernardopg/mvp-estetoscopio/wiki${NC}"
