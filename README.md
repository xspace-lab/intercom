# 🎯 TaskKeeper

**An AI-powered personal task and reminder manager built on Intercom**

TaskKeeper is a simple, beautiful, and intelligent task management application that leverages Claude AI to help users stay organized through natural conversation.

## 🌟 Features

- **Natural Language Task Creation** - Just tell Claude what you need to do
- **Smart Reminders** - Set up recurring alarms for daily habits
- **Calendar Integration** - Create and view events directly in your calendar
- **Quick Actions** - One-click access to common tasks
- **Timer Support** - Set countdown timers for focused work
- **Beautiful UI** - Clean, modern interface with smooth animations
- **Conversational AI** - Powered by Claude Sonnet 4 for intelligent interactions

## 🚀 How It Works

TaskKeeper uses the Intercom pattern to integrate Claude AI with native device capabilities:

1. **User Input** - Users type naturally: "Remind me to take vitamins every morning"
2. **AI Processing** - Claude understands intent and selects appropriate tools
3. **Action Execution** - Creates alarms, events, timers via device APIs
4. **Confirmation** - Provides clear, friendly feedback

## 🛠️ Tools Used

- `alarm_create_v0` - Daily recurring reminders
- `event_create_v1` - Calendar event creation
- `event_search_v0` - View schedule
- `user_time_v0` - Get current date/time
- `timer_create_v0` - Countdown timers

## 📦 Installation

1. Clone this repository
2. Open `index.html` in a modern web browser
3. Start chatting with your AI task manager!

No build process, no dependencies - just pure HTML, CSS, and JavaScript.

## 💡 Usage Examples

- "Add a task to review the presentation by Friday"
- "Remind me to take medication at 8am every day"
- "What do I have on my calendar this week?"
- "Set a 25 minute timer for focused work"
- "Schedule a dentist appointment for next Tuesday at 3pm"

## 🎨 Screenshots

![TaskKeeper Interface](screenshot.png)
*Clean, modern interface with conversational AI*

## 🏗️ Technical Details

- **Frontend**: Vanilla HTML/CSS/JavaScript
- **AI Model**: Claude Sonnet 4 via Anthropic API
- **Architecture**: Client-side only, no backend required
- **APIs**: Integrates with device calendar and alarm systems

## 🎯 Use Cases

- **Personal Productivity** - Track daily tasks and habits
- **Schedule Management** - Never miss appointments
- **Time Management** - Use timers for focused work sessions
- **Habit Building** - Set recurring reminders for new habits
- **Quick Capture** - Quickly add tasks via natural language

## 🔧 Customization

The SKILL.md file contains detailed instructions for Claude on how to behave within TaskKeeper. You can customize:

- Response style and tone
- Default durations for events
- Task categorization logic
- Priority assessment

## 📝 Intercom Competition Entry

**Trac Address**: `[trac1krxpwpfrtkwv8rz8u39f6gxwd6ccpl48vnpq44gg8lkfhk5mmp0qhhzjjp]`

This is a fork of Intercom built for the Trac Systems vibe competition. TaskKeeper demonstrates:

✅ Practical everyday utility
✅ Clean, intuitive interface
✅ Effective use of Claude's tool-calling capabilities
✅ Clear agent instructions via SKILL.md
✅ Simple, maintainable codebase

## 🤝 Contributing

This project is part of the Intercom ecosystem. Feel free to fork and build your own variations!

## 📄 License

MIT License - feel free to use and modify

## 🔗 Links

- [Intercom Original](https://github.com/Trac-Systems/intercom)
- [Awesome Intercom](https://github.com/Trac-Systems/awesome-intercom)
- [Competition Details](https://github.com/Trac-Systems/intercom/blob/main/SKILL.md)

---

Built with ❤️ using Claude AI and the Intercom framework
