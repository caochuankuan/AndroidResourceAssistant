#!/bin/bash

set -uo pipefail

CONFIG_FILE="/usr/local/etc/xray/config.json"
BACKUP_DIR="/usr/local/etc/xray/backup"
SUB_DIR="/usr/local/etc/xray/sub"

INSTALL_CMD='bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ install'
REMOVE_CMD='bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ remove --purge'

mkdir -p "$BACKUP_DIR"
mkdir -p "$SUB_DIR"

# =========================
# globals
# =========================
PROTOCOL=""
PRIVATE_KEY=""
PUBLIC_KEY=""
UUID=""
SHORT_ID=""
TROJAN_PASS=""
SS_PASS=""
SERVER_IP=""
PORT=""
SNI=""

# =========================
# root check
# =========================
check_root() {
  if [ "$EUID" -ne 0 ]; then
    echo "❌ 请使用 root 运行"
    exit 1
  fi
}

# =========================
# IP
# =========================
get_ip() {
  SERVER_IP=$(curl -4 -s https://api.ipify.org || true)
  if [ -z "$SERVER_IP" ]; then
    SERVER_IP=$(curl -4 -s https://ifconfig.me || true)
  fi
  if [ -z "$SERVER_IP" ]; then
    SERVER_IP=$(hostname -I | awk '{print $1}')
  fi
}

# =========================
# port
# =========================
select_port() {
  echo "选择端口"
  echo "1. 443"
  echo "2. 8443"
  echo "3. 2053"
  echo "4. 自定义"
  read -p "选择: " c

  case "$c" in
    1) PORT=443 ;;
    2) PORT=8443 ;;
    3) PORT=2053 ;;
    4) read -p "端口: " PORT ;;
    *) PORT=443 ;;
  esac
}

# =========================
# SNI
# =========================
select_sni() {
  echo "选择 SNI"
  echo "1. microsoft"
  echo "2. apple"
  echo "3. cloudflare"
  echo "4. bing"
  echo "5. github"
  echo "6. 自定义"

  read -p "选择: " c

  case "$c" in
    1) SNI="www.microsoft.com" ;;
    2) SNI="www.apple.com" ;;
    3) SNI="www.cloudflare.com" ;;
    4) SNI="www.bing.com" ;;
    5) SNI="github.com" ;;
    6) read -p "SNI: " SNI ;;
    *) SNI="www.microsoft.com" ;;
  esac
}

# =========================
# protocol
# =========================
select_protocol() {
  echo ""
  echo "选择协议"
  echo "1. VLESS + Reality"
  echo "2. Trojan + TLS"
  echo "3. Shadowsocks"
  read -p "选择: " p

  case "$p" in
    1) PROTOCOL="vless" ;;
    2) PROTOCOL="trojan" ;;
    3) PROTOCOL="ss" ;;
    *) PROTOCOL="vless" ;;
  esac
}

# =========================
# keys
# =========================
gen_keys() {
  OUT=$(xray x25519 2>&1)

  PRIVATE_KEY=""
  PUBLIC_KEY=""

  while IFS= read -r line; do
    if echo "$line" | grep -qi 'private'; then
      PRIVATE_KEY="${line##*: }"
      PRIVATE_KEY="${PRIVATE_KEY%% *}"
    fi
    if echo "$line" | grep -qi 'public\|password'; then
      PUBLIC_KEY="${line##*: }"
      PUBLIC_KEY="${PUBLIC_KEY%% *}"
    fi
  done <<< "$OUT"

  PRIVATE_KEY=$(echo "$PRIVATE_KEY" | tr -d '[:space:]')
  PUBLIC_KEY=$(echo "$PUBLIC_KEY" | tr -d '[:space:]')

  UUID=$(xray uuid)
  SHORT_ID=$(openssl rand -hex 8)
}

# =========================
# config
# =========================
write_config() {

  cp "$CONFIG_FILE" "$BACKUP_DIR/config.$(date +%s).bak" 2>/dev/null || true

  if [ "$PROTOCOL" = "vless" ]; then

cat > "$CONFIG_FILE" <<EOF
{
  "log": { "loglevel": "warning" },
  "inbounds": [{
    "listen": "0.0.0.0",
    "port": $PORT,
    "protocol": "vless",
    "settings": {
      "clients": [{
        "id": "$UUID",
        "flow": "xtls-rprx-vision"
      }],
      "decryption": "none"
    },
    "streamSettings": {
      "network": "tcp",
      "security": "reality",
      "realitySettings": {
        "show": false,
        "dest": "$SNI:443",
        "serverNames": ["$SNI"],
        "privateKey": "$PRIVATE_KEY",
        "shortIds": ["$SHORT_ID"]
      }
    }
  }],
  "outbounds": [{ "protocol": "freedom" }]
}
EOF

  elif [ "$PROTOCOL" = "trojan" ]; then

    TROJAN_PASS=$(openssl rand -hex 12)

cat > "$CONFIG_FILE" <<EOF
{
  "log": { "loglevel": "warning" },
  "inbounds": [{
    "listen": "0.0.0.0",
    "port": $PORT,
    "protocol": "trojan",
    "settings": {
      "clients": [{
        "password": "$TROJAN_PASS"
      }]
    },
    "streamSettings": {
      "network": "tcp",
      "security": "tls",
      "tlsSettings": {
        "serverName": "$SNI",
        "alpn": ["http/1.1"]
      }
    }
  }],
  "outbounds": [{ "protocol": "freedom" }]
}
EOF

  elif [ "$PROTOCOL" = "ss" ]; then

    SS_PASS=$(openssl rand -hex 12)

cat > "$CONFIG_FILE" <<EOF
{
  "log": { "loglevel": "warning" },
  "inbounds": [{
    "listen": "0.0.0.0",
    "port": $PORT,
    "protocol": "shadowsocks",
    "settings": {
      "method": "chacha20-ietf-poly1305",
      "password": "$SS_PASS"
    }
  }],
  "outbounds": [{ "protocol": "freedom" }]
}
EOF

  fi
}

