# Halden Structural: discovery analysis

Prepared by R²XTECH. Sessions held 8 to 12 September 2026.

## The firm

- Structural engineering consultancy, 85 staff, two offices (Rotterdam and Eindhoven).
- Steel and concrete structures for logistics warehouses, light industrial buildings and mid-rise commercial projects.
- Most work comes through design-build contractors.
- Tools: Tekla Structures 2024 (steel modelling and drawings), SCIA Engineer (analysis), IDEA StatiCa (connection design and sign-off), Excel for everything in between.
- IT policy: project model data stays on premises. No cloud processing of project files.

## People we spoke to

- Maaike Okafor, engineering director
- Joost van Dijk, lead steel engineer, runs the connections team (6 engineers)
- Two junior engineers, one drafter, and the office BIM coordinator

## Findings

### F1. Connection checks are rebuilt by hand from the analysis model

A typical mid-size warehouse has about 1,400 steel connections. For each connection group an engineer exports member forces from SCIA to Excel, copies them into a check spreadsheet, picks the governing load case, and then re-enters geometry and forces in IDEA StatiCa for the joints that need a full check.

- Joost estimates connection work takes about 35% of the design hours on a steel project. Reported, not measured.
- The spreadsheets differ between the two offices. There are 3 versions of the base plate sheet in use.

### F2. A revision means redrawing, not regenerating

When the architect or the contractor issues a revision, the Tekla model is updated, but drawings, connection checks and schedules are brought back in line by hand.

- We measured one revision on the DC Tilburg project (21 August): 26 drawing sheets touched, 2 people, 3.5 working days.
- The internal check afterwards caught 4 inconsistencies between the drawings and the model.

### F3. Two people hold the method

The connection rules (which load case governs, when a joint goes to a full IDEA StatiCa check, which standard details apply) live mainly with Joost and one other senior engineer. Juniors cannot run the checks unsupervised yet, so both seniors review nearly everything.

### F4. Contractors want the IFC package faster

Two of their largest clients have asked for the steel IFC package in 4 weeks instead of the current 6.

## What they said

- "We are engineers doing data entry." (Maaike Okafor)
- "The model is right. It's everything around the model that goes stale." (Joost van Dijk)

## Constraints

- IDEA StatiCa stays for final connection sign-off; engineering liability sits there.
- On premises only: anything we build runs on their servers or workstations.
- Finance gave a loaded engineering rate of €68 per hour. Reported by finance.

## The program we have in mind

Working title: Connection Pipeline.

1. Read member forces and geometry straight from the SCIA and Tekla models.
2. Apply the firm's own connection rules to sort every joint: standard detail, simplified check, or full IDEA StatiCa check.
3. Push the full-check joints into IDEA StatiCa with geometry and forces pre-filled, for an engineer to review and sign.
4. Phase 2: regenerate the affected drawing sheets and schedules when a revision lands.

Pilot proposal: run it in parallel with their current process on one live warehouse project.

## Open questions

- Does their current IDEA StatiCa plan include API access?
- Can they share 3 completed warehouse projects to encode and test the rules against?
- Who owns and maintains the rules library after handover?
