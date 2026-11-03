import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { PDFParse } from 'pdf-parse';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import ollama from 'ollama';

import Materials from '../models/materials.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cse220Roadmap = [
  { order: 1, topic: "Array Fundamentals & Memory Access", fileName: "9.pdf", course: "Data Structures", courseCode: "CSE220", startPage: 1, endPage: 3 },
  { order: 2, topic: "Linear Arrays: Creation & Core Operations (Iteration, Resize, Copy, Shift, Rotate, Reverse)", fileName: "10.pdf", course: "Data Structures", courseCode: "CSE220", startPage: 1, endPage: 3 },
  { order: 3, topic: "Linear Arrays: Size, Insertion & Deletion", fileName: "10.pdf", course: "Data Structures", courseCode: "CSE220", startPage: 3, endPage: 5 },

  { order: 4, topic: "Multidimensional Arrays: Numpy Matrix Operations (Sum, Swap, Diagonal, Multiply)", fileName: "12.pdf", course: "Data Structures", courseCode: "CSE220", startPage: 5, endPage: 13 },

  { order: 5, topic: "Linked List: Motivation, Creation & Traversal", fileName: "14.pdf", course: "Data Structures", courseCode: "CSE220", startPage: 1, endPage: 5 },
  { order: 6, topic: "Linked List: Insertion, Removal & Copying", fileName: "14.pdf", course: "Data Structures", courseCode: "CSE220", startPage: 6, endPage: 7 },
  { order: 7, topic: "Linked List: Reverse & Rotate", fileName: "14.pdf", course: "Data Structures", courseCode: "CSE220", startPage: 8, endPage: 9 },

  { order: 8, topic: "Dummy-Headed Doubly Circular Linked List: Operations", fileName: "13.pdf", course: "Data Structures", courseCode: "CSE220", startPage: 5, endPage: 8 },

  { order: 9, topic: "Stack: Concept & Core Operations (Push/Pop/Peek)", fileName: "11.pdf", course: "Data Structures", courseCode: "CSE220", startPage: 1, endPage: 2 },
  { order: 10, topic: "Stack: Real-World Applications", fileName: "11.pdf", course: "Data Structures", courseCode: "CSE220", startPage: 2, endPage: 6 },
  { order: 11, topic: "Stack: Linked List Implementation", fileName: "11.pdf", course: "Data Structures", courseCode: "CSE220", startPage: 6, endPage: 8 },

  { order: 12, topic: "Queue: Concept & Core Operations (Enqueue/Dequeue/Peek)", fileName: "18.pdf", course: "Data Structures", courseCode: "CSE220", startPage: 1, endPage: 2 },
  { order: 13, topic: "Queue: Linked List & Circular Array Implementation + Simulation", fileName: "18.pdf", course: "Data Structures", courseCode: "CSE220", startPage: 2, endPage: 6 },

  { order: 14, topic: "Hashing: Concept & Collision Handling (Chaining, Linear Probing, Double Hashing)", fileName: "16.pdf", course: "Data Structures", courseCode: "CSE220", startPage: 1, endPage: 2 },
  { order: 15, topic: "Hashing: Worked Example (Forward Chaining Walkthrough)", fileName: "16.pdf", course: "Data Structures", courseCode: "CSE220", startPage: 2, endPage: 3 },

  { order: 16, topic: "Tree Basics (Terminology, Levels, Depth, Height)", fileName: "20.pdf", course: "Data Structures", courseCode: "CSE220", startPage: 1, endPage: 5 },
  { order: 17, topic: "Binary Trees (Traversal & Representation)", fileName: "20.pdf", course: "Data Structures", courseCode: "CSE220", startPage: 6, endPage: 11 },
  { order: 18, topic: "Binary Search Trees (Properties, Insert/Delete/Search, Balancing)", fileName: "20.pdf", course: "Data Structures", courseCode: "CSE220", startPage: 12, endPage: 20 },

  { order: 19, topic: "Tree & Binary Tree Fundamentals (Height/Depth Formulas)", fileName: "17.pdf", course: "Algorithms", courseCode: "CSE221", startPage: 2, endPage: 3 },
  { order: 20, topic: "Heap Structure & Array Representation", fileName: "17.pdf", course: "Algorithms", courseCode: "CSE221", startPage: 3, endPage: 4 },
  { order: 21, topic: "Heap Insert (swim / HeapIncreaseKey)", fileName: "17.pdf", course: "Algorithms", courseCode: "CSE221", startPage: 4, endPage: 6 },
  { order: 22, topic: "Heap Delete (sink / MaxHeapify), Heap Sort & Build Max Heap", fileName: "17.pdf", course: "Algorithms", courseCode: "CSE221", startPage: 7, endPage: 10 },

  { order: 23, topic: "Recursion Fundamentals: Factorial & Fibonacci", fileName: "19.pdf", course: "Data Structures", courseCode: "CSE220", startPage: 1, endPage: 5 },
  { order: 24, topic: "Recursive Traversal & Search (Linked List, Strings, Arrays)", fileName: "19.pdf", course: "Data Structures", courseCode: "CSE220", startPage: 6, endPage: 14 },
  { order: 25, topic: "Recursive Sorting (Selection & Insertion) & Exponentiation", fileName: "19.pdf", course: "Data Structures", courseCode: "CSE220", startPage: 15, endPage: 22 },
  { order: 26, topic: "Memoization & Dynamic Programming (Bottom-Up)", fileName: "19.pdf", course: "Data Structures", courseCode: "CSE220", startPage: 23, endPage: 29 }
]

