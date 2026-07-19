param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string]$ProductPath,

    [Parameter(Position = 1)]
    [ValidateSet('plan', 'derive', 'up', 'down')]
    [string]$Action = 'plan'
)

$ErrorActionPreference = 'Stop'

$nodeGenerator = Join-Path $PSScriptRoot 'generate-product.mjs'
& node $nodeGenerator $ProductPath $Action
exit $LASTEXITCODE
