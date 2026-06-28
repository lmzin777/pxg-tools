$ErrorActionPreference = 'Stop'

$wikiBase = 'https://wiki.pokexgames.com'
$pages = @(
  'Volcanic',
  'Raibolt',
  'Orebound',
  'Naturia',
  'Gardestrike',
  'Ironhard',
  'Wingeon',
  'Psycraft',
  'Seavell',
  'Malefic'
)

function Strip-Html {
  param([string]$Value)

  if (-not $Value) {
    return ''
  }

  return (($Value `
    -replace '<script[\s\S]*?</script>', ' ' `
    -replace '<style[\s\S]*?</style>', ' ' `
    -replace '<[^>]+>', ' ' `
    -replace '&nbsp;', ' ' `
    -replace '&#160;', ' ' `
    -replace '&amp;', '&' `
    -replace '&#039;', "'" `
    -replace '&quot;', '"' `
    -replace '\s+', ' ').Trim())
}

function Get-Section {
  param(
    [string]$Html,
    [string[]]$StartId,
    [string[]]$EndIds
  )

  $start = -1
  foreach ($id in $StartId) {
    $candidate = $Html.IndexOf("id=`"$id`"")
    if ($candidate -ge 0 -and ($start -lt 0 -or $candidate -lt $start)) {
      $start = $candidate
    }
  }

  if ($start -lt 0) {
    return ''
  }

  $end = -1
  foreach ($endId in $EndIds) {
    $candidate = $Html.IndexOf("id=`"$endId`"", $start + 1)
    if ($candidate -ge 0 -and ($end -lt 0 -or $candidate -lt $end)) {
      $end = $candidate
    }
  }

  if ($end -lt 0) {
    $end = $Html.Length
  }

  return $Html.Substring($start, $end - $start)
}

function Get-Cells {
  param([string]$Row)

  return [regex]::Matches($Row, '<td[^>]*>([\s\S]*?)</td>') |
    ForEach-Object { $_.Groups[1].Value }
}

function Get-Title {
  param([string]$Cell)

  $match = [regex]::Match($Cell, '<a href="/index.php/[^"]+" title="([^"]+)">')
  if ($match.Success) {
    return $match.Groups[1].Value
  }

  return (Strip-Html $Cell)
}

function Get-AbsoluteWikiUrl {
  param([string]$Src)

  if ($Src -match '^https?://') {
    return $Src
  }

  return "$wikiBase$Src"
}

function Get-ImageItems {
  param([string]$Cell)

  return [regex]::Matches($Cell, '<img\s+([^>]+)>') | ForEach-Object {
    $attrs = $_.Groups[1].Value
    $src = [regex]::Match($attrs, 'src="([^"]+)"').Groups[1].Value
    $alt = [regex]::Match($attrs, 'alt="([^"]*)"').Groups[1].Value
    $titleMatch = [regex]::Match($attrs, 'title="([^"]*)"')
    $label = if ($titleMatch.Success -and $titleMatch.Groups[1].Value) { $titleMatch.Groups[1].Value } else { $alt }

    if ($src) {
      [pscustomobject]@{
        label = (($label -replace '\.png$', '') -replace '_', ' ').Trim()
        icon = Get-AbsoluteWikiUrl $src
      }
    }
  }
}

function Get-RoleItems {
  param([string]$Cell)

  return Get-ImageItems $Cell | Where-Object { $_.label -match '^Interface ' } | ForEach-Object {
    $raw = $_.label
    $label = switch -Regex ($raw) {
      'OffensiveTanker' { 'Offensive Tank'; break }
      'Tanker|Tank PVE|Tank PVP' { 'Tank'; break }
      'OTDD' { 'Over Time Damage Dealer'; break }
      'BDD' { 'Burst Damage Dealer'; break }
      'Support' { 'Support'; break }
      'Speedster' { 'Speedster'; break }
      'Disrupter' { 'Disrupter'; break }
      default { $raw -replace '^Interface ', '' -replace '\s+PVE$', '' -replace '\s+PVP$', '' }
    }

    [pscustomobject]@{
      label = $label
      icon = $_.icon
    }
  }
}

function Get-ElementItems {
  param([string]$Cell)

  $ignored = 'Interface|Atk|Def|Boost|Held|Blank|Not'
  return Get-ImageItems $Cell |
    Where-Object { $_.label -and $_.label -notmatch $ignored } |
    ForEach-Object {
      [pscustomobject]@{
        label = ($_.label -replace '\d+$', '')
        icon = $_.icon
      }
    }
}

function Get-Role {
  param([string]$Cell)

  $role = @(Get-RoleItems $Cell | Select-Object -First 1)
  if (-not $role.Count) {
    return $null
  }

  return $role[0]
}

$details = foreach ($page in $pages) {
  $url = "$wikiBase/api.php?action=parse&page=$page&prop=text&format=json"
  $response = Invoke-RestMethod -Uri $url -Headers @{
    Accept = 'application/json'
    'User-Agent' = 'PXGTools/0.1 (local validation)'
  }

  $html = $response.parse.text.'*'

  $bonusSection = Get-Section $html @('B.C3.B4nus_de_Cl.C3.A3', 'Bônus_de_Clã') @('Tiers')
  $bonus = [regex]::Matches((Strip-Html $bonusSection), '([A-Za-z]+):\s*Atk\s*(\d+%),\s*Def\s*(\d+%)') |
    ForEach-Object {
      [pscustomobject]@{
        type = $_.Groups[1].Value
        attack = $_.Groups[2].Value
        defense = $_.Groups[3].Value
      }
    }

  $npcSection = Get-Section $html @('Pok.C3.A9mon_obtido_via_NPC_de_Cl.C3.A3', 'Pokémon_obtido_via_NPC_de_Clã') @('Efetividades', 'Efetividade', 'Outfits_Exclusivas')
  $npcText = Strip-Html $npcSection
  $npc = [regex]::Matches($npcText, 'Para obter um(?:a)?[,]?\s+(.+?)\s*,?\s*fale com a NPC\s+(.+?)\s*,\s+(.+?)(?=\.?\s+Shiny|\.\s+Efetividade|\.\s+Efetividades|$)') |
    ForEach-Object {
      [pscustomobject]@{
        label = 'NPC de Cla'
        pokemon = $_.Groups[1].Value.Trim()
        npc = $_.Groups[2].Value.Trim()
        location = ($_.Groups[3].Value.Trim() -replace '^localizada\s+', '' -replace '\.\s*<span.*$', '')
      }
    }

  $tiersSection = Get-Section $html @('Tiers') @('Rota.C3.A7.C3.A3o_Mid-Late_Game', 'Rotação_Mid-Late_Game')
  $tierIds = @('Tier_1A', 'Tier_1B', 'Tier_1C', 'Technical_Machine_(TM)', 'Technical_Records_(TR)', 'Tier_1H', 'Tier_2', 'Tier_3')
  $tierGroups = @()
  for ($index = 0; $index -lt $tierIds.Count; $index += 1) {
    $endIds = if ($index -lt $tierIds.Count - 1) { @($tierIds[$index + 1]) } else { @('Rota.C3.A7.C3.A3o_Mid-Late_Game', 'Rotação_Mid-Late_Game') }
    $section = Get-Section $tiersSection @($tierIds[$index]) $endIds
    if (-not $section) {
      continue
    }

    $label = $tierIds[$index] -replace '_', ' ' -replace 'Technical Machine \(TM\)', 'Technical Machine (TM)' -replace 'Technical Records \(TR\)', 'Technical Records (TR)'
    $tierRows = @()
    $seenTierNames = @{}
    foreach ($rowMatch in [regex]::Matches($section, '<tr[\s\S]*?</tr>')) {
      $cells = @(Get-Cells $rowMatch.Value)
      if ($cells.Count -lt 7) {
        continue
      }

      $name = Get-Title $cells[2]
      if (-not $name -or $name -match '^(Nome|Pokemon|Pokémon|Held|Funcao|Função|Tier|PvP|PvE)$' -or $seenTierNames.ContainsKey($name)) {
        continue
      }

      $seenTierNames[$name] = $true
      $icon = @(Get-ImageItems $cells[1] | Select-Object -First 1)
      $tierRows += [pscustomobject]@{
        dex = Strip-Html $cells[0]
        icon = if ($icon.Count) { $icon[0].icon } else { '' }
        name = $name
        elements = @(Get-ElementItems $cells[3])
        pveRoles = @(Get-RoleItems $cells[4])
        pvpRoles = @(Get-RoleItems $cells[5])
        helds = @(Get-ImageItems $cells[6])
      }
    }

    if ($label -and $tierRows.Count) {
      $tierGroups += [pscustomobject]@{
        tier = $label
        pokemon = @($tierRows | ForEach-Object { $_.name })
        rows = @($tierRows)
      }
    }
  }

  $rotationSection = Get-Section $html @('Rota.C3.A7.C3.A3o_Mid-Late_Game', 'Rotação_Mid-Late_Game') @('Exclusividade_do_Cl.C3.A3_no_PvP', 'Exclusividade_de_Cl.C3.A3_no_PvP', 'Exclusividade_do_Clã_no_PvP', 'Exclusividade_de_Clã_no_PvP')
  $rotations = @()
  foreach ($tableMatch in [regex]::Matches($rotationSection, '<table[\s\S]*?</table>')) {
    $table = $tableMatch.Value
    $header = Strip-Html ([regex]::Match($table, '<th[^>]*colspan="4"[\s\S]*?</th>').Value)
    if (-not $header) {
      continue
    }

    $element = ($header -split ' ')[-1]
    $rows = @()
    foreach ($rowMatch in [regex]::Matches($table, '<tr[\s\S]*?</tr>')) {
      $cells = @(Get-Cells $rowMatch.Value)
      if ($cells.Count -lt 4) {
        continue
      }

      $name = Get-Title $cells[1]
      if (-not $name -or $name -eq 'Nome') {
        continue
      }

      $role = Get-Role $cells[2]
      $rows += [pscustomobject]@{
        pokemon = $name
        role = if ($role) { $role.label } else { '' }
        roleIcon = if ($role) { $role.icon } else { '' }
        tier = Strip-Html $cells[3]
      }
    }

    if ($rows.Count) {
      $rotations += [pscustomobject]@{
        element = $element
        rows = $rows
      }
    }
  }

  $pvpSection = Get-Section $html @('Exclusividade_do_Cl.C3.A3_no_PvP', 'Exclusividade_do_Clã_no_PvP') @('Pok.C3.A9mon_obtido_via_NPC_de_Cl.C3.A3', 'Pokémon_obtido_via_NPC_de_Clã')
  if (-not $pvpSection) {
    $pvpSection = Get-Section $html @('Exclusividade_de_Cl.C3.A3_no_PvP', 'Exclusividade_de_Clã_no_PvP') @('Pok.C3.A9mon_obtido_via_NPC_de_Cl.C3.A3', 'Pokémon_obtido_via_NPC_de_Clã')
  }

  $pvp = [regex]::Matches($pvpSection, '<a href="/index.php/[^"]+" title="([^"]+)">') |
    ForEach-Object { $_.Groups[1].Value } |
    Where-Object { $_ -notmatch '^(Pokémon|Pokemon|Volcanic|Raibolt|Orebound|Naturia|Gardestrike|Ironhard|Wingeon|Psycraft|Seavell|Malefic)$' } |
    Select-Object -Unique

  [pscustomobject]@{
    slug = $page.ToLower()
    name = $page
    sourceUrl = "$wikiBase/index.php/$page"
    bonus = @($bonus)
    npcPokemon = @($npc)
    tiers = @($tierGroups)
    rotation = @($rotations)
    pvpExclusive = @($pvp)
    pvpNote = 'A exclusividade e aplicada apenas em conteudos PvP. No PvE, o uso e liberado para todos os clas.'
  }
}

$outputPath = Join-Path (Split-Path $PSScriptRoot -Parent) 'data/clan-details.json'
$payload = [pscustomobject]@{
  source = $wikiBase
  scrapedAt = (Get-Date).ToUniversalTime().ToString('o')
  clans = @($details)
}

$payload |
  ConvertTo-Json -Depth 16 |
  Set-Content -LiteralPath $outputPath -Encoding utf8

Write-Output "Saved $($details.Count) clan detail records to $outputPath"
