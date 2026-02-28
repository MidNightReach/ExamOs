import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, BookOpen, FlaskConical, Sigma } from "lucide-react";
import { motion } from "motion/react";

interface MaterialSection {
  id: string;
  title: string;
  tag?: string;
  formulas?: string[];
  highWeightage?: string[];
  mistakes?: string[];
  reactions?: string[];
  namedReactions?: string[];
  trends?: string[];
  identities?: string[];
  problemTypes?: string[];
}

const PHYSICS_SECTIONS: MaterialSection[] = [
  {
    id: "kinematics",
    title: "Kinematics",
    tag: "High Weightage",
    formulas: [
      "v = u + at",
      "s = ut + ½at²",
      "v² = u² + 2as",
      "s_nth = u + a(2n−1)/2",
      "Projectile range: R = u²sin2θ/g",
      "Max height: H = u²sin²θ/2g",
    ],
    highWeightage: [
      "Relative velocity problems",
      "Projectile motion with constraints",
      "Non-uniform acceleration (integration)",
    ],
    mistakes: [
      "Forgetting that displacement can be negative",
      "Confusing average velocity with instantaneous velocity",
      "Using v=u+at when acceleration changes",
    ],
  },
  {
    id: "rotational",
    title: "Rotational Motion",
    tag: "Very High Weightage",
    formulas: [
      "τ = Iα = r × F",
      "L = Iω (angular momentum)",
      "I_rod (center) = ML²/12, I_rod (end) = ML²/3",
      "I_disk = MR²/2, I_sphere = 2MR²/5",
      "Rolling: v_cm = Rω, KE_total = ½Mv² + ½Iω²",
      "Parallel axis: I = I_cm + Md²",
    ],
    highWeightage: [
      "Rolling without slipping on inclined planes",
      "Angular momentum conservation",
      "Combined rotation + translation",
    ],
    mistakes: [
      "Wrong moment of inertia for composite bodies",
      "Forgetting to apply parallel axis theorem",
      "Sign convention for torque direction",
    ],
  },
  {
    id: "electrostatics",
    title: "Electrostatics",
    tag: "High Weightage",
    formulas: [
      "F = kq₁q₂/r² (Coulomb's law)",
      "E = kq/r² (point charge field)",
      "V = kq/r (potential)",
      "C = Q/V, C_parallel = C₁+C₂, 1/C_series = 1/C₁+1/C₂",
      "Energy stored: U = ½CV² = Q²/2C",
      "σ = ε₀E (surface charge density)",
    ],
    highWeightage: [
      "Electric field due to charge distributions",
      "Potential energy in systems",
      "Capacitor with dielectric",
    ],
    mistakes: [
      "Confusing electric potential with potential energy",
      "Forgetting signs in superposition",
      "Not using ε₀ vs k correctly",
    ],
  },
  {
    id: "current",
    title: "Current Electricity",
    tag: "Very High Weightage",
    formulas: [
      "V = IR (Ohm's Law)",
      "P = VI = I²R = V²/R",
      "Series: R = R₁+R₂+..., 1/R_parallel = 1/R₁+1/R₂",
      "Kirchhoff: ΣI = 0 (junction), ΣV = 0 (loop)",
      "EMF: ε = V + Ir (terminal voltage)",
      "Wheatstone bridge: P/Q = R/S (balanced)",
    ],
    highWeightage: [
      "Complex network with Kirchhoff's laws",
      "Meter bridge / Wheatstone bridge",
      "Battery combinations (series/parallel)",
    ],
    mistakes: [
      "Sign errors in Kirchhoff's loop law",
      "Forgetting internal resistance in EMF problems",
      "Treating ammeter/voltmeter as ideal when they're not",
    ],
  },
  {
    id: "modern-physics",
    title: "Modern Physics",
    tag: "High Weightage",
    formulas: [
      "E = hf = hc/λ (photon energy)",
      "λ = h/mv (de Broglie wavelength)",
      "E = mc² (mass-energy equivalence)",
      "Photoelectric: KE_max = hf − φ",
      "Bohr orbit: rₙ = 0.529n² Å",
      "Energy level: Eₙ = −13.6/n² eV",
    ],
    highWeightage: [
      "Photoelectric effect calculations",
      "Nuclear decay (α, β, γ)",
      "Hydrogen spectrum lines",
    ],
    mistakes: [
      "Unit errors in nuclear mass-energy problems",
      "Confusing frequency with wavelength in energy calc",
      "Wrong quantum numbers in Bohr model",
    ],
  },
  {
    id: "waves",
    title: "Waves & Oscillations",
    tag: "Medium Weightage",
    formulas: [
      "T = 2π√(l/g) (simple pendulum)",
      "T = 2π√(m/k) (spring-mass)",
      "v = fλ (wave equation)",
      "Standing waves: λ = 2L/n",
      "Doppler: f' = f(v±v_o)/(v∓v_s)",
      "Beat frequency: |f₁ − f₂|",
    ],
    highWeightage: [
      "Resonance in strings and pipes",
      "SHM energy and velocity",
      "Superposition and interference",
    ],
    mistakes: [
      "Phase difference vs path difference confusion",
      "Wrong boundary condition for open/closed pipe",
      "Sign in Doppler formula when source/observer move",
    ],
  },
  {
    id: "thermodynamics",
    title: "Thermodynamics",
    tag: "High Weightage",
    formulas: [
      "ΔU = Q − W (First Law)",
      "PV = nRT (Ideal Gas Law)",
      "W_isothermal = nRT·ln(V₂/V₁)",
      "W_adiabatic = (P₁V₁ − P₂V₂)/(γ−1)",
      "η_Carnot = 1 − T_cold/T_hot",
      "Cp − Cv = R, γ = Cp/Cv",
    ],
    highWeightage: [
      "PV diagrams and work calculations",
      "Carnot cycle efficiency",
      "Adiabatic process problems",
    ],
    mistakes: [
      "Sign of work (W done by vs on gas)",
      "Forgetting γ in adiabatic relations",
      "Confusing Cp and Cv for monoatomic/diatomic gas",
    ],
  },
];

