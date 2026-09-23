param([ValidateSet('build', 'test', 'check', 'package')][string]$Task = 'build')
$ErrorActionPreference = 'Stop'
$projectDirectory = Split-Path -Parent $PSScriptRoot
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
if ($nodeCommand) {
    $nodeExecutable = $nodeCommand.Source
} else {
    $nodeExecutable = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
    if (-not (Test-Path -LiteralPath $nodeExecutable)) { throw 'Install Node.js 20.19+ / 22.12+ or run in an environment with the Codex Node runtime.' }
}
Push-Location $projectDirectory
try {
    if (-not (Test-Path -LiteralPath 'node_modules/typescript/bin/tsc')) { throw 'Dependencies are missing. Run yarn install first.' }
    $scriptsToRun = switch ($Task) {
        'build' { @('node_modules/vite/bin/vite.js') }
        'test' { @('node_modules/vitest/vitest.mjs') }
        'check' { @('node_modules/typescript/bin/tsc', 'node_modules/vitest/vitest.mjs', 'node_modules/vite/bin/vite.js') }
        'package' { @('scripts/package.mjs') }
    }
    foreach ($scriptPath in $scriptsToRun) {
        if ($scriptPath -like '*typescript*') { & $nodeExecutable $scriptPath --noEmit }
        elseif ($scriptPath -like '*vitest*') { & $nodeExecutable $scriptPath run }
        elseif ($scriptPath -like '*vite/bin*') { & $nodeExecutable $scriptPath build }
        else { & $nodeExecutable $scriptPath }
        if ($LASTEXITCODE -ne 0) { throw "Failed: $scriptPath (exit $LASTEXITCODE)" }
    }
} finally { Pop-Location }
