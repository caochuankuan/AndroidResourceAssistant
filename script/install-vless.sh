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
PRIVATE_KEY=""
PUBLIC_KEY=""
UUID=""
SHORT_ID=""
TROJAN_PASS=""
SS_PASS=""
SERVER_IP=""
SNI=""

# 多协议支持：数组
PROTOCOLS=()
PORTS=()

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
# port（为指定协议选端口）
# =========================
select_port_for() {
  local proto_name="$1"
  local port=""
  echo ""
  echo "[$proto_name] 选择端口"
  echo "1. 443"
  echo "2. 8443"
  echo "3. 2053"
  echo "4. 自定义"
  read -p "选择: " c

  case "$c" in
    1) port=443 ;;
    2) port=8443 ;;
    3) port=2053 ;;
    4) read -p "端口: " port ;;
    *) port=443 ;;
  esac
  echo "$port"
}

# =========================
# SNI
# =========================
select_sni() {
  echo ""
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
# protocol（支持多选）
# =========================
select_protocols() {
  PROTOCOLS=()
  PORTS=()

  echo ""
  echo "选择协议（可多选，用空格分隔）"
  echo "1. VLESS + Reality"
  echo "2. Trojan + Reality"
  echo "3. Shadowsocks"
  echo ""
  echo "例: 输入 1 2 3 表示全部安装"
  echo "    输入 1 3 表示安装 VLESS 和 SS"
  read -p "选择: " -a choices

  # 默认选 vless
  if [ ${#choices[@]} -eq 0 ]; then
    choices=(1)
  fi

  for ch in "${choices[@]}"; do
    case "$ch" in
      1) PROTOCOLS+=("vless") ;;
      2) PROTOCOLS+=("trojan") ;;
      3) PROTOCOLS+=("ss") ;;
    esac
  done

  # 去重
  PROTOCOLS=($(echo "${PROTOCOLS[@]}" | tr ' ' '\n' | sort -u | tr '\n' ' '))

  if [ ${#PROTOCOLS[@]} -eq 0 ]; then
    PROTOCOLS=("vless")
  fi

  # 如果只选了一个协议，只问一次端口
  if [ ${#PROTOCOLS[@]} -eq 1 ]; then
    local p
    p=$(select_port_for "${PROTOCOLS[0]}")
    PORTS+=("$p")
  else
    # 多协议，每个分配端口
    echo ""
    echo "多协议需要不同端口"
    for proto in "${PROTOCOLS[@]}"; do
      local p
      p=$(select_port_for "$proto")
      PORTS+=("$p")
    done
  fi
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
  TROJAN_PASS=$(openssl rand -hex 12)
  SS_PASS=$(openssl rand -hex 12)
}

# =========================
# 生成单个 inbound json
# =========================
make_inbound() {
  local proto="$1"
  local port="$2"

  if [ "$proto" = "vless" ]; then
    cat <<EOF
    {
      "listen": "0.0.0.0",
      "port": $port,
      "protocol": "vless",
      "tag": "vless-in",
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
    }
EOF

  elif [ "$proto" = "trojan" ]; then
    cat <<EOF
    {
      "listen": "0.0.0.0",
      "port": $port,
      "protocol": "trojan",
      "tag": "trojan-in",
      "settings": {
        "clients": [{
          "password": "$TROJAN_PASS"
        }]
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
EOF

  elif [ "$proto" = "ss" ]; then
    cat <<EOF
    {
      "listen": "0.0.0.0",
      "port": $port,
      "protocol": "shadowsocks",
      "tag": "ss-in",
      "settings": {
        "method": "chacha20-ietf-poly1305",
        "password": "$SS_PASS"
      }
    }
EOF
  fi
}

# =========================
# write config
# =========================
write_config() {
  cp "$CONFIG_FILE" "$BACKUP_DIR/config.$(date +%s).bak" 2>/dev/null || true

  # 拼接所有 inbound
  local inbounds=""
  local i=0
  for proto in "${PROTOCOLS[@]}"; do
    if [ $i -gt 0 ]; then
      inbounds+=","
    fi
    inbounds+=$(make_inbound "$proto" "${PORTS[$i]}")
    i=$((i + 1))
  done

  cat > "$CONFIG_FILE" <<EOF
{
  "log": { "loglevel": "warning" },
  "inbounds": [
$inbounds
  ],
  "outbounds": [{ "protocol": "freedom" }]
}
EOF
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
# 打开防火墙
# =========================
open_ports() {
  for port in "${PORTS[@]}"; do
    if command -v ufw >/dev/null 2>&1; then
      ufw allow "$port/tcp" || true
    fi
    if command -v iptables >/dev/null 2>&1; then
      iptables -I INPUT -p tcp --dport "$port" -j ACCEPT || true
    fi
  done
}

# =========================
# 输出节点信息
# =========================
print_nodes() {
  local i=0
  for proto in "${PROTOCOLS[@]}"; do
    local port="${PORTS[$i]}"
    echo ""
    echo "---------- $proto (端口 $port) ----------"

    if [ "$proto" = "vless" ]; then
      LINK="vless://$UUID@$SERVER_IP:$port?encryption=none&flow=xtls-rprx-vision&security=reality&sni=$SNI&fp=chrome&pbk=$PUBLIC_KEY&sid=$SHORT_ID&type=tcp#VLESS"
      echo "$LINK"
      qrencode -t ANSIUTF8 "$LINK"

    elif [ "$proto" = "trojan" ]; then
      LINK="trojan://$TROJAN_PASS@$SERVER_IP:$port?security=reality&sni=$SNI&fp=chrome&pbk=$PUBLIC_KEY&sid=$SHORT_ID&type=tcp#Trojan"
      echo "$LINK"
      qrencode -t ANSIUTF8 "$LINK"

    elif [ "$proto" = "ss" ]; then
      SS_USERINFO=$(echo -n "chacha20-ietf-poly1305:$SS_PASS" | base64 -w 0)
      LINK="ss://${SS_USERINFO}@$SERVER_IP:$port#SS"
      echo "$LINK"
      qrencode -t ANSIUTF8 "$LINK"
    fi

    i=$((i + 1))
  done
}

# =========================
# install
# =========================
install_xray() {
  select_sni
  select_protocols

  apt-get update -y
  apt-get install -y curl openssl qrencode

  eval "$INSTALL_CMD" || true

  gen_keys
  write_config

  if ! test_config; then
    echo "❌ config 错误"
    cat "$CONFIG_FILE"
    exit 1
  fi

  systemctl enable xray
  systemctl restart xray

  open_ports
  get_ip

  echo ""
  echo "=========================================="
  echo "           ✅ 安装成功"
  echo "=========================================="
  echo "IP: $SERVER_IP"
  echo "SNI: $SNI"

  print_nodes
}

# =========================
# show node（从 config 读取）
# =========================
show_node() {
  if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ 配置文件不存在"
    return
  fi

  get_ip
  echo ""
  echo "========== 当前节点 =========="
  echo "IP: $SERVER_IP"

  # 解析所有 inbound
  local count
  count=$(grep -c '"protocol"' "$CONFIG_FILE" || true)

  # vless
  if grep -q '"protocol": "vless"' "$CONFIG_FILE" 2>/dev/null || grep -q '"protocol":"vless"' "$CONFIG_FILE" 2>/dev/null; then
    local port uuid short_id sni pbk
    # 用 python/perl 太重，简单 grep
    port=$(grep -A2 '"protocol".*vless' "$CONFIG_FILE" | grep -oP '"port":\s*\K\d+' || grep -oP '"port":\s*\K\d+' "$CONFIG_FILE" | head -1)
    uuid=$(grep -oP '"id":\s*"\K[^"]+' "$CONFIG_FILE" | head -1)
    short_id=$(grep -oP '"shortIds":\s*\["\K[^"]+' "$CONFIG_FILE" | head -1)
    sni=$(grep -oP '"serverNames":\s*\["\K[^"]+' "$CONFIG_FILE" | head -1)

    echo ""
    echo "---------- VLESS (端口 $port) ----------"
    # 注意：public key 不在 config 里，需要从备份或重新生成
    echo "⚠️  PublicKey 需要在安装时记录，show_node 无法还原"
    echo "UUID: $uuid"
  fi

  # trojan
  if grep -q '"protocol": "trojan"' "$CONFIG_FILE" 2>/dev/null || grep -q '"protocol":"trojan"' "$CONFIG_FILE" 2>/dev/null; then
    local pass
    pass=$(grep -oP '"password":\s*"\K[^"]+' "$CONFIG_FILE" | head -1)
    sni=$(grep -oP '"serverNames":\s*\["\K[^"]+' "$CONFIG_FILE" | head -1)

    echo ""
    echo "---------- Trojan ----------"
    echo "Password: $pass"
  fi

  # ss
  if grep -q '"protocol": "shadowsocks"' "$CONFIG_FILE" 2>/dev/null || grep -q '"protocol":"shadowsocks"' "$CONFIG_FILE" 2>/dev/null; then
    local pass method
    pass=$(grep -oP '"password":\s*"\K[^"]+' "$CONFIG_FILE" | tail -1)
    method=$(grep -oP '"method":\s*"\K[^"]+' "$CONFIG_FILE" | head -1)

    echo ""
    echo "---------- Shadowsocks ----------"
    echo "Method: $method"
    echo "Password: $pass"
  fi

  echo ""
  echo "💡 完整链接和二维码请在安装时保存，或查看 $SUB_DIR"
}

# =========================
# 保存节点信息到文件
# =========================
save_nodes() {
  local file="$SUB_DIR/nodes.txt"
  {
    echo "# 生成时间: $(date)"
    echo "# IP: $SERVER_IP"
    echo "# SNI: $SNI"
    echo ""
    local i=0
    for proto in "${PROTOCOLS[@]}"; do
      local port="${PORTS[$i]}"
      if [ "$proto" = "vless" ]; then
        echo "vless://$UUID@$SERVER_IP:$port?encryption=none&flow=xtls-rprx-vision&security=reality&sni=$SNI&fp=chrome&pbk=$PUBLIC_KEY&sid=$SHORT_ID&type=tcp#VLESS"
      elif [ "$proto" = "trojan" ]; then
        echo "trojan://$TROJAN_PASS@$SERVER_IP:$port?security=reality&sni=$SNI&fp=chrome&pbk=$PUBLIC_KEY&sid=$SHORT_ID&type=tcp#Trojan"
      elif [ "$proto" = "ss" ]; then
        SS_USERINFO=$(echo -n "chacha20-ietf-poly1305:$SS_PASS" | base64 -w 0)
        echo "ss://${SS_USERINFO}@$SERVER_IP:$port#SS"
      fi
      i=$((i + 1))
    done
  } > "$file"
  echo "节点信息已保存: $file"
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
  echo "=========================================="
  echo "     Xray Multi-Protocol CLI"
  echo "=========================================="
  echo "1. 安装"
  echo "2. 重装"
  echo "3. 卸载"
  echo "4. 状态"
  echo "5. 重启"
  echo "6. 查看节点"
  echo "7. 查看配置"
  echo "8. 修改配置"
  echo "0. 退出"
  echo ""

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
    0) exit 0 ;;
  esac
done