const CHEMISTRY_SECTIONS: MaterialSection[] = [
  {
    id: "equilibrium",
    title: "Chemical Equilibrium",
    tag: "High Weightage",
    formulas: [
      "Kc = [products]^coeff / [reactants]^coeff",
      "Kp = Kc(RT)^Δn",
      "Q < K → forward; Q > K → backward",
      "pH = −log[H⁺]; pOH = −log[OH⁻]",
      "Ka × Kb = Kw = 10⁻¹⁴ at 25°C",
    ],
    highWeightage: [
      "Le Chatelier's principle application",
      "Buffer solutions (Henderson-Hasselbalch)",
      "Solubility product (Ksp) problems",
    ],
    mistakes: [
      "Including solids/liquids in Kc expression",
      "Wrong direction of shift on pressure change",
      "Confusing degree of dissociation with Ka",
    ],
  },
  {
    id: "electrochemistry",
    title: "Electrochemistry",
    tag: "Very High Weightage",
    formulas: [
      "E°cell = E°cathode − E°anode",
      "Nernst: E = E° − (RT/nF)·ln(Q)",
      "ΔG° = −nFE°cell",
      "Faraday: m = (M/nF)·Q = (M/nF)·It",
      "Conductance = 1/Resistance",
      "Λm = κ/c (molar conductance)",
    ],
    highWeightage: [
      "Cell potential calculations",
      "Electrolysis quantitative problems",
      "Kohlrausch's law and limiting molar conductance",
    ],
    reactions: [
      "Cathode: reduction (gain electrons)",
      "Anode: oxidation (lose electrons)",
      "Daniel cell: Zn|ZnSO₄||CuSO₄|Cu",
      "SHE: H₂ → 2H⁺ + 2e⁻ (E° = 0 V)",
    ],
    mistakes: [
      "Confusing cathode/anode in electrolytic vs galvanic",
      "Forgetting to multiply E by moles in ΔG",
      "Units: F = 96500 C/mol",
    ],
  },
  {
    id: "kinetics",
    title: "Chemical Kinetics",
    tag: "High Weightage",
    formulas: [
      "rate = k[A]^m[B]^n",
      "First order: ln[A] = ln[A₀] − kt",
      "Half-life (1st order): t₁/₂ = 0.693/k",
      "Arrhenius: k = Ae^(−Ea/RT)",
      "ln(k₂/k₁) = (Ea/R)(1/T₁ − 1/T₂)",
    ],
    highWeightage: [
      "Determining rate law from data",
      "Integrated rate equations",
      "Temperature effect on rate",
    ],
    mistakes: [
      "Rate order ≠ stoichiometric coefficient (unless elementary)",
      "Forgetting units of rate constant vary with order",
      "Misapplying pseudo-first-order conditions",
    ],
  },
  {
    id: "coordination",
    title: "Coordination Compounds",
    tag: "High Weightage",
    formulas: [
      "Effective Atomic Number (EAN) = Z − oxidation state + 2×CN",
      "Crystal field stabilization energy (CFSE) in units of Δo",
      "Strong field ligands: CN⁻ > NO₂⁻ > en > NH₃ > H₂O > OH⁻ > X⁻",
    ],
    highWeightage: [
      "IUPAC naming of coordination compounds",
      "Isomerism types (geometric, optical, linkage)",
      "Crystal field theory and color",
    ],
    reactions: [
      "Ligands: monodentate, bidentate, polydentate",
      "Werner's theory: primary vs secondary valence",
      "Chelate effect: stability enhancement",
      "Trans effect: I⁻ > CN⁻ > NO₂⁻ > Br⁻ > Cl⁻ > NH₃",
    ],
    mistakes: [
      "Wrong oxidation state assignment in complex",
      "Confusing geometric and optical isomerism",
      "Forgetting charge balance in complex formula",
    ],
  },
  {
    id: "organic-reactions",
    title: "Organic Named Reactions",
    tag: "Very High Weightage",
    reactions: [
      "Aldol condensation: aldehyde + α-H → β-hydroxy carbonyl",
      "Cannizzaro reaction: no α-H aldehyde → alcohol + acid (disproportionation)",
      "Diels-Alder: conjugated diene + dienophile → cyclohexene (pericyclic)",
      "SN1: carbocation intermediate, racemization, tertiary substrates",
      "SN2: backside attack, inversion of configuration, primary substrates",
      "E1: carbocation → elimination (same conditions as SN1)",
      "E2: bimolecular, anti-periplanar, strong base required",
      "Reimer-Tiemann: phenol + CHCl₃/NaOH → salicylaldehyde",
      "Kolbe's reaction: sodium phenoxide + CO₂ → salicylic acid",
      "Friedel-Crafts: ArH + RCl/AlCl₃ → ArR or ArCOR",
    ],
    mistakes: [
      "SN1/SN2 selectivity with secondary substrates depends on solvent",
      "Aldol needs α-hydrogen — don't apply to HCHO or (CH₃)₃CCHO",
      "Diels-Alder requires s-cis conformation of diene",
    ],
  },
  {
    id: "inorganic",
    title: "Inorganic Trends",
    tag: "High Weightage",
    trends: [
      "Atomic radius: increases ↓ group, decreases → period",
      "Ionization energy: decreases ↓ group, increases → period (exceptions: Be>B, N>O)",
      "Electron affinity: Cl > F (anomaly due to small size of F)",
      "Electronegativity: increases → period, decreases ↓ group; F is highest",
      "Metallic character: increases ↓ group, decreases → period",
      "Oxidizing power: F > Cl > Br > I",
      "Acidity of oxoacids: increases with more O atoms (HClO < HClO₂ < HClO₃ < HClO₄)",
      "p-block: inert pair effect, diagonal relationship (Li-Mg, Be-Al, B-Si)",
      "d-block: similar radii in same period, variable oxidation states",
    ],
    mistakes: [
      "Forgetting IE exceptions: Be>B and N>O",
      "Confusing thermal stability and oxidizing power of oxides",
      "Lanthanoid contraction effect on 5d elements",
    ],
  },
];

