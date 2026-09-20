/**
 * ReviseAI — Phase 4E/4F Mock Revision Datasets & Normalizers
 * 
 * Provides mock datasets strictly matching Phase 4 AI Generation Schemas,
 * Mongoose model structures, and data adapters for seamless UI compatibility.
 */

// ─── 1. Mock Datasets Matching Phase 4 AI Generation Contract ───────────────

export const MOCK_MCQ_ITEMS = [
  {
    type: 'MCQ',
    question: 'What is the primary function of CPU scheduling in modern Operating Systems?',
    options: [
      'Manage process execution and allocate CPU time efficiently',
      'Allocate non-volatile disk memory for storage',
      'Route packet network traffic across gateways',
      'Regulate hardware bus clock frequency'
    ],
    answer: 'Manage process execution and allocate CPU time efficiently',
    explanation: 'CPU scheduling decides which process in the ready queue gets access to the CPU core to maximize utilization and minimize turnaround time.',
    difficulty: 'medium',
    subject: 'Operating Systems',
    module: 'Module 4: Process Management',
    sourceChunkIds: ['chunk-os-sched-001']
  },
  {
    type: 'MCQ',
    question: 'Which of the following conditions is NOT required for a deadlock to occur?',
    options: [
      'Mutual Exclusion',
      'Hold and Wait',
      'Preemptive Resource Allocation',
      'Circular Wait'
    ],
    answer: 'Preemptive Resource Allocation',
    explanation: 'Deadlock requires "No Preemption". Preemptive resource allocation breaks Coffman condition #3 and prevents deadlocks.',
    difficulty: 'hard',
    subject: 'Operating Systems',
    module: 'Module 5: Deadlocks & Synchronization',
    sourceChunkIds: ['chunk-os-deadlock-002']
  }
];

export const MOCK_FILL_BLANK_ITEMS = [
  {
    type: 'FillInTheBlank',
    statement: 'Database normalization minimizes [BLANK] and ensures transactional data integrity.',
    answer: 'redundancy',
    options: ['latency', 'redundancy', 'security', 'complexity'],
    explanation: 'Normalization organizes schema tables to reduce duplicate data and prevent insertion/update/deletion anomalies.',
    topic: 'Database Fundamentals',
    subject: 'DBMS',
    sourceChunkIds: ['chunk-db-norm-001']
  },
  {
    type: 'FillInTheBlank',
    statement: 'In symmetric encryption, the same [BLANK] is used for both encryption and decryption.',
    answer: 'key',
    options: ['algorithm', 'key', 'protocol', 'hash'],
    explanation: 'Symmetric encryption relies on a shared secret key between communicating parties.',
    topic: 'Cryptography & Security',
    subject: 'Network Security',
    sourceChunkIds: ['chunk-sec-sym-001']
  }
];

export const MOCK_FLASHCARD_ITEMS = [
  {
    type: 'Flashcard',
    front: 'What is a Deadlock in Operating Systems?',
    back: 'A state where a set of blocked processes each hold a resource and wait to acquire a resource held by another process in the set.',
    category: 'Concurrency & Resource Contention',
    subject: 'Operating Systems',
    conditionsTitle: 'Key Conditions (Coffman):',
    conditions: ['Mutual Exclusion', 'Hold and Wait', 'No Preemption', 'Circular Wait'],
    sourceChunkIds: ['chunk-os-deadlock-003']
  },
  {
    type: 'Flashcard',
    front: 'What is the ACID principle in Database Systems?',
    back: 'A set of properties (Atomicity, Consistency, Isolation, Durability) ensuring database transactions are processed reliably.',
    category: 'Transaction Management',
    subject: 'DBMS',
    conditionsTitle: 'ACID Components:',
    conditions: [
      'Atomicity — All-or-nothing execution',
      'Consistency — State adheres to integrity constraints',
      'Isolation — Concurrent transactions do not interfere',
      'Durability — Committed transactions persist despite crashes'
    ],
    sourceChunkIds: ['chunk-db-acid-001']
  }
];

export const MOCK_MATCH_ITEMS = [
  {
    type: 'MatchTheFollowing',
    question: 'Match each networking protocol with its fundamental operational characteristic.',
    subject: 'Computer Networks',
    topic: 'Transport & Routing Protocols',
    pairs: [
      { left: 'TCP', right: 'Connection-oriented, guaranteed byte-stream delivery with congestion control' },
      { left: 'UDP', right: 'Connectionless, lightweight datagram protocol with minimal latency' },
      { left: 'DNS', right: 'Hierarchical naming system resolving domain names to IP addresses' },
      { left: 'BGP', right: 'Exterior gateway routing protocol managing paths across autonomous systems' }
    ],
    sourceChunkIds: ['chunk-net-proto-001']
  }
];

