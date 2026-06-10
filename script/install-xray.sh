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
SELECTED_PORT=""

# 多协议支持
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
# port（结果写入 SELECTED_PORT）
# =========================
select_port_for() {
  local proto_name="$1"
  echo ""
  echo "[$proto_name] 选择端口"
  echo "1. 443"
  echo "2. 8443"
  echo "3. 2053"
  echo "4. 自定义"
  read -p "选择: " c

  case "$c" in
    1) SELECTED_PORT=443 ;;
    2) SELECTED_PORT=8443 ;;
    3) SELECTED_PORT=2053 ;;
    4) read -p "端口: " SELECTED_PORT ;;
    *) SELECTED_PORT=443 ;;
  esac
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
  echo "选择协议（可多选，用空格或连续数字）"
  echo "1. VLESS + Reality"
  echo "2. Trojan + Reality"
  echo "3. Shadowsocks"
  echo ""
  echo "例: 123 或 1 2 3 = 全部安装"
  echo "    13 或 1 3   = VLESS + SS"
  read -p "选择: " input

  # 支持 "123" 或 "1 2 3" 两种输入方式
  # 把输入拆成单个字符/数字
  local chars=""
  chars=$(echo "$input" | sed 's/[^123]//g' | grep -o . | sort -u)

  if [ -z "$chars" ]; then
    chars="1"
  fi

  for ch in $chars; do
    case "$ch" in
      1) PROTOCOLS+=("vless") ;;
      2) PROTOCOLS+=("trojan") ;;
      3) PROTOCOLS+=("ss") ;;
    esac
  done

  # 为每个协议选端口
  if [ ${#PROTOCOLS[@]} -eq 1 ]; then
    select_port_for "${PROTOCOLS[0]}"
    PORTS+=("$SELECTED_PORT")
  else
    echo ""
    echo "⚠️  多协议需要不同端口"
    for proto in "${PROTOCOLS[@]}"; do
      select_port_for "$proto"
      PORTS+=("$SELECTED_PORT")
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
# write config
# =========================
write_config() {
  cp "$CONFIG_FILE" "$BACKUP_DIR/config.$(date +%s).bak" 2>/dev/null || true

  # 构建 inbounds 数组
  local first=true
  local inbounds=""

  local i=0
  for proto in "${PROTOCOLS[@]}"; do
    local port="${PORTS[$i]}"

    if [ "$first" = true ]; then
      first=false
    else
      inbounds+=","
    fi

    if [ "$proto" = "vless" ]; then
      inbounds+=$(cat <<EOF

    {
      "listen": "0.0.0.0",
      "port": $port,
      "protocol": "vless",
      "tag": "vless-in",
      "settings": {
        "clients": [{"id": "$UUID", "flow": "xtls-rprx-vision"}],
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
)

    elif [ "$proto" = "trojan" ]; then
      inbounds+=$(cat <<EOF

    {
      "listen": "0.0.0.0",
      "port": $port,
      "protocol": "trojan",
      "tag": "trojan-in",
      "settings": {
        "clients": [{"password": "$TROJAN_PASS"}]
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
)

    elif [ "$proto" = "ss" ]; then
      inbounds+=$(cat <<EOF

    {
      "listen": "0.0.0.0",
      "port": $port,
      "protocol": "shadowsocks",
      "tag": "ss-in",
      "settings": {
        "method": "chacha20-ietf-poly1305",
        "password": "$SS_PASS",
        "network": "tcp,udp"
      }
    }
EOF
)
    fi

    i=$((i + 1))
  done

  cat > "$CONFIG_FILE" <<EOF
{
  "log": {"loglevel": "warning"},
  "dns": {
    "servers": ["8.8.8.8", "1.1.1.1"]
  },
  "inbounds": [$inbounds
  ],
  "outbounds": [{"protocol": "freedom"}]
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
# 输出节点信息 + 二维码
# =========================
print_nodes() {
  local i=0
  for proto in "${PROTOCOLS[@]}"; do
    local port="${PORTS[$i]}"
    local link=""

    echo ""
    echo "---------- $proto :$port ----------"

    if [ "$proto" = "vless" ]; then
      link="vless://$UUID@$SERVER_IP:$port?encryption=none&flow=xtls-rprx-vision&security=reality&sni=$SNI&fp=chrome&pbk=$PUBLIC_KEY&sid=$SHORT_ID&type=tcp#VLESS"
    elif [ "$proto" = "trojan" ]; then
      link="trojan://$TROJAN_PASS@$SERVER_IP:$port?security=reality&sni=$SNI&fp=chrome&pbk=$PUBLIC_KEY&sid=$SHORT_ID&type=tcp#Trojan"
    elif [ "$proto" = "ss" ]; then
      local ss_info
      ss_info=$(echo -n "chacha20-ietf-poly1305:$SS_PASS" | base64 -w 0)
      link="ss://${ss_info}@$SERVER_IP:$port#SS"
    fi

    echo "$link"
    echo ""
    qrencode -t ANSIUTF8 "$link"

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
    echo "❌ config 错误，内容如下："
    cat "$CONFIG_FILE"
    return
  fi

  systemctl enable xray
  systemctl restart xray

  open_ports
  get_ip

  echo ""
  echo "=========================================="
  echo "             ✅ 安装成功"
  echo "=========================================="
  echo "IP:  $SERVER_IP"
  echo "SNI: $SNI"

  print_nodes

  # 保存到文件
  save_nodes
}

# =========================
# 保存节点信息到文件
# =========================
save_nodes() {
  local file="$SUB_DIR/nodes.txt"
  local i=0
  {
    echo "# $(date)"
    echo "# IP: $SERVER_IP | SNI: $SNI"
    echo ""
    for proto in "${PROTOCOLS[@]}"; do
      local port="${PORTS[$i]}"
      if [ "$proto" = "vless" ]; then
        echo "vless://$UUID@$SERVER_IP:$port?encryption=none&flow=xtls-rprx-vision&security=reality&sni=$SNI&fp=chrome&pbk=$PUBLIC_KEY&sid=$SHORT_ID&type=tcp#VLESS"
      elif [ "$proto" = "trojan" ]; then
        echo "trojan://$TROJAN_PASS@$SERVER_IP:$port?security=reality&sni=$SNI&fp=chrome&pbk=$PUBLIC_KEY&sid=$SHORT_ID&type=tcp#Trojan"
      elif [ "$proto" = "ss" ]; then
        local ss_info
        ss_info=$(echo -n "chacha20-ietf-poly1305:$SS_PASS" | base64 -w 0)
        echo "ss://${ss_info}@$SERVER_IP:$port#SS"
      fi
      i=$((i + 1))
    done
  } > "$file"
  echo ""
  echo "💾 节点已保存: $file"
}

# =========================
# show node
# =========================
show_node() {
  local file="$SUB_DIR/nodes.txt"
  if [ -f "$file" ]; then
    echo ""
    cat "$file"
  else
    echo "❌ 没有保存的节点信息，请重新安装"
  fi
}

# =========================
# ops
# =========================
uninstall_xray() { eval "$REMOVE_CMD"; }
status() { systemctl status xray --no-pager -l; }
restart_xray() { systemctl restart xray; }
view_config() { cat "$CONFIG_FILE"; }

edit_config() {
  vim "$CONFIG_FILE"
  if test_config; then
    systemctl restart xray
    echo "✅ 配置已更新并重启"
  else
    echo "❌ 配置有误，已重启旧配置"
    systemctl restart xray
  fi
}

check_xray_installed() {
  command -v xray >/dev/null 2>&1
}

# =========================
# 显示状态摘要
# =========================
show_status_banner() {
  local xray_status="未安装"
  local active_protos=""

  # 检查 xray 是否安装
  if command -v xray >/dev/null 2>&1; then
    # 检查运行状态
    if systemctl is-active xray >/dev/null 2>&1; then
      xray_status="✅ 运行中"
    else
      xray_status="⚠️  已停止"
    fi

    # 从配置文件读取已启用的协议和端口（只提取 inbounds）
    if [ -f "$CONFIG_FILE" ]; then
      active_protos=$(awk '
        /"inbounds"/ { in_inbounds=1 }
        /"outbounds"/ { in_inbounds=0 }
        in_inbounds && /"port"/ { gsub(/[^0-9]/, "", $0); port=$0 }
        in_inbounds && /"protocol"/ {
          gsub(/.*"protocol"[^"]*"/, "", $0)
          gsub(/".*/, "", $0)
          if (port != "") printf "%s:%s ", $0, port
          port=""
        }
      ' "$CONFIG_FILE" 2>/dev/null)
    fi
  fi

  echo "  状态: $xray_status"
  if [ -n "$active_protos" ]; then
    echo "  协议: $active_protos"
  fi
}

# =========================
# menu
# =========================
check_root

while true; do
  echo ""
  echo "=========================================="
  echo "       Xray Multi-Protocol CLI"
  echo "=========================================="
  show_status_banner
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
    5) restart_xray ;;
    6) show_node ;;
    7) view_config ;;
    8) edit_config ;;
    0) exit 0 ;;
  esac
done
