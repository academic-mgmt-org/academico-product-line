$ErrorActionPreference = 'Stop'

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$servicesRoot = Join-Path $repositoryRoot 'services'
$repositories = @(
    'academico-esquema-bd',
    'academico-login',
    'academico-gateway'
)

New-Item -ItemType Directory -Force -Path $servicesRoot | Out-Null

foreach ($repository in $repositories) {
    $destination = Join-Path $servicesRoot $repository
    $remote = "https://github.com/academic-mgmt-org/$repository.git"

    if (Test-Path -LiteralPath (Join-Path $destination '.git')) {
        Write-Host "Actualizando $repository..."
        git -C $destination pull --ff-only
    }
    elseif (Test-Path -LiteralPath $destination) {
        throw "La ruta $destination existe, pero no es un repositorio Git."
    }
    else {
        Write-Host "Descargando $repository..."
        git clone --depth 1 $remote $destination
    }
}

Write-Host 'Activos del producto minimo preparados correctamente.'

