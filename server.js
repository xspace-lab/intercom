/**
 * AI Collaboratory - WebSocket Server
 * Real AI agents connect and collaborate on tasks
 * 
 * Run: node server.js
 * Then agents can connect to ws://localhost:3000
 */

const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Create HTTP server
const server = http.createServer((req, res) => {
  let filePath = '.' + req.url;
  if (filePath === './') filePath = './index-live.html';
  
  const extname = path.extname(filePath);
  const contentType = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json'
  }[extname] || 'text/html';
  
  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404);
      res.end('404 Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// State
const agents = new Map();
const viewers = new Set();
const tasks = new Map();

// Agent connects
wss.on('connection', (ws, req) => {
  console.log('🔌 New connection');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleMessage(ws, data);
    } catch (error) {
      console.error('❌ Message parse error:', error);
      ws.send(JSON.stringify({ type: 'ERROR', message: error.message }));
    }
  });
  
  ws.on('close', () => {
    // Remove disconnected agent/viewer
    for (const [id, agent] of agents.entries()) {
      if (agent.ws === ws) {
        console.log(`👋 Agent disconnected: ${agent.name}`);
        agents.delete(id);
        broadcastToViewers({ type: 'AGENT_DISCONNECTED', agentId: id });
        break;
      }
    }
    viewers.delete(ws);
  });
  
  // Send welcome
  ws.send(JSON.stringify({
    type: 'CONNECTED',
    message: 'Welcome to AI Collaboratory!',
    timestamp: Date.now()
  }));
});

function handleMessage(ws, data) {
  console.log('📨 Received:', data.type);
  
  switch (data.type) {
    case 'REGISTER_AGENT':
      registerAgent(ws, data);
      break;
      
    case 'REGISTER_VIEWER':
      registerViewer(ws);
      break;
      
    case 'SUBMIT_TASK':
      submitTask(ws, data);
      break;
      
    case 'AGENT_MESSAGE':
      handleAgentMessage(ws, data);
      break;
      
    case 'AGENT_DELIVERABLE':
      handleDeliverable(ws, data);
      break;
      
    default:
      ws.send(JSON.stringify({ type: 'ERROR', message: 'Unknown message type' }));
  }
}

function registerAgent(ws, data) {
  const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const agent = {
    id: agentId,
    ws: ws,
    name: data.name || 'Unknown Agent',
    specialty: data.specialty || 'general',
    status: 'idle',
    tasksCompleted: 0
  };
  
  agents.set(agentId, agent);
  
  console.log(`✅ Agent registered: ${agent.name} (${agent.specialty})`);
  
  // Confirm to agent
  ws.send(JSON.stringify({
    type: 'REGISTERED',
    agentId: agentId,
    message: `Welcome ${agent.name}! Ready to collaborate.`
  }));
  
  // Broadcast to viewers
  broadcastToViewers({
    type: 'AGENT_JOINED',
    agent: {
      id: agentId,
      name: agent.name,
      specialty: agent.specialty,
      status: agent.status
    }
  });
}

function registerViewer(ws) {
  viewers.add(ws);
  console.log(`👁️ Viewer connected (${viewers.size} total)`);
  
  // Send current state
  ws.send(JSON.stringify({
    type: 'STATE_UPDATE',
    agents: Array.from(agents.values()).map(a => ({
      id: a.id,
      name: a.name,
      specialty: a.specialty,
      status: a.status
    })),
    activeTasks: Array.from(tasks.values())
  }));
}

function submitTask(ws, data) {
  const taskId = `task_${Date.now()}`;
  
  const task = {
    id: taskId,
    type: data.taskType,
    description: data.description,
    status: 'pending',
    startTime: Date.now(),
    messages: [],
    assignedAgents: []
  };
  
  tasks.set(taskId, task);
  
  console.log(`📋 Task submitted: ${task.type} - ${task.description.substring(0, 50)}...`);
  
  // Notify viewers
  broadcastToViewers({
    type: 'TASK_SUBMITTED',
    task: {
      id: taskId,
      type: task.type,
      description: task.description,
      status: task.status
    }
  });
  
  // Assign to agents
  assignTaskToAgents(task);
}

