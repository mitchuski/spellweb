---
title: "Privacy is Value · V7 Research Note: Public Agreement and Private Ambiguity"
version: "7.0.0-research.1"
date: "2026-09-11"
status: "canon research note; proposed bridge and executable toy model"
series: "Privacy is Value"
prepared_for: "Mitchell Travers / agentprivacy"
prepared_by: "Codex, at the First Person's request"
conjecture_authority: "research/CONJECTURE_REGISTER_V6.md"
register_head: "C97"
license: "CC BY-SA 4.0; external sources retain their own licenses"
---

# Public agreement and private ambiguity

## 1. Disposition and scope

Enter Observer Patch Holography (OPH) as related work for boundary observations, observation-determined normal forms, repair consistency, and authenticated record provenance. Adopt its useful questions and teaching patterns. This is a V7 research note in the canon, not a replacement V7 formal specification. V6 remains the current formal volume; the existing register remains the sole numbering authority. No new C-number is minted and no confidence percentage is increased by this intake.

The central research question is: **can an authorised boundary determine a public task result while leaving the First Person's private state insufficiently determined for the stated adversary?** The two obligations must be proved separately. Agreement is a correctness property. Privacy concerns what the observations disclose about the protected secret, including background information, metadata, and combined transcripts. A protected record in OPH is preserved under repair; the word does not mean confidential. [OPH1, §3.1; AP1, §§10.3–11]

This assessment uses relevant passages of the supplied 74-page r2040 paper, browser inspection of the learning and simulation scenes, and the local agentprivacy working tree. It does not independently validate the full OPH Lean development, all companion manuscripts, or any physical realization. The attachment's SHA-256 is `f2eba9f1161de0a8adfafa6adccc7c834472e327ef860b4aeef991f71bd02c2a`. Source hashes and revision context are in `oph-v7-source-manifest.json`.

## 2. What OPH supplies

OPH1 Definition 3.1 specifies configurations Q, a consistent subset C, and an observation map B. For a reading b, the compatible consistent states are C_b = C ∩ B⁻¹(b). They are classified by cardinality: zero means unrealizable; one means reconstructing; more than one means ambiguous. Theorem 3.2 characterizes an observation-determined partial normalizer through injectivity of B restricted to C. Its short proof constructs the result on each singleton fiber. [OPH1, pp. 15–16; OPH2]

The paper separates this from repair order. Two repair schedules from the same starting state can agree without proving that two different initial states with the same reading determine one result. Repair needs its own record-preservation, reachability, termination, completeness, and confluence premises. These distinctions are directly useful when defining what a verifier or delegate is entitled to conclude. [OPH1, §3; OPH7]

Authenticated read-from dependencies produce a finite informational partial order. A displayed ancestor graph may be reconstructed retrospectively from a retained log even when a local register does not contain that ancestry. A provenance graph therefore requires a declared reader and an explicit access basis. Physical spacetime identification is a separate obligation. [OPH1, pp. 16–18; OPH3; BG1]

## 3. Proposed bridge: determine the task, preserve the secret

Let X be a private state in a finite set Ω, B the disclosed boundary, and F the authorised public task result. For b, define Ω_b = {x ∈ Ω : B(x)=b}. Public sufficiency for this task requires F to be constant on each nonempty Ω_b. Equivalently, on the image of B there exists a decoder g with F = g ∘ B. This elementary factorization follows by defining g(b) from any member of Ω_b; constancy makes that choice well-defined.

This is deliberately weaker than reconstructing X. Applying OPH's injectivity requirement to the entire private state would defeat the intended separation. A candidate transfer must instead identify an appropriate public quotient or task object on which uniqueness is required. The map from that object into OPH's Q, C and B, and the preservation of the consumed operations, remain to be supplied. The factorization above is a finite mathematical observation, not a proof of the complete C9 holographic claim.

For privacy, retain the existing channel and informed-deficit assumptions. Set-valued ambiguity |Ω_b| > 1 is not enough: one state could have posterior probability 0.999999. With a declared prior and adversary background Z, use an appropriate guessing probability, conditional entropy, or task-specific leakage criterion. If Z identifies X, the boundary may still admit several syntactic states while privacy is gone. Likewise, separate access controls do not themselves prove conditional independence. [AP1, §§10.3–11; AP2, C82 and C97]

