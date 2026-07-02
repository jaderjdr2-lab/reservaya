# Script de deploy Fase 2 — RESERVAYA
# Ejecutar en PowerShell desde la carpeta del proyecto

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

# Refrescar PATH (Git, gh, Vercel)
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "=== RESERVAYA Fase 2 Deploy ===" -ForegroundColor Cyan

# 1. Verificar herramientas
foreach ($tool in @("git", "gh", "vercel", "node", "npm")) {
  if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
    Write-Host "Falta: $tool. Instala con winget o npm." -ForegroundColor Red
    exit 1
  }
}

# 2. GitHub auth
$ghAuth = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "`nInicia sesion en GitHub (se abrira el navegador):" -ForegroundColor Yellow
  gh auth login -h github.com -p https -w
}

# 3. Crear repo y push (si no hay remote)
$remote = git remote get-url origin 2>$null
if (-not $remote) {
  Write-Host "`nCreando repo privado 'reservaya' en GitHub..." -ForegroundColor Cyan
  gh repo create reservaya --private --source=. --remote=origin --push
} else {
  Write-Host "`nRemote existente: $remote" -ForegroundColor Green
  git push -u origin main
}

# 4. Vercel auth
$vercelUser = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "`nInicia sesion en Vercel:" -ForegroundColor Yellow
  vercel login
}

# 5. Deploy (primera vez: enlaza proyecto)
Write-Host "`nDesplegando en Vercel..." -ForegroundColor Cyan
if (-not (Test-Path ".vercel/project.json")) {
  vercel link --yes
}

# 6. Variables de entorno desde .env (sin commitear secretos)
if (Test-Path ".env") {
  Write-Host "`nSubiendo variables de entorno a Vercel..." -ForegroundColor Cyan
  Get-Content ".env" | ForEach-Object {
    if ($_ -match '^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"#]*)"?\s*') {
      $name = $Matches[1]
      $value = $Matches[2].Trim()
      if ($value -and $name -ne "NODE_ENV") {
        Write-Host "  -> $name"
        echo $value | vercel env add $name production --force 2>$null
        echo $value | vercel env add $name preview --force 2>$null
      }
    }
  }
  # Produccion: actualizar URL publica
  $prodUrl = Read-Host "URL de produccion (ej. https://reservaya.co o https://tu-proyecto.vercel.app)"
  if ($prodUrl) {
    echo $prodUrl | vercel env add NEXT_PUBLIC_API_URL production --force
    echo $prodUrl | vercel env add NEXT_PUBLIC_API_URL preview --force
  }
}

vercel --prod

Write-Host "`n=== Deploy completado ===" -ForegroundColor Green
Write-Host "Siguiente: configurar Supabase Auth redirects (ver docs/PHASE2_DEPLOY.md)"