export const MOCK_SEQUENCE_ITEMS = [
  {
    type: 'Sequence',
    question: 'TCP 3-Way Handshake Connection Establishment',
    instruction: 'Arrange the packets in the correct chronological sequence to establish a connection.',
    subject: 'Computer Networks',
    topic: 'Transport Layer',
    orderedItems: [
      'Client sends SYN packet with initial sequence number (ISN)',
      'Server responds with SYN-ACK packet acknowledging client ISN',
      'Client returns ACK packet confirming server synchronization (ESTABLISHED)'
    ],
    sourceChunkIds: ['chunk-net-tcp-001']
  }
];

export const MOCK_SPOT_MISTAKE_ITEMS = [
  {
    type: 'SpotTheMistake',
    subject: 'Computer Networks',
    topic: 'Reliable Transport Protocols',
    statementWithMistake: 'TCP is a connection-oriented protocol that provides unreliable, ordered, and error-checked delivery of stream data.',
    mistake: 'unreliable,',
    correction: 'reliable,',
    explanation: 'TCP is designed specifically to guarantee reliable, in-order packet delivery using acknowledgments (ACKs), sequence numbers, and retransmission timers.',
    sourceChunkIds: ['chunk-net-tcp-002']
  }
];

export const MOCK_TRUE_FALSE_ITEMS = [
  {
    type: 'TrueFalse',
    subject: 'Computer Networks',
    topic: 'Application & Transport Protocols',
    statement: 'HTTP/3 uses UDP as its underlying transport layer protocol instead of TCP (using the QUIC protocol).',
    answer: true,
    explanation: 'HTTP/3 replaces TCP with QUIC, an application-level transport protocol built over UDP to eliminate head-of-line blocking and speed up handshakes.',
    sourceChunkIds: ['chunk-net-http3-001']
  }
];

export const MOCK_SCENARIO_CHOICE_ITEMS = [
  {
    type: 'ScenarioChoice',
    subject: 'Computer Networks',
    topic: 'Protocol Selection Dilemma',
    scenario: 'Reliable and ordered data delivery with congestion control for financial banking transactions',
    correctOption: 'A',
    rationale: 'TCP is a connection-oriented protocol that guarantees delivery and packet ordering, making it the right choice for scenarios where missing data is intolerable.',
    options: [
      { id: 'A', title: 'TCP', desc: 'Transmission Control Protocol', icon: 'assured_workload' },
      { id: 'B', title: 'UDP', desc: 'User Datagram Protocol', icon: 'speed' }
    ],
    sourceChunkIds: ['chunk-net-scen-001']
  }
];

export const MOCK_WHAT_HAPPENS_NEXT_ITEMS = [
  {
    type: 'WhatHappensNext',
    subject: 'Operating Systems',
    topic: 'CPU Scheduling & Concurrency',
    title: 'Process Scheduling & Starvation Prevention',
    scenario: 'A critical monitoring daemon (sys_monitor) begins consuming 95% of CPU cycles. Simultaneously, a user-initiated database snapshot starts, requesting high I/O priority. The scheduler operates on multi-level feedback queues with dynamic priority aging.',
    correctOutcome: 'sys_monitor priority is dynamically lowered; backup receives allocated time slices.',
    incorrectOutcomes: [
      'The database backup is paused indefinitely until sys_monitor completes.',
      'The OS immediately terminates the backup process to prevent an unrecoverable kernel panic.',
      'Both processes run at locked static priority, causing immediate system deadlock.'
    ],
    explanation: 'Modern operating systems use dynamic aging to downgrade compute-heavy tasks and ensure I/O bound processes avoid starvation.',
    sourceChunkIds: ['chunk-os-aging-001']
  }
];

export const MOCK_RANK_IT_ITEMS = [
  {
    type: 'RankIt',
    subject: 'Computer Architecture',
    topic: 'Memory Hierarchy & Latency',
    title: 'Rank Memory Hierarchy by Access Speed',
    instruction: 'Arrange the storage types from FASTEST to SLOWEST access latency.',
    items: [
      { id: 'cache', name: 'CPU Cache (L1/L2/L3)', desc: 'SRAM built directly into the processor die (~1ns)', correctRank: 1 },
      { id: 'ram', name: 'RAM (Random Access Memory)', desc: 'Volatile main memory DRAM (~50ns)', correctRank: 2 },
      { id: 'ssd', name: 'SSD (Solid State Drive)', desc: 'Non-volatile high-speed NVMe flash storage (~10µs)', correctRank: 3 },
      { id: 'hdd', name: 'HDD (Hard Disk Drive)', desc: 'Magnetic spinning platters with mechanical seek times (~5ms)', correctRank: 4 }
    ],
    sourceChunkIds: ['chunk-arch-mem-001']
  }
];

