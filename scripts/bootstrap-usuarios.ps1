$ErrorActionPreference = 'Stop'

& (Join-Path $PSScriptRoot 'bootstrap.ps1')

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$servicesRoot = Join-Path $repositoryRoot 'services'
$destination = Join-Path $servicesRoot 'academico-usuarios'
$remote = 'https://github.com/academic-mgmt-org/academico-usuarios.git'

if (Test-Path -LiteralPath (Join-Path $destination '.git')) {
    Write-Host 'Actualizando academico-usuarios...'
    git -C $destination pull --ff-only
}
elseif (Test-Path -LiteralPath $destination) {
    throw "La ruta $destination existe, pero no es un repositorio Git."
}
else {
    Write-Host 'Descargando academico-usuarios...'
    git clone --depth 1 $remote $destination
}

Write-Host 'Activos del producto con Usuarios preparados correctamente.'