const cse221Roadmap = [
  // { order: 1, topic: "Introduction to Algorithms",           fileName: "1.pdf", course: "Algorithms", courseCode: "CSE221", startPage: 1,  endPage: 5  },
  // { order: 2, topic: "Running Time & Algorithm Analysis",    fileName: "1.pdf", course: "Algorithms", courseCode: "CSE221", startPage: 6,  endPage: 9  },
  // { order: 3, topic: "Big-O, Omega & Theta Notation",        fileName: "1.pdf", course: "Algorithms", courseCode: "CSE221", startPage: 10, endPage: 35 },
  // 
  // { order: 5, topic: "Binary Search", fileName: "4.pdf", course: "Algorithms", courseCode: "CSE221", startPage: 1, endPage: 9 },
  // { order: 6, topic: "Ternary Search", fileName: "5.pdf", course: "Algorithms", courseCode: "CSE221", startPage: 1, endPage: 7 },
  // { order: 7, topic: "Divide and Conquer Strategy", fileName: "6.pdf", course: "Algorithms", courseCode: "CSE221", startPage: 1, endPage: 51 },
  // { order: 8, topic: "Quick Sort", fileName: "7.pdf", course: "Algorithms", courseCode: "CSE221", startPage: 1, endPage: 11 },
  { order: 9, topic: "Graph Basics", fileName: "8.pdf", course: "Algorithms", courseCode: "CSE221", startPage: 1, endPage: 13 },
{ order: 10, topic: "Paths, Connectivity & Trees", fileName: "8.pdf", course: "Algorithms", courseCode: "CSE221", startPage: 14, endPage: 16 },
{ order: 11, topic: "Graph Representations", fileName: "8.pdf", course: "Algorithms", courseCode: "CSE221", startPage: 17, endPage: 21 },
{ order: 12, topic: "Breadth First Search (BFS)", fileName: "8.pdf", course: "Algorithms", courseCode: "CSE221", startPage: 22, endPage: 28 },
{ order: 13, topic: "Depth First Search (DFS)", fileName: "8.pdf", course: "Algorithms", courseCode: "CSE221", startPage: 29, endPage: 31 },
];