export const MOCK_SHORT_ANSWER_ITEMS = [
  {
    type: 'ShortAnswer',
    subject: 'Networking Fundamentals',
    question: 'What is the primary difference between TCP and UDP?',
    description: 'Provide a brief explanation focusing on connection type, reliability, and transport overhead.',
    idealAnswer: 'TCP is connection-oriented and provides reliable, ordered data delivery with error checking and congestion control. UDP is connectionless and lightweight without delivery guarantees or handshake overhead.',
    criteria: [
      {
        title: 'Connection Type Distinction',
        description: 'Accurately identified TCP as connection-oriented and UDP as connectionless.',
        passed: true
      },
      {
        title: 'Reliability & Flow Control',
        description: 'Correctly explained packet acknowledgment and retransmission trade-offs.',
        passed: true
      }
    ],
    quickTip: 'Mentioning real-world protocols (TCP for HTTP/TLS, UDP for DNS/WebRTC) adds extra depth to exam answers.',
    sourceChunkIds: ['chunk-net-tcpudp-001']
  }
];

// ─── 2. Data Normalizers & Adapters ─────────────────────────────────────────

/**
 * Normalizes MCQ item from AI contract or Mongoose Question model into QuickPickCard props.
 */
export function normalizeMCQData(item = {}) {
  const rawOptions = item.options || [];
  const correctAnswerText = item.answer || item.correctAnswer || '';
  
  const options = rawOptions.map((opt, idx) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        id: opt.id || `opt-${idx + 1}`,
        icon: opt.icon || (idx === 0 ? 'memory' : idx === 1 ? 'database' : idx === 2 ? 'router' : 'settings'),
        label: opt.label || opt.text || String(opt),
        isCorrect: typeof opt.isCorrect === 'boolean' 
          ? opt.isCorrect 
          : (opt.label || opt.text) === correctAnswerText
      };
    }
    const label = String(opt).trim();
    return {
      id: `opt-${idx + 1}`,
      icon: idx === 0 ? 'memory' : idx === 1 ? 'database' : idx === 2 ? 'router' : 'settings',
      label,
      isCorrect: label === correctAnswerText.trim()
    };
  });

  return {
    subject: item.subject || 'Operating Systems',
    module: item.module || item.topic || 'Revision Module',
    progress: item.progress || 33,
    question: item.question || item.questionText || 'Select the correct answer from the options below:',
    description: item.description || item.explanation || 'Select the most accurate description from the options below.',
    options: options.length > 0 ? options : MOCK_MCQ_ITEMS[0].options
  };
}

/**
 * Normalizes FillInTheBlank item into FillTheGapCard props.
 */
export function normalizeFillGapData(item = {}) {
  let prefix = item.prefix;
  let suffix = item.suffix;
  const statement = item.statement || '';
  const correctAnswer = item.answer || item.correctAnswer || 'redundancy';

  if ((!prefix || !suffix) && statement) {
    if (statement.includes('[BLANK]')) {
      const parts = statement.split('[BLANK]');
      prefix = parts[0]?.trim() || '';
      suffix = parts[1]?.trim() || '';
    } else {
      prefix = statement;
      suffix = '';
    }
  }

  let options = item.options;
  if (!Array.isArray(options) || options.length === 0) {
    options = [correctAnswer, 'complexity', 'latency', 'security'].sort(() => Math.random() - 0.5);
  }

  return {
    topic: item.topic || item.subject || 'Core Concepts',
    progress: item.progress || 65,
    prefix: prefix || 'Database normalization minimizes',
    suffix: suffix || 'and ensures transactional data integrity.',
    correctAnswer: correctAnswer,
    explanation: item.explanation || 'Minimizes redundant data and ensures data integrity.',
    options: options
  };
}

/**
 * Normalizes Flashcard item into FlashcardCard props.
 */
