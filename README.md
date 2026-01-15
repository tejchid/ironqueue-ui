# IronQueue: Full-Stack Job Scheduler 🚀

**A distributed task management platform with real-time monitoring and persistent state.**

**[Live Demo](https://ironqueue.vercel.app/)**

### **Overview**

This repository contains the **Next.js/React** frontend for the IronQueue ecosystem. It acts as the central command center for a distributed system, allowing users to submit, monitor, and manage asynchronous task workflows across a cluster of Python workers.

### **The Full-Stack Architecture**

* **Frontend:** React, TypeScript, and Vite for a reactive, type-safe monitoring dashboard.
* **API Layer:** FastAPI (Python) managing job orchestration and client communication.
* **Message Broker:** Redis for high-speed task queuing and worker distribution.
* **Persistence:** PostgreSQL for reliable job history and metadata storage.
* **Infrastructure:** Fully containerized with Docker for seamless local development and scaling.

### **Core Features**

* **End-to-End Orchestration:** Submit complex JSON payloads through the UI and watch them move through the Redis queue to worker execution in real-time.
* **System Observability:** Visual state-machine that tracks jobs through their entire lifecycle (Pending → Processing → Completed/Failed).
* **Fault Tolerance:** Designed to interact with a "Reaper" service that handles orphaned tasks, with all status updates reflected instantly on the dashboard.

### **Quick Start**

```bash
# Clone the frontend
git clone https://github.com/tejchid/ironqueue-ui

# Install and run
npm install
npm run dev

```

*Note: This frontend requires the [IronQueue Backend](https://github.com/tejchid/ironqueue) to be running to fetch data.*