function assignTaskToAgents(task) {
  // Determine which agents to use based on task type
  const assignments = {
    code: ['architect', 'coder'],
    debug: ['coder', 'architect'],
    research: ['researcher', 'architect'],
    write: ['architect', 'coder'],
    analyze: ['researcher', 'architect'],
    design: ['researcher', 'architect', 'coder']
  };
  
  const neededSpecialties = assignments[task.type] || ['architect', 'coder'];
  const assignedAgents = [];
  
  // Find agents with needed specialties
  for (const specialty of neededSpecialties) {
    const agent = Array.from(agents.values()).find(a => 
      a.specialty === specialty && a.status === 'idle'
    );
    
    if (agent) {
      assignedAgents.push(agent);
      agent.status = 'working';
      task.assignedAgents.push(agent.id);
    }
  }
  
  if (assignedAgents.length === 0) {
    console.log('⚠️ No available agents for task');
    return;
  }
  
  console.log(`👥 Assigned ${assignedAgents.length} agents to task`);
  
  // Notify assigned agents
  for (const agent of assignedAgents) {
    agent.ws.send(JSON.stringify({
      type: 'TASK_ASSIGNED',
      task: {
        id: task.id,
        type: task.type,
        description: task.description
      },
      team: assignedAgents.map(a => ({
        id: a.id,
        name: a.name,
        specialty: a.specialty
      }))
    }));
  }
  
  // Update viewers
  broadcastToViewers({
    type: 'AGENTS_ASSIGNED',
    taskId: task.id,
    agents: assignedAgents.map(a => ({
      id: a.id,
      name: a.name,
      specialty: a.specialty
    }))
  });
}

function handleAgentMessage(ws, data) {
  // Find agent
  let agent = null;
  for (const [id, a] of agents.entries()) {
    if (a.ws === ws) {
      agent = a;
      agent.id = id;
      break;
    }
  }
  
  if (!agent) {
    ws.send(JSON.stringify({ type: 'ERROR', message: 'Agent not registered' }));
    return;
  }
  
  const task = tasks.get(data.taskId);
  if (!task) {
    ws.send(JSON.stringify({ type: 'ERROR', message: 'Task not found' }));
    return;
  }
  
  // Add message to task
  const message = {
    agentId: agent.id,
    agentName: agent.name,
    content: data.message,
    timestamp: Date.now()
  };
  
  task.messages.push(message);
  
  console.log(`💬 ${agent.name}: ${data.message.substring(0, 50)}...`);
  
  // Broadcast to other agents on the task
  for (const agentId of task.assignedAgents) {
    const teammate = agents.get(agentId);
    if (teammate && teammate.id !== agent.id) {
      teammate.ws.send(JSON.stringify({
        type: 'TEAM_MESSAGE',
        taskId: task.id,
        from: agent.name,
        message: data.message
      }));
    }
  }
  
  // Broadcast to viewers
  broadcastToViewers({
    type: 'COLLABORATION_MESSAGE',
    taskId: task.id,
    agent: {
      id: agent.id,
      name: agent.name,
      specialty: agent.specialty
    },
    message: data.message,
    timestamp: message.timestamp
  });
}

function handleDeliverable(ws, data) {
  const task = tasks.get(data.taskId);
  if (!task) return;
  
  task.deliverable = data.deliverable;
  task.status = 'completed';
  task.completionTime = Date.now();
  
  // Mark agents as idle
  for (const agentId of task.assignedAgents) {
    const agent = agents.get(agentId);
    if (agent) {
      agent.status = 'idle';
      agent.tasksCompleted++;
    }
  }
  
  console.log(`✅ Task completed: ${task.id}`);
  
  // Broadcast completion
  broadcastToViewers({
    type: 'TASK_COMPLETED',
    taskId: task.id,
    deliverable: data.deliverable,
    duration: task.completionTime - task.startTime
  });
}

function broadcastToViewers(message) {
  viewers.forEach(viewer => {
    if (viewer.readyState === WebSocket.OPEN) {
      viewer.send(JSON.stringify(message));
    }
  });
}

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('🚀 AI Collaboratory Server Running!');
  console.log(`📡 WebSocket: ws://localhost:${PORT}`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log('\n💡 AI agents and viewers can now connect!');
  console.log('\n📖 Usage:');
  console.log('  - Open http://localhost:3000 in browser (viewers)');
  console.log('  - Run python agent.py to connect AI agents');
  console.log('  - Submit tasks and watch collaboration!\n');
});

module.exports = { server, wss };
