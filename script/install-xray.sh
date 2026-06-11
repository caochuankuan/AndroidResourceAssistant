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

  while true; do
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

    # 检测端口是否被占用
    if ss -tlnp 2>/dev/null | grep -q ":${SELECTED_PORT} " || \
       ss -ulnp 2>/dev/null | grep -q ":${SELECTED_PORT} "; then
      local occupy
      occupy=$(ss -tlnp 2>/dev/null | grep ":${SELECTED_PORT} " | awk '{print $NF}' | head -1)
      echo "⚠️  端口 $SELECTED_PORT 已被占用: $occupy"
      echo "请重新选择"
    else
      break
    fi
  done
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
  echo "4. VMess + WebSocket"
  echo ""
  echo "例: 1234 或 1 2 3 4 = 全部安装"
  echo "    13 或 1 3       = VLESS + SS"
  read -p "选择: " input

  # 支持 "1234" 或 "1 2 3 4" 两种输入方式
  # 把输入拆成单个字符/数字
  local chars=""
  chars=$(echo "$input" | sed 's/[^1234]//g' | grep -o . | sort -u)

  if [ -z "$chars" ]; then
    chars="1"
  fi

  for ch in $chars; do
    case "$ch" in
      1) PROTOCOLS+=("vless") ;;
      2) PROTOCOLS+=("trojan") ;;
      3) PROTOCOLS+=("ss") ;;
      4) PROTOCOLS+=("vmess") ;;
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

    elif [ "$proto" = "vmess" ]; then
      inbounds+=$(cat <<EOF

    {
      "listen": "0.0.0.0",
      "port": $port,
      "protocol": "vmess",
      "tag": "vmess-in",
      "settings": {
        "clients": [{"id": "$UUID", "alterId": 0}]
      },
      "streamSettings": {
        "network": "ws",
        "wsSettings": {
          "path": "/vmess"
        }
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
    elif [ "$proto" = "vmess" ]; then
      local vmess_json
      vmess_json=$(cat <<EJSON
{"v":"2","ps":"VMess","add":"$SERVER_IP","port":"$port","id":"$UUID","aid":"0","net":"ws","type":"none","host":"","path":"/vmess","tls":""}
EJSON
)
      link="vmess://$(echo -n "$vmess_json" | base64 -w 0)"
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
      elif [ "$proto" = "vmess" ]; then
        local vmess_json
        vmess_json="{\"v\":\"2\",\"ps\":\"VMess\",\"add\":\"$SERVER_IP\",\"port\":\"$port\",\"id\":\"$UUID\",\"aid\":\"0\",\"net\":\"ws\",\"type\":\"none\",\"host\":\"\",\"path\":\"/vmess\",\"tls\":\"\"}"
        echo "vmess://$(echo -n "$vmess_json" | base64 -w 0)"
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
# 新增协议（追加到现有配置）
# =========================
add_protocol() {
  if ! command -v xray >/dev/null 2>&1; then
    echo "❌ Xray 未安装，请先安装"
    return
  fi

  if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ 配置文件不存在，请先安装"
    return
  fi

  # 显示当前已有协议
  echo ""
  echo "当前已有协议："
  awk '
    /"inbounds"/ { in_inbounds=1 }
    /"outbounds"/ { in_inbounds=0 }
    in_inbounds && /"port"/ { gsub(/[^0-9]/, "", $0); port=$0 }
    in_inbounds && /"protocol"/ {
      gsub(/.*"protocol"[^"]*"/, "", $0)
      gsub(/".*/, "", $0)
      if (port != "") printf "  - %s:%s\n", $0, port
      port=""
    }
  ' "$CONFIG_FILE" 2>/dev/null
  echo ""

  # 从现有配置提取 reality 密钥（适配单行和多行 JSON 格式）
  local existing_pk=""
  local existing_sid=""
  local existing_sni=""
  existing_pk=$(grep '"privateKey"' "$CONFIG_FILE" 2>/dev/null | head -1 | sed 's/.*"privateKey"[^"]*"\([^"]*\)".*/\1/')
  # shortIds 可能在同一行 ["xxx"] 或下一行 "xxx"
  existing_sid=$(grep -A1 '"shortIds"' "$CONFIG_FILE" 2>/dev/null | grep -o '"[0-9a-f]\{16\}"' | head -1 | tr -d '"')
  # serverNames 可能在同一行 ["xxx"] 或下一行 "xxx"
  existing_sni=$(grep -A1 '"serverNames"' "$CONFIG_FILE" 2>/dev/null | grep -o '"[^"]*\.\([^"]*\)"' | head -1 | tr -d '"')

  # 选择要新增的协议
  echo "选择要新增的协议："
  echo "1. VLESS + Reality"
  echo "2. Trojan + Reality"
  echo "3. Shadowsocks"
  echo "4. VMess + WebSocket"
  read -p "选择: " proto_choice

  local new_proto=""
  case "$proto_choice" in
    1) new_proto="vless" ;;
    2) new_proto="trojan" ;;
    3) new_proto="ss" ;;
    4) new_proto="vmess" ;;
    *) echo "❌ 无效选择"; return ;;
  esac

  # 检查是否已存在同协议
  local proto_name="$new_proto"
  [ "$proto_name" = "ss" ] && proto_name="shadowsocks"
  if grep -q "\"protocol\": \"$proto_name\"" "$CONFIG_FILE" 2>/dev/null; then
    echo "⚠️  已存在 $proto_name 协议"
    read -p "继续添加(多端口)? [y/N]: " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
      return
    fi
  fi

  # 选端口
  select_port_for "$new_proto"
  local new_port="$SELECTED_PORT"

  # 生成新凭据
  local new_uuid=""
  local new_trojan_pass=""
  local new_ss_pass=""
  local use_pk="$existing_pk"
  local use_sid="$existing_sid"
  local use_sni="$existing_sni"

  if [ "$new_proto" = "vless" ]; then
    new_uuid=$(xray uuid)
    # 如果没有现有 reality 密钥，生成新的
    if [ -z "$use_pk" ]; then
      gen_keys
      use_pk="$PRIVATE_KEY"
      use_sid="$SHORT_ID"
      select_sni
      use_sni="$SNI"
    fi
  elif [ "$new_proto" = "trojan" ]; then
    new_trojan_pass=$(openssl rand -hex 12)
    if [ -z "$use_pk" ]; then
      gen_keys
      use_pk="$PRIVATE_KEY"
      use_sid="$SHORT_ID"
      select_sni
      use_sni="$SNI"
    fi
  elif [ "$new_proto" = "ss" ]; then
    new_ss_pass=$(openssl rand -hex 12)
  elif [ "$new_proto" = "vmess" ]; then
    new_uuid=$(xray uuid)
  fi

  # 备份配置
  cp "$CONFIG_FILE" "$BACKUP_DIR/config.$(date +%s).bak" 2>/dev/null || true

  # 构建新的 inbound JSON，写到临时文件
  local tmp_inbound="/tmp/xray_new_inbound.json"

  if [ "$new_proto" = "vless" ]; then
    cat > "$tmp_inbound" <<EOF
    {
      "listen": "0.0.0.0",
      "port": $new_port,
      "protocol": "vless",
      "tag": "vless-in-$new_port",
      "settings": {
        "clients": [{"id": "$new_uuid", "flow": "xtls-rprx-vision"}],
        "decryption": "none"
      },
      "streamSettings": {
        "network": "tcp",
        "security": "reality",
        "realitySettings": {
          "show": false,
          "dest": "$use_sni:443",
          "serverNames": ["$use_sni"],
          "privateKey": "$use_pk",
          "shortIds": ["$use_sid"]
        }
      }
    }
EOF
  elif [ "$new_proto" = "trojan" ]; then
    cat > "$tmp_inbound" <<EOF
    {
      "listen": "0.0.0.0",
      "port": $new_port,
      "protocol": "trojan",
      "tag": "trojan-in-$new_port",
      "settings": {
        "clients": [{"password": "$new_trojan_pass"}]
      },
      "streamSettings": {
        "network": "tcp",
        "security": "reality",
        "realitySettings": {
          "show": false,
          "dest": "$use_sni:443",
          "serverNames": ["$use_sni"],
          "privateKey": "$use_pk",
          "shortIds": ["$use_sid"]
        }
      }
    }
EOF
  elif [ "$new_proto" = "ss" ]; then
    cat > "$tmp_inbound" <<EOF
    {
      "listen": "0.0.0.0",
      "port": $new_port,
      "protocol": "shadowsocks",
      "tag": "ss-in-$new_port",
      "settings": {
        "method": "chacha20-ietf-poly1305",
        "password": "$new_ss_pass",
        "network": "tcp,udp"
      }
    }
EOF
  elif [ "$new_proto" = "vmess" ]; then
    cat > "$tmp_inbound" <<EOF
    {
      "listen": "0.0.0.0",
      "port": $new_port,
      "protocol": "vmess",
      "tag": "vmess-in-$new_port",
      "settings": {
        "clients": [{"id": "$new_uuid", "alterId": 0}]
      },
      "streamSettings": {
        "network": "ws",
        "wsSettings": {
          "path": "/vmess"
        }
      }
    }
EOF
  fi

  # 找到 inbounds 的结束位置并插入
  local outbounds_line
  outbounds_line=$(grep -n '"outbounds"' "$CONFIG_FILE" | head -1 | cut -d: -f1)

  if [ -z "$outbounds_line" ]; then
    echo "❌ 找不到 outbounds 位置"
    rm -f "$tmp_inbound"
    return
  fi

  # 从第1行到outbounds行之间，找最后一个只包含 ] 或 ], 的行（inbounds 的结束）
  local inbounds_close
  inbounds_close=$(head -n "$((outbounds_line - 1))" "$CONFIG_FILE" | grep -n '^\s*\]' | tail -1 | cut -d: -f1)

  if [ -z "$inbounds_close" ]; then
    echo "❌ 找不到 inbounds 结束位置"
    rm -f "$tmp_inbound"
    return
  fi

  # inbounds ] 的前一行就是最后一个 inbound 的 }
  local last_inbound_end=$((inbounds_close - 1))

  # 在最后一个 inbound 的 } 那行末尾加逗号
  sed -i "${last_inbound_end}s/$/,/" "$CONFIG_FILE"
  # 在加完逗号的那行后面插入新 inbound 内容
  sed -i "${last_inbound_end}r $tmp_inbound" "$CONFIG_FILE"

  rm -f "$tmp_inbound"

  # 验证配置
  if ! test_config; then
    echo "❌ 配置验证失败，错误信息："
    xray run -test -config "$CONFIG_FILE" 2>&1 || xray -test -config "$CONFIG_FILE" 2>&1 || true
    echo ""
    echo "⬆️  生成的配置内容："
    cat -n "$CONFIG_FILE"
    echo ""
    echo "正在恢复备份..."
    local latest_bak
    latest_bak=$(ls -t "$BACKUP_DIR"/config.*.bak 2>/dev/null | head -1)
    if [ -n "$latest_bak" ]; then
      cp "$latest_bak" "$CONFIG_FILE"
      echo "✅ 已恢复到上一次配置"
    fi
    return
  fi

  # 重启 xray
  systemctl restart xray

  # 打开防火墙
  PORTS=("$new_port")
  open_ports

  # 获取 IP 并显示新节点
  get_ip

  # 获取公钥用于生成链接
  if [ "$new_proto" != "ss" ]; then
    # 从私钥推导公钥
    local pub_key=""
    pub_key=$(xray x25519 -i "$use_pk" 2>&1 | grep -i 'public' | sed 's/.*: //' | tr -d '[:space:]')
    if [ -z "$pub_key" ]; then
      pub_key="<请从之前的节点信息获取>"
    fi
  fi

  echo ""
  echo "=========================================="
  echo "          ✅ 新增协议成功"
  echo "=========================================="

  local link=""
  if [ "$new_proto" = "vless" ]; then
    link="vless://$new_uuid@$SERVER_IP:$new_port?encryption=none&flow=xtls-rprx-vision&security=reality&sni=$use_sni&fp=chrome&pbk=$pub_key&sid=$use_sid&type=tcp#VLESS-$new_port"
    echo "$link"
    echo ""
    qrencode -t ANSIUTF8 "$link" 2>/dev/null || true
  elif [ "$new_proto" = "trojan" ]; then
    link="trojan://$new_trojan_pass@$SERVER_IP:$new_port?security=reality&sni=$use_sni&fp=chrome&pbk=$pub_key&sid=$use_sid&type=tcp#Trojan-$new_port"
    echo "$link"
    echo ""
    qrencode -t ANSIUTF8 "$link" 2>/dev/null || true
  elif [ "$new_proto" = "ss" ]; then
    local ss_info
    ss_info=$(echo -n "chacha20-ietf-poly1305:$new_ss_pass" | base64 -w 0)
    link="ss://${ss_info}@$SERVER_IP:$new_port#SS-$new_port"
    echo "$link"
    echo ""
    qrencode -t ANSIUTF8 "$link" 2>/dev/null || true
  elif [ "$new_proto" = "vmess" ]; then
    local vmess_json
    vmess_json="{\"v\":\"2\",\"ps\":\"VMess-$new_port\",\"add\":\"$SERVER_IP\",\"port\":\"$new_port\",\"id\":\"$new_uuid\",\"aid\":\"0\",\"net\":\"ws\",\"type\":\"none\",\"host\":\"\",\"path\":\"/vmess\",\"tls\":\"\"}"
    link="vmess://$(echo -n "$vmess_json" | base64 -w 0)"
    echo "$link"
    echo ""
    qrencode -t ANSIUTF8 "$link" 2>/dev/null || true
  fi

  # 追加到 nodes.txt
  local file="$SUB_DIR/nodes.txt"
  echo "$link" >> "$file"
  echo ""
  echo "💾 节点已追加到: $file"
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
# 生成 Clash 配置
# =========================
gen_clash() {
  if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ 配置文件不存在，请先安装"
    return
  fi

  get_ip

  # 从配置中提取 reality 公钥
  local priv_key pub_key short_id sni
  priv_key=$(grep '"privateKey"' "$CONFIG_FILE" 2>/dev/null | head -1 | sed 's/.*"privateKey"[^"]*"\([^"]*\)".*/\1/')
  if [ -n "$priv_key" ]; then
    pub_key=$(xray x25519 -i "$priv_key" 2>&1 | grep -i 'public' | sed 's/.*: //' | tr -d '[:space:]')
  fi
  short_id=$(grep -A1 '"shortIds"' "$CONFIG_FILE" 2>/dev/null | grep -o '"[0-9a-f]\{16\}"' | head -1 | tr -d '"')
  sni=$(grep -A1 '"serverNames"' "$CONFIG_FILE" 2>/dev/null | grep -o '"[^"]*\.\([^"]*\)"' | head -1 | tr -d '"')

  # 构建 proxies 和 proxy 名称列表
  local proxies=""
  local proxy_names=""

  # 遍历 inbounds 提取每个协议的信息
  local port proto uuid password
  local in_inbounds=0

  while IFS= read -r line; do
    if echo "$line" | grep -q '"inbounds"'; then
      in_inbounds=1
      continue
    fi
    if echo "$line" | grep -q '"outbounds"'; then
      in_inbounds=0
      continue
    fi

    [ "$in_inbounds" -eq 0 ] && continue

    if echo "$line" | grep -q '"port"'; then
      port=$(echo "$line" | grep -o '[0-9]\+')
    fi

    if echo "$line" | grep -q '"protocol"'; then
      proto=$(echo "$line" | sed 's/.*"protocol"[^"]*"\([^"]*\)".*/\1/')
    fi

    if echo "$line" | grep -q '"id"'; then
      uuid=$(echo "$line" | sed 's/.*"id"[^"]*"\([^"]*\)".*/\1/')
    fi

    if echo "$line" | grep -q '"password"'; then
      password=$(echo "$line" | sed 's/.*"password"[^"]*"\([^"]*\)".*/\1/')
    fi

    if echo "$line" | grep -q '"method"'; then
      # ss 的 method 行之后就可以构建 ss 节点了
      true
    fi

    # 遇到 } 且有 port+proto 就输出一个节点
    if echo "$line" | grep -q '^\s*}' && [ -n "$port" ] && [ -n "$proto" ]; then
      local name=""

      if [ "$proto" = "vless" ] && [ -n "$uuid" ]; then
        name="VLESS-$port"
        proxies+="  - name: $name
    type: vless
    server: $SERVER_IP
    port: $port
    uuid: $uuid
    network: tcp
    tls: true
    udp: true
    flow: xtls-rprx-vision
    servername: $sni
    client-fingerprint: chrome
    reality-opts:
      public-key: $pub_key
      short-id: $short_id

"
        proxy_names+="      - $name
"
        uuid=""

      elif [ "$proto" = "trojan" ] && [ -n "$password" ]; then
        name="Trojan-$port"
        proxies+="  - name: $name
    type: trojan
    server: $SERVER_IP
    port: $port
    password: $password
    udp: true
    sni: $sni
    client-fingerprint: chrome
    reality-opts:
      public-key: $pub_key
      short-id: $short_id

"
        proxy_names+="      - $name
"
        password=""

      elif [ "$proto" = "shadowsocks" ] && [ -n "$password" ]; then
        name="SS-$port"
        proxies+="  - name: $name
    type: ss
    server: $SERVER_IP
    port: $port
    cipher: chacha20-ietf-poly1305
    password: $password
    udp: true

"
        proxy_names+="      - $name
"
        password=""

      elif [ "$proto" = "vmess" ] && [ -n "$uuid" ]; then
        name="VMess-$port"
        proxies+="  - name: $name
    type: vmess
    server: $SERVER_IP
    port: $port
    uuid: $uuid
    alterId: 0
    cipher: auto
    udp: true
    network: ws
    ws-opts:
      path: /vmess

"
        proxy_names+="      - $name
"
        uuid=""
      fi

      port=""
      proto=""
    fi
  done < "$CONFIG_FILE"

  if [ -z "$proxies" ]; then
    echo "❌ 未找到有效的节点配置"
    return
  fi

  local clash_file="$SUB_DIR/clash.yaml"

  cat > "$clash_file" <<EOF
mixed-port: 7890
allow-lan: true
mode: rule
log-level: info

proxies:
${proxies}
proxy-groups:
  - name: PROXY
    type: select
    proxies:
${proxy_names}      - DIRECT

rules:
  - MATCH,PROXY
EOF

  echo ""
  echo "=========================================="
  echo "     ✅ Clash Meta 配置已生成"
  echo "=========================================="
  echo ""
  cat "$clash_file"
  echo ""
  echo "💾 已保存: $clash_file"
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
  echo "9. 新增协议"
  echo "10. 生成 Clash 配置"
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
    9) add_protocol ;;
    10) gen_clash ;;
    0) exit 0 ;;
  esac
done
