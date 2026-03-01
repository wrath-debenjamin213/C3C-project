require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

// Safe fetch support for Render
const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve React build
app.use(express.static(path.join(__dirname, '../dist')));



/* ===============================
   SOCKET.IO REALTIME FEATURES
================================*/

io.on('connection', (socket) => {

    console.log('User connected:', socket.id);

    socket.on('join_roadmap', (roadmapId) => {
        socket.join(roadmapId);
        console.log("Joined roadmap:", roadmapId);
    });

    socket.on('send_message', (data) => {

        console.log("Chat Message:", data);

        socket.to(data.roadmapId).emit('receive_message', data);

    });

    socket.on('update_roadmap', (data) => {

        socket.to(data.roadmapId).emit('roadmap_updated', data.roadmap);

    });

    socket.on('disconnect', () => {
        console.log("User disconnected:", socket.id);
    });

});



/* ===============================
   GEMINI AI ROADMAP GENERATION
================================*/

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.warn("WARNING: GEMINI_API_KEY missing");
}


app.post('/api/generate-roadmap', async (req, res) => {

    try {

        const { formData } = req.body;

        if (!formData || !formData.idea) {

            return res.status(400).json({
                error: "Missing formData"
            });

        }


        const { idea, timeline, category, budget, teamSize, scope } = formData;


        const systemPrompt = `

You are an expert CTO and Product Manager.

Create a structured execution roadmap.

Idea:
${idea}

Category:
${category}

Timeline:
${timeline} weeks

Team Size:
${teamSize}

Scope:
${scope}

Budget:
${budget || "Low"}

Return STRICT JSON.

Root object must contain:

{
phases:[]
}

Each phase:

title
tasks[]

Each task:

id
title
estimatedHours
completed:false
cost
prereqs
details

Details must contain:

whatThisMeans
whatThisMeansExample[]
whyItMatters[]
whatYouNeedToDo[]
output
outputExample

`;


        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    contents: [
                        {
                            parts: [
                                {
                                    text: systemPrompt
                                }
                            ]
                        }
                    ],

                    generationConfig: {
                        temperature: 0.7,
                        responseMimeType: "application/json"
                    }

                })

            }
        );


        if (!response.ok) {

            const text = await response.text();

            throw new Error(text);

        }


        const data = await response.json();


        let responseText =
            data.candidates[0].content.parts[0].text.trim();


        if (responseText.startsWith("```json"))
            responseText = responseText.substring(7);

        if (responseText.startsWith("```"))
            responseText = responseText.substring(3);

        if (responseText.endsWith("```"))
            responseText = responseText.substring(0, responseText.length - 3);


        const generatedRoadmap =
            JSON.parse(responseText.trim());


        res.json({
            roadmap: generatedRoadmap
        });


    }
    catch (error) {

        console.error("AI Error:", error);

        res.status(500).json({
            error: "AI generation failed"
        });

    }

});



/* ===============================
   SHARED ROADMAP LINKS
================================*/

const sharedRoadmaps = new Map();



app.post('/api/share', (req, res) => {

    try {

        const { roadmap } = req.body;

        if (!roadmap || !roadmap.id) {

            return res.status(400).json({
                error: "Invalid roadmap"
            });

        }


        const shareId =
            Math.random()
                .toString(36)
                .substring(2, 8)
                .toUpperCase();


        sharedRoadmaps.set(shareId, roadmap);


        res.json({
            shareId
        });

    }
    catch (e) {

        res.status(500).json({
            error: "Share failed"
        });

    }

});



app.get('/api/shared-roadmap/:id', (req, res) => {

    const { id } = req.params;

    if (sharedRoadmaps.has(id)) {

        res.json({
            roadmap:
                sharedRoadmaps.get(id)
        });

    }
    else {

        res.status(404).json({
            error: "Not found"
        });

    }

});



/* ===============================
   FALLBACK ROUTE
================================*/

app.use((req, res) => {

    res.send("Server running");

});



/* ===============================
   START SERVER
================================*/

server.listen(PORT, () => {

    console.log("Server running on port", PORT);

});
