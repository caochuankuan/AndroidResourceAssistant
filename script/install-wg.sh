#!/bin/bash

WG_DIR="/etc/wireguard"
WG_IF="wg0"
CLIENT_CONF="$WG_DIR/client.conf"

# =========================
# root check
# =========================
if [ "$EUID" -ne 0 ]; then
  echo "❌ 请使用 root 运行"
  exit 1
fi

# =========================
# 获取公网 IP
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
# 获取默认网卡
# =========================
get_interface() {
  NET_IF=$(ip route show default | awk '/default/ {print $5}' | head -1)
  if [ -z "$NET_IF" ]; then
    NET_IF="eth0"
  fi
}

# =========================
# 检查是否安装
# =========================
check_installed() {
  if ! command -v wg >/dev/null 2>&1; then
    echo "❌ WireGuard 未安装，请先选择【1 安装】"
    return 1
  fi
  return 0
}

# =========================
# 检查配置
# =========================
check_config() {
  if [ ! -f "$WG_DIR/$WG_IF.conf" ]; then
    echo "❌ 未找到 wg0.conf，请先安装"
    return 1
  fi
  return 0
}

# =========================
# 安装（先收集输入再装包）
# =========================
install_wg() {
  get_ip
  get_interface

  echo ""
  echo "=========================================="
  echo "        WireGuard 配置"
  echo "=========================================="
  echo "服务器 IP: $SERVER_IP"
  echo "网卡: $NET_IF"
  echo ""

  # 先收集所有输入
  read -p "WireGuard 端口 [默认 51820]: " WG_PORT
  WG_PORT=${WG_PORT:-51820}

  read -p "内网网段 [默认 10.0.0.0/24]: " WG_SUBNET
  WG_SUBNET=${WG_SUBNET:-10.0.0.0/24}

  SUBNET_PREFIX=$(echo "$WG_SUBNET" | cut -d'.' -f1-3)

  echo ""
  echo "端口: $WG_PORT | 子网: $WG_SUBNET"
  echo "正在安装..."

  export DEBIAN_FRONTEND=noninteractive
  export NEEDRESTART_MODE=a

  apt-get update -y
  apt-get install -y wireguard wireguard-tools qrencode

  # 开启转发
  echo "net.ipv4.ip_forward = 1" > /etc/sysctl.d/99-wg.conf
  sysctl -p /etc/sysctl.d/99-wg.conf

  # 生成服务端密钥
  SERVER_PRIV=$(wg genkey)
  SERVER_PUB=$(echo "$SERVER_PRIV" | wg pubkey)

  # 生成客户端密钥
  CLIENT_PRIV=$(wg genkey)
  CLIENT_PUB=$(echo "$CLIENT_PRIV" | wg pubkey)

  # 生成 PresharedKey
  PSK=$(wg genpsk)

  mkdir -p "$WG_DIR"

  # 写服务端配置
  cat > "$WG_DIR/$WG_IF.conf" <<EOF
[Interface]
Address = ${SUBNET_PREFIX}.1/24
ListenPort = $WG_PORT
PrivateKey = $SERVER_PRIV
PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -t nat -A POSTROUTING -o $NET_IF -j MASQUERADE
PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -t nat -D POSTROUTING -o $NET_IF -j MASQUERADE

[Peer]
PublicKey = $CLIENT_PUB
PresharedKey = $PSK
AllowedIPs = ${SUBNET_PREFIX}.2/32
EOF

  # 写客户端配置
  cat > "$CLIENT_CONF" <<EOF
[Interface]
PrivateKey = $CLIENT_PRIV
Address = ${SUBNET_PREFIX}.2/32
DNS = 8.8.8.8, 1.1.1.1

[Peer]
PublicKey = $SERVER_PUB
PresharedKey = $PSK
Endpoint = $SERVER_IP:$WG_PORT
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25
EOF

  chmod 600 "$WG_DIR/$WG_IF.conf" "$CLIENT_CONF"

  # 启动服务
  systemctl enable wg-quick@$WG_IF
  systemctl restart wg-quick@$WG_IF

  # 防火墙
  if command -v ufw >/dev/null 2>&1; then
    ufw allow "$WG_PORT/udp" || true
  fi
  if command -v iptables >/dev/null 2>&1; then
    iptables -I INPUT -p udp --dport "$WG_PORT" -j ACCEPT || true
  fi

  echo ""
  echo "=========================================="
  echo "          ✅ WireGuard 安装成功"
  echo "=========================================="
  echo "服务端 IP: $SERVER_IP"
  echo "端口: $WG_PORT (UDP)"
  echo "子网: $WG_SUBNET"
  echo "网卡: $NET_IF"
  echo ""
  echo "---------- 客户端配置 ----------"
  cat "$CLIENT_CONF"
  echo ""
  echo "---------- 二维码 ----------"
  qrencode -t ansiutf8 < "$CLIENT_CONF"
  echo ""
  echo "💾 客户端配置已保存: $CLIENT_CONF"
}

