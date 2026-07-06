<script>
    const chatBox = document.getElementById('chatBox');
    const userInput = document.getElementById('userInput');
    
    // ВАШ НОВИЙ РОБОЧИЙ API KEY
    const API_KEY = 'AIzaSyACDC3jNm7q4nXRM2dGga-T9WC1Qn7l9yc';
    
    // ПІДТВЕРДЖЕНА МОДЕЛЬ
    const MODEL_ID = "gemini-flash-latest";

    async function sendMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        // Відображаємо повідомлення користувача
        appendMessage('user', text);
        userInput.value = '';
        userInput.style.height = '';

        // Створюємо індикатор завантаження
        const loadingId = appendMessage('ai', '<span class="typing-dot">.</span><span class="typing-dot" style="animation-delay:0.2s">.</span><span class="typing-dot" style="animation-delay:0.4s">.</span>');

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${API_KEY}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            // ТУТ ЗАМІНЕНО: Відправляємо чистий промт без заготовок
                            text: text 
                        }]
                    }]
                })
            });

            const data = await response.json();
            
            if (data.error) {
                updateMessage(loadingId, `⚠️ Помилка API: ${data.error.message}`);
                console.error("Деталі помилки:", data.error);
            } else if (data.candidates && data.candidates[0].content.parts[0].text) {
                let aiText = data.candidates[0].content.parts[0].text;
                
                // Форматування Markdown у HTML
                aiText = aiText
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br>')
                    .replace(/^\s*[\-\*]\s+/gm, '• ');

                updateMessage(loadingId, aiText);
            } else {
                updateMessage(loadingId, "⚠️ ШІ повернув порожню відповідь.");
            }

        } catch (error) {
            updateMessage(loadingId, "❌ Критична помилка з'єднання.");
            console.error(error);
        }
    }

    function appendMessage(role, text) {
        const id = Date.now();
        const div = document.createElement('div');
        div.className = `flex items-start gap-4 animate-chat ${role === 'user' ? 'flex-row-reverse' : ''}`;
        div.id = id;

        const icon = role === 'ai' 
            ? '<div class="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white text-xs shrink-0 shadow-lg">AI</div>' 
            : '<div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xs shrink-0 shadow-lg"><i class="fas fa-user text-[10px]"></i></div>';
        
        const style = role === 'ai' ? 'bg-white border-slate-100 text-slate-700' : 'bg-blue-600 text-white shadow-blue-100';

        div.innerHTML = `
            ${icon}
            <div class="${style} p-4 rounded-3xl shadow-sm max-w-[80%] border">
                <div class="text-sm leading-relaxed">${text}</div>
            </div>
        `;

        chatBox.appendChild(div);
        chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
        return id;
    }

    function updateMessage(id, newText) {
        const msgContainer = document.getElementById(id);
        if (msgContainer) {
            const textDiv = msgContainer.querySelector('.text-sm');
            textDiv.innerHTML = newText;
            chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
        }
    }

    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
</script>