const cse321Roadmap = [
  // Module 1: Process
  { order: 1, topic: "Process Concepts, States & Process Control Block (PCB)", fileName: "Operating Systems-1-Process (2).pdf", course: "Operating Systems", courseCode: "CSE321", startPage: 1, endPage: 10 },
  { order: 2, topic: "Process Scheduling Queues & Context Switching", fileName: "Operating Systems-1-Process (2).pdf", course: "Operating Systems", courseCode: "CSE321", startPage: 11, endPage: 15 },
  { order: 3, topic: "Dual-Mode Operation & System Calls", fileName: "Operating Systems-1-Process (2).pdf", course: "Operating Systems", courseCode: "CSE321", startPage: 16, endPage: 20 },
  { order: 4, topic: "Process Creation, fork() Mechanics & Process Trees", fileName: "Operating Systems-1-Process (2).pdf", course: "Operating Systems", courseCode: "CSE321", startPage: 21, endPage: 38 },
  { order: 5, topic: "Inter-Process Communication (IPC): Shared Memory vs Message Passing", fileName: "Operating Systems-1-Process (2).pdf", course: "Operating Systems", courseCode: "CSE321", startPage: 39, endPage: 46 },

  // Module 2: Threads
  { order: 6, topic: "Threads vs Processes & Multithreading Models (User vs Kernel)", fileName: "Operating Systems-2-Threads.pdf", course: "Operating Systems", courseCode: "CSE321", startPage: 1, endPage: 9 },
  { order: 7, topic: "Thread Libraries, Pthreads & Thread Pools", fileName: "Operating Systems-2-Threads.pdf", course: "Operating Systems", courseCode: "CSE321", startPage: 10, endPage: 18 },
  { order: 8, topic: "Threading Issues: Fork/Exec Semantics, Cancellation & Signals", fileName: "Operating Systems-2-Threads.pdf", course: "Operating Systems", courseCode: "CSE321", startPage: 19, endPage: 23 },

  // Module 3: CPU Scheduling
  { order: 9, topic: "CPU Scheduling Concepts & Optimization Criteria", fileName: "Operating Systems-3-CPU Scheduling.pdf", course: "Operating Systems", courseCode: "CSE321", startPage: 1, endPage: 6 },
  { order: 10, topic: "Non-Preemptive & Preemptive Scheduling: FCFS & SJF/SRTF", fileName: "Operating Systems-3-CPU Scheduling.pdf", course: "Operating Systems", courseCode: "CSE321", startPage: 7, endPage: 13 },
  { order: 11, topic: "Priority Scheduling, Starvation/Aging & Round Robin", fileName: "Operating Systems-3-CPU Scheduling.pdf", course: "Operating Systems", courseCode: "CSE321", startPage: 14, endPage: 21 },
  { order: 12, topic: "Multilevel Queue & Multilevel Feedback Queue (MLFQ)", fileName: "Operating Systems-3-CPU Scheduling.pdf", course: "Operating Systems", courseCode: "CSE321", startPage: 22, endPage: 30 },

  // Module 4: Process Synchronization
  { order: 13, topic: "Race Conditions & The Critical Section Problem", fileName: "Operating Systems-4-Process synchronization.pdf", course: "Operating Systems", courseCode: "CSE321", startPage: 1, endPage: 9 },
  { order: 14, topic: "Hardware Synchronization (Test-and-Set, CAS) & Mutex Locks", fileName: "Operating Systems-4-Process synchronization.pdf", course: "Operating Systems", courseCode: "CSE321", startPage: 10, endPage: 15 },
  { order: 15, topic: "Semaphores: Binary vs Counting & Implementation", fileName: "Operating Systems-4-Process synchronization.pdf", course: "Operating Systems", courseCode: "CSE321", startPage: 16, endPage: 25 },
  { order: 16, topic: "Classic Synchronization: Producer-Consumer & Readers-Writers", fileName: "Operating Systems-4-Process synchronization.pdf", course: "Operating Systems", courseCode: "CSE321", startPage: 26, endPage: 36 },
  { order: 17, topic: "Dining Philosophers Problem & The 4 Deadlock Conditions", fileName: "Operating Systems-4-Process synchronization.pdf", course: "Operating Systems", courseCode: "CSE321", startPage: 37, endPage: 43 },

  // Module 5: Memory Management
  { order: 18, topic: "Logical vs Physical Address Space & Base/Limit Registers", fileName: "Operating Systems-6-Memory Management.pdf", course: "Operating Systems", courseCode: "CSE321", startPage: 1, endPage: 7 },
  { order: 19, topic: "Paging Architecture & Address Translation", fileName: "Operating Systems-6-Memory Management.pdf", course: "Operating Systems", courseCode: "CSE321", startPage: 8, endPage: 16 },
  { order: 20, topic: "Translation Lookaside Buffer (TLB) & Effective Access Time", fileName: "Operating Systems-6-Memory Management.pdf", course: "Operating Systems", courseCode: "CSE321", startPage: 17, endPage: 26 },
  { order: 21, topic: "Hierarchical & Multi-Level Page Tables", fileName: "Operating Systems-6-Memory Management.pdf", course: "Operating Systems", courseCode: "CSE321", startPage: 27, endPage: 30 },
  { order: 22, topic: "Virtual Memory, Demand Paging & Page Fault Handling", fileName: "Operating Systems-6-Memory Management.pdf", course: "Operating Systems", courseCode: "CSE321", startPage: 31, endPage: 36 },
  { order: 23, topic: "Page Replacement Algorithms: FIFO, LRU & Optimal (OPT)", fileName: "Operating Systems-6-Memory Management.pdf", course: "Operating Systems", courseCode: "CSE321", startPage: 37, endPage: 40 },

  // Module 6: File Systems
  { order: 24, topic: "Disk Storage Architecture & File Attributes", fileName: "Operating Systems-5-File Systems.pdf", course: "Operating Systems", courseCode: "CSE321", startPage: 1, endPage: 9 },
  { order: 25, topic: "File Allocation Methods & UNIX Inode Structure", fileName: "Operating Systems-5-File Systems.pdf", course: "Operating Systems", courseCode: "CSE321", startPage: 10, endPage: 18 },
  { order: 26, topic: "File System Organization: Superblock, Bitmaps & Inode Tables", fileName: "Operating Systems-5-File Systems.pdf", course: "Operating Systems", courseCode: "CSE321", startPage: 19, endPage: 34 },
  { order: 27, topic: "File Access Paths: Reading & Writing Files from Disk", fileName: "Operating Systems-5-File Systems.pdf", course: "Operating Systems", courseCode: "CSE321", startPage: 35, endPage: 41 },
  { order: 28, topic: "Crash Consistency & FSCK (File System Checker)", fileName: "Operating Systems-5-File Systems.pdf", course: "Operating Systems", courseCode: "CSE321", startPage: 42, endPage: 50 },
  { order: 29, topic: "Journaling (Write-Ahead Logging): Data vs Metadata Journaling", fileName: "Operating Systems-5-File Systems.pdf", course: "Operating Systems", courseCode: "CSE321", startPage: 51, endPage: 68 }
];

