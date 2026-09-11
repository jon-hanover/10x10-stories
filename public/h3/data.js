/* ============================================================================
   H3 ECOSYSTEM CONSTELLATION — demonstration dataset
   ----------------------------------------------------------------------------
   Entities are drawn from the live "H3 Institute | Ecosystem Map" workbook
   (universities, field, funders tabs) plus the LearnerStudio team roster.

   TAGS AND EDGES ARE A WORKING SAMPLE, NOT VERIFIED DATA. Lever tags, pillar
   tags and most relationship lines were inferred for this proof of concept so
   the interaction model can be evaluated. Treat every connection as a
   hypothesis to be confirmed before it goes anywhere real.
   ========================================================================== */

(function () {
  const LEVERS = [
    { id: "L1", n: "Demand & Narrative",        s: "Messaging, advocacy, activation, leadership", c: "#ff7a59" },
    { id: "L2", n: "Quality Learning",          s: "High-agency, plural learning experiences",     c: "#ffb02e" },
    { id: "L3", n: "Modernizing the What",      s: "The knowledge, capabilities and dispositions", c: "#ffe066" },
    { id: "L4", n: "Upskilling the Workforce",  s: "Adults, near-peers and tech supports",         c: "#7ee081" },
    { id: "L5", n: "Policy & Public Purpose",   s: "A coherent federal, state and local stack",    c: "#4fd1c5" },
    { id: "L6", n: "R&D",                       s: "R&D for an adaptive learning system",          c: "#63b3ff" },
    { id: "L7", n: "Digital Backbone",          s: "Standards, utilities and the tech stack",      c: "#9f8cff" },
    { id: "L8", n: "Pathways to Life",          s: "Continuous, visible, networked journeys",      c: "#e07fe0" },
    { id: "L9", n: "Institutional Evolution",   s: "Helping existing systems get ready",           c: "#ff9ec4" },
    { id: "MEAS", n: "Measurement & Evidence",  s: "Cross-cutting thread, not a numbered lever",   c: "#8ef1ff" }
  ];

  const PILLARS = [
    { id: "agency",         n: "Human Agency",         c: "#ffb54d" },
    { id: "connection",     n: "Human Connection",     c: "#ff79b0" },
    { id: "sustainability", n: "Human Sustainability", c: "#5fd6c4" }
  ];

  const OUTCOMES = [
    { id: "goodlife", n: "Live a Good Life" },
    { id: "economy",  n: "Advance Our Economy" },
    { id: "democracy",n: "Sustain Our Democracy" }
  ];

  const GROUPS = [
    { id: "core",       n: "LearnerStudio & H3", c: "#ffd166" },
    { id: "university", n: "Universities",       c: "#6fb1ff" },
    { id: "field",      n: "Field",              c: "#68e0a0" },
    { id: "funder",     n: "Funders",            c: "#c79bff" }
  ];

  const nodes = [];
  // id, name, kind, group, role, home org, priority, status, blurb, levers, pillars, outcomes, domain
  function N(id, name, kind, group, role, home, pri, status, blurb, lev, pil, out, domain) {
    nodes.push({
      id, name, kind, group, role, home: home || null,
      pri: pri || "P3", status: status || "prospect",
      blurb: blurb || "", levers: lev || [], pillars: pil || [], outcomes: out || [],
      domain: domain || null
    });
  }

  /* ---------------------------------------------------------------- CORE -- */
  N("h3-institute", "The H3 Institute", "org", "core", "Proposed applied research center", null, "P1", "active",
    "The animating question: what does it take for young people, roughly 6 to 25, to be inspired and prepared to flourish as human beings and values-based leaders in an AI-shaped world. Currently Phase 0 inside LearnerStudio, with an endowed institute at a research university as the 2028 target.",
    ["L3","L6","MEAS"], ["agency","connection","sustainability"], ["goodlife","economy","democracy"], null);

  N("learnerstudio", "LearnerStudio", "org", "core", "Nonprofit, learning design for the Age of AI", null, "P1", "active",
    "The home and driver of the H3 Institute. Raising Fund II across three investment categories: Models, Digital Infrastructure and Measurement.",
    ["L2","L3","L6","MEAS"], ["agency","connection","sustainability"], ["goodlife","economy","democracy"], "thelearnerstudio.org");

  N("lfn", "Learning to Flourish Network", "org", "core", "Collective action network", null, "P1", "active",
    "The nine-lever collective action agenda that H3 plugs into. Steering Committee convenes at Lone Rock; next gathering November 15 to 18, 2026.",
    ["L1","L2","L3","L4","L5","L6","L7","L8","L9"], ["agency","connection","sustainability"], ["goodlife","economy","democracy"], null);

  N("hawthorn", "Hawthorn Education Strategies", "org", "core", "Advisory practice", null, "P2", "active",
    "Jon Hanover's advisory practice. Contract with LearnerStudio is on Amendment 4.",
    ["L6"], ["sustainability"], ["goodlife"], "hawthorneducation.com");

  N("kim-smith", "Kim Smith", "person", "core", "CEO, LearnerStudio", "learnerstudio", "P1", "active",
    "The driving visionary behind H3. Built NewSchools Venture Fund, Pahara and Bellwether. Holds nearly every anchor relationship in this map.",
    ["L1","L3","L6","L9","MEAS"], ["agency","connection","sustainability"], ["goodlife","economy","democracy"], null);

  N("victor-reinoso", "Victor Reinoso", "person", "core", "LearnerStudio", "learnerstudio", "P1", "active",
    "Day-to-day collaborator on H3 with Jon. Holds the working context on people and prior work, and sits on the university calls.",
    ["L3","L6","L9"], ["sustainability"], ["economy"], null);

  N("cassie-crockett", "Cassie Crockett", "person", "core", "LearnerStudio", "learnerstudio", "P2", "active",
    "Brokered the engagement and tracks the measurement unlock inside Fund II.",
    ["L6","MEAS"], ["sustainability"], ["economy"], null);

  N("courtney-garcia", "Courtney Garcia", "person", "core", "Partner, LearnerStudio", "learnerstudio", "P2", "active",
    "Leads measurement outreach and the Transcend thread; advised on Fund II learning-model investments.",
    ["L2","L6","MEAS"], ["sustainability"], ["economy"], null);

  N("babak-mostaghimi", "Babak Mostaghimi", "person", "core", "LearnerStudio", "learnerstudio", "P1", "active",
    "Key internal collaborator on measurement. Source of the ambient-measurement framing, the eliteness tension and the ag-research analogy. Speaking at The Colorado Imperative on October 29.",
    ["L6","L7","MEAS"], ["agency","sustainability"], ["economy","democracy"], null);

  N("gwen-baker", "Gwen Baker", "person", "core", "LearnerStudio", "learnerstudio", "P1", "active",
    "Owns the meta-domains and knowledge-graph work, a top-level organizer for flourishing that indexes ELA, math and durable skills together.",
    ["L3","L7","MEAS"], ["sustainability"], ["economy"], null);

  N("melanie-dukes", "Melanie Dukes", "person", "core", "LearnerStudio", "learnerstudio", "P2", "active",
    "Holds the final H3 Governance Report and writes the Flourishing Substack that Penn responded to.",
    ["L1","L9"], ["connection"], ["goodlife"], null);

  N("katherine-moore", "Katherine Moore", "person", "core", "Kim's EA, LearnerStudio", "learnerstudio", "P3", "active",
    "Manages Kim's scheduling and has commented on the Strategy on a Page. Every calendar path runs through here.",
    [], [], [], null);

  N("mk-romagnoli", "MaryKate Romagnoli", "person", "core", "LearnerStudio", "learnerstudio", "P3", "active",
    "Ran the LFN Steering Committee retreat and the post-retreat summary. Knows the network cold.",
    ["L1"], ["connection"], ["democracy"], null);

  N("stephanie-distasio", "Stephanie DiStasio", "person", "core", "Head of Network Engagement, LFN", "lfn", "P2", "active",
    "Joined LearnerStudio in July 2026 to lead engagement for the Learning to Flourish Network.",
    ["L1","L8"], ["connection"], ["democracy"], null);

  N("jon-hanover", "Jon Hanover", "person", "core", "Advisor, Hawthorn Education Strategies", "hawthorn", "P1", "active",
    "Outside thought partner to Kim and Victor. Sharpens the framing, maps the ecosystem, drafts the assets and answers what it would take to make this real.",
    ["L1","L3","L6","MEAS"], ["agency","connection","sustainability"], ["goodlife","economy","democracy"], null);

  N("kent-mcguire", "Kent McGuire", "person", "core", "Funder advisor", null, "P1", "active",
    "Quarterbacking the funder landscape ahead of the September convening. Working Hewlett, Stuart, Walton and Bezos, and positioning LearnerStudio around measurement as the entry point.",
    ["L5","L6","MEAS"], ["sustainability"], ["economy"], null);

  /* -------------------------------------------------------- UNIVERSITIES -- */
  N("northeastern", "Northeastern University", "org", "university", "Anchor university candidate", null, "P1", "active",
    "The leading anchor candidate inside an independent-nonprofit JV. Deep humanics bench, long competency-based experience, portable credentials, and an existing tie through Big Picture Learning. In discussions to acquire Minerva.",
    ["L3","L6","L8","L9","MEAS"], ["sustainability"], ["economy"], "northeastern.edu");

  N("stanford", "Stanford University", "org", "university", "Learning Society project", null, "P1", "active",
    "Mitchell Stevens and the Learning Society project. Warm and moving; the schooling-to-learning frame came out of the joint call.",
    ["L6","L8","L9"], ["agency","sustainability"], ["economy"], "stanford.edu");

  N("penn", "University of Pennsylvania", "org", "university", "Penn GSE", null, "P2", "warm",
    "Two live threads: Zachary Herrmann's Leadership Education Institute and Michael Golden's innovation work. Three named modes of engagement are open and none has been chosen.",
    ["L4","L6","L9"], ["agency"], ["democracy"], "upenn.edu");

  N("harvard", "Harvard University", "org", "university", "Human Flourishing Program", null, "P2", "warm",
    "The Human Flourishing Program holds the six-domain flourishing definition H3 borrows from, and released a flourishing research update in August.",
    ["L6","MEAS"], ["connection"], ["goodlife"], "harvard.edu");

  N("vanderbilt", "Vanderbilt University", "org", "university", "Research partner, parked", null, "P2", "parked",
    "Earlier concept doc landed well with the dean, with blunt feedback that H3 will need to bring the money. Held while Northeastern plays out.",
    ["L6"], ["sustainability"], ["economy"], "vanderbilt.edu");

  N("baylor", "Baylor University", "org", "university", "Institute for Global Human Flourishing", null, "P2", "prospect",
    "Launched its Institute for Global Human Flourishing in April 2025. Added at Kim's suggestion; a Matthew Lee readout decides whether it is a partner or a peer to watch.",
    ["L6"], ["connection"], ["goodlife"], "baylor.edu");

  N("mit", "MIT", "org", "university", "Media Lab, D-School, STS", null, "P2", "prospect",
    "Design and experiential threads reinforce the Gerald Chan conversation. His MIT design connection is underdeveloped in the current pitch.",
    ["L7","L6"], ["agency"], ["economy"], "mit.edu");

  N("minerva", "Minerva University", "org", "university", "Possible core anchor", null, "P2", "prospect",
    "Named as a possible core anchor alongside Northeastern. Mike Magee sees room to innovate past the faculty limits that constrained ASU.",
    ["L2","L9"], ["agency"], ["economy"], "minerva.edu");

  N("bank-street", "Bank Street College", "org", "university", "Educator preparation", null, "P3", "prospect",
    "Shael Polakow-Suransky's institution, and an overlap with the Playlab inner circle.",
    ["L4"], ["connection"], ["goodlife"], "bankstreet.edu");

  N("notre-dame", "Notre Dame Ethics Center", "org", "university", "Delta on Purpose", null, "P4", "prospect",
    "Runs the Delta on Purpose fellowship and grant program, the closest live analog on purpose and ethics.",
    ["L8"], ["agency"], ["goodlife"], "nd.edu");

  N("cornell-psix", "Cornell PSiX", "org", "university", "Purpose Science and Innovation Exchange", null, "P1", "active",
    "Tony Burrow's exchange at the Bronfenbrenner Center. Purpose indicators, a national purpose survey, and a distribution question that runs through LFN.",
    ["L6","L8","MEAS"], ["agency"], ["goodlife","democracy"], "cornell.edu");

  N("stanford-accelerator", "Stanford Accelerator for Learning", "org", "university", "Isabelle Hau", null, "P3", "prospect",
    "Relational intelligence as a core outcome alongside cognitive skills, plus an 800-paper evidence review of AI in K-12.",
    ["L2","L6"], ["connection"], ["goodlife"], "stanford.edu");

  N("harvard-hfp", "Harvard Human Flourishing Program", "org", "university", "Flourishing measurement", null, "P2", "warm",
    "The six-domain flourishing construct and the measurement apparatus behind it. Also a crowded label, which is part of why H3 moved off the word.",
    ["L6","MEAS"], ["connection"], ["goodlife"], "harvard.edu");

  N("baylor-ighf", "Institute for Global Human Flourishing", "org", "university", "Baylor", null, "P3", "prospect",
    "Templeton-adjacent flourishing center launched in 2025. A peer to read before it is a partner to court.",
    ["L6"], ["connection"], ["goodlife"], "baylor.edu");

  N("george-mason", "George Mason University", "org", "university", "Frontier-model bias research", null, "P4", "prospect",
    "Thema Monroe-White's home for work on frontier-model bias and how to guard against it.",
    ["L7","MEAS"], [], ["democracy"], "gmu.edu");

  N("asu", "Arizona State University", "org", "university", "Center for Whole-Child Education", null, "P4", "parked",
    "Off the list for now. Faculty limits are the cautionary tale that makes Minerva interesting.",
    ["L2"], ["connection"], ["goodlife"], "asu.edu");

  N("usc", "USC", "org", "university", "CANDLE, Immordino-Yang", null, "P4", "parked",
    "Mary Helen Immordino-Yang's CANDLE center and the Institute for Advanced Study. Parked, not closed.",
    ["L6"], ["connection"], ["goodlife"], "usc.edu");

  N("oxford", "Oxford Skoll Centre", "org", "university", "Parked", null, "P4", "parked",
    "Parked. Interesting for social entrepreneurship framing if the work ever goes international.",
    ["L9"], [], ["economy"], "ox.ac.uk");

  N("connie-yowell", "Connie Yowell", "person", "university", "Sr. Advisor to the President, Northeastern", "northeastern", "P1", "active",
    "The anchor relationship on the university track. Comfortable with LearnerStudio as the hub. Co-authored the young adulthood vertical proposal with Mitchell Stevens. Missed the first weekly call.",
    ["L3","L6","L9","MEAS"], ["sustainability"], ["economy"], null);

  N("mitchell-stevens", "Mitchell Stevens", "person", "university", "Stanford, Learning Society", "stanford", "P1", "active",
    "Organizes the standing weekly call and held the room alone when Connie could not make the first one. Affiliate of Stanford's Pathways Network.",
    ["L6","L8"], ["agency","sustainability"], ["economy"], null);

  N("michael-golden", "Michael Golden", "person", "university", "Penn GSE innovation", "penn", "P2", "prospect",
    "Runs innovation at Penn GSE. Described as all-in on H3 once he sees it. Still an unopened door.",
    ["L9"], ["agency"], ["economy"], null);

  N("zachary-herrmann", "Zachary Herrmann", "person", "university", "Penn Leadership Education Institute", "penn", "P2", "warm",
    "Leadership competencies across disciplines: curiosity, open-mindedness, social good. Holds a grant redesigning teacher prep outside university walls.",
    ["L4","L2"], ["agency"], ["democracy"], null);

  N("danielle-allen", "Danielle Allen", "person", "university", "Harvard", "harvard", "P3", "prospect",
    "Led related grant-making for Connie at MacArthur and collaborated with Howard Gardner. Flagged for the humanics convening group.",
    ["L5","L1"], ["connection"], ["democracy"], null);

  N("shawn-ginwright", "Shawn Ginwright", "person", "university", "Harvard GSE", "harvard", "P4", "prospect",
    "Writes on the us-versus-them mentality that damages research and practice relationships. A speaker and voice candidate rather than a research partner.",
    ["L1","L4"], ["connection"], ["democracy"], null);

  N("isabelle-hau", "Isabelle Hau", "person", "university", "Stanford Accelerator for Learning", "stanford-accelerator", "P3", "prospect",
    "Relational intelligence as a core outcome. Named by Kim; no confirmed tie yet.",
    ["L2","L6"], ["connection"], ["goodlife"], null);

  N("tony-burrow", "Anthony Burrow", "person", "university", "Cornell, PSiX", "cornell-psix", "P1", "warm",
    "Ferris Family Associate Professor of Life Course Studies, Director of the Bronfenbrenner Center. Purpose measurement is his field and three roles are on the table. Still no direct line.",
    ["L6","L8","MEAS"], ["agency"], ["goodlife","democracy"], null);

  N("thema-monroe-white", "Thema Monroe-White", "person", "university", "George Mason", "george-mason", "P4", "prospect",
    "Frontier-model bias research. Susan Lyons offered the intro.",
    ["L7","MEAS"], [], ["democracy"], null);

  N("matthew-lee", "Matthew Lee", "person", "university", "Baylor", "baylor", "P3", "prospect",
    "The Baylor read. Kim's readout decides whether Baylor is a partner or a peer.",
    ["L6"], ["connection"], ["goodlife"], null);

  N("mike-magee", "Mike Magee", "person", "university", "Minerva", "minerva", "P2", "prospect",
    "Sees the Northeastern conversation as room to innovate past ASU's faculty limits.",
    ["L9","L2"], ["agency"], ["economy"], null);

  N("jal-mehta", "Jal Mehta", "person", "university", "Harvard GSE", "harvard", "P3", "prospect",
    "Suggested by Kent McGuire; Tyler Thigpen ties the teacher-prep redesign work back to him.",
    ["L4","L2"], ["agency"], ["goodlife"], null);

  /* ---------------------------------------------------------------- FIELD -- */
  N("human-potential-lab", "The Human Potential L.A.B.", "org", "field", "Pam Cantor's lab", null, "P1", "active",
    "LearnerStudio funded phase one of the LAB and the Causal Development Sequence, the framework that carries the science into the field.",
    ["L2","L6"], ["agency","connection"], ["goodlife"], "humanpotentiallab.org");

  N("rithm", "The Rithm Project", "org", "field", "Human Connection lead JV partner", null, "P1", "active",
    "Lead JV partner on the Human Connection pillar. Michelle Culver holds strong reservations about a university-housed center.",
    ["L1","L2","L8"], ["connection"], ["goodlife","democracy"], "therithmproject.org");

  N("playlab", "Playlab", "org", "field", "Applied lab partner", null, "P1", "active",
    "Inner-circle partner. Paired with the Transcend Design Commons as the applied tier while Northeastern and Stanford form the research tier.",
    ["L2","L7","L4"], ["agency"], ["economy"], "playlab.ai");

  N("transcend", "Transcend Education", "org", "field", "Applied innovation edge", null, "P1", "active",
    "Brings experts to its charter-network clients and feeds learning back. Aylon Samouha joined the LearnerStudio board in September.",
    ["L2","L3","L9"], ["sustainability"], ["economy"], "transcendeducation.org");

  N("design-commons", "Design Commons Cohort", "org", "field", "Valor, Summit, Intrinsic, CompSci", null, "P1", "active",
    "Transcend-convened design cohort. Starting emphasis is connection and human skills, with an explicit goal of right-sizing content so it does not crowd out other learning.",
    ["L2","L3"], ["connection","sustainability"], ["goodlife","economy"], null);

  N("valor", "Valor Collegiate", "org", "field", "Design Commons anchor school", null, "P2", "active",
    "Daren Dickson's school and the practical engine of the modernizing-the-what collaboration.",
    ["L2","L3"], ["connection"], ["goodlife"], "valorcollegiate.org");

  N("high-tech-high", "High Tech High", "org", "field", "Deeper Learning Network", null, "P2", "warm",
    "Runs the Deeper Learning Network and reportedly took over the Carnegie Improvement Network. Ben Daily opened the door himself.",
    ["L2","L4"], ["connection"], ["goodlife"], "hightechhigh.org");

  N("big-picture", "Big Picture Learning", "org", "field", "Inner circle", null, "P2", "active",
    "Long-standing inner-circle network and the existing tie into Northeastern.",
    ["L2","L8"], ["agency","connection"], ["goodlife"], "bigpicture.org");

  N("full-scale", "Full Scale", "org", "field", "Research shop", null, "P2", "warm",
    "The research shop Playlab uses for its learning agenda. Externally validated by Caroline Vander Ark.",
    ["L6","MEAS"], ["sustainability"], ["economy"], "fullscale.org");

  N("carnegie-foundation", "Carnegie Foundation", "org", "field", "Research consortium", null, "P2", "warm",
    "Brooke Stafford-Brizard's whole-child measurement agenda overlaps H3 closely enough that there is competitive energy as well as collaboration.",
    ["L6","L9","MEAS"], ["sustainability"], ["economy"], "carnegiefoundation.org");

  N("ccr", "Center for Curriculum Redesign", "org", "field", "Charles Fadel", null, "P2", "warm",
    "Charles Fadel's four-dimensional framework is the closest existing answer to modernizing the what.",
    ["L3"], ["sustainability"], ["economy"], "curriculumredesign.org");

  N("teen-flourishing", "Center for Teen Flourishing", "org", "field", "Mike Goldstein", null, "P2", "warm",
    "Mike Goldstein's center, with Jenny Anderson steering him toward in-school work and a live tutoring-versus-flourishing tension.",
    ["L2","L1"], ["connection"], ["goodlife"], null);

  N("cie-osi", "Center for Innovation in Education", "org", "field", "Open Systems Institute", null, "P2", "warm",
    "Doannie Tran's state-intermediaries angle and the Kentucky model. The source of the Susan Lyons introduction.",
    ["L5","L9"], ["sustainability"], ["democracy"], "leadingwithlearning.org");

  N("isdl", "Institute for Self-Directed Learning", "org", "field", "Forest School external arm", null, "P2", "warm",
    "Coaches school founders, supports transformation, trains teachers, and connects practice to researchers and policy.",
    ["L4","L2"], ["agency"], ["goodlife"], "selfdirect.school");

  N("forest-school", "The Forest School", "org", "field", "Tyler Thigpen", null, "P3", "warm",
    "Founded in 2018 by Tyler Thigpen and Caleb. The practice base underneath the Institute for Self-Directed Learning.",
    ["L2"], ["agency"], ["goodlife"], "theforest.school");

  N("ncme", "NCME", "org", "field", "Measurement association", null, "P2", "warm",
    "The professional association for educational measurement, now expanding into responsible AI integration. Susan Lyons has led it since January 2026.",
    ["L6","MEAS"], [], ["economy"], "ncme.org");

  N("ets-ri", "ETS Research Institute", "org", "field", "Advancing Human Competencies", null, "P3", "prospect",
    "Posted two Skills roles under the banner Advancing Human Competencies in the Age of AI. An aligned-measurement peer to watch, not yet a conversation.",
    ["L6","MEAS"], [], ["economy"], "ets.org");

  N("genai-evidence-hub", "GenAI Evidence Hub", "org", "field", "John Whitmer", null, "P3", "prospect",
    "Gates-funded synthesis of research into benchmarks and standards for edtech.",
    ["L6","L7","MEAS"], [], ["economy"], "learningdatainsights.com");

  N("brookings", "Brookings", "org", "field", "Rebecca Winthrop", null, "P3", "prospect",
    "Rebecca Winthrop's platform on student agency and the global view of what school is for.",
    ["L1","L5"], ["agency"], ["democracy"], "brookings.edu");

  N("xq", "XQ Institute", "org", "field", "High school redesign", null, "P3", "prospect",
    "The front edge of the last wave of content reform. A new leader creates an opening to update that work.",
    ["L3","L2"], ["sustainability"], ["economy"], "xqsuperschool.org");

  N("ncee", "NCEE", "org", "field", "Vicki Phillips", null, "P3", "prospect",
    "National Center on Education and the Economy. The comparative systems view of the what and the how.",
    ["L3","L5"], ["sustainability"], ["economy"], "ncee.org");

  N("air", "AIR", "org", "field", "Jack Buckley", null, "P3", "prospect",
    "Large-scale research and assessment capacity that any serious measurement agenda eventually needs.",
    ["L6","MEAS"], [], ["economy"], "air.org");

  N("aerdf", "AERDF", "org", "field", "Temple Lovelace", null, "P3", "prospect",
    "The closest existing model of inclusive R&D in education, and a structural precedent for how H3 might run programs.",
    ["L6"], ["agency"], ["economy"], "aerdf.org");

  N("celo", "CELO", "org", "field", "John Dugan", null, "P4", "prospect",
    "Leadership development and civic purpose. A thin thread so far.",
    ["L4"], ["agency"], ["democracy"], null);

  N("edsafe", "EDSAFE AI Alliance", "org", "field", "AI safety in education", null, "P3", "prospect",
    "Standards and safety framing for AI in schools, adjacent to the digital backbone lever.",
    ["L7","L5"], [], ["democracy"], "edsafeai.org");

  N("fli", "Future of Life Institute", "org", "field", "AI governance", null, "P4", "prospect",
    "Included for contrast and for the governance model, not for education overlap.",
    ["L5","L7"], [], ["democracy"], "futureoflife.org");

  N("milken", "Milken Institute", "org", "field", "Convening power", null, "P4", "prospect",
    "Convening power and capital attraction, if the Institute ever wants a large stage.",
    ["L1"], [], ["economy"], "milkeninstitute.org");

  N("hastings-bowdoin", "Hastings Initiative for AI and Humanity", "org", "field", "Bowdoin College", null, "P3", "prospect",
    "Reed Hastings' Bowdoin initiative on AI and the humanities. The nearest liberal-arts expression of the H3 question.",
    ["L3","L6"], ["sustainability"], ["goodlife"], "bowdoin.edu");

  N("history-colab", "History Co.Lab", "org", "field", "Fernande Raine", null, "P2", "warm",
    "Led the Civic Thriving Report, which grew out of a LearnerStudio funded collaboration.",
    ["L1","L3"], ["connection"], ["democracy"], "historycolab.org");

  N("purpose-commons", "Purpose Commons", "org", "field", "TeRay Esquibel", null, "P2", "warm",
    "Denver-based youth purpose work and the practical partner alongside Cornell PSiX.",
    ["L8","L1"], ["agency"], ["goodlife","democracy"], null);

  N("oko-labs", "Oko Labs", "org", "field", "Mat Miller", null, "P4", "prospect",
    "AI coaching for collaborative problem solving, tracking individual contribution inside group work. A candidate proof point for experience-embedded measurement.",
    ["L2","L7","MEAS"], ["connection"], ["economy"], null);

  N("tn-score", "Tennessee SCORE", "org", "field", "State intermediary", null, "P4", "prospect",
    "Runs an AI in K-12 strand with students at the center. A test of whether the state-intermediary theory holds.",
    ["L5","L9"], [], ["democracy"], "tnscore.org");

  N("colorado-imperative", "The Colorado Imperative", "org", "field", "Convening series", null, "P4", "warm",
    "Six sessions, 50 to 60 Colorado leaders, opening September 29. A state coalition Jon can work in person.",
    ["L1","L5"], ["connection"], ["democracy"], null);

  N("forum-youth", "Forum for Youth Investment", "org", "field", "Karen Pittman, Merita Irby", null, "P4", "prospect",
    "The readiness and youth development canon that predates all of this and still holds the field's memory.",
    ["L8","L2"], ["agency","connection"], ["goodlife"], "forumfyi.org");

  N("ihf", "Institute for Human Flourishing", "org", "field", "Unassessed", null, "P2", "prospect",
    "Surfaced in September with the question 'did y'all see this'. Possible peer, possible duplicate, possible name collision. Nobody has read it yet.",
    ["L6"], ["connection"], ["goodlife"], "educationforflourishing.org");

  N("pam-cantor", "Pam Cantor", "person", "field", "The Human Potential L.A.B.", "human-potential-lab", "P1", "active",
    "Lead JV partner on Human Agency. Her line: relationships are not nice to have, they are the traffic cop that directs fuel to the brain. New book with an agency chapter is coming.",
    ["L2","L6","MEAS"], ["agency","connection"], ["goodlife"], null);

  N("michelle-culver", "Michelle Culver", "person", "field", "Founder, The Rithm Project", "rithm", "P1", "active",
    "Lead JV partner on Human Connection. Skeptical of a university-housed center, which makes her a useful pressure test on structure.",
    ["L1","L2","L8"], ["connection"], ["goodlife","democracy"], null);

  N("nate-kerr", "Nate Kerr", "person", "field", "The Rithm Project", "rithm", "P2", "active",
    "The working Rithm contact distinct from Michelle. The September 1 meeting still needs a debrief.",
    ["L2","L8"], ["connection"], ["goodlife"], null);

  N("yusuf-ahmad", "Yusuf Ahmad", "person", "field", "Playlab", "playlab", "P1", "active",
    "Playlab's lead and one of the tightest inner-circle ties to Kim.",
    ["L7","L2"], ["agency"], ["economy"], null);

  N("caroline-vander-ark", "Caroline Vander Ark", "person", "field", "Playlab", "playlab", "P2", "warm",
    "The entry point to Full Scale and the person who built the Digital Learning Now precedent worth studying.",
    ["L6","L1"], ["sustainability"], ["economy"], null);

  N("beth-holland", "Beth Holland", "person", "field", "Director of Research, Full Scale", "full-scale", "P3", "warm",
    "Former CZI. Authored the Eight Year Study synthesis. Brooke flagged her as a must-talk-to.",
    ["L6","MEAS"], ["sustainability"], ["economy"], null);

  N("brooke-stafford-brizard", "Brooke Stafford-Brizard", "person", "field", "Carnegie Foundation", "carnegie-foundation", "P2", "active",
    "Whole-child measurement leader with an overlapping R&D agenda. Keep Gerald Chan out of these conversations.",
    ["L6","L9","MEAS"], ["sustainability"], ["economy"], null);

  N("susan-lyons", "Susan Lyons", "person", "field", "ED, NCME; Lyons Assessment", "ncme", "P2", "active",
    "Psychometrician, runs her own practice, leads NCME. The single most connected node on the measurement thread.",
    ["L6","MEAS"], [], ["economy"], null);

  N("doannie-tran", "Doannie Tran", "person", "field", "Center for Innovation in Education", "cie-osi", "P2", "warm",
    "Source of the Kentucky model and the local-intermediary thesis. Made the Susan Lyons introduction.",
    ["L5","L9"], ["sustainability"], ["democracy"], null);

  N("tyler-thigpen", "Tyler Thigpen", "person", "field", "The Forest School", "forest-school", "P2", "active",
    "Named the three ways to engage Penn and ties the teacher-prep work to Jal Mehta.",
    ["L4","L2"], ["agency"], ["goodlife"], null);

  N("caleb", "Caleb", "person", "field", "Institute for Self-Directed Learning", "isdl", "P3", "warm",
    "Holds three research threads: the future role of the educator, social capital, and the Georgia CGSA grant. Strongly favors a fully independent think tank.",
    ["L4","L6"], ["agency"], ["goodlife"], null);

  N("charles-fadel", "Charles Fadel", "person", "field", "Center for Curriculum Redesign", "ccr", "P2", "warm",
    "Participated in the Gates work interview. The transcript is still unmined for what H3 should take from it.",
    ["L3"], ["sustainability"], ["economy"], null);

  N("mike-goldstein", "Mike Goldstein", "person", "field", "Center for Teen Flourishing", "teen-flourishing", "P2", "warm",
    "Bezos-world backing, and being steered toward in-school work. Overlaps Harvard on the universities tab.",
    ["L2","L1"], ["connection"], ["goodlife"], null);

  N("jenny-anderson", "Jenny Anderson", "person", "field", "Author and journalist", null, "P3", "warm",
    "Steering Mike Goldstein toward in-school work. A narrative ally on the demand lever.",
    ["L1"], ["connection"], ["goodlife"], null);

  N("rebecca-winthrop", "Rebecca Winthrop", "person", "field", "Brookings", "brookings", "P3", "prospect",
    "Student agency and the global view of what school is for. A natural voice for the demand lever.",
    ["L1","L2"], ["agency"], ["democracy"], null);

  N("karen-pittman", "Karen Pittman", "person", "field", "Forum for Youth Investment", "forum-youth", "P4", "prospect",
    "Holds the readiness canon and the field's institutional memory on youth development.",
    ["L8","L2"], ["agency","connection"], ["goodlife"], null);

  N("merita-irby", "Merita Irby", "person", "field", "Forum for Youth Investment", "forum-youth", "P4", "prospect",
    "Co-founder alongside Karen Pittman.",
    ["L8"], ["connection"], ["goodlife"], null);

  N("jim-collins", "Jim Collins", "person", "field", "Author, Good to Great", null, "P3", "prospect",
    "A named aspiration on the list. Credibility and framing power if the Institute ever needs a public voice on greatness and discipline.",
    ["L1","L9"], [], ["economy"], null);

  N("daren-dickson", "Daren Dickson", "person", "field", "ED of Innovation, Valor Collegiate", "valor", "P1", "active",
    "The live contact and bridger into Transcend and the Design Commons. Asked directly to collaborate on modernizing the what.",
    ["L2","L3"], ["connection","sustainability"], ["goodlife","economy"], null);

  N("aylon-samouha", "Aylon Samouha", "person", "field", "CEO, Transcend", "transcend", "P2", "active",
    "The existing LearnerStudio tie, and since September a LearnerStudio board member.",
    ["L2","L9"], ["sustainability"], ["economy"], null);

  N("lavada-berger", "Lavada Berger", "person", "field", "Transcend", "transcend", "P3", "active",
    "Transcend's coordinating lead on this thread. The person who makes the four-way calls happen.",
    ["L2"], [], ["economy"], null);

  N("ben-daily", "Ben Daily", "person", "field", "High Tech High", "high-tech-high", "P2", "warm",
    "Reached out to Jon directly in August. The Deeper Learning Network is the asset behind him.",
    ["L2","L4"], ["connection"], ["goodlife"], null);

  N("john-whitmer", "John Whitmer", "person", "field", "GenAI Evidence Hub", "genai-evidence-hub", "P3", "prospect",
    "Former IES, now synthesizing research into benchmarks and standards. Susan Lyons would broker the intro.",
    ["L6","L7","MEAS"], [], ["economy"], null);

  N("teray-esquibel", "TeRay Esquibel", "person", "field", "Purpose Commons", "purpose-commons", "P2", "warm",
    "Denver-based, same city as Jon, and the working half of the Cornell purpose thread.",
    ["L8","L1"], ["agency"], ["goodlife","democracy"], null);

  N("fernande-raine", "Fernande Raine", "person", "field", "Founder, History Co.Lab", "history-colab", "P2", "warm",
    "Led the Civic Thriving Report. Two standing asks of Jon are still unanswered.",
    ["L1","L3"], ["connection"], ["democracy"], null);

  N("gerard-senehi", "Gerard Senehi", "person", "field", "Open Future Institute", null, "P3", "prospect",
    "The QUESTion Project and 'Prioritizing What Makes Us Human in Education'. Possibly a tie to Gerald Chan, still unconfirmed.",
    ["L1","L2"], ["agency"], ["goodlife"], "openfutureinstitute.org");

  N("vicki-phillips", "Vicki Phillips", "person", "field", "NCEE", "ncee", "P3", "prospect",
    "Runs NCEE and carries the comparative-systems view.",
    ["L3","L5"], ["sustainability"], ["economy"], null);

  N("jack-buckley", "Jack Buckley", "person", "field", "AIR", "air", "P3", "prospect",
    "Assessment leadership at scale, the kind of credibility a measurement agenda eventually has to earn.",
    ["L6","MEAS"], [], ["economy"], null);

  N("temple-lovelace", "Temple Lovelace", "person", "field", "AERDF", "aerdf", "P3", "prospect",
    "Inclusive R&D in practice, and a model for how H3 might run programs.",
    ["L6"], ["agency"], ["economy"], null);

  N("mat-miller", "Mat Miller", "person", "field", "Oko Labs", "oko-labs", "P4", "prospect",
    "Ex-Amplify. Building new metrics around collaboration growth inside real group work.",
    ["L7","MEAS"], ["connection"], ["economy"], null);

  N("chris-agnew", "Chris Agnew", "person", "field", "Stanford SCALE Initiative", "stanford-accelerator", "P4", "prospect",
    "Named author of the Tennessee SCORE slide that surfaced in the sandbox.",
    ["L5","L7"], [], ["democracy"], null);

  /* -------------------------------------------------------------- FUNDERS -- */
  N("gerald-chan", "Gerald Chan", "person", "funder", "Principal funder target", null, "P1", "active",
    "Deep pockets, likes working with universities, strongly aligned intellectually. Now pitched in three phases rather than one 60 million dollar swing. His stated exemplar of experiential learning is Northeastern's co-op model.",
    ["L6","L9"], ["sustainability"], ["economy"], null);

  N("jenn-holleran", "Jenn Holleran", "person", "funder", "The path to Gerald Chan", null, "P1", "active",
    "Reads the materials first and gave the memo a thumbs up. Also a connection into MIT.",
    ["L6"], [], ["economy"], null);

  N("schwab-foundation", "Schwab Foundation", "org", "funder", "Anchor conversation", null, "P1", "warm",
    "Institute-specific rather than Fund II only. The Vanderbilt tie is warm but parked behind Northeastern.",
    ["L6","L2"], ["connection"], ["goodlife"], "schwabfoundation.org");

  N("katie-schwab", "Katie Schwab", "person", "funder", "Schwab Foundation", "schwab-foundation", "P2", "warm",
    "The Vanderbilt endowed dean's position ran through her, and her blessing is the unlock on that thread.",
    ["L6"], [], ["goodlife"], null);

  N("lemnis", "Lemnis", "org", "funder", "Named anchor funder for Fund II", null, "P1", "active",
    "Anchor prospect with the decision pending. Pam Cantor and the LAB sit inside the same conversation.",
    ["L2","L6"], ["agency"], ["goodlife"], null);

  N("openai-foundation", "OpenAI Foundation", "org", "funder", "Anya Manki", null, "P1", "active",
    "The largest foundation in the world on paper, and a live unsolicited invitation. A five to six page memo in Amazon style is the ask.",
    ["L6","L7"], ["sustainability"], ["economy"], "openai.com");

  N("anya-manki", "Anya Manki", "person", "funder", "OpenAI Foundation", "openai-foundation", "P1", "active",
    "The warm inbound. Highest-value funder relationship on the board right now.",
    ["L6","L7"], [], ["economy"], null);

  N("stuart-foundation", "Stuart Foundation", "org", "funder", "Peter Ross, Sophie", null, "P2", "active",
    "Flexible funds, wants influence beyond California, and measurement is the likely entry point. Meeting booked for September 18.",
    ["L5","MEAS"], ["sustainability"], ["democracy"], "stuartfoundation.org");

  N("peter-ross", "Peter Ross", "person", "funder", "Stuart Foundation", "stuart-foundation", "P2", "active",
    "The booked conversation. The scheduling conflict is the only thing in the way.",
    ["L5"], [], ["democracy"], null);

  N("sophie-stuart", "Sophie", "person", "funder", "Stuart Foundation", "stuart-foundation", "P3", "warm",
    "Flexible quarter million, lower friction than most, reviewed by Kent before anything goes over.",
    ["L5","MEAS"], [], ["democracy"], null);

  N("spencer-foundation", "Spencer Foundation", "org", "funder", "Transformative Research Grants", null, "P2", "warm",
    "Sees itself as the gold standard on research. A fall convening is booked and the positioning still needs sharpening.",
    ["L6"], ["sustainability"], ["economy"], "spencer.org");

  N("valhalla", "Valhalla", "org", "funder", "Making Critical Thinking Count", null, "P2", "active",
    "Eight revisions in, now a 250 to 300 thousand dollar convening proposal on data science and humanics. Critical thinking is the wedge.",
    ["L3","MEAS"], ["sustainability"], ["economy"], null);

  N("sarah-valhalla", "Sarah", "person", "funder", "Valhalla", "valhalla", "P2", "active",
    "The movable contact at Valhalla.",
    ["L3","MEAS"], [], ["economy"], null);

  N("richard-robertson", "Richard Robertson", "person", "funder", "Valhalla", "valhalla", "P3", "prospect",
    "Harder to move than Sarah, and the reason the ask keeps shrinking.",
    ["L3"], [], ["economy"], null);

  N("templeton", "Templeton Cluster", "org", "funder", "John Templeton Foundation", null, "P3", "prospect",
    "The co-funders behind Baylor and the Harvard Human Flourishing Program. The flourishing money already has a home.",
    ["L6"], ["connection"], ["goodlife"], "templeton.org");

  N("barra", "Barra Foundation", "org", "funder", "Kent's tie", null, "P3", "prospect",
    "Possible fit once Kent's capacity opens.",
    ["L6"], [], ["goodlife"], "barrafoundation.org");

  N("ron-conway", "Ron Conway", "person", "funder", "SV Angel", null, "P3", "prospect",
    "Founding donor of the Arc Institute, the closest live precedent for what H3 is trying to become.",
    ["L6","L9"], [], ["economy"], null);

  N("gates-foundation", "Gates Foundation", "org", "funder", "Prior consortium grant", null, "P2", "warm",
    "Funded the feasibility assessment and the landscape map that this ecosystem view sits on top of.",
    ["L6","L3","MEAS"], ["sustainability"], ["economy"], "gatesfoundation.org");

  N("walton", "Walton Family Foundation", "org", "funder", "Amber Oliver", null, "P3", "prospect",
    "Anchor-funder candidate asking for early impact indicators rather than outcomes alone.",
    ["L6","MEAS"], [], ["economy"], "waltonfamilyfoundation.org");

  N("amber-oliver", "Amber Oliver", "person", "funder", "Walton", "walton", "P3", "prospect",
    "Wants early indicators. That request is a measurement design brief in disguise.",
    ["MEAS"], [], ["economy"], null);

  N("hewlett", "Hewlett Foundation", "org", "funder", "Ash", null, "P3", "warm",
    "In a good conversation with Kent in his ear.",
    ["L5","L6"], [], ["democracy"], "hewlett.org");

  N("ash-hewlett", "Ash", "person", "funder", "Hewlett Foundation", "hewlett", "P3", "warm",
    "The live Hewlett contact.",
    ["L5"], [], ["democracy"], null);

  N("bezos-philanthropy", "Bezos Philanthropy", "org", "funder", "Bill Hight", null, "P3", "prospect",
    "A possible fourth anchor funder, reached through Bill Hight.",
    ["L2"], ["connection"], ["goodlife"], null);

  N("bill-hight", "Bill Hight", "person", "funder", "Bezos Philanthropy", "bezos-philanthropy", "P3", "prospect",
    "Recently arrived from KnowledgeWorks. The live path in.",
    ["L2"], [], ["goodlife"], null);

  N("carnegie-corp", "Carnegie Corporation", "org", "funder", "Flourishing-aligned funder", null, "P3", "prospect",
    "Named in the landscape map as humanics-aligned, and adjacent to Brooke's consortium work.",
    ["L6","L9"], ["sustainability"], ["democracy"], "carnegie.org");


  /* ------------------------------------------------- SECTOR & DISCIPLINE -- */
  /* Sector shapes the color families. Research: studies it. Field: student,
     teacher or system-leader facing. Funder: moves the capital. Other: the
     conveners, advisors and voices that fit none of the three cleanly. */

  const DISCIPLINES = [
    { id: "transdisciplinary", n: "Transdisciplinary",      c: "#ffd166" },
    { id: "cogsci",            n: "Cognitive science",      c: "#63b3ff" },
    { id: "devpsych",          n: "Developmental psych",    c: "#7ee081" },
    { id: "edpsych",           n: "Educational psych",      c: "#4fd1c5" },
    { id: "motivation",        n: "Motivation science",     c: "#ffb02e" },
    { id: "identity",          n: "Identity development",   c: "#e07fe0" },
    { id: "learnsci",          n: "Learning sciences",      c: "#8ef1ff" },
    { id: "humandev",          n: "Human development",      c: "#ff9ec4" },
    { id: "sociology",         n: "Sociology",              c: "#ff7a59" },
    { id: "orgpsych",          n: "Organizational psych",   c: "#9f8cff" },
    { id: "systems",           n: "Systems & design",       c: "#68e0a0" }
  ];

  const SECTORS = [
    { id: "research", n: "Research", c: "#6fb1ff", d: "Universities, labs, research shops and the people inside them" },
    { id: "field",    n: "Field",    c: "#68e0a0", d: "Student, teacher and system-leader facing" },
    { id: "funder",   n: "Funder",   c: "#c79bff", d: "Where the capital sits" },
    { id: "other",    n: "Other",    c: "#ffd166", d: "Conveners, advisors, voices and LearnerStudio itself" }
  ];

  const SECTOR_OF = {
    research: ["northeastern","stanford","penn","harvard","vanderbilt","baylor","mit","minerva",
      "bank-street","notre-dame","cornell-psix","stanford-accelerator","harvard-hfp","baylor-ighf",
      "george-mason","asu","usc","oxford","connie-yowell","mitchell-stevens","michael-golden",
      "zachary-herrmann","danielle-allen","shawn-ginwright","isabelle-hau","tony-burrow",
      "thema-monroe-white","matthew-lee","mike-magee","jal-mehta","human-potential-lab","pam-cantor",
      "full-scale","beth-holland","carnegie-foundation","brooke-stafford-brizard","ncme","susan-lyons",
      "ets-ri","genai-evidence-hub","john-whitmer","brookings","rebecca-winthrop","air","jack-buckley",
      "aerdf","temple-lovelace","ihf","ccr","charles-fadel","hastings-bowdoin","chris-agnew"],
    field: ["rithm","michelle-culver","nate-kerr","playlab","yusuf-ahmad","caroline-vander-ark",
      "transcend","aylon-samouha","lavada-berger","design-commons","valor","daren-dickson",
      "high-tech-high","ben-daily","big-picture","teen-flourishing","mike-goldstein","cie-osi",
      "doannie-tran","isdl","caleb","forest-school","tyler-thigpen","xq","ncee","vicki-phillips",
      "celo","edsafe","history-colab","fernande-raine","purpose-commons","teray-esquibel","oko-labs",
      "mat-miller","tn-score","forum-youth","karen-pittman","merita-irby","gerard-senehi",
      "colorado-imperative"],
    funder: ["gerald-chan","jenn-holleran","schwab-foundation","katie-schwab","lemnis",
      "openai-foundation","anya-manki","stuart-foundation","peter-ross","sophie-stuart",
      "spencer-foundation","valhalla","sarah-valhalla","richard-robertson","templeton","barra",
      "ron-conway","gates-foundation","walton","amber-oliver","hewlett","ash-hewlett",
      "bezos-philanthropy","bill-hight","carnegie-corp"],
    other: ["h3-institute","learnerstudio","lfn","hawthorn","kim-smith","victor-reinoso",
      "cassie-crockett","courtney-garcia","babak-mostaghimi","gwen-baker","melanie-dukes",
      "katherine-moore","mk-romagnoli","stephanie-distasio","jon-hanover","kent-mcguire",
      "jim-collins","milken","fli","jenny-anderson"]
  };

  /* Disciplines are a research read, so they are only placed on researchers and
     research institutions (plus the Institute itself, which is the whole point). */
  const DISC_OF = {
    "h3-institute": ["transdisciplinary","learnsci","humandev"],
    "northeastern": ["learnsci","edpsych","systems"],
    "stanford": ["sociology","learnsci","humandev"],
    "penn": ["edpsych","orgpsych"],
    "harvard": ["humandev","sociology"],
    "harvard-hfp": ["humandev","identity"],
    "vanderbilt": ["edpsych","learnsci"],
    "baylor": ["humandev","identity"],
    "baylor-ighf": ["humandev","identity"],
    "mit": ["cogsci","systems"],
    "minerva": ["learnsci","cogsci"],
    "bank-street": ["devpsych","edpsych"],
    "notre-dame": ["identity","humandev"],
    "cornell-psix": ["devpsych","identity","motivation"],
    "stanford-accelerator": ["learnsci","devpsych"],
    "george-mason": ["systems","sociology"],
    "asu": ["devpsych","edpsych"],
    "usc": ["cogsci","devpsych"],
    "oxford": ["orgpsych","systems"],
    "connie-yowell": ["learnsci","systems"],
    "mitchell-stevens": ["sociology","humandev"],
    "michael-golden": ["orgpsych","systems"],
    "zachary-herrmann": ["orgpsych","edpsych"],
    "danielle-allen": ["sociology","identity"],
    "shawn-ginwright": ["sociology","humandev"],
    "isabelle-hau": ["devpsych","learnsci"],
    "tony-burrow": ["devpsych","identity","motivation"],
    "thema-monroe-white": ["systems","sociology"],
    "matthew-lee": ["humandev","sociology"],
    "mike-magee": ["learnsci","orgpsych"],
    "jal-mehta": ["sociology","edpsych","orgpsych"],
    "human-potential-lab": ["devpsych","cogsci","humandev"],
    "pam-cantor": ["devpsych","cogsci","humandev"],
    "full-scale": ["learnsci","edpsych"],
    "beth-holland": ["learnsci","edpsych"],
    "carnegie-foundation": ["humandev","systems","edpsych"],
    "brooke-stafford-brizard": ["humandev","devpsych"],
    "ncme": ["edpsych","systems"],
    "susan-lyons": ["edpsych","systems"],
    "ets-ri": ["edpsych","cogsci"],
    "genai-evidence-hub": ["learnsci","systems"],
    "john-whitmer": ["learnsci","systems"],
    "brookings": ["sociology","motivation"],
    "rebecca-winthrop": ["sociology","motivation"],
    "air": ["edpsych","sociology"],
    "jack-buckley": ["edpsych","sociology"],
    "aerdf": ["learnsci","systems"],
    "temple-lovelace": ["learnsci","systems"],
    "ihf": ["humandev","identity"],
    "ccr": ["transdisciplinary","learnsci","systems"],
    "charles-fadel": ["transdisciplinary","learnsci","systems"],
    "hastings-bowdoin": ["transdisciplinary","cogsci","sociology"],
    "chris-agnew": ["learnsci","systems"],
    "gwen-baker": ["learnsci","systems","transdisciplinary"]
  };

  const sectorIndex = {};
  Object.keys(SECTOR_OF).forEach(k => SECTOR_OF[k].forEach(id => sectorIndex[id] = k));
  nodes.forEach(n => {
    n.sector = sectorIndex[n.id] || "other";
    n.disc = DISC_OF[n.id] || [];
  });

  /* ---------------------------------------------------------------- EDGES -- */
  const edges = [];
  function E(s, t, type, label, w) { edges.push({ s, t, type, label: label || "", w: w || 1 }); }

  // Spine
  E("h3-institute","learnerstudio","home","Phase 0 lives inside LearnerStudio",3);
  E("h3-institute","lfn","collab","Plugs into the nine-lever agenda",3);
  E("learnerstudio","lfn","home","LearnerStudio convenes the network",3);
  E("h3-institute","northeastern","target","Leading anchor candidate for the endowed institute",3);
  E("h3-institute","stanford","target","Research tier anchor candidate",2);
  E("h3-institute","human-potential-lab","collab","Lead JV partner, Human Agency",3);
  E("h3-institute","rithm","collab","Lead JV partner, Human Connection",3);
  E("h3-institute","playlab","collab","Applied tier with the lab schools",2);
  E("h3-institute","transcend","collab","Applied innovation edge",2);

  // LearnerStudio team
  ["kim-smith","victor-reinoso","cassie-crockett","courtney-garcia","babak-mostaghimi","gwen-baker","melanie-dukes","katherine-moore","mk-romagnoli"]
    .forEach(function (p) { E("learnerstudio", p, "employs", "LearnerStudio team", 2); });
  E("lfn","stephanie-distasio","employs","Head of Network Engagement",2);
  E("lfn","mk-romagnoli","collab","Ran the Steering Committee retreat",1);
  E("hawthorn","jon-hanover","employs","Principal",2);
  E("jon-hanover","learnerstudio","collab","Advisor on Amendment 4, now with an LS address",3);
  E("jon-hanover","h3-institute","collab","Framing, ecosystem mapping and assets",3);
  E("kim-smith","h3-institute","collab","The driving visionary",3);
  E("victor-reinoso","jon-hanover","ally","Day-to-day collaborators",3);
  E("cassie-crockett","jon-hanover","ally","Brokered the engagement",2);
  E("babak-mostaghimi","jon-hanover","ally","Measurement thinking partners",2);
  E("gwen-baker","victor-reinoso","collab","Knowledge graph and the university calls",1);
  E("kim-smith","victor-reinoso","ally","The two-person center of the work",3);
  E("kim-smith","katherine-moore","ally","Every calendar path",1);
  E("kent-mcguire","kim-smith","ally","Quarterbacking the funder landscape",2);
  E("melanie-dukes","jon-hanover","ally","Governance report and the institute catch-up",1);
  E("courtney-garcia","transcend","collab","De facto owner of the Transcend thread",2);
  E("babak-mostaghimi","colorado-imperative","collab","Speaking October 29",1);

  // Universities
  E("northeastern","connie-yowell","employs","Sr. Advisor to the President",3);
  E("stanford","mitchell-stevens","employs","Learning Society project",3);
  E("penn","zachary-herrmann","employs","Leadership Education Institute",2);
  E("penn","michael-golden","employs","Runs innovation at Penn GSE",1);
  E("harvard","danielle-allen","employs","Faculty",1);
  E("harvard","shawn-ginwright","employs","Harvard GSE",1);
  E("harvard","jal-mehta","employs","Harvard GSE",1);
  E("harvard","harvard-hfp","home","Human Flourishing Program",2);
  E("baylor","baylor-ighf","home","Institute for Global Human Flourishing",2);
  E("baylor","matthew-lee","employs","Faculty",1);
  E("minerva","mike-magee","employs","Leadership",1);
  E("cornell-psix","tony-burrow","employs","Director",3);
  E("stanford","stanford-accelerator","home","Accelerator for Learning",2);
  E("stanford-accelerator","isabelle-hau","employs","Leads the Accelerator",2);
  E("stanford-accelerator","chris-agnew","employs","SCALE Initiative",1);
  E("george-mason","thema-monroe-white","employs","Faculty",1);
  E("bank-street","playlab","ally","Shael Polakow-Suransky sits in both worlds",1);
  E("northeastern","minerva","collab","In discussions to acquire",2);
  E("northeastern","big-picture","collab","The existing tie into the network",2);

  // The anchor relationships
  E("kim-smith","connie-yowell","ally","The anchor relationship on the university track",3);
  E("connie-yowell","mitchell-stevens","collab","Co-authored the young adulthood vertical proposal",3);
  E("mitchell-stevens","kim-smith","ally","Owed a real answer on co-convening",2);
  E("jon-hanover","mitchell-stevens","collab","Standing weekly call",2);
  E("connie-yowell","danielle-allen","intro","MacArthur grant-making history",1);
  E("connie-yowell","gwen-baker","collab","Meta-domains and the IB PLC measurement question",2);
  E("kim-smith","michael-golden","target","Still an unopened door",1);
  E("kim-smith","zachary-herrmann","collab","Call held September 10",2);
  E("tyler-thigpen","zachary-herrmann","ally","Named the three Penn modes together",2);
  E("tyler-thigpen","jal-mehta","intro","Ties the teacher-prep redesign to him",1);
  E("kim-smith","matthew-lee","target","Baylor readout pending",1);
  E("kim-smith","mike-magee","target","Possible core anchor",1);
  E("kim-smith","isabelle-hau","target","Named, not yet connected",1);
  E("harvard-hfp","baylor-ighf","peer","Both funded out of the Templeton cluster",2);
  E("harvard-hfp","ihf","peer","Crowded flourishing label",1);

  // Field
  E("human-potential-lab","pam-cantor","employs","Founder",3);
  E("rithm","michelle-culver","employs","Founder",3);
  E("rithm","nate-kerr","employs","Partnerships",2);
  E("playlab","yusuf-ahmad","employs","Lead",3);
  E("playlab","caroline-vander-ark","employs","Team",2);
  E("transcend","aylon-samouha","employs","CEO",2);
  E("transcend","lavada-berger","employs","Coordinating lead",1);
  E("transcend","design-commons","home","Convenes the cohort",3);
  E("design-commons","valor","home","Anchor school",2);
  E("valor","daren-dickson","employs","ED of Innovation",3);
  E("full-scale","beth-holland","employs","Director of Research",2);
  E("carnegie-foundation","brooke-stafford-brizard","employs","Whole-child measurement",3);
  E("ncme","susan-lyons","employs","Executive Director",3);
  E("cie-osi","doannie-tran","employs","Lead",2);
  E("isdl","caleb","employs","Co-founder",2);
  E("isdl","forest-school","home","External-facing arm",2);
  E("forest-school","tyler-thigpen","employs","Co-founder",2);
  E("ccr","charles-fadel","employs","Founder",2);
  E("teen-flourishing","mike-goldstein","employs","Founder",2);
  E("brookings","rebecca-winthrop","employs","Senior Fellow",1);
  E("ncee","vicki-phillips","employs","Lead",1);
  E("air","jack-buckley","employs","Leadership",1);
  E("aerdf","temple-lovelace","employs","Leadership",1);
  E("oko-labs","mat-miller","employs","Founder",1);
  E("history-colab","fernande-raine","employs","Founder",2);
  E("purpose-commons","teray-esquibel","employs","Lead",2);
  E("genai-evidence-hub","john-whitmer","employs","Lead",1);
  E("forum-youth","karen-pittman","employs","Co-founder",1);
  E("forum-youth","merita-irby","employs","Co-founder",1);
  E("high-tech-high","ben-daily","employs","Leadership",2);
  E("full-scale","playlab","collab","The research shop behind the learning agenda",2);
  E("hastings-bowdoin","fli","peer","AI and humanity framing",1);

  // Warm ties and brokered paths
  E("kim-smith","pam-cantor","ally","Scientific advisory JV under discussion",3);
  E("kim-smith","michelle-culver","ally","Human Connection JV",3);
  E("jon-hanover","michelle-culver","ally","Met on a walk in July",2);
  E("jon-hanover","nate-kerr","collab","September 1 meeting still needs a debrief",2);
  E("kim-smith","yusuf-ahmad","ally","Inner circle",3);
  E("kim-smith","daren-dickson","ally","Direct on the modernizing-the-what ask",3);
  E("kim-smith","brooke-stafford-brizard","ally","Introduced Brooke to Jon to coordinate",2);
  E("brooke-stafford-brizard","jon-hanover","collab","Carnegie research consortium question",2);
  E("brooke-stafford-brizard","beth-holland","intro","Flagged as a must-talk-to",1);
  E("doannie-tran","susan-lyons","intro","Made the introduction in July",3);
  E("susan-lyons","jon-hanover","collab","Measurement call in August",3);
  E("susan-lyons","john-whitmer","intro","Would broker the introduction",2);
  E("susan-lyons","thema-monroe-white","intro","Offered the introduction",2);
  E("susan-lyons","ets-ri","ally","Consulting tie through Skills for the Future",1);
  E("susan-lyons","ncme","home","Leads the association",2);
  E("caroline-vander-ark","full-scale","intro","The entry point",2);
  E("caroline-vander-ark","jon-hanover","collab","Digital Learning Now precedent",1);
  E("daren-dickson","lavada-berger","collab","Transcend coordination",1);
  E("aylon-samouha","courtney-garcia","ally","Existing LearnerStudio tie",2);
  E("aylon-samouha","learnerstudio","home","Joined the board in September",2);
  E("ben-daily","jon-hanover","collab","Inbound in August",2);
  E("teray-esquibel","jon-hanover","ally","Both Denver based",2);
  E("teray-esquibel","tony-burrow","collab","PSiX and Purpose Commons together",3);
  E("teray-esquibel","shawn-ginwright","intro","Recommended him in August",1);
  E("fernande-raine","jon-hanover","ally","Two standing asks unanswered",2);
  E("fernande-raine","kim-smith","ally","Raised her independently",1);
  E("jenny-anderson","mike-goldstein","ally","Steering him toward in-school work",1);
  E("mike-goldstein","harvard-hfp","peer","Overlaps the Harvard thread",1);
  E("babak-mostaghimi","ihf","peer","Surfaced it in the sandbox",1);
  E("babak-mostaghimi","ets-ri","peer","Surfaced the Skills roles",1);
  E("kim-smith","tn-score","peer","Posted the slide to the sandbox",1);
  E("chris-agnew","tn-score","collab","Named author of the slide",1);
  E("jon-hanover","colorado-imperative","collab","Registered interest",1);
  E("jon-hanover","gerard-senehi","target","Researching the Gerald Chan tie",1);
  E("kim-smith","xq","target","Possible partner on updating the content work",1);
  E("melanie-dukes","xq","intro","May have intel on who drove the content work",1);
  E("kim-smith","charles-fadel","collab","Gates work interview",1);
  E("kim-smith","spencer-foundation","target","Fall convening",2);
  E("kent-mcguire","spencer-foundation","ally","Advising them",2);
  E("victor-reinoso","tyler-thigpen","collab","Penn call",1);
  E("caleb","jon-hanover","collab","Ran the July call",1);
  E("courtney-garcia","design-commons","collab","Aylon calls and the cohort picture",2);
  E("gwen-baker","transcend","collab","Knowledge graph thread",2);
  E("design-commons","gwen-baker","collab","Possible co-owner of a shared knowledge-graph rebuild",2);

  // Funders
  E("gerald-chan","jenn-holleran","ally","She reads the materials first",3);
  E("jenn-holleran","kim-smith","intro","The path in",3);
  E("jenn-holleran","mit","ally","A connection into MIT",2);
  E("gerald-chan","mit","ally","Design school ties and a strong design gestalt",2);
  E("gerald-chan","northeastern","ally","The co-op model is his stated exemplar",2);
  E("gerald-chan","h3-institute","funds","Three-phase ask, memo sent",3);
  E("jon-hanover","gerald-chan","target","Owns the memo",2);
  E("schwab-foundation","katie-schwab","employs","Family lead",2);
  E("katie-schwab","vanderbilt","ally","The endowed dean's position",2);
  E("schwab-foundation","h3-institute","funds","Anchor conversation, sequenced behind Northeastern",2);
  E("lemnis","h3-institute","funds","Named anchor funder for Fund II",3);
  E("lemnis","pam-cantor","funds","The LAB sits in the same conversation",2);
  E("openai-foundation","anya-manki","employs","Program lead",2);
  E("anya-manki","kim-smith","ally","Unsolicited invitation",3);
  E("openai-foundation","h3-institute","funds","Five to six page memo in progress",3);
  E("jon-hanover","openai-foundation","target","Writing the memo",2);
  E("openai-foundation","oko-labs","funds","Candidate direct grantee example",1);
  E("stuart-foundation","peter-ross","employs","Program lead",2);
  E("stuart-foundation","sophie-stuart","employs","Program",1);
  E("peter-ross","kim-smith","collab","Meeting booked for September 18",2);
  E("kent-mcguire","stuart-foundation","collab","Reviewing materials first",2);
  E("kent-mcguire","hewlett","collab","In Ash's ear",2);
  E("hewlett","ash-hewlett","employs","Program",1);
  E("kent-mcguire","walton","collab","Working Amber Oliver",1);
  E("walton","amber-oliver","employs","Program",1);
  E("kent-mcguire","bezos-philanthropy","intro","Calling Bill Hight",1);
  E("bezos-philanthropy","bill-hight","employs","Recently arrived from KnowledgeWorks",1);
  E("bezos-philanthropy","teen-flourishing","funds","Eden and the Bezos world back the center",1);
  E("valhalla","sarah-valhalla","employs","The movable contact",2);
  E("valhalla","richard-robertson","employs","Harder to move",1);
  E("valhalla","h3-institute","funds","Convening proposal on data science and humanics",2);
  E("gwen-baker","valhalla","collab","Tracking how the data-literacy scope gets written",2);
  E("spencer-foundation","h3-institute","funds","Transformative Research Grants",2);
  E("templeton","harvard-hfp","funds","Global Flourishing Study co-funder",2);
  E("templeton","baylor-ighf","funds","Global Flourishing Study co-funder",2);
  E("templeton","gerald-chan","peer","Adjacent flourishing capital",1);
  E("gates-foundation","learnerstudio","funds","Funded the feasibility assessment and landscape map",2);
  E("gates-foundation","genai-evidence-hub","funds","Evidence hub grant",1);
  E("carnegie-corp","carnegie-foundation","peer","Adjacent names, different institutions",1);
  E("barra","kent-mcguire","ally","Kent has the tie",1);
  E("ron-conway","h3-institute","peer","Arc Institute is the closest live precedent",1);

  /* ------------------------------------------------------------------------ */
  window.H3DATA = { nodes, edges, LEVERS, PILLARS, OUTCOMES, GROUPS, SECTORS, DISCIPLINES };
})();
