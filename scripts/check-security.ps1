<#
    Run the deployment and security checks the way production would see them.

    Every check worth having here is a no-op under DEBUG -- local work runs on
    plain HTTP, and complaining about that would train everybody to ignore the
    output. `.env` sets DEBUG=True, so `manage.py check --deploy` run plainly
    reports nothing while looking exactly like a pass.

    Turning DEBUG off then makes settings demand values that only production
    carries, and some of them are shape-checked. That is why this is a script
    and not a line in a runbook: four environment variables in the right shapes,
    typed from memory, is four chances to produce an error that reads like a
    finding.

    Nothing here reaches Stripe. The values are placeholders shaped to satisfy
    the checks, and no system check makes a network call.
#>

$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')

$restore = @{}
foreach ($name in 'DEBUG', 'SECRET_KEY', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'SITE_URL') {
    $restore[$name] = [Environment]::GetEnvironmentVariable($name)
}

try {
    # python-dotenv does not overwrite a variable already in the environment,
    # so these win over .env.
    $env:DEBUG = 'False'
    # A long random key, because Django's security.W009 fires on a short one and
    # the key in .env is a local one -- production's comes from the host's
    # environment and is not visible here. Checking the local key would report a
    # warning about a value that never ships.
    $env:SECRET_KEY = -join ((1..72) | ForEach-Object { [char[]]'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' | Get-Random })
    # ftp_payments.E004 / E005 check the prefix, not the key, so these satisfy
    # them without being credentials.
    $env:STRIPE_SECRET_KEY = 'sk_test_placeholder_not_a_real_key'
    $env:STRIPE_WEBHOOK_SECRET = 'whsec_placeholder_not_a_real_secret'
    # ftp_payments.E007: outside DEBUG the redirect target has to be HTTPS.
    $env:SITE_URL = 'https://checks.invalid'

    & .\.venv\Scripts\python.exe manage.py check --deploy
    $code = $LASTEXITCODE
}
finally {
    foreach ($name in $restore.Keys) {
        if ($null -eq $restore[$name]) {
            Remove-Item "Env:$name" -ErrorAction SilentlyContinue
        }
        else {
            Set-Item "Env:$name" $restore[$name]
        }
    }
}

# security.W008 and security.W021 are silenced by name in SILENCED_SYSTEM_CHECKS
# with their reasons -- the host does the HTTP-to-HTTPS redirect, and the domain
# is not on the browser preload list. Anything this prints is a finding.
exit $code