const cse421Roadmap = [
  // Module 1: Architecture & Network Models (Bite-Sized & Light)
  { order: 1, topic: "Network Layering & The OSI 7-Layer Reference Model", fileName: "01 - Protocols.pptx", course: "Computer Networks", courseCode: "CSE421", startPage: 18, endPage: 33 },
  { order: 2, topic: "TCP/IP Model, Encapsulation & Multi-Layer Addressing", fileName: "01 - Protocols.pptx", course: "Computer Networks", courseCode: "CSE421", startPage: 53, endPage: 64 },

  // Module 2: Application Layer (Web, HTTP & Security)
  { order: 3, topic: "Application Layer Paradigms & Client-Server Architecture", fileName: "02 - Application Layer (HTTP).pptx", course: "Computer Networks", courseCode: "CSE421", startPage: 1, endPage: 14 },
  { order: 4, topic: "HTTP Protocol: Request Methods & Response Status Codes", fileName: "02 - Application Layer (HTTP).pptx", course: "Computer Networks", courseCode: "CSE421", startPage: 15, endPage: 24 },
  { order: 5, topic: "HTTP Connections: Non-Persistent vs Persistent (Keep-Alive) & RTT", fileName: "02 - Application Layer (HTTP).pptx", course: "Computer Networks", courseCode: "CSE421", startPage: 25, endPage: 33 },
  { order: 6, topic: "Web State Management: Stateless HTTP, Cookies & Sessions", fileName: "02 - Application Layer (HTTP).pptx", course: "Computer Networks", courseCode: "CSE421", startPage: 34, endPage: 40 },
  { order: 7, topic: "Web Caching, Proxy Servers & Conditional GET", fileName: "02 - Application Layer (HTTP).pptx", course: "Computer Networks", courseCode: "CSE421", startPage: 41, endPage: 52 },
  { order: 8, topic: "HTTPS: Transport Layer Security (TLS/SSL) & Encryption", fileName: "02 - Application Layer (HTTP).pptx", course: "Computer Networks", courseCode: "CSE421", startPage: 53, endPage: 56 },

  // Module 3: Domain Resolution & Mail Services
  { order: 9, topic: "Electronic Mail Architecture: SMTP, POP3 & IMAP", fileName: "03 - Application Layer (Electronic Mail _ DNS)F24.pptx", course: "Computer Networks", courseCode: "CSE421", startPage: 1, endPage: 12 },
  { order: 10, topic: "DNS Architecture: Distributed Hierarchical Database", fileName: "03 - Application Layer (Electronic Mail _ DNS)F24.pptx", course: "Computer Networks", courseCode: "CSE421", startPage: 13, endPage: 23 },
  { order: 11, topic: "DNS Resolution, Resource Records (RR) & TTL Caching", fileName: "03 - Application Layer (Electronic Mail _ DNS)F24.pptx", course: "Computer Networks", courseCode: "CSE421", startPage: 24, endPage: 30 },

  // Module 4: Transport Layer (UDP, TCP & Multiplexing)
  { order: 12, topic: "Transport Layer Services: Process-to-Process Delivery & Ports", fileName: "04 - Transport Layer-UDP_F24.pptx", course: "Computer Networks", courseCode: "CSE421", startPage: 1, endPage: 18 },
  { order: 13, topic: "Socket Multiplexing & Demultiplexing", fileName: "04 - Transport Layer-UDP_F24.pptx", course: "Computer Networks", courseCode: "CSE421", startPage: 19, endPage: 28 },
  { order: 14, topic: "UDP (User Datagram Protocol): Lightweight, Connectionless Transport", fileName: "04 - Transport Layer-UDP_F24.pptx", course: "Computer Networks", courseCode: "CSE421", startPage: 7, endPage: 13 },
  { order: 15, topic: "TCP Connection Lifecycle: 3-Way Handshake & Teardown", fileName: "06 - Transport Layer (TCP Congestion Control).pptx", course: "Computer Networks", courseCode: "CSE421", startPage: 17, endPage: 21 },
  { order: 16, topic: "TCP Flow Control vs Congestion Control Principles", fileName: "06 - Transport Layer (TCP Congestion Control).pptx", course: "Computer Networks", courseCode: "CSE421", startPage: 1, endPage: 16 },
  { order: 17, topic: "TCP Congestion Control: Slow Start, Congestion Avoidance & AIMD", fileName: "06 - Transport Layer (TCP Congestion Control).pptx", course: "Computer Networks", courseCode: "CSE421", startPage: 21, endPage: 36 },

  // Module 5: Network Layer (IP, Subnets, DHCP, NAT & Routing)
  { order: 18, topic: "IPv4 Addressing, Subnetting & CIDR Notation for SWE", fileName: "08 - Network Layer - Subnetting_F24.pptx", course: "Computer Networks", courseCode: "CSE421", startPage: 1, endPage: 16 },
  { order: 19, topic: "DHCP: Dynamic Host Configuration & The DORA Process", fileName: "10 - DHCPv4 & NAT_F25.pptx", course: "Computer Networks", courseCode: "CSE421", startPage: 1, endPage: 21 },
  { order: 20, topic: "Public vs Private IP Spaces & NAT (Network Address Translation)", fileName: "10 - DHCPv4 & NAT_F25.pptx", course: "Computer Networks", courseCode: "CSE421", startPage: 22, endPage: 30 },
  { order: 21, topic: "PAT (Port Address Translation) & Port Forwarding", fileName: "10 - DHCPv4 & NAT_F25.pptx", course: "Computer Networks", courseCode: "CSE421", startPage: 31, endPage: 42 },
  { order: 22, topic: "Routing Principles: Forwarding vs Routing & Link-State / OSPF Concepts", fileName: "12 - Network Layer - Link State Routing & OSPF.pptx", course: "Computer Networks", courseCode: "CSE421", startPage: 1, endPage: 32 },

  // Module 6: Data Link Layer & Local Area Networks (LAN)
  { order: 23, topic: "Data Link Layer: MAC Addressing, Framing & ARP", fileName: "14 - Data Link LayerV2.pptx", course: "Computer Networks", courseCode: "CSE421", startPage: 1, endPage: 35 },
  { order: 24, topic: "Ethernet Switches: Self-Learning MAC Tables & Switch vs Router", fileName: "14 - Data Link LayerV2.pptx", course: "Computer Networks", courseCode: "CSE421", startPage: 36, endPage: 48 },
  { order: 25, topic: "Wireless LAN (Wi-Fi 802.11): CSMA/CA & Hidden Terminal Problem", fileName: "15 - Wireless_Intro_V2.pptx", course: "Computer Networks", courseCode: "CSE421", startPage: 1, endPage: 20 }
];