# =========================
# test
# =========================
test_config() {
  xray run -test -config "$CONFIG_FILE" >/dev/null 2>&1 && return 0
  xray -test -config "$CONFIG_FILE" >/dev/null 2>&1 && return 0
  return 1
}

# =========================
# install
# =========================
install_xray() {

  select_port
  select_sni
  select_protocol

  apt-get update -y
  apt-get install -y curl openssl qrencode

  eval "$INSTALL_CMD" || true

  gen_keys
  write_config

  if ! test_config; then
    echo "❌ config 错误"
    exit 1
  fi

  systemctl enable xray
  systemctl restart xray

  get_ip

  echo ""
  echo "========== 安装成功 =========="
  echo "IP: $SERVER_IP"
  echo "PORT: $PORT"
  echo "PROTOCOL: $PROTOCOL"
  echo ""

  if [ "$PROTOCOL" = "vless" ]; then
    LINK="vless://$UUID@$SERVER_IP:$PORT?encryption=none&flow=xtls-rprx-vision&security=reality&sni=$SNI&pbk=$PUBLIC_KEY&sid=$SHORT_ID&type=tcp"
    echo "$LINK"
    qrencode -t ANSIUTF8 "$LINK"

  elif [ "$PROTOCOL" = "trojan" ]; then
    echo "trojan://$TROJAN_PASS@$SERVER_IP:$PORT?sni=$SNI"

  elif [ "$PROTOCOL" = "ss" ]; then
    echo "SS PASS: $SS_PASS"
  fi
}

# =========================
# show node + QR
# =========================
show_node() {
  echo ""
  echo "========== NODE =========="

  PROTOCOL_NOW=$(grep -m1 '"protocol"' "$CONFIG_FILE" | awk -F '"' '{print $4}')
  get_ip

  echo "Protocol: $PROTOCOL_NOW"

  if [ "$PROTOCOL_NOW" = "vless" ]; then

    UUID=$(grep -oP '"id":\s*"\K[^"]+' "$CONFIG_FILE")
    SHORT_ID=$(grep -oP '"shortIds":\s*\["\K[^"]+' "$CONFIG_FILE")
    SNI=$(grep -oP '"serverNames":\s*\["\K[^"]+' "$CONFIG_FILE")
    PBK=$(grep -oP '"privateKey":.*"publicKey":\s*"\K[^"]+' "$CONFIG_FILE" 2>/dev/null)

    LINK="vless://$UUID@$SERVER_IP:$PORT?security=reality&sni=$SNI&pbk=$PBK&sid=$SHORT_ID&type=tcp"

    echo "$LINK"
    qrencode -t ANSIUTF8 "$LINK"

  elif [ "$PROTOCOL_NOW" = "trojan" ]; then

    PASS=$(grep -oP '"password":\s*"\K[^"]+' "$CONFIG_FILE")
    LINK="trojan://$PASS@$SERVER_IP:$PORT?sni=$SNI"
    echo "$LINK"
    qrencode -t ANSIUTF8 "$LINK"

  elif [ "$PROTOCOL_NOW" = "ss" ]; then
    echo "SS password:"
    grep -oP '"password":\s*"\K[^"]+' "$CONFIG_FILE"
  fi
}

# =========================
# clash
# =========================
generate_clash() {
  get_ip

cat > "$SUB_DIR/clash.yaml" <<EOF
proxies:
  - name: "node"
    server: $SERVER_IP
    port: $PORT
EOF

  echo "Clash saved: $SUB_DIR/clash.yaml"
}

# =========================
# singbox
# =========================
generate_singbox() {

cat > "$SUB_DIR/sing-box.json" <<EOF
{
  "outbounds": [{
    "type": "$PROTOCOL",
    "server": "$SERVER_IP",
    "server_port": $PORT
  }]
}
EOF

  echo "sing-box saved: $SUB_DIR/sing-box.json"
}

# =========================
# ops
# =========================
uninstall_xray() { eval "$REMOVE_CMD"; }
status() { systemctl status xray --no-pager -l; }
restart() { systemctl restart xray; }
view_config() { cat "$CONFIG_FILE"; }

edit_config() {
  vim "$CONFIG_FILE"
  systemctl restart xray
}

check_xray_installed() {
  command -v xray >/dev/null 2>&1
}

# =========================
# menu
# =========================
check_root

while true; do
  echo ""
  echo "1. 安装"
  echo "2. 重装"
  echo "3. 卸载"
  echo "4. 状态"
  echo "5. 重启"
  echo "6. 查看节点"
  echo "7. 查看配置"
  echo "8. 修改配置"
  echo "9. 生成 Clash"
  echo "10. 生成 sing-box"
  echo "0. 退出"

  read -p "选择: " c

  case "$c" in
    1) install_xray ;;
    2) uninstall_xray; install_xray ;;
    3) uninstall_xray ;;
    4) status ;;
    5) restart ;;
    6) show_node ;;
    7) view_config ;;
    8) edit_config ;;
    9) generate_clash ;;
    10) generate_singbox ;;
    0) exit 0 ;;
  esac
done