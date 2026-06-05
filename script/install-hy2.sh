#!/usr/bin/env bash

set -e

CONFIG_FILE="/etc/hysteria/config.yaml"

header() {
    clear
    echo "================================================"
    echo "          Yujian Hysteria2 Manager"
    echo "================================================"
    echo
}

pause() {
    echo
    read -rp "按回车继续..."
}

check_root() {
    if [ "$(id -u)" != "0" ]; then
        echo "错误：请使用 root 用户运行"
        exit 1
    fi
}

install_deps() {

    export DEBIAN_FRONTEND=noninteractive

    apt update -y

    apt install -y \
        curl \
        openssl \
        qrencode \
        ufw \
        ca-certificates
}

get_domain() {

    echo
    echo "请确保域名已经解析到当前服务器IP"
    echo

    read -rp "请输入域名: " DOMAIN

    if [ -z "$DOMAIN" ]; then
        echo "域名不能为空"
        exit 1
    fi

    SERVER_IP=$(curl -4 -s https://api.ipify.org || true)
    DOMAIN_IP=$(getent ahostsv4 "$DOMAIN" | awk '{print $1}' | head -1)

    if [ -n "$SERVER_IP" ] && [ -n "$DOMAIN_IP" ]; then

        if [ "$SERVER_IP" != "$DOMAIN_IP" ]; then

            echo
            echo "警告：域名未解析到当前服务器"
            echo
            echo "服务器IP : $SERVER_IP"
            echo "域名解析 : $DOMAIN_IP"
            echo

            read -rp "继续安装？(y/N): " CONTINUE

            case "$CONTINUE" in
                y|Y|yes|YES)
                    ;;
                *)
                    exit 1
                    ;;
            esac
        fi
    fi
}

get_password() {

    read -rp "请输入密码(留空自动生成): " PASSWORD

    if [ -z "$PASSWORD" ]; then

        PASSWORD=$(openssl rand -hex 16)

        echo
        echo "自动生成密码:"
        echo "$PASSWORD"
    fi
}

show_qr() {

    local URI="$1"

    echo
    echo "================================================"
    echo "二维码"
    echo "================================================"
    echo

    qrencode -t ANSIUTF8 "$URI"
}

show_clash() {

    local DOMAIN="$1"
    local PASSWORD="$2"

cat <<EOF

================================================
Clash Meta YAML
================================================

mixed-port: 7890
allow-lan: true
mode: rule
log-level: info

proxies:
  - name: HY2
    type: hysteria2
    server: $DOMAIN
    port: 443
    password: $PASSWORD
    sni: $DOMAIN

proxy-groups:
  - name: Proxy
    type: select
    proxies:
      - HY2
      - DIRECT

rules:
  - MATCH,Proxy

EOF
}

show_node_info() {

    local DOMAIN="$1"
    local PASSWORD="$2"

    URI="hysteria2://$PASSWORD@$DOMAIN:443?sni=$DOMAIN#HY2"

    echo
    echo "================================================"
    echo "节点信息"
    echo "================================================"

    echo "协议 : Hysteria2"
    echo "域名 : $DOMAIN"
    echo "端口 : 443"
    echo "密码 : $PASSWORD"

    echo
    echo "分享链接:"
    echo "$URI"

    show_qr "$URI"

    show_clash "$DOMAIN" "$PASSWORD"
}

write_config() {

cat >"$CONFIG_FILE" <<EOF
listen: :443

acme:
  domains:
    - $1
  email: admin@$1

auth:
  type: password
  password: $2

ignoreClientBandwidth: true

masquerade:
  type: proxy
  proxy:
    url: https://www.cloudflare.com
    rewriteHost: true
EOF
}