### A fully specified finite example

The prototype uses six independent, uniformly distributed bits X = (x₀,…,x₅), hence 64 equiprobable states. These are synthetic coordinates, not measured behaviours or a claimed model of the Atlas lattice. The public result is parity F(X) = x₀ ⊕ … ⊕ x₅. The authorised boundary initially discloses only that parity.

For either parity, 32 states remain: public-result correctness is exact, H(X | F) = 5 bits, and optimal exact-state guessing success is 1/32. If k distinct coordinates are also disclosed, the remaining count is 2^(5−k) for 0 ≤ k ≤ 5, and one for k = 6. At k = 5, parity determines the sixth bit. These are exact counts under the stated uniform model, not an empirical reconstruction ceiling for people.

The observer roles are pedagogical masks: First Person knows all six bits; Swordsman sees coordinates 0 and 1 plus parity; Mage sees 2 and 3 plus parity; a public observer initially sees parity only. A combined-observer control unions the Swordsman and Mage disclosures, leaving two candidate states. Background bits are additional observations against the same fixed archive. No independence guarantee is inferred from these labels.

Different private states with the same parity remain distinguishable private states; they are not declared physically gauge-equivalent. Switching the example's private state is a comparison between fibers' members, not a replay of OPH repair dynamics.

## 4. Conjecture dispositions

The accompanying `oph-v7-conjecture-dispositions.json` is the machine-readable citation and disposition overlay. It points to the existing register; it is not a second authority.

- **C9 — boundary sufficiency (25%, active):** direct methodological reference. Add the public-result/private-state distinction and the obligation to define the boundary map, task quotient, composition rule and informed privacy bound. No promotion: no map from OPH geometry to the agentprivacy boundary has been constructed.
- **C16 — topological trust invariants (25%, active):** OPH's local/global consistency and obstruction discussion suggests a candidate test setting. Betti numbers alone do not encode authorization, issuer trust, or honest behaviour. Supply an actual mapping and trust-sensitive counterexamples before claiming transfer.
- **C8 — compression lowers reconstruction (45%, active):** shared invariants motivate an experiment but do not establish lower leakage. Compare the same task under explicit priors and side information; lossless re-encoding cannot be treated as information destruction.
- **C15 — UOR resolution-pipeline correspondence (65%, active):** refinement and stable public readings offer a comparison target. No isomorphism or UOR/OPH correspondence is established.
- **C7 — multiplicative separation (30%, active):** OPH does not justify multiplying the three privacy factors or remove dependence between them.
- **C81 — existence-leak (~70%, active):** OPH normal-form feasibility and provenance are not a second empirical feasibility-leak instance. Its Stage-2 bar remains open.
- **C82 — moving ceiling (~65%, active):** the toy's accumulating background observations illustrate the information mechanism. They do not estimate the conjectural real-world rate. More computation alone is not treated as breaking an information-theoretic bound.
- **C93 — content-addressed liveness (~55%, active):** the existence and ancestry of a retained record are a relevant interface question; this is not an independently observed GUID-liveness leak.
- **C97 — non-reconstruction and ownability (architectural, active):** the example clarifies the non-reconstruction side under a finite prior. It supplies no market evidence for the economic reading.
- **C4, C5 and C6 — geometric and cost claims:** retain existing statuses. Twelve OPH ports, 64 binary strings, and the agentprivacy 96-edge account do not establish a shared construction or any ZK cost reduction.
- **C13 and C67–C71 — quantum-resistance/Horizon claims:** retain existing statuses. OPH's finite quantum and physics results supply no demonstrated cryptanalytic capability or horizon revision.

The geometric, information-theoretic, economic and empirical readings remain distinct. Other conjectures receive no change from this source. Historical V4/V5 bodies and pinned narrative editions retain their era wording; current projections should read the register and this overlay.

## 5. Atlas prototypes and integration contract

### A. Observer access

