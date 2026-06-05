#!/usr/bin/env bash

set -e

clear

echo "================================================"
echo "        Hysteria2 One-Click Installer"
echo "================================================"
echo

# Root检查
if [ "$(id -u)" != "0" ]; then
    echo "错误：请使用 root 用户运行"
    exit 1
fi

echo "请确保域名已经解析到当前服务器 IP"
echo

read -rp "请输入域名 (例如: hy2.example.com): " DOMAIN

if [ -z "$DOMAIN" ]; then
    echo
    echo "错误：域名不能为空"
    exit 1
fi

echo
read -rp "请输入密码 (留空自动生成): " PASSWORD

if [ -z "$PASSWORD" ]; then
    PASSWORD=$(openssl rand -hex 16)
    echo
    echo "自动生成密码:"
    echo "$PASSWORD"
fi

echo
echo "================================================"
echo "安装信息"
echo "================================================"
echo "域名 : $DOMAIN"
echo "密码 : $PASSWORD"
echo

read -rp "确认开始安装？(y/N): " CONFIRM

case "$CONFIRM" in
    y|Y|yes|YES)
        ;;
    *)
        echo "已取消安装"
        exit 0
        ;;
esac

echo
echo "================================================"
echo "安装依赖"
echo "================================================"

apt update -y
apt install -y curl openssl qrencode

echo
echo "================================================"
echo "安装 Hysteria2"
echo "================================================"

bash <(curl -fsSL https://get.hy2.sh/)

echo
echo "================================================"
echo "配置防火墙"
echo "================================================"

if command -v ufw >/dev/null 2>&1; then
    ufw allow 443/tcp || true
    ufw allow 443/udp || true
fi

mkdir -p /etc/hysteria

cat >/etc/hysteria/config.yaml <<EOF
listen: :443

acme:
  domains:
    - $DOMAIN
  email: admin@$DOMAIN

auth:
  type: password
  password: $PASSWORD

ignoreClientBandwidth: true

masquerade:
  type: proxy
  proxy:
    url: https://www.cloudflare.com
    rewriteHost: true
EOF

echo
echo "================================================"
echo "启动服务"
echo "================================================"

systemctl daemon-reload
systemctl enable hysteria-server
systemctl restart hysteria-server

sleep 5

echo
echo "================================================"
echo "服务状态"
echo "================================================"

systemctl --no-pager --full status hysteria-server || true

echo
echo "================================================"
echo "监听端口"
echo "================================================"

ss -lunp | grep ":443" || true

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
echo
echo "$URI"

echo
echo "================================================"
echo "二维码"
echo "================================================"
echo

qrencode -t ANSIUTF8 "$URI"

echo
echo "================================================"
echo "完整 Clash Meta YAML"
echo "================================================"
echo

cat <<EOF
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

echo
echo "================================================"
echo "查看日志"
echo "================================================"

echo "journalctl -u hysteria-server -f"

echo
echo "安装完成"