# =========================
# 卸载
# =========================
uninstall_wg() {
  systemctl stop wg-quick@$WG_IF 2>/dev/null || true
  systemctl disable wg-quick@$WG_IF 2>/dev/null || true
  export DEBIAN_FRONTEND=noninteractive
  apt-get purge -y wireguard wireguard-tools
  rm -rf /etc/wireguard
  rm -f /etc/sysctl.d/99-wg.conf
  sysctl -p 2>/dev/null || true
  echo "✅ 已卸载 WireGuard"
}

# =========================
# 查看配置
# =========================
show_config() {
  check_installed || return
  check_config || return

  echo ""
  echo "===== 服务端 wg0.conf ====="
  cat "$WG_DIR/$WG_IF.conf"

  if [ -f "$CLIENT_CONF" ]; then
    echo ""
    echo "===== 客户端 client.conf ====="
    cat "$CLIENT_CONF"
  fi
}

# =========================
# 编辑配置
# =========================
edit_config() {
  check_installed || return
  check_config || return

  systemctl stop wg-quick@$WG_IF 2>/dev/null || true
  vim "$WG_DIR/$WG_IF.conf"
  systemctl start wg-quick@$WG_IF
  echo "✅ 已重启 WireGuard"
}

# =========================
# 二维码
# =========================
qr_code() {
  if [ ! -f "$CLIENT_CONF" ]; then
    echo "❌ 未找到 client.conf，请先安装"
    return
  fi

  echo ""
  echo "===== 客户端二维码 ====="
  qrencode -t ansiutf8 < "$CLIENT_CONF"
}

# =========================
# 添加客户端
# =========================
add_client() {
  check_installed || return
  check_config || return

  get_ip

  # 读取现有配置
  WG_PORT=$(grep "ListenPort" "$WG_DIR/$WG_IF.conf" | awk '{print $3}')
  SERVER_PUB=$(grep "PrivateKey" "$WG_DIR/$WG_IF.conf" | head -1 | awk '{print $3}' | wg pubkey)
  SUBNET_PREFIX=$(grep "Address" "$WG_DIR/$WG_IF.conf" | grep -oP '\d+\.\d+\.\d+')

  # 找下一个可用 IP
  LAST_IP=$(grep "AllowedIPs" "$WG_DIR/$WG_IF.conf" | tail -1 | grep -oP '\d+\.\d+\.\d+\.\d+')
  LAST_NUM=$(echo "$LAST_IP" | cut -d'.' -f4)
  NEXT_NUM=$((LAST_NUM + 1))

  read -p "客户端名称 [默认 client$NEXT_NUM]: " CLIENT_NAME
  CLIENT_NAME=${CLIENT_NAME:-"client$NEXT_NUM"}

  # 生成密钥
  CLIENT_PRIV=$(wg genkey)
  CLIENT_PUB=$(echo "$CLIENT_PRIV" | wg pubkey)
  PSK=$(wg genpsk)

  # 追加到服务端配置
  cat >> "$WG_DIR/$WG_IF.conf" <<EOF

[Peer]
# $CLIENT_NAME
PublicKey = $CLIENT_PUB
PresharedKey = $PSK
AllowedIPs = ${SUBNET_PREFIX}.${NEXT_NUM}/32
EOF

  # 生成客户端配置
  local client_file="$WG_DIR/${CLIENT_NAME}.conf"
  cat > "$client_file" <<EOF
[Interface]
PrivateKey = $CLIENT_PRIV
Address = ${SUBNET_PREFIX}.${NEXT_NUM}/32
DNS = 8.8.8.8, 1.1.1.1

[Peer]
PublicKey = $SERVER_PUB
PresharedKey = $PSK
Endpoint = $SERVER_IP:$WG_PORT
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25
EOF

  chmod 600 "$client_file"

  # 重启 WireGuard
  systemctl restart wg-quick@$WG_IF

  echo ""
  echo "✅ 已添加客户端: $CLIENT_NAME"
  echo "IP: ${SUBNET_PREFIX}.${NEXT_NUM}/32"
  echo "配置文件: $client_file"
  echo ""
  echo "---------- 二维码 ----------"
  qrencode -t ansiutf8 < "$client_file"
}