export function normalizeFlashcardData(item = {}) {
  const frontText = item.front || item.question || 'Concept Overview';
  const backText = item.back || item.answerDefinition || item.answer || 'Core definition and explanation.';

  return {
    subject: item.subject || 'Core Concept Review',
    category: item.category || item.tags?.[0] || 'Key Terminology',
    index: item.index || 12,
    total: item.total || 50,
    question: frontText,
    answerTitle: item.answerTitle || frontText.replace(/^(What is |Explain |Define )/i, '').replace(/\?$/, '') || 'Key Concept',
    answerDefinition: backText,
    conditionsTitle: item.conditionsTitle || 'Key Points / Conditions:',
    conditions: Array.isArray(item.conditions) ? item.conditions : []
  };
}

/**
 * Normalizes MatchTheFollowing item into MatchItCard props.
 */
export function normalizeMatchData(item = {}) {
  let pairs = [];
  if (Array.isArray(item.pairs)) {
    pairs = item.pairs.map((p, idx) => ({
      id: String(idx + 1),
      concept: p.concept || p.left || `Term ${idx + 1}`,
      definition: p.definition || p.right || `Definition ${idx + 1}`
    }));
  } else {
    pairs = MOCK_MATCH_ITEMS[0].pairs.map((p, idx) => ({
      id: String(idx + 1),
      concept: p.left,
      definition: p.right
    }));
  }

  return {
    subject: item.subject || 'Computer Networks',
    topic: item.topic || 'Protocols & Architecture',
    pairs: pairs
  };
}

/**
 * Normalizes Sequence item into PutInOrderCard props.
 */
export function normalizeSequenceData(item = {}) {
  let items = [];
  if (Array.isArray(item.items)) {
    items = item.items;
  } else if (Array.isArray(item.orderedItems)) {
    items = item.orderedItems.map((text, idx) => {
      const parts = text.split(/[:\-(➔)]/);
      const label = parts.length > 1 ? parts[0].trim() : `Step ${idx + 1}`;
      const desc = parts.length > 1 ? parts.slice(1).join(' ').trim() : text;
      return {
        id: `step-${idx + 1}`,
        label: label,
        title: label,
        desc: desc,
        correctPos: idx
      };
    });
  }

  return {
    title: item.title || item.question || 'TCP 3-Way Handshake',
    instruction: item.instruction || 'Arrange the items in the correct chronological sequence.',
    subject: item.subject || 'Computer Networks',
    topic: item.topic || 'Transport Layer',
    items: items.length > 0 ? items : undefined
  };
}

/**
 * Normalizes SpotTheMistake item into SpotTheMistakeCard props.
 */
export function normalizeSpotMistakeData(item = {}) {
  const statement = item.statementWithMistake || 'TCP is a connection-oriented protocol that provides unreliable, ordered, and error-checked delivery of stream data.';
  const mistakeWord = (item.mistake || 'unreliable').toLowerCase().trim();
  const correctionWord = item.correction || 'reliable,';

  const tokens = statement.split(/\s+/).map((word, idx) => {
    const clean = word.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
    const isMistake = clean === mistakeWord.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '') || word.toLowerCase().includes(mistakeWord);
    return {
      id: `t-${idx + 1}`,
      text: word,
      isMistake: isMistake,
      correction: isMistake ? correctionWord : undefined
    };
  });

  return {
    subject: item.subject || 'Computer Networks',
    topic: item.topic || 'Reliable Transport Protocols',
    statementWithMistake: statement,
    mistake: item.mistake || 'unreliable,',
    correction: correctionWord,
    explanation: item.explanation || 'TCP guarantees reliable in-order delivery using ACKs and retransmissions.',
    tokens: tokens
  };
}

/**
 * Normalizes WhatHappensNext item into WhatHappensNextCard props.
 */
export function normalizeWhatHappensNextData(item = {}) {
  let options = [];
  if (Array.isArray(item.options)) {
    options = item.options;
  } else if (item.correctOutcome && Array.isArray(item.incorrectOutcomes)) {
    const raw = [
      { text: item.correctOutcome, isCorrect: true },
      ...item.incorrectOutcomes.map((t) => ({ text: t, isCorrect: false }))
    ].sort(() => Math.random() - 0.5);

    const letters = ['A', 'B', 'C', 'D'];
    options = raw.slice(0, 4).map((opt, idx) => ({
      id: letters[idx],
      text: opt.text,
      isCorrect: opt.isCorrect
    }));
  }

  return {
    subject: item.subject || 'Operating Systems',
    topic: item.topic || 'CPU Scheduling & Concurrency',
    title: item.title || 'Process Scheduling & Starvation Prevention',
    scenario: item.scenario || 'A critical monitoring daemon begins consuming 95% of CPU cycles...',
    explanation: item.explanation || 'Modern operating systems use dynamic priority aging to prevent starvation.',
    options: options.length > 0 ? options : undefined
  };
}
