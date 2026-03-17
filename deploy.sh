#!/bin/bash
# Deploy sportsbeer to mihaicosma.com/sports/ (Apache reverse proxy → Node)
set -e

ZONE="us-central1-a"
HOST="mc-new"
DEPLOY_DIR="/opt/sportsbeer"
PORT=3001

echo "==> Building..."
npm run build

echo "==> Uploading standalone build..."
gcloud compute ssh ${HOST} --zone=${ZONE} --command="mkdir -p ~/sportsbeer-deploy/.next"
gcloud compute scp --recurse .next/standalone/* ${HOST}:~/sportsbeer-deploy --zone=${ZONE}
gcloud compute scp --recurse .next/static ${HOST}:~/sportsbeer-deploy/.next/static --zone=${ZONE}
gcloud compute scp --recurse public ${HOST}:~/sportsbeer-deploy/public --zone=${ZONE} 2>/dev/null || true

# Copy .env for runtime (DB path, auth secret, API keys)
gcloud compute scp .env ${HOST}:~/sportsbeer-deploy/.env --zone=${ZONE}

# Copy the SQLite DB
gcloud compute scp db/sportsbeer.db ${HOST}:~/sportsbeer-deploy/db/sportsbeer.db --zone=${ZONE} 2>/dev/null || true

echo "==> Swapping on server..."
gcloud compute ssh ${HOST} --zone=${ZONE} --command="
    sudo systemctl stop sportsbeer 2>/dev/null || true
    sudo rm -rf ${DEPLOY_DIR}.old
    sudo mv ${DEPLOY_DIR} ${DEPLOY_DIR}.old 2>/dev/null || true
    sudo mv ~/sportsbeer-deploy ${DEPLOY_DIR}
    sudo chown -R www-data:www-data ${DEPLOY_DIR}

    # Ensure systemd service exists
    if [ ! -f /etc/systemd/system/sportsbeer.service ]; then
        sudo tee /etc/systemd/system/sportsbeer.service > /dev/null <<UNIT
[Unit]
Description=Brews & Box Scores (Next.js)
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=${DEPLOY_DIR}
ExecStart=/usr/bin/node ${DEPLOY_DIR}/server.js
Environment=NODE_ENV=production
Environment=PORT=${PORT}
Environment=HOSTNAME=127.0.0.1
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT
        sudo systemctl daemon-reload
        sudo systemctl enable sportsbeer
    fi

    sudo systemctl start sportsbeer
"

echo "==> Done. Node running on :${PORT}"
echo ""
echo "Apache config needed (once):"
echo "  ProxyPass /sports http://127.0.0.1:${PORT}/sports"
echo "  ProxyPassReverse /sports http://127.0.0.1:${PORT}/sports"
