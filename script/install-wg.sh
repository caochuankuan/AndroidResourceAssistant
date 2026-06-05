#!/bin/bash

WG_DIR="/etc/wireguard"
WG_IF="wg0"
WG_PORT="51820"
WG_NET="10.10.0.0/24"
WG_SERVER_IP="10.10.0.1"
WG_CLIENT_IP="10.10.0.2"

# =========================
# 安装
# =========================
install_wg() {
    echo "[安装 WireGuard]"

    apt update -y
    apt install wireguard qrencode iptables curl -y

    sysctl -w net.ipv4.ip_forward=1 >/dev/null
    grep -q "net.ipv4.ip_forward=1" /etc/sysctl.conf || echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf

    mkdir -p $WG_DIR
    cd $WG_DIR

    umask 077
    wg genkey | tee server_private.key | wg pubkey > server_public.key

    SERVER_PRIVATE=$(cat server_private.key)

    IFACE=$(ip route | grep default | awk '{print $5}' | head -n1)

    cat > $WG_DIR/$WG_IF.conf <<EOF
[Interface]
Address = $WG_SERVER_IP/24
ListenPort = $WG_PORT
PrivateKey = $SERVER_PRIVATE
PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -t nat -A POSTROUTING -o $IFACE -j MASQUERADE
PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -t nat -D POSTROUTING -o $IFACE -j MASQUERADE
EOF

    systemctl enable wg-quick@wg0
    systemctl restart wg-quick@wg0

    echo "安装完成"
}

# =========================
# 重装
# =========================
reinstall_wg() {
    echo "[重装]"
    systemctl stop wg-quick@wg0 || true
    apt purge wireguard wireguard-tools -y
    rm -rf /etc/wireguard
    install_wg
}

# =========================
# 卸载
# =========================
uninstall_wg() {
    echo "[卸载]"
    systemctl stop wg-quick@wg0 || true
    systemctl disable wg-quick@wg0 || true
    apt purge wireguard wireguard-tools -y
    rm -rf /etc/wireguard
    echo "卸载完成"
}

# =========================
# 查看配置
# =========================
show_config() {
    echo "[配置]"
    cat $WG_DIR/$WG_IF.conf
}

# =========================
# 编辑配置
# =========================
edit_config() {
    vim $WG_DIR/$WG_IF.conf
}

# =========================
# 自动生成客户端 + QR
# =========================
generate_qr() {
    echo "[生成客户端 + QR]"

    SERVER_PUB=$(cat $WG_DIR/server_public.key)
    SERVER_IP=$(curl -s ifconfig.me)

    CLIENT_PRIV=$(wg genkey)
    CLIENT_PUB=$(echo "$CLIENT_PRIV" | wg pubkey)

    CLIENT_CONF="$WG_DIR/client.conf"

    cat > $CLIENT_CONF <<EOF
[Interface]
PrivateKey = $CLIENT_PRIV
Address = $WG_CLIENT_IP/32
DNS = 1.1.1.1

[Peer]
PublicKey = $SERVER_PUB
Endpoint = $SERVER_IP:$WG_PORT
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25
EOF

    echo "[加入 peer 到服务器]"
    wg set wg0 peer "$CLIENT_PUB" allowed-ips $WG_CLIENT_IP/32

    echo ""
    echo "===== client.conf ====="
    cat $CLIENT_CONF

    echo ""
    echo "===== QR CODE ====="
    qrencode -t ansiutf8 < $CLIENT_CONF
}

# =========================
# 菜单
# =========================
while true; do
    echo ""
    echo "=========================="
    echo " WireGuard 管理菜单"
    echo "=========================="
    echo "1. 安装"
    echo "2. 重装"
    echo "3. 卸载"
    echo "4. 查看配置"
    echo "5. 编辑配置"
    echo "6. 生成用户 + 二维码"
    echo "7. 退出"
    echo "=========================="
    read -p "请选择: " choice

    case $choice in
        1) install_wg ;;
        2) reinstall_wg ;;
        3) uninstall_wg ;;
        4) show_config ;;
        5) edit_config ;;
        6) generate_qr ;;
        7) exit 0 ;;
        *) echo "无效选项" ;;
    esac
done