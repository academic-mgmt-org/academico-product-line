$ErrorActionPreference = 'Stop'

$repositoryRoot = Split-Path -Parent $PSScriptRoot
Push-Location $repositoryRoot
try {
    & npm test
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
