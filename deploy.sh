#!/bin/bash
# Deploy sportsbeer to mihaicosma.com/sports/ (Apache reverse proxy → Node)
set -e

HOST="mc"
DEPLOY_DIR="/opt/sportsbeer"
PORT=3001
SYNC_DB=0

usage() {
    cat <<EOF
Usage: ./deploy.sh [--sync-db] [--help]

Options:
  --sync-db  Ship the local SQLite database to the server
  --help     Show this help
EOF
}

for arg in "$@"; do
    case "$arg" in
        --sync-db)
            SYNC_DB=1
            ;;
        --help)
            usage
            exit 0
            ;;
        *)
            echo "Unknown option: $arg" >&2
            usage >&2
            exit 1
            ;;
    esac
done

echo "==> Building..."
npm run build

# Next.js standalone nests under the project name
STANDALONE=".next/standalone/sportsbeer"

echo "==> Syncing to server..."
ssh ${HOST} "mkdir -p ~/sportsbeer-deploy/.next/static ~/sportsbeer-deploy/public ~/sportsbeer-deploy/db"

# Exclude the traced SQLite files from the standalone bundle. By default we
# preserve the server DB during the swap; use --sync-db to ship the local DB.
rsync -az --delete \
    --exclude '/db/sportsbeer.db' \
    --exclude '/db/sportsbeer.db-shm' \
    --exclude '/db/sportsbeer.db-wal' \
    ${STANDALONE}/ ${HOST}:~/sportsbeer-deploy/
rsync -az --delete .next/static/ ${HOST}:~/sportsbeer-deploy/.next/static/
rsync -az --delete public/ ${HOST}:~/sportsbeer-deploy/public/
rsync -az .env ${HOST}:~/sportsbeer-deploy/.env

if [ "${SYNC_DB}" = "1" ]; then
    echo "==> Syncing local DB..."
    ssh ${HOST} "rm -rf ~/sportsbeer-deploy/db && mkdir -p ~/sportsbeer-deploy/db"
    rsync -az db/sportsbeer.db ${HOST}:~/sportsbeer-deploy/db/
    if [ -f db/sportsbeer.db-shm ]; then
        rsync -az db/sportsbeer.db-shm ${HOST}:~/sportsbeer-deploy/db/
    fi
    if [ -f db/sportsbeer.db-wal ]; then
        rsync -az db/sportsbeer.db-wal ${HOST}:~/sportsbeer-deploy/db/
    fi
fi

echo "==> Swapping on server..."
ssh ${HOST} "
    sudo systemctl stop sportsbeer 2>/dev/null || true
    if [ \"${SYNC_DB}\" != \"1\" ] && [ -d ${DEPLOY_DIR}/db ]; then
        rm -rf ~/sportsbeer-deploy/db
        mkdir -p ~/sportsbeer-deploy/db
        cp -a ${DEPLOY_DIR}/db/. ~/sportsbeer-deploy/db/
    fi
    sudo rm -rf ${DEPLOY_DIR}.old
    sudo mv ${DEPLOY_DIR} ${DEPLOY_DIR}.old 2>/dev/null || true
    sudo mv ~/sportsbeer-deploy ${DEPLOY_DIR}
    sudo chown -R www-data:www-data ${DEPLOY_DIR}

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
