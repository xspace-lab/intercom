"""
AI Collaboratory - Agent Client
Connects to WebSocket server and collaborates on tasks

Usage:
    python agent.py --name "Claude Architect" --specialty "architect" --api-key sk-ant-...
"""

import asyncio
import websockets
import json
import argparse
from anthropic import Anthropic

class CollaborationAgent:
    def __init__(self, name, specialty, api_key, server_url="ws://localhost:3000"):
        self.name = name
        self.specialty = specialty
        self.server_url = server_url
        self.client = Anthropic(api_key=api_key)
        self.agent_id = None
        self.current_task = None
        
    async def connect(self):
        """Connect to collaboration server"""
        print(f"🔌 Connecting to {self.server_url}...")
        
        async with websockets.connect(self.server_url) as websocket:
            self.websocket = websocket
            
            # Register with server
            await self.register()
            
            # Main loop
            await self.collaboration_loop()
    
    async def register(self):
        """Register agent with server"""
        message = {
            "type": "REGISTER_AGENT",
            "name": self.name,
            "specialty": self.specialty
        }
        
        await self.websocket.send(json.dumps(message))
        
        # Wait for confirmation
        response = await self.websocket.recv()
        data = json.loads(response)
        
        if data['type'] == 'REGISTERED':
            self.agent_id = data['agentId']
            print(f"✅ Registered as {self.name} ({self.agent_id})")
            print(f"💼 Specialty: {self.specialty}")
            print(f"🤖 Ready to collaborate!\n")
        else:
            raise Exception("Registration failed")
    
    async def collaboration_loop(self):
        """Main loop - receive tasks and collaborate"""
        try:
            async for message in self.websocket:
                data = json.loads(message)
                await self.handle_message(data)
        except websockets.exceptions.ConnectionClosed:
            print("❌ Connection closed")
    
    async def handle_message(self, data):
        """Handle messages from server"""
        msg_type = data.get('type')
        
        if msg_type == 'TASK_ASSIGNED':
            await self.handle_task_assigned(data)
            
        elif msg_type == 'TEAM_MESSAGE':
            await self.handle_team_message(data)
    
    async def handle_task_assigned(self, data):
        """Task assigned to this agent"""
        self.current_task = data['task']
        team = data['team']
        
        print(f"\n📋 Task assigned: {self.current_task['type']}")
        print(f"📝 Description: {self.current_task['description']}")
        print(f"👥 Team: {', '.join([t['name'] for t in team])}\n")
        
        # Decide what to do based on specialty and task
        await self.collaborate_on_task()
    
    async def handle_team_message(self, data):
        """Received message from teammate"""
        print(f"💬 {data['from']}: {data['message'][:100]}...")
        
        # Continue collaboration based on teammate's input
        await asyncio.sleep(1)
        await self.collaborate_on_task()
    
    async def collaborate_on_task(self):
        """Use Claude to generate response for current task"""
        if not self.current_task:
            return
        
        print(f"🤔 {self.name} thinking...")
        
        # Build prompt based on specialty and task
        prompt = self.build_prompt()
        
        # Ask Claude
        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=500,
                messages=[{"role": "user", "content": prompt}]
            )
            
            response = message.content[0].text
            
            print(f"💡 {self.name}: {response[:100]}...\n")
            
            # Send to team
            await self.websocket.send(json.dumps({
                'type': 'AGENT_MESSAGE',
                'taskId': self.current_task['id'],
                'message': response
            }))
            
            # If we're the final agent, send deliverable
            if self.should_complete_task():
                await self.send_deliverable(response)
            
        except Exception as e:
            print(f"⚠️ Error: {e}")
    
    def build_prompt(self):
        """Build prompt for Claude based on specialty and task"""
        task = self.current_task
        
        specialty_prompts = {
            'architect': f"""You are an AI architect agent collaborating on a task.

Task: {task['type']} - {task['description']}

As the architect, your role is to:
- Design the system architecture
- Plan the implementation approach
- Provide strategic guidance
- Review and improve solutions

Provide a concise response (2-3 sentences) with your architectural approach or review.
Be specific and actionable.""",

            'coder': f"""You are an AI coding agent collaborating on a task.

Task: {task['type']} - {task['description']}

As the coder, your role is to:
- Implement the solution
- Write clean, working code
- Fix bugs and issues
- Add tests and documentation

Provide a concise response (2-3 sentences) with your implementation or code snippet.
Be practical and executable.""",

            'researcher': f"""You are an AI research agent collaborating on a task.

Task: {task['type']} - {task['description']}

As the researcher, your role is to:
- Gather relevant information
- Analyze requirements
- Validate approaches
- Provide context and best practices

Provide a concise response (2-3 sentences) with your research findings or analysis.
Be informative and evidence-based."""
        }
        
        return specialty_prompts.get(self.specialty, specialty_prompts['architect'])
    
    def should_complete_task(self):
        """Determine if this agent should mark task as complete"""
        # Simple logic: coder usually completes implementation tasks
        if self.specialty == 'coder' and self.current_task['type'] in ['code', 'debug']:
            return True
        # Architect completes review/design tasks
        if self.specialty == 'architect' and self.current_task['type'] in ['design', 'write']:
            return True
        # Researcher completes research tasks
        if self.specialty == 'researcher' and self.current_task['type'] in ['research', 'analyze']:
            return True
        return False
    
    async def send_deliverable(self, content):
        """Send final deliverable for task"""
        print(f"✅ {self.name} completing task\n")
        
        # Format deliverable
        deliverable = self.format_deliverable(content)
        
        await self.websocket.send(json.dumps({
            'type': 'AGENT_DELIVERABLE',
            'taskId': self.current_task['id'],
            'deliverable': deliverable
        }))
        
        self.current_task = None
    
    def format_deliverable(self, content):
        """Format the final deliverable"""
        task_type = self.current_task['type']
        
        templates = {
            'code': f"// {self.current_task['description']}\n\n{content}",
            'debug': f"Bug Fix:\n{content}\n\nAll tests passing ✅",
            'research': f"Research Report:\n{content}\n\nSources verified ✅",
            'write': f"{content}\n\n— Generated by {self.name}",
            'analyze': f"Analysis:\n{content}\n\nConfidence: 94%",
            'design': f"System Design:\n{content}\n\nReady for implementation ✅"
        }
        
        return templates.get(task_type, content)

def main():
    parser = argparse.ArgumentParser(description='AI Collaboration Agent')
    parser.add_argument('--name', type=str, required=True, help='Agent name')
    parser.add_argument('--specialty', type=str, required=True,
                       choices=['architect', 'coder', 'researcher'],
                       help='Agent specialty')
    parser.add_argument('--api-key', type=str, required=True, help='Anthropic API key')
    parser.add_argument('--server', type=str, default='ws://localhost:3000',
                       help='Server URL')
    
    args = parser.parse_args()
    
    agent = CollaborationAgent(
        name=args.name,
        specialty=args.specialty,
        api_key=args.api_key,
        server_url=args.server
    )
    
    # Run agent
    try:
        asyncio.run(agent.connect())
    except KeyboardInterrupt:
        print("\n👋 Agent shutting down...")
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == '__main__':
    main()
