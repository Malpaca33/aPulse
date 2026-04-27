#!/usr/bin/env bash
# vibe-note.sh — 记录 vibe coding Q&A 到 Obsidian Vault
# 用法:
#   ./scripts/vibe-note.sh -t "标题" -d "详细内容（支持多行，用 \\n 换行）"
#   echo "多行\n内容" | ./scripts/vibe-note.sh -t "标题"
#
# 自动追加到: Obsidian Vault / aPulse_Logs / YYYY-MM-DD.md

set -euo pipefail

VAULT_DIR="/c/Users/Malpaca/Documents/Obsidian Vault/aPulse_Logs"
TITLE=""
BODY=""

# 解析参数
while [[ $# -gt 0 ]]; do
  case "$1" in
    -t|--title) TITLE="$2"; shift 2 ;;
    -d|--desc)  BODY="$2";  shift 2 ;;
    *) echo "未知参数: $1"; exit 1 ;;
  esac
done

# 如果没有 -d，尝试从 stdin 读取
if [[ -z "$BODY" ]] && [[ ! -t 0 ]]; then
  BODY=$(cat)
fi

if [[ -z "$TITLE" ]]; then
  echo "错误: 必须提供 -t 标题"
  echo "用法: $0 -t \"标题\" -d \"内容\""
  exit 1
fi

# 创建 vault 目录（如果不存在）
mkdir -p "$VAULT_DIR"

# 生成文件名: YYYY-MM-DD.md
DATE_FILE=$(date +%Y-%m-%d)
FILEPATH="$VAULT_DIR/$DATE_FILE.md"

# 时间戳
TIMESTAMP=$(date "+%Y-%m-%d %H:%M")

# 追加条目
{
  echo ""
  echo "---"
  echo "### ⏱ $TIMESTAMP — $TITLE"
  echo ""
  if [[ -n "$BODY" ]]; then
    # 将 \n 转为实际换行
    echo -e "$BODY" | sed 's/^/> /'
  fi
  echo ""
} >> "$FILEPATH"

echo "✓ 已记录 → $FILEPATH"
