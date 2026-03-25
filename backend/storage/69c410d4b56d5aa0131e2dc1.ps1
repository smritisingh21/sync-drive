# PowerShell: Windows Defender Firewall Rules (Parts 4–6)

# Part 4 (2 pts): Allow ICMP (ping) only inside LAN
New-NetFirewallRule -DisplayName "Allow ICMPv4 LAN Only" -Protocol ICMPv4 -IcmpType 8 -Direction Inbound -Action Allow -RemoteAddress 10.10.0.0/22 -Profile Domain,Private

# Part 5 (5 pts): Program-based outbound allow for Chrome; block other outbound (Servers)
$chrome="C:\Program Files\Google\Chrome\Application\chrome.exe"
New-NetFirewallRule -DisplayName "Allow Chrome Outbound" -Direction Outbound -Program $chrome -Action Allow -Profile Domain,Private
# Optional: set default outbound to block (add exceptions as required)
Set-NetFirewallProfile -Profile Domain,Private -DefaultOutboundAction Block

# Part 6 (3 pts): Enable firewall logging and export policy
Set-NetFirewallProfile -Profile Domain,Private -LogAllowed True -LogBlocked True -LogFileName "C:\Windows\System32\LogFiles\Firewall\pfirewall.log" -LogMaxSizeKilobytes 16384

# Export current policy (ensure C:\Temp exists or change path)
if (!(Test-Path -Path "C:\Temp")) { New-Item -ItemType Directory -Path "C:\Temp" | Out-Null }
netsh advfirewall export "C:\Temp\FirewallPolicy.wfw"
# PowerShell: Windows Defender Firewall Rules (Parts 4–6)

# Part 4 (2 pts): Allow ICMP (ping) only inside LAN
New-NetFirewallRule -DisplayName "Allow ICMPv4 LAN Only" -Protocol ICMPv4 -IcmpType 8 -Direction Inbound -Action Allow -RemoteAddress 10.10.0.0/22 -Profile Domain,Private

# Part 5 (5 pts): Program-based outbound allow for Chrome; block other outbound (Servers)
$chrome="C:\Program Files\Google\Chrome\Application\chrome.exe"
New-NetFirewallRule -DisplayName "Allow Chrome Outbound" -Direction Outbound -Program $chrome -Action Allow -Profile Domain,Private
# Optional: set default outbound to block (add exceptions as required)
Set-NetFirewallProfile -Profile Domain,Private -DefaultOutboundAction Block

# Part 6 (3 pts): Enable firewall logging and export policy
Set-NetFirewallProfile -Profile Domain,Private -LogAllowed True -LogBlocked True -LogFileName "C:\Windows\System32\LogFiles\Firewall\pfirewall.log" -LogMaxSizeKilobytes 16384

# Export current policy (ensure C:\Temp exists or change path)
if (!(Test-Path -Path "C:\Temp")) { New-Item -ItemType Directory -Path "C:\Temp" | Out-Null }
netsh advfirewall export "C:\Temp\FirewallPolicy.wfw"
