#!/bin/bash
set -euo pipefail

CONFIG_FILE="/usr/local/etc/xray/config.json"
BACKUP_DIR="/usr/local/etc/xray/backup"

INSTALL_CMD='bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ install'
REMOVE_CMD='bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ remove --purge'

mkdir -p "$BACKUP_DIR"

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
  [ -z "$SERVER_IP" ] && SERVER_IP=$(curl -4 -s https://ifconfig.me || true)
  [ -z "$SERVER_IP" ] && SERVER_IP=$(hostname -I | awk '{print $1}')
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
# Reality keys（兼容所有版本）
# =========================
gen_keys() {
  OUT=$(xray x25519 2>&1)

  # 兼容新旧版本格式：
  # 旧版: "Private key: xxx" / "Public key: xxx"
  # 新版: "PrivateKey: xxx" / "Password (PublicKey): xxx"
  PRIVATE_KEY=$(echo "$OUT" | grep -i 'private' | sed 's/.*: //')
  PUBLIC_KEY=$(echo "$OUT" | grep -i 'public\|password' | sed 's/.*: //' | awk '{print $1}')

  UUID=$(xray uuid)
  SHORT_ID=$(openssl rand -hex 8)

  if [[ -z "$PRIVATE_KEY" || -z "$PUBLIC_KEY" ]]; then
    echo "❌ key 生成失败"
    echo "$OUT"
    exit 1
  fi
}

# =========================
# SNI check
# =========================
check_sni() {
  echo "检测 SNI: $SNI"
  timeout 5 bash -c "echo | openssl s_client -connect $SNI:443 -servername $SNI" >/dev/null 2>&1 \
  || echo "⚠️ SNI 不可达，但继续"
}

# =========================
# firewall
# =========================
open_port() {
  command -v ufw >/dev/null 2>&1 && ufw allow $PORT/tcp || true
  command -v iptables >/dev/null 2>&1 && iptables -I INPUT -p tcp --dport $PORT -j ACCEPT || true
}

# =========================
# write config (auto backup)
# =========================
write_config() {
  cp "$CONFIG_FILE" "$BACKUP_DIR/config.$(date +%s).bak" 2>/dev/null || true

  cat > "$CONFIG_FILE" <<EOF
{
  "log": { "loglevel": "warning" },
  "inbounds": [
    {
      "listen": "0.0.0.0",
      "port": $PORT,
      "protocol": "vless",
      "settings": {
        "clients": [
          {
            "id": "$UUID",
            "flow": "xtls-rprx-vision"
          }
        ],
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
    }
  ],
  "outbounds": [{ "protocol": "freedom" }]
}
EOF
}

# =========================
# test config
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
  check_sni

  apt-get update -y
  apt-get install -y curl openssl qrencode

  eval "$INSTALL_CMD"

  gen_keys
  write_config

  if ! test_config; then
    echo "❌ config 错误，回滚"
    latest=$(ls -t $BACKUP_DIR/*.bak 2>/dev/null | head -1)
    [ -n "$latest" ] && cp "$latest" "$CONFIG_FILE"
    systemctl restart xray
    exit 1
  fi

  systemctl enable xray
  systemctl restart xray

  open_port
  get_ip

  VLESS="vless://$UUID@$SERVER_IP:$PORT?encryption=none&flow=xtls-rprx-vision&security=reality&sni=$SNI&fp=chrome&pbk=$PUBLIC_KEY&sid=$SHORT_ID&type=tcp#Reality"

  echo ""
  echo "========== 安装成功 =========="
  echo "IP: $SERVER_IP"
  echo "PORT: $PORT"
  echo "UUID: $UUID"
  echo "SNI: $SNI"
  echo "SHORTID: $SHORT_ID"
  echo ""
  echo "$VLESS"
  echo ""
  qrencode -t ANSIUTF8 "$VLESS"
}

# =========================
# uninstall
# =========================
uninstall_xray() {
  eval "$REMOVE_CMD"
}

# =========================
# status
# =========================
status() {
  systemctl status xray --no-pager -l
}

# =========================
# restart
# =========================
restart() {
  systemctl restart xray
}

# =========================
# view config (✔保留)
# =========================
view_config() {
  echo "===== CONFIG ====="
  cat "$CONFIG_FILE"
}

# =========================
# edit config (✔保留 + 安全)
# =========================
edit_config() {
  cp "$CONFIG_FILE" "$BACKUP_DIR/manual.$(date +%s).bak"

  vim "$CONFIG_FILE"

  if ! test_config; then
    echo "❌ 配置错误，回滚"
    latest=$(ls -t $BACKUP_DIR/*.bak | head -1)
    cp "$latest" "$CONFIG_FILE"
  fi

  systemctl restart xray
}

# =========================
# 检查是否安装
# =========================
check_xray_installed() {
  if ! command -v xray >/dev/null 2>&1; then
    echo "❌ 未检测到 Xray 安装"
    echo "👉 请先选择 1 安装"
    return 1
  fi

  if [ ! -f /usr/local/bin/xray ]; then
    echo "❌ Xray 二进制不存在"
    return 1
  fi

  if ! systemctl list-unit-files | grep -q xray.service; then
    echo "❌ systemd 服务不存在"
    return 1
  fi

  return 0
}

# =========================
# menu
# =========================
check_root

while true; do
  echo ""
  echo "=================================="
  echo "   Xray Reality Production CLI"
  echo "=================================="
  echo "1. 安装"
  echo "2. 重装"
  echo "3. 卸载"
  echo "4. 查看状态"
  echo "5. 重启服务"
  echo "6. 查看配置"
  echo "7. 修改配置"
  echo "0. 退出"
  echo ""

  read -p "请选择: " c

  case "$c" in
    1) install_xray ;;

    2)
      check_xray_installed || { install_xray; continue; }
      uninstall_xray
      install_xray
      ;;

    3)
      check_xray_installed || continue
      uninstall_xray
      ;;

    4)
      check_xray_installed || continue
      status
      ;;

    5)
      check_xray_installed || continue
      restart
      ;;

    6)
      check_xray_installed || continue
      view_config
      ;;

    7)
      check_xray_installed || continue
      edit_config
      ;;

    0) exit 0 ;;
    *) echo "无效选择" ;;
  esac
done