# Manifesto lido por scalpel/deploy/deploy.sh. Caminhos relativos a este arquivo.
APP_SLUG="estetoscopio"
APP_DOMAIN="estetoscopio.scalpel.com.br"
APP_BUILD="npm run build"
APP_DIST="out"           # export estático do Next.js, publicado no docroot
APP_SERVER="deploy"      # api/*.php + .htaccess + uploads/, copiados por cima