Switch the selected reader; show records it directly holds in solid lines and additional logical deductions in dashed lines. Keep unavailable values hidden in the ordinary observer view. A separately labelled analyst overlay may reveal the complete synthetic state for teaching; it is never a privacy enforcement mechanism. Show accessible records separately from candidate-state counts. Record dependencies are illustrative, not claims that a causal parent automatically grants access to its contents. Inspiration: OPH's accessible-past scene. [OPH3]

### B. Shared result, different private states

Display the exact candidate set for the current disclosures. Let the reader select another compatible state and verify that the public parity and already disclosed bits remain unchanged. Display candidate count, conditional entropy and guessing probability, always with the finite uniform-prior label. Toggle a combined observer and add background coordinates to see the set shrink. Inspiration: OPH's comparison between terminal configurations and their common quotient. Their actual scene reports sampled global-histogram agreement, not universal portwise identity. [OPH4]

### C. Guided route

Use five steps: private state → scoped disclosure → public verification → delegation → later inference. Each step names input, operation, output, assumption and reference. Finish on the same inference experiment so the narrative has an observable consequence. The learning layout is adapted from OPH Learn; the lesson content and interface code here are newly authored. [OPH5–6]

### Production boundary

The supplied prototype is a local, deterministic teaching tool containing all 64 synthetic states. Browser hiding is not access control. A real atlas adapter must receive only an authorized projection; raw private state and unavailable record payloads must never be shipped to an unauthorized client. A production dataset must declare the principal, policy, provenance visibility, disclosure closure and reference status. Navigation edges in the knowledge graph are relationships between ideas, not permission grants.

No ports-to-lattice animation or physics-derived privacy claim is included. Original functional geometry and UI are used; no OPH code, illustrations or PDF text are copied into the prototype. Attribution does not replace checking the upstream per-directory license if future reuse includes actual source or artwork. [OPH8]

## 6. Acceptance and falsification work

1. Enumerate all 64 states for every observer, coalition toggle and background mask; compare UI counts with the exact compatible-state filter. Test the parity-implied final bit and the zero-background baseline.
2. Verify that changing only the chosen compatible private state preserves all disclosed values and the public task result.
3. Exhibit a public-task counterexample: take F(X)=x₀ but B(X)=parity(X). The fiber contains different x₀ values, so this B is not sufficient for that F. Sufficiency is task-relative.
4. Exhibit a privacy counterexample: let background Z=X. Every fiber conditional on (B,Z) is a singleton even though parity alone had 32 candidates. Alternatively, a skewed posterior can give near-certain guessing without singleton support.
5. Before a C9 promotion, instantiate the actual agentprivacy boundary, prove public task factorization and informed privacy bounds under composition, and test a failure case. Before C16 promotion, show that the proposed invariant distinguishes a relevant trust obstruction rather than merely an unlabeled topology.

The toy's checks establish its implementation, not the unconstructed cross-framework bridge. Numerical confidence figures in the register are inherited assessments, not probabilities computed from this example.

## 7. Required references

