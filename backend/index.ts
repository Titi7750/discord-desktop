import cors from 'cors';
import mysql, { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { Server } from 'socket.io';

const bodyParser = require('body-parser');
const express = require('express');
let io: Server;

async function configureDatabase() {
    const dbConfig = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'discord'
    });

    await dbConfig.execute('CREATE DATABASE IF NOT EXISTS discord');
    await dbConfig.execute(`
        CREATE TABLE IF NOT EXISTS user (
            id INT PRIMARY KEY AUTO_INCREMENT,
            username VARCHAR(100) NOT NULL UNIQUE
        )
    `);
    await dbConfig.execute(`
        CREATE TABLE IF NOT EXISTS conversation (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(100) NOT NULL UNIQUE
        )
    `);
    await dbConfig.execute(`
        CREATE TABLE IF NOT EXISTS message (
            id INT AUTO_INCREMENT PRIMARY KEY,
            content TEXT,
            conversation_id INT,
            user_id INT,
            FOREIGN KEY (user_id) REFERENCES user(id),
            FOREIGN KEY (conversation_id) REFERENCES conversation(id)
        )
    `);

    return dbConfig;
}

function configureExpressApp(dbConfig: mysql.Connection) {
    const app = express();
    const PORT = 3001;

    app.use(bodyParser.json());
    app.use(cors());

    app.get('/conversations', async (req, res) => {
        try {
            const [rows] = await dbConfig.execute<RowDataPacket[]>('SELECT id, title FROM conversation');
            res.json(rows);
        } catch (error) {
            console.error('Error fetching conversations:', error);
            res.status(500).json({ error: 'Database error' });
        }
    });

    app.get('/users', async (req, res) => {
        try {
            const [rows] = await dbConfig.execute<RowDataPacket[]>('SELECT id, username FROM user');
            res.json(rows);
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ error: 'Database error' });
        }
    });

    app.post('/send-message', async (req, res) => {
        const { user_id, content, conversation_id } = req.body;
        console.log('Received message via HTTP POST:', req.body);

        try {
            const [result] = await dbConfig.execute<ResultSetHeader>('INSERT INTO message (content, conversation_id, user_id) VALUES (?, ?, ?)', [content, conversation_id, user_id]);
            const messageId = result.insertId;
            const [userRows] = await dbConfig.execute<RowDataPacket[]>('SELECT username FROM user WHERE id = ?', [user_id]);
            const author = userRows[0]?.username;

            if (!author) {
                return res.status(400).json({ error: 'User not found' });
            }

            const message = { id: messageId, author, content, conversation_id };
            io.emit('message', message);
            res.status(200).json(message);
        } catch (error) {
            console.error('Error sending message:', error);
            res.status(500).json({ error: 'Database error' });
        }
    });

    app.get('/messages', async (req, res) => {
        const { conversation_id } = req.query;
        if (!conversation_id) {
            return res.status(400).send('Conversation_id parameter is required');
        }
        try {
            const [rows] = await dbConfig.execute<RowDataPacket[]>(`
                SELECT message.id, message.content, message.conversation_id, user.username as author 
                FROM message 
                JOIN user ON message.user_id = user.id 
                WHERE conversation_id = ?
                ORDER BY message.id ASC
            `, [conversation_id]);
            res.json(rows);
        } catch (error) {
            console.error('Error fetching messages:', error);
            res.status(500).json({ error: 'Database error' });
        }
    });

    app.get('/last-message', async (req, res) => {
        const { conversation_id } = req.query;
        if (!conversation_id) {
            return res.status(400).send('Conversation_id parameter is required');
        }
        try {
            const [rows] = await dbConfig.execute<RowDataPacket[]>(`
                SELECT message.content, user.username as author 
                FROM message 
                JOIN user ON message.user_id = user.id 
                WHERE conversation_id = ?
                ORDER BY message.id DESC
                LIMIT 1
            `, [conversation_id]);
            res.json(rows[0]);
        } catch (error) {
            console.error('Error fetching last message:', error);
            res.status(500).json({ error: 'Database error' });
        }
    });

    app.listen(PORT, () => {
        console.log(`HTTP server listening on port ${PORT}`);
    });
}

function configureSocketIO(dbConfig: mysql.Connection) {
    io = new Server({
        cors: {
            origin: '*',
        }
    });

    io.on('connection', (socket) => {
        console.log('New connection: ', socket.id);

        socket.on('message', async (message) => {
            try {
                const [result] = await dbConfig.execute<ResultSetHeader>('INSERT INTO message (content, conversation_id, user_id) VALUES (?, ?, ?)', [message.content, message.conversation_id, message.user_id]);
                const messageId = result.insertId;
                const [userRows] = await dbConfig.execute<RowDataPacket[]>('SELECT username FROM user WHERE id = ?', [message.user_id]);
                const author = userRows[0]?.username;

                if (!author) {
                    return console.error('User not found');
                }

                io.emit('message', { id: messageId, author, content: message.content, conversation_id: message.conversation_id });
            } catch (error) {
                console.error('Database error: ', error);
            }
        });
    });

    io.listen(3000);
    console.log('Socket.IO server started on port 3000');
}

async function main() {
    try {
        const dbConfig = await configureDatabase();
        configureExpressApp(dbConfig);
        configureSocketIO(dbConfig);
    } catch (err) {
        console.error(err);
    }
}

main();