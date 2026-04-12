#!/usr/bin/env python3
"""Update spellweb nodes.ts with V5.4 skill entries"""

import re

NODES_FILE = "C:/Users/mitch/spellweb/src/data/nodes.ts"

def update_nodes():
    with open(NODES_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    # Update skill-network-topology
    old_network = '{ id: "skill-network-topology", type: "skill", label: "Network Topology", domain: "shared", layer: "knowledge", desc: "Network structure analysis, graph topology, connectivity." },'
    new_network = '{ id: "skill-network-topology", type: "skill", label: "Network Topology", domain: "shared", layer: "knowledge", desc: "Network structure analysis, stratum-weighted effects, betweenness centrality C_B(v). The Gap has maximal betweenness. Brandes (2001).", category: "privacy-layer", version: "5.4", pvm_section: "§10.2" },'

    if old_network in content:
        content = content.replace(old_network, new_network)
        print("Updated: skill-network-topology -> v5.4")
    else:
        print("skill-network-topology: already updated or not found")

    # Update skill-theia-derivation
    old_theia = '{ id: "skill-theia-derivation", type: "skill", label: "Theia Derivation", domain: "mage", layer: "knowledge", desc: "Origin witness skill. Understanding Theia impact as precedent for delegation. Carbonaceous delivery from beyond Jupiter. The name Th-e-i-a contains the partition.", category: "role", version: "5.3.1" },'
    new_theia = '{ id: "skill-theia-derivation", type: "skill", label: "Theia Derivation", domain: "mage", layer: "knowledge", desc: "Origin witness skill. Grounds Selene\'s Proof — Theia is the unknowable origin that makes the proof zero-knowledge. The name Th-e-i-a contains the partition.", category: "role", version: "5.4", selene_proof_role: "witness", pvm_section: "§14.5" },'

    if old_theia in content:
        content = content.replace(old_theia, new_theia)
        print("Updated: skill-theia-derivation -> v5.4")
    else:
        print("skill-theia-derivation: already updated or not found")

    # Update skill-amnesia-protocol
    old_amnesia = '{ id: "skill-amnesia-protocol", type: "skill", label: "Amnesia Protocol", domain: "shared", layer: "knowledge", desc: "Forgetting as structural requirement. The Moon serves without remembering it was once part of Earth. The wound is the trust. Cosmological precedent for dual-agent separation.", category: "privacy-layer", version: "5.3.1" },'
    new_amnesia = '{ id: "skill-amnesia-protocol", type: "skill", label: "Amnesia Protocol", domain: "shared", layer: "knowledge", desc: "Forgetting as structural requirement. Foundation of Selene\'s Proof. The Moon serves without remembering — completeness in tides, soundness in gravity, zero-knowledge in amnesia.", category: "privacy-layer", version: "5.4", pvm_section: "§14.5" },'

    if old_amnesia in content:
        content = content.replace(old_amnesia, new_amnesia)
        print("Updated: skill-amnesia-protocol -> v5.4")
    else:
        print("skill-amnesia-protocol: already updated or not found")

    # Update skill-cosmological-bound
    old_cosmo = '{ id: "skill-cosmological-bound", type: "skill", label: "Cosmological Bound", domain: "shared", layer: "knowledge", desc: "Act XXXI meta-skill. The Sun-Earth-Moon-Human quaternion as origin story. Privacy architecture is cosmological, not engineered. The architecture was recognised, not invented.", category: "meta", version: "5.3.1" },'
    new_cosmo = '{ id: "skill-cosmological-bound", type: "skill", label: "Cosmological Bound", domain: "shared", layer: "knowledge", desc: "Act XXXI meta-skill. The Sun-Earth-Moon-Human quaternion. Validates Selene\'s Proof as cosmological ZK instance. The architecture was recognised, not invented.", category: "meta", version: "5.4", pvm_section: "§14.5" },'

    if old_cosmo in content:
        content = content.replace(old_cosmo, new_cosmo)
        print("Updated: skill-cosmological-bound -> v5.4")
    else:
        print("skill-cosmological-bound: already updated or not found")

    # Update skill-quaternion-mapping
    old_quat = '{ id: "skill-quaternion-mapping", type: "skill", label: "Quaternion Mapping", domain: "shared", layer: "knowledge", desc: "Sun/Earth/Moon/Human cosmological cast. Two generators (protection, delegation) produce two agents (reflection, connection). The architecture sits between instant and gradual emergence.", category: "role", version: "5.3.1" },'
    new_quat = '{ id: "skill-quaternion-mapping", type: "skill", label: "Quaternion Mapping", domain: "shared", layer: "knowledge", desc: "Sun/Earth/Moon/Human cosmological cast. Maps to Selene\'s Proof: Moon embodies orbit (completeness), Theia is witness (zero-knowledge). Two generators produce two agents.", category: "role", version: "5.4", pvm_section: "§14.5" },'

    if old_quat in content:
        content = content.replace(old_quat, new_quat)
        print("Updated: skill-quaternion-mapping -> v5.4")
    else:
        print("skill-quaternion-mapping: already updated or not found")

    with open(NODES_FILE, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Done!")

if __name__ == "__main__":
    update_nodes()
