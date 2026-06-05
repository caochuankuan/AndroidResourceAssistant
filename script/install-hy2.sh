#!/usr/bin/env bash

set -e

CONFIG_FILE="/etc/hysteria/config.yaml"
CERT_FILE="/etc/hysteria/server.crt"
KEY_FILE="/etc/hysteria/server.key"

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

# 选择 TLS 模式：域名(ACME) 或 IP(自签证书)
choose_tls_mode() {

    echo
    echo "请选择 TLS 模式:"
    echo "1. 域名模式（ACME 自动证书，需要域名）"
    echo "2. IP 模式（自签证书，无需域名）"
    echo

    read -rp "请选择 [1-2]: " TLS_MODE

    case "$TLS_MODE" in
        1) TLS_MODE="domain" ;;
        2) TLS_MODE="ip" ;;
        *) TLS_MODE="domain" ;;
    esac
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

get_server_ip() {

    SERVER_IP=$(curl -4 -s https://api.ipify.org || true)

    if [ -z "$SERVER_IP" ]; then
        echo "无法获取服务器公网 IP"
        exit 1
    fi

    echo
    echo "服务器 IP: $SERVER_IP"
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

# 生成自签证书
gen_selfsigned_cert() {

    openssl ecparam -genkey -name prime256v1 -out "$KEY_FILE"

    openssl req -new -x509 -days 3650 -key "$KEY_FILE" -out "$CERT_FILE" \
        -subj "/CN=bing.com"

    echo
    echo "自签证书已生成"
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

show_clash_domain() {

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

show_clash_ip() {

    local IP="$1"
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
    server: $IP
    port: 443
    password: $PASSWORD
    skip-cert-verify: true

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

    local HOST="$1"
    local PASSWORD="$2"
    local MODE="$3"

    echo
    echo "================================================"
    echo "节点信息"
    echo "================================================"

    echo "协议 : Hysteria2"
    echo "地址 : $HOST"
    echo "端口 : 443"
    echo "密码 : $PASSWORD"

    if [ "$MODE" = "ip" ]; then

        URI="hysteria2://$PASSWORD@$HOST:443?insecure=1#HY2"

        echo "验证 : 跳过证书验证 (insecure)"

        echo
        echo "分享链接:"
        echo "$URI"

        show_qr "$URI"
        show_clash_ip "$HOST" "$PASSWORD"
    else

        URI="hysteria2://$PASSWORD@$HOST:443?sni=$HOST#HY2"

        echo
        echo "分享链接:"
        echo "$URI"

        show_qr "$URI"
        show_clash_domain "$HOST" "$PASSWORD"
    fi
}

write_config_domain() {

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

write_config_ip() {

cat >"$CONFIG_FILE" <<EOF
listen: :443

tls:
  cert: $CERT_FILE
  key: $KEY_FILE

auth:
  type: password
  password: $1

ignoreClientBandwidth: true

masquerade:
  type: proxy
  proxy:
    url: https://www.cloudflare.com
    rewriteHost: true
EOF
}

install_hysteria() {

    if [ -f /usr/local/bin/hysteria ]; then

        echo
        echo "检测到 Hysteria2 已安装"
        pause
        return
    fi

    choose_tls_mode

    if [ "$TLS_MODE" = "domain" ]; then
        get_domain
    else
        get_server_ip
    fi

    get_password

    install_deps

    mkdir -p /etc/hysteria

    if [ "$TLS_MODE" = "domain" ]; then
        write_config_domain "$DOMAIN" "$PASSWORD"
    else
        gen_selfsigned_cert
        write_config_ip "$PASSWORD"
    fi

    bash <(curl -fsSL https://get.hy2.sh/)

    if command -v ufw >/dev/null 2>&1; then
        ufw allow 443/tcp || true
        ufw allow 443/udp || true
    fi

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

    if [ "$TLS_MODE" = "domain" ]; then
        show_node_info "$DOMAIN" "$PASSWORD" "domain"
    else
        show_node_info "$SERVER_IP" "$PASSWORD" "ip"
    fi

    pause
}

reinstall_hysteria() {

    check_installed && return

    read -rp "确认重装？(y/N): " CONFIRM

    case "$CONFIRM" in
        y|Y|yes|YES)
            ;;
        *)
            return
            ;;
    esac

    systemctl stop hysteria-server || true

    bash <(curl -fsSL https://get.hy2.sh/) --remove || true

    rm -rf /etc/hysteria
    rm -rf /var/lib/hysteria
    userdel -r hysteria 2>/dev/null || true

    choose_tls_mode

    if [ "$TLS_MODE" = "domain" ]; then
        get_domain
    else
        get_server_ip
    fi

    get_password

    mkdir -p /etc/hysteria

    if [ "$TLS_MODE" = "domain" ]; then
        write_config_domain "$DOMAIN" "$PASSWORD"
    else
        gen_selfsigned_cert
        write_config_ip "$PASSWORD"
    fi

    bash <(curl -fsSL https://get.hy2.sh/) || true

    if command -v ufw >/dev/null 2>&1; then
        ufw allow 443/tcp || true
        ufw allow 443/udp || true
    fi

    systemctl daemon-reload
    systemctl enable hysteria-server
    systemctl restart hysteria-server

    sleep 8

    if ! systemctl is-active --quiet hysteria-server; then
        echo
        echo "启动失败"
        journalctl -u hysteria-server -n 20 --no-pager
        pause
        return
    fi

    if [ "$TLS_MODE" = "domain" ]; then
        show_node_info "$DOMAIN" "$PASSWORD" "domain"
    else
        show_node_info "$SERVER_IP" "$PASSWORD" "ip"
    fi

    pause
}

modify_config() {

    check_installed && return

    [ ! -f "$CONFIG_FILE" ] && return

    # 检测当前模式
    if grep -q "^acme:" "$CONFIG_FILE"; then
        CURRENT_MODE="domain"
        CURRENT_HOST=$(grep -A1 "domains:" "$CONFIG_FILE" | tail -1 | sed 's/- //g' | xargs)
    else
        CURRENT_MODE="ip"
        CURRENT_HOST=$(curl -4 -s https://api.ipify.org || true)
    fi

    CURRENT_PASSWORD=$(grep "^  password:" "$CONFIG_FILE" | awk '{print $2}')

    echo
    echo "当前模式 : $([ "$CURRENT_MODE" = "domain" ] && echo "域名" || echo "IP")"
    echo "当前地址 : $CURRENT_HOST"
    echo "当前密码 : $CURRENT_PASSWORD"
    echo

    read -rp "新密码(回车保持不变): " NEW_PASSWORD

    [ -z "$NEW_PASSWORD" ] && NEW_PASSWORD="$CURRENT_PASSWORD"

    if [ "$CURRENT_MODE" = "domain" ]; then

        read -rp "新域名(回车保持不变): " NEW_DOMAIN
        [ -z "$NEW_DOMAIN" ] && NEW_DOMAIN="$CURRENT_HOST"

        if [ "$NEW_DOMAIN" != "$CURRENT_HOST" ]; then
            rm -rf /var/lib/hysteria
        fi

        write_config_domain "$NEW_DOMAIN" "$NEW_PASSWORD"
        systemctl restart hysteria-server
        show_node_info "$NEW_DOMAIN" "$NEW_PASSWORD" "domain"
    else
        write_config_ip "$NEW_PASSWORD"
        systemctl restart hysteria-server
        show_node_info "$CURRENT_HOST" "$NEW_PASSWORD" "ip"
    fi

    pause
}

show_config() {

    check_installed && return

    [ ! -f "$CONFIG_FILE" ] && return

    # 检测当前模式
    if grep -q "^acme:" "$CONFIG_FILE"; then
        MODE="domain"
        HOST=$(grep -A1 "domains:" "$CONFIG_FILE" | tail -1 | sed 's/- //g' | xargs)
    else
        MODE="ip"
        HOST=$(curl -4 -s https://api.ipify.org || true)
    fi

    PASSWORD=$(grep "^  password:" "$CONFIG_FILE" | awk '{print $2}')

    systemctl status hysteria-server --no-pager || true

    show_node_info "$HOST" "$PASSWORD" "$MODE"

    pause
}

check_installed() {
    local installed=false
    if [ -f /usr/local/bin/hysteria ]; then
        installed=true
    fi
    if [ "$installed" = "false" ]; then
        echo
        echo "Hysteria2 尚未安装，请先执行安装"
        pause
        return 0
    fi
    return 1
}

uninstall_hysteria() {

    check_installed && return

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

    bash <(curl -fsSL https://get.hy2.sh/) --remove

    rm -rf /etc/hysteria
    rm -rf /var/lib/hysteria
    userdel -r hysteria 2>/dev/null || true

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
            *) ;;
        esac || true

    done
}

main
