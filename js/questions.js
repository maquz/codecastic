/**
 * CodeCastic - Ghana Education Service (GES) Promotion Exam Question Bank
 * Contains 15 realistic, high-level multiple-choice questions categorized across 
 * official GES promotion ranks:
 * - Assistant Director II (AD II)
 * - Assistant Director I (AD I)
 * - Deputy Director (DD)
 * - Director II (Dir II)
 */

var DEFAULT_QUESTIONS = [
  // ==================== ASSISTANT DIRECTOR II (AD II) ====================
  {
    id: "ges_ad2_01",
    level: "AD_II",
    levelName: "Assistant Director II",
    category: "Educational Law & Regulatory Framework",
    q: "Under the Education Regulatory Bodies Act, 2020 (Act 1023), which body is legally empowered to register and license professional teachers in Ghana?",
    options: [
      "National Council for Curriculum and Assessment (NaCCA)",
      "National Teaching Council (NTC)",
      "National Inspectorate Authority (NIA)",
      "Ghana Education Service Council (GESC)"
    ],
    correct: 1,
    explanation: "Act 1023 established the National Teaching Council (NTC) as the statutory mandate body responsible for regulating the teaching profession, registering teachers, and issuing professional teaching licenses in Ghana."
  },
  {
    id: "ges_ad2_02",
    level: "AD_II",
    levelName: "Assistant Director II",
    category: "Curriculum & Pedagogy",
    q: "What is the primary focus of the Standards-Based Curriculum introduced by NaCCA for Ghanaian basic schools?",
    options: [
      "Memorization of core textbook content for national ranking",
      "Shift from rote learning to competency-based learning emphasizing critical thinking and problem-solving",
      "Replacing formative classroom assessments entirely with end-of-year external exams",
      "Eliminating continuous professional development for teachers"
    ],
    correct: 1,
    explanation: "The NaCCA Standards-Based Curriculum shifts instruction from rote learning (chew and pour) toward competency development, critical thinking, creativity, collaboration, and national values."
  },
  {
    id: "ges_ad2_03",
    level: "AD_II",
    levelName: "Assistant Director II",
    category: "School Management & Administration",
    q: "According to GES administrative procedures, what is the primary objective of conducting regular School Performance Appraisal Meetings (SPAM)?",
    options: [
      "To audit and confiscate unspent PTA funds",
      "To bring community stakeholders together to review academic progress and agree on actionable remediation strategies",
      "To issue formal query letters to underperforming teaching staff",
      "To determine which teachers qualify for immediate transfer"
    ],
    correct: 1,
    explanation: "SPAM is a participatory platform bringing headteachers, teachers, parents (SMC/PTA), and community leaders together to analyze school performance metrics and craft collective intervention plans."
  },
  {
    id: "ges_ad2_04",
    level: "AD_II",
    levelName: "Assistant Director II",
    category: "Code of Conduct & Ethics",
    q: "A teacher absenting themselves from duty without permission for 10 consecutive working days is liable to which sanction under the GES Code of Ethics?",
    options: "Under the GES Code of Conduct for Staff, unauthorized absence from duty for 10 consecutive working days constitutes abandonment of post, resulting in summary dismissal or removal from payroll after due process.",
    options: [
      "Written warning letter only",
      "Forfeiture of one month's allowance",
      "Summary dismissal or removal from the GES payroll for abandonment of post",
      "Compulsory transfer to a remote school district"
    ],
    correct: 2,
    explanation: "Under the GES Code of Conduct, an employee who absents themselves from work without approved leave for 10 consecutive working days is deemed to have abandoned their post, forfeiting their appointment."
  },

  // ==================== ASSISTANT DIRECTOR I (AD I) ====================
  {
    id: "ges_ad1_01",
    level: "AD_I",
    levelName: "Assistant Director I",
    category: "Educational Law & Regulatory Framework",
    q: "Under the Public Financial Management Act, 2016 (Act 921), who serves as the Covered Entity Head personally accountable for public funds in a Senior High School?",
    options: [
      "The Assistant Headmaster (Academic)",
      "The Headmaster / Headmistress",
      "The School Accountant or Bursar",
      "The Chairman of the Board of Governors"
    ],
    correct: 1,
    explanation: "Act 921 designates the Head of a Covered Entity (the Headmaster/Headmistress in a school setting) as the chief accounting officer personally responsible for financial management, budget execution, and asset protection."
  },
  {
    id: "ges_ad1_02",
    level: "AD_I",
    levelName: "Assistant Director I",
    category: "Staff Assessment & Supervision",
    q: "In the GES Staff Performance Appraisal System (SPAS), what is required before an adverse performance rating can be formally submitted against an officer?",
    options: [
      "Immediate recommendation for salary stoppage",
      "Evidence of prior mid-year review feedback, clear performance targets set, and documented support or training provided",
      "Verbal reprimand delivered during a general staff meeting",
      "Unilateral decision made by the District Human Resource Officer without employee signature"
    ],
    correct: 1,
    explanation: "Natural justice and SPAS regulations stipulate that an officer must be given clear targets, mid-period review feedback, and opportunity for improvement before any negative appraisal report is finalized."
  },
  {
    id: "ges_ad1_03",
    level: "AD_I",
    levelName: "Assistant Director I",
    category: "Financial Management & Procurement",
    q: "According to the Public Procurement Act, 2003 (Act 663 as amended by Act 914), what is the threshold requirement for engaging Sole Sourcing procurement method in a GES institution?",
    options: [
      "Whenever the Headmaster prefers a specific local vendor",
      "Only under catastrophic emergencies, extreme urgency, or where goods/services are available from a single sole supplier, subject to Public Procurement Authority (PPA) approval",
      "For any purchase below GH¢ 50,000",
      "When the PTA votes unanimously to bypass public tender"
    ],
    correct: 1,
    explanation: "Sole sourcing is strictly restricted under Act 663/914 to exceptional circumstances (catastrophic emergencies, exclusive rights/single provider) and requires prior statutory approval from the PPA Board."
  },
  {
    id: "ges_ad1_04",
    level: "AD_I",
    levelName: "Assistant Director I",
    category: "Teacher Professional Development",
    q: "Under NTC regulations, how do professional teachers earn credit points for renewing their teaching licenses in Ghana?",
    options: [
      "By paying an annual renewal fee without taking courses",
      "By accumulating mandatory Continuous Professional Development (CPD) points through accredited workshops, PLC sessions, and portfolio reviews",
      "By serving continuously for 10 years without receiving a written query",
      "By obtaining a Master's degree regardless of NTC endorsement"
    ],
    correct: 1,
    explanation: "The NTC Teacher Licensing and Professional Standing framework mandates that teachers accumulate required CPD points over a 3-year cycle through accredited programs and Professional Learning Community (PLC) participation."
  },

  // ==================== DEPUTY DIRECTOR (DD) ====================
  {
    id: "ges_dd_01",
    level: "DD",
    levelName: "Deputy Director",
    category: "Educational Policy & Governance",
    q: "In the decentralized educational governance structure of Ghana, which body holds statutory responsibility for overseeing basic education delivery at the Metropolitan/Municipal/District Assembly level?",
    options: [
      "District Directorate of Agriculture",
      "District Education Oversight Committee (DEOC)",
      "Regional Coordinating Council (RCC)",
      "Conference of Heads of Assisted Secondary Schools (CHASS)"
    ],
    correct: 1,
    explanation: "The District Education Oversight Committee (DEOC), chaired by the District Chief Executive (DCE) or designated representative, is the statutory body managing educational policy implementation and infrastructure monitoring at the district level."
  },
  {
    id: "ges_dd_02",
    level: "DD",
    levelName: "Deputy Director",
    category: "Strategic Planning & Resource Management",
    q: "When a Deputy Director is leading the preparation of the District Education Strategic Plan (DESP), which strategic framework must align directly with national education priorities?",
    options: [
      "Education Sector Plan (ESP 2018-2030) and Sustainable Development Goal 4 (SDG 4)",
      "District Assembly Common Fund Guidelines only",
      "Internal Revenue Act Regulations",
      "West African Examinations Council (WAEC) Standing Orders"
    ],
    correct: 0,
    explanation: "DESP plans must align with Ghana's Education Sector Plan (ESP 2018-2030) and UN SDG 4 (Inclusive and Equitable Quality Education) to secure budgetary clearance and policy coherence."
  },
  {
    id: "ges_dd_03",
    level: "DD",
    levelName: "Deputy Director",
    category: "Quality Assurance & Supervision",
    q: "What key function differentiates the National Inspectorate Authority (NaSIA) under Act 1023 from traditional GES District Supervision?",
    options: [
      "NaSIA pays teachers' monthly salaries directly",
      "NaSIA functions as an independent statutory authority responsible for setting school evaluation standards and conducting external inspections of both public and private pre-tertiary schools",
      "NaSIA manages the distribution of textbooks to schools",
      "NaSIA conducts promotion interviews for GES officers"
    ],
    correct: 1,
    explanation: "Act 1023 transformed the Inspectorate Division into an independent statutory body (NaSIA) responsible for establishing quality standards, licensing schools, and enforcing compliance across public and private pre-tertiary institutions."
  },
  {
    id: "ges_dd_04",
    level: "DD",
    levelName: "Deputy Director",
    category: "Conflict Resolution & Industrial Relations",
    q: "Under the Labour Act, 2003 (Act 651), what prerequisite steps must be taken by teacher unions (e.g., NAGRAT, GNAT, CCT) before embarking on a lawful strike action?",
    options: [
      "Immediate walkout after sending a text message to the Ministry",
      "Failure of compulsory negotiation/mediation, submission of 7 days' written notice to the National Labour Commission (NLC), and adhering to dispute resolution procedures",
      "Unanimous approval by school prefects",
      "Obtaining a permit from the Ghana Police Service only"
    ],
    correct: 1,
    explanation: "Act 651 mandates that trade unions must exhaust negotiation and mediation mechanisms, and serve a mandatory 7-day written notice of intention to strike to the National Labour Commission before taking industrial action."
  },

  // ==================== DIRECTOR II (DIR II) ====================
  {
    id: "ges_d2_01",
    level: "DIR_II",
    levelName: "Director II",
    category: "Executive Leadership & Policy Analysis",
    q: "As a Regional or Head Office Director II, what is your statutory obligation when an auditor's report uncovers financial infractions amounting to loss of public funds in an agency under your supervision?",
    options: [
      "Cover up the finding to protect the institution's public image",
      "Issue an immediate query, refer to the Audit Report Implementation Committee (ARIC), and enforce recovery or surrender to the Auditor-General / Special Prosecutor",
      "Deduct the stolen amount evenly from all staff salaries in the region",
      "Re-assign the affected bursar without financial investigation"
    ],
    correct: 1,
    explanation: "Under the Public Financial Management Act (Act 921), top executives must activate the Audit Report Implementation Committee (ARIC) to enforce recommendations, surcharge culprits, and prosecute financial malfeasance."
  },
  {
    id: "ges_d2_02",
    level: "DIR_II",
    levelName: "Director II",
    category: "Public Sector Reforms & Policy Implementation",
    q: "The Free Senior High School (Free SHS) policy in Ghana incorporates which constitutional directive principle of state policy?",
    options: [
      "Article 25(1)(b) of the 1992 Constitution of Ghana, which mandates that secondary education shall be made generally available and progressively free",
      "Article 106 regarding Parliamentary Bill enactments",
      "Article 190 governing Public Services Commission appointments",
      "Article 210 establishing the Armed Forces Council"
    ],
    correct: 0,
    explanation: "Article 25(1)(b) of Ghana's 1992 Constitution states that secondary education in all its forms, including technical and vocational education, shall be made generally available and accessible by all appropriate means and by the progressive introduction of free education."
  },
  {
    id: "ges_d2_03",
    level: "DIR_II",
    levelName: "Director II",
    category: "Institutional Governance & Risk Management",
    q: "When establishing a risk management framework for a Regional Education Directorate, which factor represents the highest operational risk to educational access during natural disasters or health crises?",
    options: [
      "Lack of decorative signage at District Offices",
      "Breakdown of school continuity plans, digital learning infrastructure, and emergency response logistics",
      "Delay in printing annual wall calendars",
      "Excessive supply of exercise books to primary schools"
    ],
    correct: 1,
    explanation: "Executive risk management prioritizes learning continuity, emergency preparedness, infrastructure resilience, and digital access during disruptions (such as floods, pandemics, or civil emergencies)."
  }
];

