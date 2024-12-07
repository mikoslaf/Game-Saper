# Project Saper

Saper is a web-based implementation of the classic Minesweeper game. This project is built using Node.js, Express, and WebSockets. The game logic is handled server-side, while the client-side is responsible for displaying data and sending events related to player moves.

## Features

- Classic Gameplay
- Responsive Design
- Customizable Difficulty

## Technologies Used

- [Node.js](https://nodejs.org/en])
- [Express](https://expressjs.com/)
- [Socket.IO](https://socket.io/)

## Installation

1. Clone the repository:
```
git clone https://github.com/mikoslaf/Game-Sapper.git
```
2. Navigate to the project directory:
```
cd Game-Sapper
```
3. Install the dependencies:
```
npm install
```
4. Start the server:
```
npm start
```
5. Open your web browser and go to `http://localhost:3000` to start playing the game.

## HTTPS Setup

To run the server with HTTPS, you need to create `key.key` and `key.cer` files.

1. Create a `key.key` file for your private key.
2. Create a `key.cer` file for your certificate.

Ensure these files are placed in the root directory of the project. The server will automatically detect these files and run with HTTPS.

## How to Play

1. Objective: Clear the board without detonating any mines.
2. Controls:
   - Left-click to reveal a tile.
   - Right-click to flag a tile as a mine.
3. Winning: Clear all non-mine tiles.
4. Losing: Reveal a mine.
