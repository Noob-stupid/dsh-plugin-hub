#!/usr/bin/env bash
# 一键部署：把插件控制台安装进当前 DSH 的 web profile 并启用（Linux/macOS）
set -euo pipefail

PROFILE="${1:-web}"
DSH_HOME="${DSH_HOME:-$HOME/.dsh}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROFILE_DIR="$DSH_HOME/profiles/$PROFILE"
# 共享库安装：profile 私有 node_modules 会被 npm/pnpm 整树重建，
# 手工拷贝的包会被修剪掉。
TARGET="$DSH_HOME/profiles/node_modules/@deepseek-ai/dsh-plugin-console"
PATCH="$PROFILE_DIR/cordis.patch.yml"

if [ ! -f "$PROFILE_DIR/cordis.yml" ]; then
  echo "未找到 profile：$PROFILE_DIR —— 请先至少运行过一次 dsh $PROFILE" >&2
  exit 1
fi

mkdir -p "$(dirname "$TARGET")"
cp -R "$ROOT/lib" "$ROOT/package.json" "$ROOT/cordis.patch.yml" "$ROOT/README.md" "$TARGET/"

if [ ! -f "$PATCH" ]; then
  echo '[]' > "$PATCH"
fi
if ! grep -q '^    - id: plugin-console$' "$PATCH"; then
  printf '\n- insert:\n    - id: plugin-console\n      name: '"'"'@deepseek-ai/dsh-plugin-console'"'"'\n' >> "$PATCH"
  echo "OK 已写入启用条目：$PATCH"
else
  echo "OK 启用条目已存在：$PATCH"
fi

echo "OK 已安装：$TARGET"
echo
echo '下一步：'
echo "  1. 重启 dsh $PROFILE 服务进程"
echo '  2. 刷新浏览器页面，打开 设置 -> 插件 -> 插件管理'
