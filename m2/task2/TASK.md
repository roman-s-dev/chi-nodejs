Technology restrictions

Node.js, Socket.io, browser JavaScript

Task

Build a real-time chat application using Socket.io, where users can connect and communicate on different chat channels. Use a simple web interface (using the front-end framework which you are most familiar with) for testing purposes.

Requirements:

- Investigate the Socket.io "Get started" tutorial

https://socket.io/get-started/chat

and use it as a guide for this task

- Reproduce all the steps from that tutorial

- When a user connects to the server, they should be prompted to choose a chat channel from a list of available channels.

- When a user sends a message in a chat channel, broadcast the message to all connected clients in that channel.

- Add support for nicknames

- Include the sender's name and timestamp in the message display for each chat channel

- Show who’s online

- Add {user} is typing functionality

- Don’t send the same message to the user that sent it. Instead, append the message directly as soon as they press enter

- Implement a way to prevent users from sending empty or excessively long messages

- Test your results by running at least 3 independent browser instances (incognito mode, etc.) simultaneously for a different chat users to make them able to communicate each other in the chat