**OPH1 — principal technical reference.** Mueller, Bernhard; Osika, Alexander; Poneder, Mario; Xue, Kai; Cassie, Ben; Nguyen, Peter; Kim, Jinwook; Matscheko, David; Hill, Jonathan; Glynn, William T.; Visser, Maarten Antonie; Anirudha, Kale Arnav; and de La Fournière, Brieuc. *Finite Observer Consensus as a Reconstruction Principle: Normal Forms, the Standard Model Lie Type, and a Route to the Einstein Field Equation*. September 9, 2026, r2040. Supplied PDF; [landing record](https://philpapers.org/rec/MUEFOC). Cite §1 / Table 1 for epistemic classes; Definition 3.1 and Theorem 3.2, pp. 15–16, for observable fibers; pp. 16–18 for authenticated provenance. No completed masses, cosmology, or physical-truth guarantee is claimed at Boundary 1.1.

**OPH2 — deeper normal-form proofs.** Mueller, Bernhard; Kim, Jinwook; Matscheko, David; and Hill, Jonathan. *Observation-Determined Normal Forms: Stability, Obstructions, and Refinement in Constraint and Rewrite Systems*. 2026, public manuscript. [Companion PDF](https://github.com/FloatingPragma/observer-patch-holography/blob/main/extra/observable_normal_forms.pdf). Identified through OPH1 reference 5; not independently audited in this intake.

**OPH3 — observer-access visual.** FloatingPragma. [See what one record can access](https://simulation.floatingpragma.io/spacetime?scene=observer-history). Inspected September 11, 2026. The viewer reconstructs ancestry from retained logs; the local summed register alone does not encode it.

**OPH4 — agreement visual.** FloatingPragma. [What different repair orders agree on](https://simulation.floatingpragma.io/agreement?scene=normal-forms). Inspected September 11, 2026. Sampled endpoint quotient agreement; the crossfade is not intermediate trajectory evidence.

**OPH5–6 — educational structure.** Pragma Research. *The OPH Machine*: [Introduction & The Big Picture](https://learn.floatingpragma.io/book/machine/chapter/0) and [Chapter 9: The Consensus Protocol](https://learn.floatingpragma.io/book/machine/chapter/9). Inspected September 11, 2026. Pedagogical sources; defer to the technical paper where scope differs. In particular, a decreasing nonnegative real quantity alone does not guarantee finite termination without well-foundedness or another termination premise.

**OPH7 — consensus companion.** Mueller, Bernhard; Xue, Kai; Kim, Jinwook; Anirudha, Kale Arnav; Matscheko, David; and Hill, Jonathan. *Reality as a Consensus Protocol: The Fixed-Point Computation That Implements Physics*. 2026. [Companion manuscript](https://github.com/FloatingPragma/observer-patch-holography/blob/main/paper/reality_as_consensus_protocol.pdf), identified through OPH1 reference 7. No independent full-proof audit here.

**OPH8 — source and licensing.** [Observer Patch Holography repository](https://github.com/FloatingPragma/observer-patch-holography/tree/621edbb2a56b388b3590a5c766a59bd9d2012a17). Snapshot September 11, 2026. [License map](https://github.com/FloatingPragma/observer-patch-holography/blob/621edbb2a56b388b3590a5c766a59bd9d2012a17/LICENSE). This revision identifies the inspected current repository, not byte identity with the supplied r2040 PDF.

**AP1 — formal privacy baseline.** privacymage / Mitchell Travers. *Privacy is Value · V6: The Gathering Turn and the Moving Ceiling*, formal specification, June 10, 2026 with subsequent local amendments. [Source](https://github.com/mitchuski/agentprivacy-docs/blob/main/papers/v6/privacy_value_v6_formal_specification.md). §§8, 10.3–11 and 17; local pre-edit hash recorded in the manifest.

**AP2 — conjecture authority.** *The Conjecture Register*, head C97, [source](https://github.com/mitchuski/agentprivacy-docs/blob/main/research/CONJECTURE_REGISTER_V6.md). Rows C7–C9, C15–C16, C81–C82, C93 and C97 govern the dispositions here. Do not substitute stale README summaries or atlas group confidence labels for individual rows.

**AP3 — existing external-reference precedent.** [UOR Atlas UTQC × PVM — Overlap Assessment](https://github.com/mitchuski/agentprivacy-docs/blob/main/research/uor-atlas-utqc-overlap.md), and [V6 convergence note](https://github.com/mitchuski/agentprivacy-docs/blob/main/research/uor-atlas-utqc-v6-note.md), 2026. Prior example of retaining useful mechanisms while separating unestablished quantum-computing claims. No identity between UOR and OPH is inferred.

**BG1 — distributed-order background.** Lamport, Leslie. “Time, Clocks, and the Ordering of Events in a Distributed System.” *Communications of the ACM* 21(7), 1978, pp. 558–565. [DOI](https://doi.org/10.1145/359545.359563). OPH1 reference 43; supports the distributed-computing comparison, not physical spacetime identification.

**BG2 — confluence background.** Newman, M. H. A. “On Theories with a Combinatorial Definition of Equivalence.” *Annals of Mathematics* 43(2), 1942, pp. 223–243. [DOI](https://doi.org/10.2307/1968867). OPH1 reference 46; relevant when termination and local confluence are actually supplied.