const MATHS_SECTIONS: MaterialSection[] = [
  {
    id: "derivatives",
    title: "Calculus — Derivatives",
    tag: "Very High Weightage",
    formulas: [
      "d/dx(xⁿ) = nxⁿ⁻¹",
      "d/dx(eˣ) = eˣ, d/dx(aˣ) = aˣ·ln a",
      "d/dx(ln x) = 1/x",
      "d/dx(sin x) = cos x, d/dx(cos x) = −sin x",
      "d/dx(tan x) = sec²x, d/dx(cot x) = −csc²x",
      "Chain rule: d/dx[f(g(x))] = f'(g(x))·g'(x)",
      "Product rule: (uv)' = u'v + uv'",
      "Quotient rule: (u/v)' = (u'v − uv')/v²",
    ],
    highWeightage: [
      "Maxima and minima using first/second derivative test",
      "Rolle's theorem and LMVT",
      "Implicit differentiation",
    ],
    problemTypes: [
      "Find critical points, classify as max/min/saddle",
      "Increasing/decreasing intervals",
      "Rate of change problems",
      "Tangent and normal equations",
    ],
  },
  {
    id: "integrals",
    title: "Calculus — Integrals",
    tag: "Very High Weightage",
    formulas: [
      "∫xⁿdx = xⁿ⁺¹/(n+1) + C (n ≠ −1)",
      "∫eˣdx = eˣ + C, ∫aˣdx = aˣ/ln a + C",
      "∫(1/x)dx = ln|x| + C",
      "∫sin x dx = −cos x + C, ∫cos x dx = sin x + C",
      "∫sec²x dx = tan x + C",
      "Integration by parts: ∫u·dv = uv − ∫v·du (ILATE rule)",
      "∫₀^a f(x)dx = ∫₀^a f(a−x)dx (King's rule)",
    ],
    highWeightage: [
      "Definite integrals using properties",
      "Area under curve / between curves",
      "Integration by substitution",
    ],
    problemTypes: [
      "Standard forms with partial fractions",
      "Trigonometric substitutions",
      "Reduction formulae",
      "Application to area between curves",
    ],
  },
  {
    id: "conics",
    title: "Conic Sections",
    tag: "High Weightage",
    formulas: [
      "Circle: (x−h)² + (y−k)² = r²",
      "Parabola: y² = 4ax (focus: (a,0), directrix: x = −a)",
      "Ellipse: x²/a² + y²/b² = 1 (a>b), b² = a²(1−e²)",
      "Hyperbola: x²/a² − y²/b² = 1, b² = a²(e²−1)",
      "Eccentricity: e<1 ellipse, e=1 parabola, e>1 hyperbola",
      "Tangent to parabola: ty = x + at² (parametric)",
    ],
    highWeightage: [
      "Tangent and normal conditions",
      "Chord of contact: T = 0",
      "Intersection of conics",
    ],
    problemTypes: [
      "Finding focus, directrix, latus rectum",
      "Tangent at a point (both slope and parametric form)",
      "Chord bisected at a given point",
      "Normals and their conditions",
    ],
  },
  {
    id: "3d-geometry",
    title: "3D Geometry",
    tag: "High Weightage",
    formulas: [
      "Distance: √[(x₂−x₁)² + (y₂−y₁)² + (z₂−z₁)²]",
      "Direction cosines: l²+m²+n² = 1",
      "Line: (x−x₁)/a = (y−y₁)/b = (z−z₁)/c",
      "Plane: ax+by+cz+d = 0",
      "Angle between lines: cos θ = |l₁l₂+m₁m₂+n₁n₂|",
      "Distance from point to plane: |ax₀+by₀+cz₀+d|/√(a²+b²+c²)",
    ],
    highWeightage: [
      "Skew lines (shortest distance)",
      "Plane through intersection of two planes",
      "Foot of perpendicular from point to line/plane",
    ],
    problemTypes: [
      "Find equation of plane given 3 points",
      "Angle between line and plane",
      "Image of point in plane",
      "Coplanarity of lines",
    ],
  },
  {
    id: "probability",
    title: "Probability",
    tag: "High Weightage",
    formulas: [
      "P(A∪B) = P(A) + P(B) − P(A∩B)",
      "P(A|B) = P(A∩B)/P(B)",
      "Bayes' theorem: P(Aᵢ|B) = P(Aᵢ)·P(B|Aᵢ)/ΣP(Aⱼ)·P(B|Aⱼ)",
      "Binomial: P(X=r) = ⁿCᵣ·pʳ·(1-p)^(n-r)",
      "Mean of Binomial: np, Variance: npq",
      "Poisson: P(X=k) = e^(−λ)·λᵏ/k!",
    ],
    highWeightage: [
      "Conditional probability",
      "Total probability theorem",
      "Binomial distribution mean/variance",
    ],
    problemTypes: [
      "Card/dice/ball drawing (with/without replacement)",
      "Tree diagram problems",
      "Binomial approximation",
      "Expected value calculations",
    ],
  },
  {
    id: "vectors",
    title: "Vectors",
    tag: "High Weightage",
    formulas: [
      "Dot product: a·b = |a||b|cos θ = a₁b₁+a₂b₂+a₃b₃",
      "Cross product: |a×b| = |a||b|sin θ (direction by right-hand rule)",
      "Scalar triple product: [a b c] = a·(b×c) = det[a b c]",
      "Vector projection: (a·b̂)b̂",
      "Area of triangle = ½|AB×AC|",
      "Coplanar vectors: [a b c] = 0",
    ],
    highWeightage: [
      "Vector equations of line and plane",
      "Scalar triple product for volume",
      "Linear independence of vectors",
    ],
    problemTypes: [
      "Finding angle between two lines using direction vectors",
      "Distance between skew lines",
      "Vector equation of plane (normal + point form)",
      "Checking coplanarity",
    ],
  },
];