install_hysteria() {

    if systemctl list-unit-files 2>/dev/null | grep -q "^hysteria-server"; then

        echo
        echo "检测到 Hysteria2 已安装"
        pause
        return
    fi

    get_domain
    get_password

    install_deps

    bash <(curl -fsSL https://get.hy2.sh/)

    if command -v ufw >/dev/null 2>&1; then
        ufw allow 443/tcp || true
        ufw allow 443/udp || true
    fi

    mkdir -p /etc/hysteria

    write_config "$DOMAIN" "$PASSWORD"

    systemctl daemon-reload
    systemctl enable hysteria-server
    systemctl restart hysteria-server

    sleep 8

    if ! systemctl is-active --quiet hysteria-server; then

        echo
        echo "启动失败"

        journalctl -u hysteria-server -n 50 --no-pager

        pause
        return
    fi

    show_node_info "$DOMAIN" "$PASSWORD"

    pause
}

reinstall_hysteria() {

    read -rp "确认重装？(y/N): " CONFIRM

    case "$CONFIRM" in
        y|Y|yes|YES)
            ;;
        *)
            return
            ;;
    esac

    systemctl stop hysteria-server || true

    rm -rf /etc/hysteria
    rm -rf /var/lib/hysteria

    mkdir -p /etc/hysteria

    get_domain
    get_password

    write_config "$DOMAIN" "$PASSWORD"

    bash <(curl -fsSL https://get.hy2.sh/)

    systemctl daemon-reload
    systemctl restart hysteria-server

    sleep 8

    show_node_info "$DOMAIN" "$PASSWORD"

    pause
}

modify_config() {

    [ ! -f "$CONFIG_FILE" ] && return

    CURRENT_DOMAIN=$(grep -A1 "domains:" "$CONFIG_FILE" | tail -1 | sed 's/- //g' | xargs)
    CURRENT_PASSWORD=$(grep "^  password:" "$CONFIG_FILE" | awk '{print $2}')

    echo
    echo "当前域名 : $CURRENT_DOMAIN"
    echo "当前密码 : $CURRENT_PASSWORD"

    read -rp "新域名(回车保持不变): " NEW_DOMAIN
    read -rp "新密码(回车保持不变): " NEW_PASSWORD

    [ -z "$NEW_DOMAIN" ] && NEW_DOMAIN="$CURRENT_DOMAIN"
    [ -z "$NEW_PASSWORD" ] && NEW_PASSWORD="$CURRENT_PASSWORD"

    if [ "$NEW_DOMAIN" != "$CURRENT_DOMAIN" ]; then
        rm -rf /var/lib/hysteria
    fi

    write_config "$NEW_DOMAIN" "$NEW_PASSWORD"

    systemctl restart hysteria-server

    show_node_info "$NEW_DOMAIN" "$NEW_PASSWORD"

    pause
}

show_config() {

    [ ! -f "$CONFIG_FILE" ] && return

    DOMAIN=$(grep -A1 "domains:" "$CONFIG_FILE" | tail -1 | sed 's/- //g' | xargs)
    PASSWORD=$(grep "^  password:" "$CONFIG_FILE" | awk '{print $2}')

    systemctl status hysteria-server --no-pager || true

    show_node_info "$DOMAIN" "$PASSWORD"

    pause
}

uninstall_hysteria() {

    read -rp "确认卸载？(y/N): " CONFIRM

    case "$CONFIRM" in
        y|Y|yes|YES)
            ;;
        *)
            return
            ;;
    esac

    systemctl stop hysteria-server || true
    systemctl disable hysteria-server || true

    rm -rf /etc/hysteria
    rm -rf /var/lib/hysteria

    rm -f /usr/local/bin/hysteria
    rm -f /etc/systemd/system/hysteria-server.service

    systemctl daemon-reload

    echo
    echo "卸载完成"

    pause
}

show_menu() {

    header

    echo "1. 安装 Hysteria2"
    echo "2. 重装 Hysteria2"
    echo "3. 修改配置"
    echo "4. 查看配置"
    echo "5. 卸载 Hysteria2"
    echo "0. 退出"
    echo

    read -rp "请选择 [0-5]: " MENU
}

main() {

    check_root

    while true
    do

        show_menu

        case "$MENU" in
            1) install_hysteria ;;
            2) reinstall_hysteria ;;
            3) modify_config ;;
            4) show_config ;;
            5) uninstall_hysteria ;;
            0) exit 0 ;;
        esac

    done
}

main