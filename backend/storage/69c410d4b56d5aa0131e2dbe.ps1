# PowerShell: Windows Defender Firewall Rules (Parts 1–3)

# Part 1 (2 pts): Allow RDP inbound from Admin subnet only (VLAN 40: 10.10.1.0/27)
New-NetFirewallRule -DisplayName "Allow RDP from Admin" -Direction Inbound -Protocol TCP -LocalPort 3389 -RemoteAddress 10.10.1.0/27 -Action Allow -Profile Domain,Private

# Part 2 (3 pts): Block SMB from Guests (VLAN 10: 10.10.0.0/25)
New-NetFirewallRule -DisplayName "Block SMB from Guests" -Direction Inbound -Protocol TCP -LocalPort 445 -RemoteAddress 10.10.0.0/25 -Action Block -Profile Domain,Private

# Part 3 (5 pts): Allow 80/443 to Web Server and block other inbound (run on the server)
New-NetFirewallRule -DisplayName "Allow HTTP In" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow -Profile Domain,Private
New-NetFirewallRule -DisplayName "Allow HTTPS In" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow -Profile Domain,Private

# Optional hardening: default inbound block (ensure needed allows exist first)
Set-NetFirewallProfile -Profile Domain,Private -DefaultInboundAction Block
# PowerShell: Windows Defender Firewall Rules (Parts 1–3)

# Part 1 (2 pts): Allow RDP inbound from Admin subnet only (VLAN 40: 10.10.1.0/27)
New-NetFirewallRule -DisplayName "Allow RDP from Admin" -Direction Inbound -Protocol TCP -LocalPort 3389 -RemoteAddress 10.10.1.0/27 -Action Allow -Profile Domain,Private

# Part 2 (3 pts): Block SMB from Guests (VLAN 10: 10.10.0.0/25)
New-NetFirewallRule -DisplayName "Block SMB from Guests" -Direction Inbound -Protocol TCP -LocalPort 445 -RemoteAddress 10.10.0.0/25 -Action Block -Profile Domain,Private

# Part 3 (5 pts): Allow 80/443 to Web Server and block other inbound (run on the server)
New-NetFirewallRule -DisplayName "Allow HTTP In" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow -Profile Domain,Private
New-NetFirewallRule -DisplayName "Allow HTTPS In" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow -Profile Domain,Private

# Optional hardening: default inbound block (ensure needed allows exist first)
Set-NetFirewallProfile -Profile Domain,Private -DefaultInboundAction Block
