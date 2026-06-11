#!/usr/bin/env bash

set -e

# 基础目录
HYSTERIA_DIR="/etc/hysteria"

header() {
    clear
    echo "================================================"
    echo "                 Hysteria2 Manager"
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

# 获取实例名称
get_instance_name() {
    echo
    read -rp "请输入实例名称(英文，如 node1、hk、us): " INSTANCE_NAME

    if [ -z "$INSTANCE_NAME" ]; then
        echo "实例名称不能为空"
        return 1
    fi

    # 只允许英文、数字、横线
    if [[ ! "$INSTANCE_NAME" =~ ^[a-zA-Z0-9_-]+$ ]]; then
        echo "实例名称只能包含英文字母、数字、横线、下划线"
        return 1
    fi

    return 0
}

# 获取端口
get_port() {
    echo
    read -rp "请输入监听端口(默认 443): " PORT
    [ -z "$PORT" ] && PORT=443

    # 检查端口是否被其他实例占用
    local conflict=""
    for cfg in "$HYSTERIA_DIR"/config-*.yaml; do
        [ -f "$cfg" ] || continue
        # 跳过自身
        echo "$cfg" | grep -q "config-${INSTANCE_NAME}.yaml" && continue
        if grep -q "listen: :${PORT}" "$cfg" 2>/dev/null; then
            local other_name
            other_name=$(basename "$cfg" | sed 's/config-//;s/.yaml//')
            echo "端口 $PORT 已被实例 [$other_name] 占用"
            conflict="yes"
            break
        fi
    done

    if [ "$conflict" = "yes" ]; then
        return 1
    fi

    return 0
}

# 选择 TLS 模式
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
                y|Y|yes|YES) ;;
                *) exit 1 ;;
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

# 生成自签证书（每个实例独立证书）
gen_selfsigned_cert() {
    local cert_file="$HYSTERIA_DIR/server-${INSTANCE_NAME}.crt"
    local key_file="$HYSTERIA_DIR/server-${INSTANCE_NAME}.key"

    openssl ecparam -genkey -name prime256v1 -out "$key_file"
    openssl req -new -x509 -days 3650 -key "$key_file" -out "$cert_file" \
        -subj "/CN=bing.com"

    chmod 644 "$cert_file"
    chmod 644 "$key_file"

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
    local PORT="$3"
    local NAME="$4"

cat <<EOF

================================================
Clash Meta YAML
================================================

mixed-port: 7890
allow-lan: true
mode: rule
log-level: info

proxies:
  - name: HY2-${NAME}
    type: hysteria2
    server: $DOMAIN
    port: $PORT
    password: $PASSWORD
    sni: $DOMAIN

proxy-groups:
  - name: Proxy
    type: select
    proxies:
      - HY2-${NAME}
      - DIRECT

rules:
  - MATCH,Proxy

EOF
}

show_clash_ip() {
    local IP="$1"
    local PASSWORD="$2"
    local PORT="$3"
    local NAME="$4"

cat <<EOF

================================================
Clash Meta YAML
================================================

mixed-port: 7890
allow-lan: true
mode: rule
log-level: info

proxies:
  - name: HY2-${NAME}
    type: hysteria2
    server: $IP
    port: $PORT
    password: $PASSWORD
    skip-cert-verify: true

proxy-groups:
  - name: Proxy
    type: select
    proxies:
      - HY2-${NAME}
      - DIRECT

rules:
  - MATCH,Proxy

EOF
}

show_node_info() {
    local HOST="$1"
    local PASSWORD="$2"
    local MODE="$3"
    local PORT="$4"
    local NAME="$5"

    echo
    echo "================================================"
    echo "节点信息 [$NAME]"
    echo "================================================"

    echo "协议 : Hysteria2"
    echo "地址 : $HOST"
    echo "端口 : $PORT"
    echo "密码 : $PASSWORD"

    if [ "$MODE" = "ip" ]; then
        URI="hysteria2://$PASSWORD@$HOST:$PORT?insecure=1#HY2-${NAME}"
        echo "验证 : 跳过证书验证 (insecure)"
        echo
        echo "分享链接:"
        echo "$URI"
        show_qr "$URI"
        show_clash_ip "$HOST" "$PASSWORD" "$PORT" "$NAME"
    else
        URI="hysteria2://$PASSWORD@$HOST:$PORT?sni=$HOST#HY2-${NAME}"
        echo
        echo "分享链接:"
        echo "$URI"
        show_qr "$URI"
        show_clash_domain "$HOST" "$PASSWORD" "$PORT" "$NAME"
    fi
}

