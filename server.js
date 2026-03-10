const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let questions = JSON.parse(fs.readFileSync('./public/questions.json', 'utf8'));
let currentIndex = 0;
let totalScore = 0;
let clearedStatus = new Array(questions.length).fill(false);

io.on('connection', (socket) => {
    socket.emit('init', { 
        question: questions[Math.min(currentIndex, questions.length - 1)], 
        score: totalScore, 
        isCleared: clearedStatus[Math.min(currentIndex, questions.length - 1)],
        shouldRestartTimer: true,
        isResultScreen: (currentIndex === questions.length)
    });

    socket.on('change_question', (dir) => {
        let newIndex = currentIndex + dir;
        
        if (newIndex >= questions.length) {
            currentIndex = questions.length; // 31に固定
            io.emit('show_success', { score: totalScore });
            return;
        }

        if (newIndex >= 0) {
            currentIndex = newIndex;
            if(newIndex == 20){
                var today = new Date();
                if(today.getMonth()+1 == 3 && today.getDay() == 15){
                    io.emit('update_question', { 
                        question: 'q4-5_0316.png', 
                        score: totalScore, 
                        shouldRestartTimer: true,
                        isCleared: clearedStatus[currentIndex]
                    });
                }
                else if(today.getMonth()+1 == 3 && today.getDay() == 14){
                    io.emit('update_question', { 
                        question: 'q4-5_0315.png', 
                        score: totalScore, 
                        shouldRestartTimer: true,
                        isCleared: clearedStatus[currentIndex]
                    });
                }
                else{
                    io.emit('update_question', { 
                        question: 'q4-5_0315.png', 
                        score: totalScore, 
                        shouldRestartTimer: true,
                        isCleared: clearedStatus[currentIndex]
                    });
                }
            }
            io.emit('update_question', { 
                question: questions[currentIndex], 
                score: totalScore, 
                shouldRestartTimer: true,
                isCleared: clearedStatus[currentIndex]
            });
        }
    });

    socket.on('judge', (isCorrect) => {
        if (isCorrect && currentIndex < questions.length && !clearedStatus[currentIndex]) {
            totalScore += 1;
            clearedStatus[currentIndex] = true;
            io.emit('update_question', { 
                question: questions[currentIndex], 
                score: totalScore, 
                shouldRestartTimer: false, 
                isCleared: clearedStatus[currentIndex]
            });
        }
    });

    socket.on('undo_judge', () => {
        if (currentIndex < questions.length && clearedStatus[currentIndex]) {
            totalScore = Math.max(0, totalScore - 1);
            clearedStatus[currentIndex] = false;
            io.emit('update_question', { 
                question: questions[currentIndex], 
                score: totalScore, 
                shouldRestartTimer: false,
                isCleared: clearedStatus[currentIndex]
            });
        }
    });

    socket.on('reset_game', () => {
        currentIndex = 0;
        totalScore = 0;
        clearedStatus.fill(false);
        io.emit('init', { 
            question: questions[0], 
            score: 0, 
            isCleared: false,
            shouldRestartTimer: true 
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
