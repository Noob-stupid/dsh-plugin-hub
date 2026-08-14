# 一键部署：把插件控制台安装进当前 DSH 的 web profile 并启用（Windows PowerShell）
param(
  [string]$Profile = 'web',
  [string]$DshHome = $env:DSH_HOME
)
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($DshHome)) { $DshHome = Join-Path $env:USERPROFILE '.dsh' }
$profileDir = Join-Path $DshHome 'profiles' $Profile
$target = Join-Path $profileDir 'node_modules' '@deepseek-ai' 'dsh-plugin-console'
$patch = Join-Path $profileDir 'cordis.patch.yml'

if (-not (Test-Path (Join-Path $profileDir 'cordis.yml'))) {
  throw "未找到 profile：$profileDir —— 请先至少运行过一次 dsh $Profile（让 profile 初始化）"
}

# 1. 拷贝插件包（lib + package.json + cordis.patch.yml + README）
New-Item -ItemType Directory -Force -Path (Split-Path $target) | Out-Null
Copy-Item -Path (Join-Path $root 'lib') -Destination $target -Recurse -Force
Copy-Item -Path (Join-Path $root 'package.json'), (Join-Path $root 'cordis.patch.yml'), (Join-Path $root 'README.md') -Destination $target -Force

# 2. 幂等追加启用条目（不覆盖用户已有补丁内容）
if (-not (Test-Path $patch)) { Set-Content -Path $patch -Value '[]' -Encoding UTF8 }
$content = Get-Content $patch -Raw -Encoding UTF8
if ($content -notmatch '(?m)^ {4}- id: plugin-console\s*$') {
  if (-not $content.EndsWith("`n")) { $content += "`n" }
  $content += "- insert:`n    - id: plugin-console`n      name: '@deepseek-ai/dsh-plugin-console'`n"
  [System.IO.File]::WriteAllText($patch, $content, (New-Object System.Text.UTF8Encoding($false)))
  $patched = $true
} else { $patched = $false }

Write-Host "OK 已安装：$target"
if ($patched) { Write-Host "OK 已写入启用条目：$patch" } else { Write-Host "OK 启用条目已存在：$patch" }
Write-Host ''
Write-Host '下一步：'
Write-Host '  1. 重启 dsh 服务（命令行 dsh ' + $Profile + ' 的请重启进程；桌面客户端直接退出重开）'
Write-Host '  2. 刷新浏览器页面，打开 设置 -> 插件 -> 插件管理'
