$ErrorActionPreference = 'Stop'

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$generator = Join-Path $repositoryRoot 'scripts\generate-product.ps1'
$products = @(
    'products\producto-minimo.yml',
    'products\producto-usuarios.yml'
)

foreach ($product in $products) {
    $path = Join-Path $repositoryRoot $product
    & powershell -ExecutionPolicy Bypass -File $generator $path plan
    if ($LASTEXITCODE -ne 0) {
        throw "El generador fallo para $product."
    }
}

$minimumSelection = Get-Content -Raw -LiteralPath (
    Join-Path $repositoryRoot 'generated\academico-minimo\selection.json'
) | ConvertFrom-Json
$usersSelection = Get-Content -Raw -LiteralPath (
    Join-Path $repositoryRoot 'generated\academico-usuarios\selection.json'
) | ConvertFrom-Json

if ($minimumSelection.features.usuarios) {
    throw 'El producto minimo activo Usuarios por error.'
}

if (-not $usersSelection.features.usuarios) {
    throw 'El producto de Usuarios no activo Usuarios.'
}

if ($minimumSelection.compose_files -contains 'compose.usuarios.yaml') {
    throw 'El producto minimo incluyo el Compose de Usuarios.'
}

if ($usersSelection.compose_files -notcontains 'compose.usuarios.yaml') {
    throw 'El producto de Usuarios no incluyo su Compose.'
}

Write-Host 'OK: el generador selecciona correctamente las dos variantes.'