async function generateRoadMap(topic){
  
}






function extractPages(text, startPage, endPage) {
  const pages = text['pages'].filter(obj => obj.num >= startPage && obj.num <= endPage);
  const pageText = pages
  .map(p => `Page ${p.num}\n${p.text}`)
  .join('\n\n');
  console.log(pageText)
  return pageText;
}

const callLocalLLMWithContext = async (rawText, topicName, stepOrder, course, courseCode) => {
  console.log(`🦙 Sending context to local Ollama (qwen2.5-coder:7b)...`);

  const response = await ollama.chat({
    model: 'qwen2.5-coder:7b',
    messages: [
      {
        role: 'system',
        content: `You are a computer science data extraction agent. Extract academic information from university lecture text and return it as a single raw JSON object.

STRICT RULES:
- Return ONLY a valid JSON object with a single key: "bracuNotesContext"
- The value of "bracuNotesContext" must be a plain string
- NO markdown, NO code blocks, NO backticks, NO introduction, NO explanation
- If you cannot extract anything, return: {"bracuNotesContext": "No context extracted."}`
      },
      {
        role: 'user',
        content: `Course: ${courseCode}
Topic: ${topicName}
Step: ${stepOrder}

this is for lightweight revision Extract the core concepts from the notes including all technical definitions, formulas but skip historical relevance. Incase of complex example and simulation just extract the topic name, for example graph basics, dfs, bfc, etc.
 Be dense, bulleted, and exam-focused.
  Math data maybe noisy dont focus too much on extracting dense math concepts but summarize the core ideas so another llm can generate from them. Make sure to include just the most important concepts not all examples as content must fit one page email.

Text array containing objects with text and page numbers of the lecture slides:
${rawText}`
      }
    ],
    format: 'json'
  });

  let cleanJSON;
  try {
    const raw = response.message.content
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    cleanJSON = JSON.parse(raw);
    console.log(cleanJSON);
  } catch (e) {
    console.warn('⚠️ JSON parse failed, using raw response as context');
    cleanJSON = { bracuNotesContext: response.message.content };
  }

  return {
    course: course,
    courseCode: courseCode,
    topic: topicName,
    order: Number(stepOrder),
    bracUNotesContext: cleanJSON.bracuNotesContext || cleanJSON.summary || "No context extracted."
  };
};