# 写入域名模式配置
write_config_domain() {
    local config_file="$HYSTERIA_DIR/config-${INSTANCE_NAME}.yaml"

cat >"$config_file" <<EOF
listen: :${PORT}

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

# 写入 IP 模式配置
write_config_ip() {
    local config_file="$HYSTERIA_DIR/config-${INSTANCE_NAME}.yaml"
    local cert_file="$HYSTERIA_DIR/server-${INSTANCE_NAME}.crt"
    local key_file="$HYSTERIA_DIR/server-${INSTANCE_NAME}.key"

cat >"$config_file" <<EOF
listen: :${PORT}

tls:
  cert: $cert_file
  key: $key_file

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

# 创建 systemd 服务文件
create_service() {
    local service_file="/etc/systemd/system/hysteria-server@${INSTANCE_NAME}.service"
    local config_file="$HYSTERIA_DIR/config-${INSTANCE_NAME}.yaml"

cat >"$service_file" <<EOF
[Unit]
Description=Hysteria2 Server (instance: ${INSTANCE_NAME})
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/hysteria server -c ${config_file}
Restart=on-failure
RestartSec=10
LimitNOFILE=infinity

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
}

# 安装 hysteria 二进制文件（只需一次）
install_binary() {
    if [ ! -f /usr/local/bin/hysteria ]; then
        install_deps
        bash <(curl -fsSL https://get.hy2.sh/)
    fi
}

# 列出所有实例
list_instances() {
    local configs
    configs=$(ls "$HYSTERIA_DIR"/config-*.yaml 2>/dev/null || true)

    if [ -z "$configs" ]; then
        echo
        echo "暂无实例"
        return
    fi

    echo
    echo "================================================"
    echo "所有实例"
    echo "================================================"
    echo
    printf "%-12s %-8s %-25s %-10s\n" "名称" "端口" "地址" "状态"
    echo "------------------------------------------------------------"

    for cfg in $configs; do
        local name port host mode status

        name=$(basename "$cfg" | sed 's/config-//;s/.yaml//')
        port=$(grep "^listen:" "$cfg" | sed 's/listen: ://;s/listen://') 

        if grep -q "^acme:" "$cfg"; then
            host=$(grep -A1 "domains:" "$cfg" | tail -1 | sed 's/- //g' | xargs)
        else
            host=$(curl -4 -s https://api.ipify.org || echo "unknown")
        fi

        if systemctl is-active --quiet "hysteria-server@${name}" 2>/dev/null; then
            status="✅ 运行中"
        else
            status="❌ 已停止"
        fi

        printf "%-12s %-8s %-25s %-10s\n" "$name" "$port" "$host" "$status"
    done
    echo
}

# 选择一个实例
select_instance() {
    local configs
    configs=$(ls "$HYSTERIA_DIR"/config-*.yaml 2>/dev/null || true)

    if [ -z "$configs" ]; then
        echo
        echo "暂无实例"
        return 1
    fi

    echo
    echo "可用实例:"
    local i=1
    local names=()
    for cfg in $configs; do
        local name
        name=$(basename "$cfg" | sed 's/config-//;s/.yaml//')
        names+=("$name")
        echo "  $i. $name"
        ((i++))
    done
    echo

    read -rp "请选择实例编号: " CHOICE

    if [[ ! "$CHOICE" =~ ^[0-9]+$ ]] || [ "$CHOICE" -lt 1 ] || [ "$CHOICE" -gt "${#names[@]}" ]; then
        echo "无效选择"
        return 1
    fi

    INSTANCE_NAME="${names[$((CHOICE-1))]}"
    return 0
}

# 添加新实例
add_instance() {
    # 确保 hysteria 已安装
    install_binary

    get_instance_name || { pause; return; }

    # 检查实例是否已存在
    if [ -f "$HYSTERIA_DIR/config-${INSTANCE_NAME}.yaml" ]; then
        echo
        echo "实例 [$INSTANCE_NAME] 已存在"
        pause
        return
    fi

    choose_tls_mode

    if [ "$TLS_MODE" = "domain" ]; then
        get_domain
    else
        get_server_ip
    fi

    get_port || { pause; return; }
    get_password

    mkdir -p "$HYSTERIA_DIR"

    if [ "$TLS_MODE" = "domain" ]; then
        write_config_domain "$DOMAIN" "$PASSWORD"
    else
        gen_selfsigned_cert
        write_config_ip "$PASSWORD"
    fi

    # 创建 systemd 服务
    create_service

    # 放行端口
    if command -v ufw >/dev/null 2>&1; then
        ufw allow "${PORT}/tcp" || true
        ufw allow "${PORT}/udp" || true
    fi

    systemctl enable "hysteria-server@${INSTANCE_NAME}"
    systemctl restart "hysteria-server@${INSTANCE_NAME}"

    sleep 5

    if ! systemctl is-active --quiet "hysteria-server@${INSTANCE_NAME}"; then
        echo
        echo "实例 [$INSTANCE_NAME] 启动失败"
        journalctl -u "hysteria-server@${INSTANCE_NAME}" -n 30 --no-pager
        pause
        return
    fi

    echo
    echo "实例 [$INSTANCE_NAME] 启动成功!"

    if [ "$TLS_MODE" = "domain" ]; then
        show_node_info "$DOMAIN" "$PASSWORD" "domain" "$PORT" "$INSTANCE_NAME"
    else
        show_node_info "$SERVER_IP" "$PASSWORD" "ip" "$PORT" "$INSTANCE_NAME"
    fi

    pause
}

# 删除实例
remove_instance() {
    select_instance || { pause; return; }

    echo
    read -rp "确认删除实例 [$INSTANCE_NAME]？(y/N): " CONFIRM
    case "$CONFIRM" in
        y|Y|yes|YES) ;;
        *) return ;;
    esac

    local config_file="$HYSTERIA_DIR/config-${INSTANCE_NAME}.yaml"
    local port
    port=$(grep "^listen:" "$config_file" | sed 's/listen: ://')

    systemctl stop "hysteria-server@${INSTANCE_NAME}" 2>/dev/null || true
    systemctl disable "hysteria-server@${INSTANCE_NAME}" 2>/dev/null || true
    rm -f "/etc/systemd/system/hysteria-server@${INSTANCE_NAME}.service"
    rm -f "$HYSTERIA_DIR/config-${INSTANCE_NAME}.yaml"
    rm -f "$HYSTERIA_DIR/server-${INSTANCE_NAME}.crt"
    rm -f "$HYSTERIA_DIR/server-${INSTANCE_NAME}.key"
    systemctl daemon-reload

    # 移除端口
    if command -v ufw >/dev/null 2>&1 && [ -n "$port" ]; then
        ufw delete allow "${port}/tcp" 2>/dev/null || true
        ufw delete allow "${port}/udp" 2>/dev/null || true
    fi

    echo
    echo "实例 [$INSTANCE_NAME] 已删除"

    # 如果没有实例了，提示是否卸载 hysteria
    local remaining
    remaining=$(ls "$HYSTERIA_DIR"/config-*.yaml 2>/dev/null || true)
    if [ -z "$remaining" ]; then
        echo
        read -rp "所有实例已删除，是否卸载 Hysteria2？(y/N): " UNINSTALL
        case "$UNINSTALL" in
            y|Y|yes|YES)
                bash <(curl -fsSL https://get.hy2.sh/) --remove || true
                rm -rf "$HYSTERIA_DIR"
                rm -rf /var/lib/hysteria
                userdel -r hysteria 2>/dev/null || true
                systemctl daemon-reload
                echo "Hysteria2 已完全卸载"
                ;;
        esac
    fi

    pause
}

# 修改实例配置
modify_instance() {
    select_instance || { pause; return; }

    local config_file="$HYSTERIA_DIR/config-${INSTANCE_NAME}.yaml"

    if [ ! -f "$config_file" ]; then
        echo "配置文件不存在"
        pause
        return
    fi

    # 读取当前配置
    local current_port current_mode current_host current_password

    current_port=$(grep "^listen:" "$config_file" | sed 's/listen: ://')

    if grep -q "^acme:" "$config_file"; then
        current_mode="domain"
        current_host=$(grep -A1 "domains:" "$config_file" | tail -1 | sed 's/- //g' | xargs)
    else
        current_mode="ip"
        current_host=$(curl -4 -s https://api.ipify.org || true)
    fi

    current_password=$(grep "^  password:" "$config_file" | awk '{print $2}')

    echo
    echo "实例 [$INSTANCE_NAME] 当前配置:"
    echo "  模式 : $([ "$current_mode" = "domain" ] && echo "域名" || echo "IP")"
    echo "  地址 : $current_host"
    echo "  端口 : $current_port"
    echo "  密码 : $current_password"
    echo

    read -rp "新端口(回车保持 $current_port): " NEW_PORT
    [ -z "$NEW_PORT" ] && NEW_PORT="$current_port"

    read -rp "新密码(回车保持不变): " NEW_PASSWORD
    [ -z "$NEW_PASSWORD" ] && NEW_PASSWORD="$current_password"

    PORT="$NEW_PORT"

    if [ "$current_mode" = "domain" ]; then
        read -rp "新域名(回车保持 $current_host): " NEW_DOMAIN
        [ -z "$NEW_DOMAIN" ] && NEW_DOMAIN="$current_host"

        if [ "$NEW_DOMAIN" != "$current_host" ]; then
            rm -rf /var/lib/hysteria
        fi

        DOMAIN="$NEW_DOMAIN"
        write_config_domain "$NEW_DOMAIN" "$NEW_PASSWORD"
    else
        write_config_ip "$NEW_PASSWORD"
    fi

    # 更新 systemd 服务（端口变化可能需要更新防火墙）
    if [ "$NEW_PORT" != "$current_port" ]; then
        if command -v ufw >/dev/null 2>&1; then
            ufw delete allow "${current_port}/tcp" 2>/dev/null || true
            ufw delete allow "${current_port}/udp" 2>/dev/null || true
            ufw allow "${NEW_PORT}/tcp" || true
            ufw allow "${NEW_PORT}/udp" || true
        fi
    fi

    systemctl restart "hysteria-server@${INSTANCE_NAME}"

    sleep 3

    if ! systemctl is-active --quiet "hysteria-server@${INSTANCE_NAME}"; then
        echo
        echo "重启失败"
        journalctl -u "hysteria-server@${INSTANCE_NAME}" -n 20 --no-pager
        pause
        return
    fi

    echo
    echo "配置已更新，实例已重启"

    if [ "$current_mode" = "domain" ]; then
        show_node_info "$NEW_DOMAIN" "$NEW_PASSWORD" "domain" "$NEW_PORT" "$INSTANCE_NAME"
    else
        show_node_info "$current_host" "$NEW_PASSWORD" "ip" "$NEW_PORT" "$INSTANCE_NAME"
    fi

    pause
}

# 查看实例详情
show_instance() {
    select_instance || { pause; return; }

    local config_file="$HYSTERIA_DIR/config-${INSTANCE_NAME}.yaml"

    if [ ! -f "$config_file" ]; then
        echo "配置文件不存在"
        pause
        return
    fi

    local port mode host password

    port=$(grep "^listen:" "$config_file" | sed 's/listen: ://')

    if grep -q "^acme:" "$config_file"; then
        mode="domain"
        host=$(grep -A1 "domains:" "$config_file" | tail -1 | sed 's/- //g' | xargs)
    else
        mode="ip"
        host=$(curl -4 -s https://api.ipify.org || true)
    fi

    password=$(grep "^  password:" "$config_file" | awk '{print $2}')

    echo
    systemctl status "hysteria-server@${INSTANCE_NAME}" --no-pager || true

    show_node_info "$host" "$password" "$mode" "$port" "$INSTANCE_NAME"

    pause
}

# 查看所有实例（详细版）
show_all_instances() {
    local configs
    configs=$(ls "$HYSTERIA_DIR"/config-*.yaml 2>/dev/null || true)

    if [ -z "$configs" ]; then
        echo
        echo "暂无实例"
        pause
        return
    fi

    local server_ip
    server_ip=$(curl -4 -s https://api.ipify.org || echo "unknown")

    local idx=0
    for cfg in $configs; do
        local name port host mode password status uri

        name=$(basename "$cfg" | sed 's/config-//;s/.yaml//')
        port=$(grep "^listen:" "$cfg" | sed 's/listen: ://')
        password=$(grep "^  password:" "$cfg" | awk '{print $2}')

        if grep -q "^acme:" "$cfg"; then
            mode="域名"
            host=$(grep -A1 "domains:" "$cfg" | tail -1 | sed 's/- //g' | xargs)
            uri="hysteria2://$password@$host:$port?sni=$host#HY2-${name}"
        else
            mode="IP"
            host="$server_ip"
            uri="hysteria2://$password@$host:$port?insecure=1#HY2-${name}"
        fi

        if systemctl is-active --quiet "hysteria-server@${name}" 2>/dev/null; then
            status="✅ 运行中"
        else
            status="❌ 已停止"
        fi

        ((idx++))
        echo
        echo "================================================"
        echo " [$idx] 实例: $name    $status"
        echo "================================================"
        echo "  模式 : $mode"
        echo "  地址 : $host"
        echo "  端口 : $port"
        echo "  密码 : $password"
        echo "  链接 : $uri"
    done

    echo
    echo "================================================"
    echo " 共 $idx 个实例"
    echo "================================================"

    pause
}

# 启动/停止实例
toggle_instance() {
    select_instance || { pause; return; }

    if systemctl is-active --quiet "hysteria-server@${INSTANCE_NAME}"; then
        echo
        read -rp "实例 [$INSTANCE_NAME] 正在运行，是否停止？(y/N): " CONFIRM
        case "$CONFIRM" in
            y|Y|yes|YES)
                systemctl stop "hysteria-server@${INSTANCE_NAME}"
                echo "已停止"
                ;;
        esac
    else
        echo
        echo "正在启动实例 [$INSTANCE_NAME]..."
        systemctl start "hysteria-server@${INSTANCE_NAME}"
        sleep 3
        if systemctl is-active --quiet "hysteria-server@${INSTANCE_NAME}"; then
            echo "启动成功"
        else
            echo "启动失败"
            journalctl -u "hysteria-server@${INSTANCE_NAME}" -n 20 --no-pager
        fi
    fi

    pause
}

# 卸载所有
uninstall_all() {
    local configs
    configs=$(ls "$HYSTERIA_DIR"/config-*.yaml 2>/dev/null || true)

    if [ -z "$configs" ] && [ ! -f /usr/local/bin/hysteria ]; then
        echo
        echo "Hysteria2 尚未安装"
        pause
        return
    fi

    echo
    read -rp "确认卸载 Hysteria2 及所有实例？(y/N): " CONFIRM
    case "$CONFIRM" in
        y|Y|yes|YES) ;;
        *) return ;;
    esac

    # 停止并删除所有实例服务
    for cfg in $configs; do
        local name
        name=$(basename "$cfg" | sed 's/config-//;s/.yaml//')
        systemctl stop "hysteria-server@${name}" 2>/dev/null || true
        systemctl disable "hysteria-server@${name}" 2>/dev/null || true
        rm -f "/etc/systemd/system/hysteria-server@${name}.service"
    done

    bash <(curl -fsSL https://get.hy2.sh/) --remove || true

    rm -rf "$HYSTERIA_DIR"
    rm -rf /var/lib/hysteria
    userdel -r hysteria 2>/dev/null || true

    systemctl daemon-reload

    echo
    echo "卸载完成，所有实例已清除"

    pause
}

show_menu() {
    header

    list_instances

    echo "1. 添加实例"
    echo "2. 删除实例"
    echo "3. 修改实例"
    echo "4. 查看实例详情"
    echo "5. 启动/停止实例"
    echo "6. 查看所有实例"
    echo "7. 卸载 Hysteria2"
    echo "0. 退出"
    echo

    read -rp "请选择 [0-7]: " MENU
}

main() {
    check_root

    mkdir -p "$HYSTERIA_DIR"

    while true; do
        show_menu

        case "$MENU" in
            1) add_instance ;;
            2) remove_instance ;;
            3) modify_instance ;;
            4) show_instance ;;
            5) toggle_instance ;;
            6) show_all_instances ;;
            7) uninstall_all ;;
            0) exit 0 ;;
            *) ;;
        esac || true
    done
}

main
