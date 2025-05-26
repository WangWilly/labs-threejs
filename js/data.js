// Resume content configuration
const resumeSections = [
    {
        title: "EDUCATION",
        content: [
            "1. The Ohio State University, Columbus, Ohio",
            "(Aug. 2024 — Jan. 2025)",
            "- Master of Engineering in Computer Science Engineering (CSE)",
            "",
            "2. National Taiwan University, Taipei, Taiwan",
            "(Sept. 2019 — June 2021)",
            "- Master of Science in Computer Science and Information Engineering (CSIE)",
            "- Master's Thesis: Singing Voice Separation Using U-Net and Its Compressed Version"
        ]
    },
    {
        title: "SKILLS",
        content: [
            "1. Research Interests:",
            "Web3, Blockchain, Music Signal Analysis, Machine Learning, AI",
            "2. Programming:",
            "Solidity, Go, Rust, Java, TS/JS, Python, Cpp, SQL, Bash, Web Frameworks, CI/CD",
            "3. Software:",
            "Linux, Git, PostgreSQL, MongoDB, Redis, Docker, K8s, AWS, Azure, GCP",
        ]
    },
    {
        title: "PERSONAL PROJECTS",
        content: [
            "1. Client-side Solana Trade Bot, Web3 project",
            "(Jan. 2025 — Current)",
            "- Designed an automated trading system to prevent abusing private keys",
            "- Focused on copy-trading and snipping tokens on Solana with user defined strategies",
            "- Analyzed event logs through websocket for accurate amount and triggering copy trades",
            "- Adopted Jupiter APIs for DEX routes optimizing and Jito nodes for higher tx sending speed",
            "",
            "2. Dounty, Web3 project",
            "(Jan. 2025 — Current)",
            "- A tool to incentivize developers to contribute to open source projects with bounties",
            "- Deployed Solana smart contracts to collect solana native token as bounties from donors",
            "- Designed quorum scheme through Solana smart contract for bounty issue and NFT rewards",
            "",
            "3. EVM/oracle monorepo, Web3 project",
            "(Apr. 2025 — Current)",
            "- A Typescript monorepo template project for friendly deployment of Solidity project",
            "- Deployed EVM contracts allow users to send and retrieve messages through Oracle",
            "",
            "4. Crypto price CLI display module, Trade project",
            "(May 2025)",
            "- A tool displays Bitcoin price data in terminal as ASCII chart with automatic refresh",
            "- Adopted CCXT for CEXes (Binance, OKX) flexible API support with little development"
        ]
    },
    {
        title: "WORK EXPERIENCE",
        content: [
            "1. Mastertones Co., Ltd., Taipei (remote), Taiwan",
            "(July. 2024 — Dec. 2024)",
            "- Software Engineer, Application | Part-time",
            "- Designed and implemented APIs for AI Interactive Experience system using NestJS",
            "- Integrated AI model with RESTful APIs for the TTS system and dockerized for AWS",
            "",
            "2. Yating Intelligence Co., Ltd., Taipei, Taiwan",
            "May 2023 — July. 2024",
            "- Software Engineer, Application Service",
            "- Developed APIs using Go, NestJS, and PostgreSQL for web/mobile app features",
            "- Managed microservice systems on GCP using RestfulAPI, GRPC and Pub/Sub",
            "- Designed a post recommendation system, raised retention rate by 40%",
            "- Built features for TTS, ASR, and virtual talker services",
            "",
            "3. ASUSTeK Computer Inc., Taipei, Taiwan",
            "Mar. 2022 — Mar. 2023",
            "- Software Engineer, Asus Intelligent Cloud Service",
            "- Adapted an automated E2E testing system with Python and Selenium",
            "- Designed natural language commands, reducing QA development time by 50%",
            "- Improved response time by 30% through data flow and MongoDB optimization" 
        ]
    }
];

// Shape names corresponding to resume sections
const shapes = ['Education', 'Skills', 'Projects', 'Experience'];
