#!/bin/bash
set -e

echo "=== laRooms Deploy Script ==="

# 1. System dependencies
echo "[1/8] Installing system dependencies..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl nginx certbot python3-certbot-nginx

# 2. Node.js 20
echo "[2/8] Installing Node.js 20..."
if ! command -v nvm &> /dev/null; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
fi
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20

# 3. PostgreSQL
echo "[3/8] Installing PostgreSQL..."
if ! command -v psql &> /dev/null; then
  sudo apt install -y postgresql postgresql-contrib
fi
sudo systemctl enable postgresql
sudo systemctl start postgresql

# 4. Create database
echo "[4/8] Creating database..."
sudo -u postgres psql -c "CREATE USER larooms WITH PASSWORD 'larooms_password';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE larooms OWNER larooms;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE larooms TO larooms;" 2>/dev/null || true

# 5. Clone repo (if not exists)
echo "[5/8] Cloning repository..."
DEPLOY_DIR="/var/www/larooms"
if [ ! -d "$DEPLOY_DIR" ]; then
  sudo mkdir -p $DEPLOY_DIR
  sudo chown $USER:$USER $DEPLOY_DIR
  git clone <YOUR_REPO_URL> $DEPLOY_DIR
fi
cd $DEPLOY_DIR

# 6. Install dependencies and configure
echo "[6/8] Installing dependencies..."
npm install

# Create .env if not exists
if [ ! -f .env ]; then
  cp .env.example .env
  echo ""
  echo "!!! ОТКРОЙ .env И ЗАПОЛНИ !!!"
  echo "DATABASE_URL=\"postgresql://larooms:larooms_password@localhost:5432/larooms\""
  echo "YANDEX_TRAVEL_OAUTH_TOKEN=\"<ТВОЙ ТОКЕН>\""
  echo ""
  read -p "Нажми Enter когда заполнишь .env..."
fi

# 7. Database setup
echo "[7/8] Setting up database..."
npm run db:push
npm run db:seed

# 8. Build and start
echo "[8/8] Building and starting..."
npm run build

# PM2
if ! command -v pm2 &> /dev/null; then
  npm install -g pm2
fi
pm2 delete larooms 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# nginx
sudo cp nginx/larooms.conf /etc/nginx/sites-available/larooms.conf
sudo ln -sf /etc/nginx/sites-available/larooms.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

echo ""
echo "=== DEPLOY COMPLETE ==="
echo "Открой http://$(curl -s ifconfig.me) в браузере"
echo ""
echo "Для SSL запусти:"
echo "sudo certbot --nginx -d твой-домен.ru -d www.твой-домен.ru"