// Helper metadata for promotion ranks
var GES_RANKS = [
  {
    id: "ALL",
    name: "All Promotion Levels",
    description: "Complete comprehensive test across all GES promotion ranks (15 questions)",
    badgeClass: "badge-all",
    count: 15
  },
  {
    id: "AD_II",
    name: "Assistant Director II",
    description: "Pedagogy, NaCCA Curriculum, Code of Ethics, SPAM & Basic Administration",
    badgeClass: "badge-ad2",
    count: 4
  },
  {
    id: "AD_I",
    name: "Assistant Director I",
    description: "PFMA (Act 921), Procurement (Act 663), SPAS Appraisal & NTC Licensing",
    badgeClass: "badge-ad1",
    count: 4
  },
  {
    id: "DD",
    name: "Deputy Director",
    description: "DEOC Governance, ESP 2018-2030, NaSIA Inspections & Labour Act 651",
    badgeClass: "badge-dd",
    count: 4
  },
  {
    id: "DIR_II",
    name: "Director II",
    description: "Executive ARIC Governance, 1992 Constitution Directives, Free SHS Policy & Risk Management",
    badgeClass: "badge-dir2",
    count: 3
  }
];

if (typeof window !== 'undefined') {
  window.DEFAULT_QUESTIONS = DEFAULT_QUESTIONS;
  window.GES_RANKS = GES_RANKS;
}
