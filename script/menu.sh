#!/bin/bash

# 代理工具管理菜单
# 支持 WireGuard / Hysteria2 / Xray

BASE_URL="https://yujian.love/script"

# root check
if [ "$EUID" -ne 0 ]; then
  echo "❌ 请使用 root 运行"
  exit 1
fi

while true; do
  echo ""
  echo "=========================================="
  echo "         代理工具管理"
  echo "=========================================="
  echo "1. WireGuard (WireGuard)"
  echo "2. Hysteria2 (Hysteria2)"
  echo "3. Xray (VLESS Reality / Trojan Reality / VMess / Shadowsocks)"
  echo "0. 退出"
  echo ""
  read -p "请选择: " choice

  case $choice in
    1) bash <(curl -fsSL "$BASE_URL/install-wg.sh") ;;
    2) bash <(curl -fsSL "$BASE_URL/install-hy2.sh") ;;
    3) bash <(curl -fsSL "$BASE_URL/install-xray.sh") ;;
    0) exit 0 ;;
    *) echo "无效选项" ;;
  esac
done
