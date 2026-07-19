param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string]$ProductPath,

    [Parameter(Position = 1)]
    [ValidateSet('plan', 'up', 'down')]
    [string]$Action = 'plan'
)

$ErrorActionPreference = 'Stop'

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$resolvedProductPath = Resolve-Path -LiteralPath $ProductPath
$productDefinition = Get-Content -Raw -LiteralPath $resolvedProductPath

function Read-YamlScalar {
    param(
        [string]$Content,
        [string]$Key
    )

    $pattern = "(?m)^\s{2}$([regex]::Escape($Key)):\s*(.+?)\s*$"
    $match = [regex]::Match($Content, $pattern)
    if (-not $match.Success) {
        throw "La propiedad '$Key' no existe en $resolvedProductPath."
    }

    return $match.Groups[1].Value.Trim().Trim('"').Trim("'")
}

function Read-Feature {
    param(
        [string]$Content,
        [string]$Feature
    )

    $value = Read-YamlScalar -Content $Content -Key $Feature
    if ($value -notin @('true', 'false')) {
        throw "La caracteristica '$Feature' debe ser true o false."
    }

    return $value -eq 'true'
}

$productId = Read-YamlScalar -Content $productDefinition -Key 'id'
$knownFeatures = @(
    'database',
    'login',
    'gateway',
    'usuarios',
    'matriculas',
    'calificaciones',
    'notificaciones',
    'web',
    'quality_gates'
)

$features = [ordered]@{}
foreach ($feature in $knownFeatures) {
    $features[$feature] = Read-Feature -Content $productDefinition -Feature $feature
}

foreach ($requiredFeature in @('database', 'login', 'gateway')) {
    if (-not $features[$requiredFeature]) {
        throw "El producto '$productId' debe activar la caracteristica obligatoria '$requiredFeature'."
    }
}

$notImplemented = @(
    'matriculas',
    'calificaciones',
    'notificaciones',
    'web',
    'quality_gates'
) | Where-Object { $features[$_] }

if ($notImplemented.Count -gt 0) {
    throw "El producto '$productId' activa caracteristicas aun no integradas: $($notImplemented -join ', ')."
}

$composeFiles = @(
    (Join-Path $repositoryRoot 'compose.yaml'),
    (Join-Path $repositoryRoot 'compose.override.yaml')
)
$bootstrapScript = Join-Path $PSScriptRoot 'bootstrap.ps1'

if ($features['usuarios']) {
    $composeFiles += Join-Path $repositoryRoot 'compose.usuarios.yaml'
    $bootstrapScript = Join-Path $PSScriptRoot 'bootstrap-usuarios.ps1'
}

foreach ($composeFile in $composeFiles) {
    if (-not (Test-Path -LiteralPath $composeFile)) {
        throw "No existe el archivo Compose requerido: $composeFile"
    }
}

$composeArguments = @()
foreach ($composeFile in $composeFiles) {
    $composeArguments += @('-f', $composeFile)
}

Push-Location $repositoryRoot
try {
    & docker compose @composeArguments config --quiet
    if ($LASTEXITCODE -ne 0) {
        throw "La configuracion Compose de '$productId' no es valida."
    }

    $generatedDirectory = Join-Path $repositoryRoot "generated\$productId"
    New-Item -ItemType Directory -Force -Path $generatedDirectory | Out-Null

    $selection = [ordered]@{
        product = $productId
        source = $resolvedProductPath.Path
        features = $features
        compose_files = $composeFiles | ForEach-Object {
            [System.IO.Path]::GetFileName($_)
        }
        generated_at = (Get-Date).ToString('o')
    }
    $selection |
        ConvertTo-Json -Depth 5 |
        Set-Content -LiteralPath (Join-Path $generatedDirectory 'selection.json') -Encoding utf8

    Write-Host "Producto: $productId"
    Write-Host "Caracteristicas activas: $(($features.Keys | Where-Object { $features[$_] }) -join ', ')"
    Write-Host "Compose: $(($selection.compose_files) -join ' + ')"

    switch ($Action) {
        'plan' {
            Write-Host "Plan generado en generated/$productId/selection.json"
        }
        'up' {
            & powershell -ExecutionPolicy Bypass -File $bootstrapScript
            if ($LASTEXITCODE -ne 0) {
                throw "Fallo el bootstrap de '$productId'."
            }

            & docker compose @composeArguments up --build -d
            if ($LASTEXITCODE -ne 0) {
                throw "No se pudo iniciar el producto '$productId'."
            }
        }
        'down' {
            & docker compose @composeArguments down
            if ($LASTEXITCODE -ne 0) {
                throw "No se pudo detener el producto '$productId'."
            }
        }
    }
}
finally {
    Pop-Location
}
