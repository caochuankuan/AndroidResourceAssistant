#!/bin/bash

WG_DIR="/etc/wireguard"
WG_IF="wg0"

# =========================
# 检查是否安装 WireGuard
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
        echo "❌ 未找到 wg0.conf，请先安装或重装"
        return 1
    fi
    return 0
}

# =========================
# 安装
# =========================
install_wg() {
    bash install-wg.sh
}

# =========================
# 重装
# =========================
reinstall_wg() {
    bash install-wg.sh
}

# =========================
# 卸载
# =========================
uninstall_wg() {
    systemctl stop wg-quick@wg0 || true
    apt purge wireguard wireguard-tools -y
    rm -rf /etc/wireguard
    echo "✔ 已卸载"
}

# =========================
# 查看配置
# =========================
show_config() {
    check_installed || return
    check_config || return

    echo "===== wg0.conf ====="
    cat $WG_DIR/$WG_IF.conf
}

# =========================
# 编辑配置
# =========================
edit_config() {
    check_installed || return
    check_config || return

    vim $WG_DIR/$WG_IF.conf
}

# =========================
# 二维码
# =========================
qr_code() {
    check_installed || return

    CLIENT_CONF="$WG_DIR/client.conf"

    if [ ! -f "$CLIENT_CONF" ]; then
        echo "❌ 未找到 client.conf，请先生成用户"
        return
    fi

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
    echo "6. 二维码"
    echo "7. 退出"
    echo "=========================="
    read -p "请选择: " choice

    case $choice in
        1) install_wg ;;
        2) reinstall_wg ;;
        3) uninstall_wg ;;
        4) show_config ;;
        5) edit_config ;;
        6) qr_code ;;
        7) exit 0 ;;
        *) echo "无效选项" ;;
    esac
done