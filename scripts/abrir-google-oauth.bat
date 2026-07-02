@echo off
echo ============================================
echo  RESERVAYA - Configuracion Google OAuth
echo ============================================
echo.
echo Abriendo Google Cloud y Supabase en tu Chrome...
echo.

start "" "https://console.cloud.google.com/apis/credentials/oauthclient"
timeout /t 2 /nobreak >nul
start "" "https://supabase.com/dashboard/project/ofsvjygoyhmkrorkvzsa/auth/providers?provider=Google"

echo.
echo === GOOGLE CLOUD (pestaña 1) ===
echo 1. Si pide proyecto: crea "RESERVAYA"
echo 2. Tipo: Aplicacion web
echo 3. Redirect URI (copia exacto):
echo    https://ofsvjygoyhmkrorkvzsa.supabase.co/auth/v1/callback
echo 4. Crear - copia Client ID y Secret
echo.
echo === SUPABASE (pestaña 2) ===
echo 1. Google - Enable
echo 2. Pega Client ID y Secret
echo 3. Save
echo.
echo Cuando termines escribe "listo" en Cursor.
echo.
pause