# =========================
# 生成 Clash 配置
# =========================
gen_clash() {
  check_installed || return
  check_config || return

  get_ip

  # 读取现有配置
  WG_PORT=$(grep "ListenPort" "$WG_DIR/$WG_IF.conf" | awk '{print $3}')
  SERVER_PUB=$(grep "PrivateKey" "$WG_DIR/$WG_IF.conf" | head -1 | awk '{print $3}' | wg pubkey)
  SUBNET_PREFIX=$(grep "Address" "$WG_DIR/$WG_IF.conf" | grep -oP '\d+\.\d+\.\d+')

  # 列出所有客户端配置文件
  echo ""
  echo "可用的客户端配置："
  local idx=0
  local conf_files=()
  for f in "$WG_DIR"/*.conf; do
    [ "$f" = "$WG_DIR/$WG_IF.conf" ] && continue
    idx=$((idx + 1))
    conf_files+=("$f")
    local fname=$(basename "$f" .conf)
    local cip=$(grep "Address" "$f" | awk '{print $3}')
    echo "  $idx. $fname ($cip)"
  done

  if [ $idx -eq 0 ]; then
    echo "❌ 没有找到客户端配置文件"
    return
  fi

  read -p "选择客户端 [1-$idx，默认 1]: " sel
  sel=${sel:-1}

  local selected_conf="${conf_files[$((sel - 1))]}"
  if [ ! -f "$selected_conf" ]; then
    echo "❌ 无效选择"
    return
  fi

  # 从客户端配置中提取信息
  local CLIENT_PRIV=$(grep "PrivateKey" "$selected_conf" | awk '{print $3}')
  local CLIENT_IP=$(grep "Address" "$selected_conf" | awk '{print $3}' | cut -d'/' -f1)
  local CLIENT_PSK=$(grep "PresharedKey" "$selected_conf" | awk '{print $3}')
  local CLIENT_NAME=$(basename "$selected_conf" .conf)

  local CLASH_FILE="$WG_DIR/${CLIENT_NAME}-clash.yaml"

  cat > "$CLASH_FILE" <<EOF
# Clash Meta (mihomo) for Android 配置
# 客户端: $CLIENT_NAME ($CLIENT_IP)
mixed-port: 7890
allow-lan: false
mode: rule
log-level: info
unified-delay: true
find-process-mode: strict
geodata-mode: true

dns:
  enable: true
  listen: 0.0.0.0:1053
  enhanced-mode: fake-ip
  fake-ip-range: 198.18.0.1/16
  default-nameserver:
    - 223.5.5.5
    - 119.29.29.29
  nameserver:
    - https://dns.alidns.com/dns-query
    - https://doh.pub/dns-query
  nameserver-policy:
    "geosite:geolocation-!cn":
      - "https://dns.google/dns-query#Proxy"
      - "https://cloudflare-dns.com/dns-query#Proxy"

proxies:
  - name: "WireGuard"
    type: wireguard
    server: $SERVER_IP
    port: $WG_PORT
    ip: $CLIENT_IP
    ipv6: ""
    private-key: $CLIENT_PRIV
    public-key: $SERVER_PUB
    pre-shared-key: $CLIENT_PSK
    dns:
      - 8.8.8.8
      - 1.1.1.1
    mtu: 1280
    udp: true
    persistent-keepalive: 25

proxy-groups:
  - name: "Proxy"
    type: select
    proxies:
      - WireGuard
      - DIRECT

rules:
  - IP-CIDR,127.0.0.0/8,DIRECT
  - IP-CIDR,192.168.0.0/16,DIRECT
  - IP-CIDR,10.0.0.0/8,DIRECT
  - IP-CIDR,172.16.0.0/12,DIRECT
  - GEOIP,CN,DIRECT
  - MATCH,Proxy
EOF

  chmod 600 "$CLASH_FILE"

  echo ""
  echo "=========================================="
  echo "     ✅ Clash Meta 配置已生成"
  echo "=========================================="
  echo "客户端: $CLIENT_NAME"
  echo "IP: $CLIENT_IP"
  echo "文件: $CLASH_FILE"
  echo ""
  echo "---------- 配置内容 ----------"
  cat "$CLASH_FILE"
}

# =========================
# 菜单
# =========================
while true; do
  echo ""
  echo "=========================================="
  echo "        WireGuard 管理菜单"
  echo "=========================================="

  # 运行状态
  if command -v wg >/dev/null 2>&1; then
    if systemctl is-active wg-quick@$WG_IF >/dev/null 2>&1; then
      local_ip=$(grep "Address" "$WG_DIR/$WG_IF.conf" 2>/dev/null | awk '{print $3}')
      listen_port=$(grep "ListenPort" "$WG_DIR/$WG_IF.conf" 2>/dev/null | awk '{print $3}')
      peer_count=$(grep -c "^\[Peer\]" "$WG_DIR/$WG_IF.conf" 2>/dev/null || echo 0)
      echo "  状态: ✅ 运行中"
      echo "  地址: $local_ip | 端口: $listen_port/UDP"
      echo "  客户端: $peer_count 个"
    else
      echo "  状态: ⚠️  已停止"
    fi
  else
    echo "  状态: 未安装"
  fi

  echo "=========================================="
  echo "1. 安装"
  echo "2. 重装"
  echo "3. 卸载"
  echo "4. 添加客户端"
  echo "5. 查看配置"
  echo "6. 编辑配置"
  echo "7. 二维码"
  echo "8. 生成 Clash 配置"
  echo "0. 退出"
  echo ""
  read -p "请选择: " choice

  case $choice in
    1) install_wg ;;
    2) uninstall_wg; install_wg ;;
    3) uninstall_wg ;;
    4) add_client ;;
    5) show_config ;;
    6) edit_config ;;
    7) qr_code ;;
    8) gen_clash ;;
    0) exit 0 ;;
    *) echo "无效选项" ;;
  esac
done