const PRIMARY = "oklch(0.72 0.17 195)";
const PHYSICS_COLOR = "oklch(0.65 0.18 240)";
const CHEM_COLOR = "oklch(0.65 0.18 145)";
const MATHS_COLOR = "oklch(0.70 0.17 60)";

function TagBadge({ tag }: { tag?: string }) {
  if (!tag) return null;
  const isHigh = tag.toLowerCase().includes("high");
  const isVery = tag.toLowerCase().includes("very");
  return (
    <span
      className="text-[10px] font-display font-bold px-1.5 py-0.5 rounded ml-2"
      style={{
        background: isVery
          ? "oklch(0.65 0.23 25 / 0.15)"
          : isHigh
            ? "oklch(0.72 0.17 60 / 0.12)"
            : "oklch(0.72 0.17 195 / 0.1)",
        color: isVery
          ? "oklch(0.65 0.23 25)"
          : isHigh
            ? "oklch(0.72 0.17 60)"
            : PRIMARY,
      }}
    >
      {tag}
    </span>
  );
}

function SectionContent({ section }: { section: MaterialSection }) {
  return (
    <div className="space-y-4 pt-1">
      {section.formulas && section.formulas.length > 0 && (
        <div>
          <h4
            className="text-xs font-display font-semibold uppercase tracking-wider mb-2"
            style={{ color: PRIMARY }}
          >
            Key Formulas
          </h4>
          <div className="space-y-1.5">
            {section.formulas.map((f) => (
              <div
                key={f}
                className="font-mono text-xs px-3 py-2 rounded-lg"
                style={{
                  background: "oklch(0.72 0.17 195 / 0.06)",
                  border: "1px solid oklch(0.72 0.17 195 / 0.12)",
                  color: "oklch(0.82 0.01 250)",
                }}
              >
                {f}
              </div>
            ))}
          </div>
        </div>
      )}

      {section.reactions && section.reactions.length > 0 && (
        <div>
          <h4
            className="text-xs font-display font-semibold uppercase tracking-wider mb-2"
            style={{ color: CHEM_COLOR }}
          >
            Reactions & Rules
          </h4>
          <ul className="space-y-1.5">
            {section.reactions.map((r) => (
              <li
                key={r}
                className="text-xs font-body pl-3 py-1"
                style={{
                  color: "oklch(0.72 0.012 250)",
                  borderLeft: `2px solid ${CHEM_COLOR}`,
                }}
              >
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {section.trends && section.trends.length > 0 && (
        <div>
          <h4
            className="text-xs font-display font-semibold uppercase tracking-wider mb-2"
            style={{ color: CHEM_COLOR }}
          >
            Periodic Trends
          </h4>
          <ul className="space-y-1.5">
            {section.trends.map((t) => (
              <li
                key={t}
                className="text-xs font-body pl-3 py-1"
                style={{
                  color: "oklch(0.72 0.012 250)",
                  borderLeft: "2px solid oklch(0.65 0.18 145 / 0.4)",
                }}
              >
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}

      {section.namedReactions && section.namedReactions.length > 0 && (
        <div>
          <h4
            className="text-xs font-display font-semibold uppercase tracking-wider mb-2"
            style={{ color: CHEM_COLOR }}
          >
            Named Reactions
          </h4>
          <ul className="space-y-1">
            {section.namedReactions.map((r) => (
              <li
                key={r}
                className="text-xs font-body"
                style={{ color: "oklch(0.68 0.012 250)" }}
              >
                • {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {section.highWeightage && section.highWeightage.length > 0 && (
        <div>
          <h4
            className="text-xs font-display font-semibold uppercase tracking-wider mb-2"
            style={{ color: "oklch(0.72 0.17 60)" }}
          >
            High-Weightage Topics
          </h4>
          <ul className="space-y-1">
            {section.highWeightage.map((h) => (
              <li
                key={h}
                className="text-xs font-body flex items-start gap-2"
                style={{ color: "oklch(0.68 0.012 250)" }}
              >
                <span style={{ color: "oklch(0.72 0.17 60)" }}>▸</span>
                {h}
              </li>
            ))}
          </ul>
        </div>
      )}

      {section.identities && section.identities.length > 0 && (
        <div>
          <h4
            className="text-xs font-display font-semibold uppercase tracking-wider mb-2"
            style={{ color: MATHS_COLOR }}
          >
            Key Identities
          </h4>
          <div className="space-y-1.5">
            {section.identities.map((i) => (
              <div
                key={i}
                className="font-mono text-xs px-3 py-2 rounded-lg"
                style={{
                  background: "oklch(0.70 0.17 60 / 0.06)",
                  border: "1px solid oklch(0.70 0.17 60 / 0.15)",
                  color: "oklch(0.80 0.01 250)",
                }}
              >
                {i}
              </div>
            ))}
          </div>
        </div>
      )}

      {section.problemTypes && section.problemTypes.length > 0 && (
        <div>
          <h4
            className="text-xs font-display font-semibold uppercase tracking-wider mb-2"
            style={{ color: MATHS_COLOR }}
          >
            Standard Problem Types
          </h4>
          <ul className="space-y-1">
            {section.problemTypes.map((p) => (
              <li
                key={p}
                className="text-xs font-body flex items-start gap-2"
                style={{ color: "oklch(0.68 0.012 250)" }}
              >
                <span style={{ color: MATHS_COLOR }}>→</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {section.mistakes && section.mistakes.length > 0 && (
        <div>
          <h4
            className="text-xs font-display font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5"
            style={{ color: "oklch(0.65 0.23 25)" }}
          >
            <AlertCircle className="w-3 h-3" />
            Common Mistakes
          </h4>
          <ul className="space-y-1">
            {section.mistakes.map((m) => (
              <li
                key={m}
                className="text-xs font-body flex items-start gap-2"
                style={{ color: "oklch(0.65 0.012 250)" }}
              >
                <span style={{ color: "oklch(0.65 0.23 25 / 0.7)" }}>✗</span>
                {m}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function SubjectSection({
  sections,
}: {
  sections: MaterialSection[];
  accentColor?: string;
}) {
  return (
    <Accordion type="multiple" className="space-y-2">
      {sections.map((section) => (
        <AccordionItem
          key={section.id}
          value={section.id}
          className="rounded-xl overflow-hidden border-0"
          style={{
            background: "oklch(0.16 0.018 250)",
            border: "1px solid oklch(0.24 0.02 250)",
          }}
        >
          <AccordionTrigger
            className="px-5 py-4 hover:no-underline hover:bg-secondary/20"
            style={{ border: "none" }}
          >
            <div className="flex items-center gap-2">
              <span
                className="font-display font-semibold text-sm"
                style={{ color: "oklch(0.88 0.01 250)" }}
              >
                {section.title}
              </span>
              <TagBadge tag={section.tag} />
            </div>
          </AccordionTrigger>
          <AccordionContent
            className="px-5 pb-5"
            style={{ borderTop: "1px solid oklch(0.22 0.02 250)" }}
          >
            <SectionContent section={section} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export default function MaterialsPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="max-w-3xl space-y-5"
    >
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <BookOpen className="w-5 h-5" style={{ color: PRIMARY }} />
          <h1
            className="font-display font-bold text-xl"
            style={{ color: "oklch(0.92 0.01 250)", letterSpacing: "-0.02em" }}
          >
            JEE Materials
          </h1>
        </div>
        <p
          className="text-xs font-body"
          style={{ color: "oklch(0.50 0.012 250)" }}
        >
          Formulas, named reactions, key concepts — organized by chapter
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="physics" className="w-full">
        <TabsList
          className="mb-5 p-1 h-auto gap-1"
          style={{
            background: "oklch(0.16 0.018 250)",
            border: "1px solid oklch(0.24 0.02 250)",
          }}
        >
          <TabsTrigger
            value="physics"
            className="flex items-center gap-1.5 font-display font-semibold text-xs px-4 py-2 rounded-lg data-[state=active]:text-foreground"
            style={{}}
          >
            <FlaskConical
              className="w-3.5 h-3.5"
              style={{ color: PHYSICS_COLOR }}
            />
            Physics
          </TabsTrigger>
          <TabsTrigger
            value="chemistry"
            className="flex items-center gap-1.5 font-display font-semibold text-xs px-4 py-2 rounded-lg"
          >
            <FlaskConical
              className="w-3.5 h-3.5"
              style={{ color: CHEM_COLOR }}
            />
            Chemistry
          </TabsTrigger>
          <TabsTrigger
            value="maths"
            className="flex items-center gap-1.5 font-display font-semibold text-xs px-4 py-2 rounded-lg"
          >
            <Sigma className="w-3.5 h-3.5" style={{ color: MATHS_COLOR }} />
            Maths
          </TabsTrigger>
        </TabsList>

        <TabsContent value="physics">
          <SubjectSection
            sections={PHYSICS_SECTIONS}
            accentColor={PHYSICS_COLOR}
          />
        </TabsContent>

        <TabsContent value="chemistry">
          <SubjectSection
            sections={CHEMISTRY_SECTIONS}
            accentColor={CHEM_COLOR}
          />
        </TabsContent>

        <TabsContent value="maths">
          <SubjectSection sections={MATHS_SECTIONS} accentColor={MATHS_COLOR} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