const runSyllabusFactory = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected safely to database.');

    for (const step of cse421Roadmap) {
      console.log(`\n🚀 Processing Step ${step.order}: ${step.topic}`);
      
      const pdfPath = path.join(__dirname, '..', 'etl-processor', 'raw-slides', step.fileName);
      
      if (!fs.existsSync(pdfPath)) {
        console.error(`❌ PDF file missing at: ${pdfPath}. Skipping.`);
        continue;
      }

      const existingMaterial = await Materials.findOne({ course: step.course, order: step.order });
      if (existingMaterial) {
        console.log(`⏩ Step ${step.order} already exists. Skipping.`);
        continue;
      }

      // Phase A: EXTRACT

      let parsedData;
      if (step.fileName.endsWith('.pptx')) {
        const pythonScript = path.join(__dirname, '..', 'etl-processor', 'extract_pptx.py');
        const jsonOutput = execFileSync('python', [pythonScript, pdfPath], {
          encoding: 'utf-8',
          maxBuffer: 20 * 1024 * 1024
        });
        parsedData = JSON.parse(jsonOutput);
      } else {
        const dataBuffer = fs.readFileSync(pdfPath);
        const parser = new PDFParse({ data: dataBuffer });
        parsedData = await parser.getText();
      }

      const pages = extractPages(parsedData, step.startPage, step.endPage);
      console.log(pages);

      // console.log(`📄 Total pages: ${parsedData.numpages}`);
      // console.log(`📄 Extracting pages ${step.startPage}-${step.endPage}...`);

      

      // Phase B: TRANSFORM
      const distilledDocument = await callLocalLLMWithContext(
        pages,
        step.topic,
        step.order,
        step.course,
        step.courseCode
      );

      // Phase C: LOAD
      await Materials.findOneAndUpdate(
        { course: distilledDocument.course, order: distilledDocument.order },
        distilledDocument,
        { upsert: true, new: true }
      );
      console.log(`📥 Successfully loaded Step ${step.order} into MongoDB!`);
    }

    console.log('\n🏁 ETL Factory completed successfully.');

  } catch (error) {
    console.error('❌ ETL System Failure:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection safely disconnected.');
  }
};

runSyllabusFactory();