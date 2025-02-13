class SlotMachine {
    constructor() {
        console.log('Инициализация слот-машины...');
        this.symbols = [
            { id: 1, url: 'https://i.postimg.cc/LsWTwZqz/image.png', value: 500, isWild: false },
            { id: 2, url: 'https://i.postimg.cc/KjS5vSDj/image.png', value: 400, isWild: false },
            { id: 3, url: 'https://i.postimg.cc/wMXQ1fwV/image.png', value: 300, isWild: false },
            { id: 4, url: 'https://i.postimg.cc/9QFYfBZd/image.png', value: 200, isWild: false },
            { id: 5, url: 'https://i.postimg.cc/TPBVCMS0/image.png', value: 100, isWild: false },
            { id: 6, url: 'https://i.postimg.cc/LsWTwZqz/image.png', value: 1000, isWild: true }
        ];
        
        this.initElements();
        this.init();
        console.log('Слот-машина успешно инициализирована');

        // Проверяем, первый ли это визит
        if (!localStorage.getItem('tutorialCompleted')) {
            this.showTutorial();
        }
    }

    initElements() {
        // Основные элементы
        this.reels = Array.from({ length: 3 }, (_, i) => document.getElementById(`reel${i + 1}`));
        this.spinButton = document.getElementById('spinButton');
        this.balanceElement = document.getElementById('balance');
        
        // Обновляем отображение баланса
        const balanceContainer = document.querySelector('.balance-container');
        if (balanceContainer) {
            balanceContainer.innerHTML = `<h2>Баланс: <span id="balance">${this.balance}</span></h2>`;
        }
        
        this.winMessage = document.getElementById('winMessage');
        this.showCombosButton = document.getElementById('showCombosButton');
        this.modal = document.getElementById('combosModal');
        this.closeButton = document.querySelector('.close-button');
        
        // Новые элементы управления
        this.createControlPanel();
        
        // Инициализация настроек
        this.initSettings();
        this.initCloseButtons();
    }

    updateWinHistory(results, amount) {
        // Добавляем выигрыш в историю
        this.winHistory.push({
            combination: results.map(r => r.id),
            amount: amount,
            multiplier: this.currentMultiplier,
            timestamp: new Date()
        });

        // Обновляем отображение истории
        const historyList = document.getElementById('winHistoryList');
        if (historyList) {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            // Получаем количество оставшихся спинов
            const spinCount = document.getElementById('spinCount');
            const totalSpins = spinCount ? parseInt(spinCount.value) : 1;
            const spinsLeft = totalSpins - (this.sessionStats.totalSpins % totalSpins);
            
            historyItem.innerHTML = `
                <div class="timestamp">${new Date().toLocaleTimeString()}</div>
                <div class="win-amount">+${amount}</div>
                <div class="spins-left">Осталось: ${spinsLeft}</div>
            `;
            
            historyList.insertBefore(historyItem, historyList.firstChild);
            
            // Ограничиваем количество отображаемых записей
            if (historyList.children.length > 10) {
                historyList.removeChild(historyList.lastChild);
            }
        }
    }

    // ... existing code ...
} 