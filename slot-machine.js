class SlotMachine {
    constructor() {
        console.log('Инициализация слот-машины...');
        this.symbols = [
            { id: 1, url: 'https://i.postimg.cc/Sx6q5nWX/aa58afaa-c9b3-42bb-a874-c24862f1e816-Photoroom.png', value: -1000, isWild: false },
            { id: 2, url: 'https://i.postimg.cc/VN4wf2Zm/3510d7ef-b9a1-4d82-a89a-b6bb56e261a7-Photoroom.png', value: 800, isWild: false },
            { id: 3, url: 'https://i.postimg.cc/pTTHpk38/16d8a086-b16c-4f7d-8636-e7f84361d5bd-Photoroom.png', value: 600, isWild: false },
            { id: 4, url: 'https://i.postimg.cc/PxRkZYk7/4a0953c3-7ae5-4a3a-8b35-384772a6fb14-Photoroom.png', value: 400, isWild: false },
            { id: 5, url: 'https://i.postimg.cc/rFtq1nsN/61643317-46fa-4e3d-b461-0da0934c5dac-Photoroom.png', value: 200, isWild: false },
            { id: 6, url: 'https://i.postimg.cc/Mp2qd7j2/cartoon-koala-bear-wearing-hat-scarf-sitting-ground-generative-ai-974539-58351-Photoroom.png', value: 100, isWild: false },
            { id: 7, url: 'https://i.postimg.cc/R0v9zvRg/im-5d071b31-39b0-46a1-8b17-dcb37e7b4118-Photoroom.png', value: 50, isWild: false }
        ];
        
        // Бонусная система
        this.bonusSystem = {
            dailyBonus: 1000,
            progressiveJackpot: 10000,
            lastDailyBonus: null,
            freeSpins: 0,
            multiplier: 1,
            achievements: [
                {
                    id: 'firstSpin',
                    title: 'Первое вращение',
                    description: 'Сделайте свое первое вращение',
                    completed: false
                },
                {
                    id: 'bigWin',
                    title: 'Крупный выигрыш',
                    description: 'Выиграйте 1000 монет за одно вращение',
                    completed: false
                },
                {
                    id: 'luckyStreak',
                    title: 'Счастливая полоса',
                    description: 'Выиграйте 3 раза подряд',
                    completed: false,
                    progress: 0
                },
                {
                    id: 'highRoller',
                    title: 'Хайроллер',
                    description: 'Сделайте 50 вращений',
                    completed: false,
                    progress: 0
                },
                {
                    id: 'jackpotHunter',
                    title: 'Охотник за джекпотами',
                    description: 'Соберите комбинацию из трех диких символов',
                    completed: false
                }
            ]
        };
        
        this.balance = 10000;
        this.spinCost = 100;
        this.isSpinning = false;
        this.currentMultiplier = 1;
        this.autoSpinCount = 0;
        this.isTurboMode = false;
        this.theme = 'dark';
        this.winHistory = [];
        this.sessionStats = {
            totalSpins: 0,
            totalWins: 0,
            biggestWin: 0,
            totalWager: 0
        };
        
        // Настройки анимации
        this.animationSpeed = 1;
        this.effects = {
            particles: true,
            glow: true,
            'three-d': true
        };
        
        this.reels = Array.from({ length: 3 }, (_, i) => document.getElementById(`reel${i + 1}`));
        this.spinButton = document.getElementById('spinButton');
        this.balanceElement = document.getElementById('balance');
        this.winMessage = document.getElementById('winMessage');
        this.showCombosButton = document.getElementById('showCombosButton');
        this.modal = document.getElementById('combosModal');
        this.closeButton = document.querySelector('.close-button');
        
        // Проверка наличия всех необходимых элементов
        if (!this.reels.every(reel => reel)) {
            console.error('Ошибка: Не найдены все барабаны!');
            return;
        }
        if (!this.spinButton || !this.balanceElement || !this.winMessage || 
            !this.showCombosButton || !this.modal || !this.closeButton) {
            console.error('Ошибка: Не найдены необходимые элементы интерфейса!');
            return;
        }

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

    createControlPanel() {
        const controls = document.createElement('div');
        controls.className = 'control-panel';
        
        // Мультиспины
        const spinCount = document.getElementById('spinCount');
        if (spinCount) {
            spinCount.addEventListener('change', (e) => {
                const count = parseInt(e.target.value);
                const totalCost = this.spinCost * count;
                this.spinButton.textContent = `КРУТИТЬ ${count} РАЗ (${totalCost} МОНЕТ)`;
            });
        }
        
        // Турбо режим
        const turboButton = document.getElementById('turboMode');
        if (turboButton) {
            turboButton.addEventListener('click', () => {
                this.toggleTurboMode();
                turboButton.classList.toggle('active');
                turboButton.textContent = this.isTurboMode ? 'ТУРБО РЕЖИМ ВКЛ' : 'ТУРБО РЕЖИМ';
            });
        }
        
        // Настройки
        const settingsButton = document.getElementById('settingsButton');
        if (settingsButton) {
            settingsButton.addEventListener('click', () => this.showSettings());
        }
        
        // Статистика
        const statsButton = document.getElementById('statsButton');
        if (statsButton) {
            statsButton.addEventListener('click', () => this.showStats());
        }
    }

    init() {
        console.log('Начало инициализации...');
        this.preloadImages();
        // Инициализируем барабаны со знаками вопроса
        this.reels.forEach((reel, index) => {
            console.log(`Инициализация барабана ${index + 1}`);
            this.createReelContent(reel, true);
        });
        this.addEventListeners();
        this.updateBalance(0);
        console.log('Инициализация завершена');
    }

    preloadImages() {
        console.log('Предзагрузка изображений...');
        this.symbols.forEach(symbol => {
            const img = new Image();
            img.src = symbol.url;
            console.log(`Загружено изображение: ${symbol.url}`);
        });
    }

    createReelContent(reel, showQuestionMarks = false) {
        reel.innerHTML = '';
        const container = document.createElement('div');
        container.className = 'reel-container';
        
        // Создаем последовательность символов для плавной анимации
        const symbols = [];
        for (let i = 0; i < 10; i++) {
            symbols.push(this.getRandomSymbol());
        }
        
        // Создаем изображения в определенном порядке
        symbols.forEach(symbol => {
            const img = document.createElement('img');
            if (showQuestionMarks) {
                img.src = 'https://i.postimg.cc/nL2FJ56J/koala.png'; // Новая картинка вместо знака вопроса
                img.classList.add('question-mark');
            } else {
                img.src = symbol.url;
                img.dataset.symbolId = symbol.id;
            }
            container.appendChild(img);
        });
        
        reel.appendChild(container);
        container.style.transform = 'translateY(-40%)';
        return symbols[0];
    }

    addEventListeners() {
        console.log('Добавление обработчиков событий...');
        this.spinButton.addEventListener('click', () => {
            console.log('Нажата кнопка вращения');
            this.spin();
        });

        this.showCombosButton.addEventListener('click', () => {
            console.log('Открытие окна комбинаций');
            this.modal.style.display = 'block';
            setTimeout(() => this.modal.classList.add('active'), 10);
        });

        this.closeButton.addEventListener('click', () => {
            console.log('Закрытие окна комбинаций');
            this.modal.classList.remove('active');
            setTimeout(() => {
                this.modal.style.display = 'none';
            }, 300);
        });

        window.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.modal.classList.remove('active');
                setTimeout(() => {
                    this.modal.style.display = 'none';
                }, 300);
            }
        });
    }

    getRandomSymbol() {
        const symbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
        return symbol;
    }

    async spin(count = 1) {
        const spinCount = document.getElementById('spinCount');
        count = spinCount ? parseInt(spinCount.value) : 1;
        
        // Проверяем бесплатные вращения
        const isFree = this.bonusSystem.freeSpins > 0;
        const cost = isFree ? 0 : this.spinCost;
        
        if (this.isSpinning || (!isFree && this.balance < cost * count)) {
            console.log('Недостаточно средств или уже идет вращение');
            return;
        }
        
        const totalCost = cost * count;
        this.isSpinning = true;
        if (!isFree) {
            this.updateBalance(-totalCost);
            this.updateProgressiveJackpot();
        } else {
            this.bonusSystem.freeSpins--;
        }
        
        this.spinButton.disabled = true;
        this.winMessage.style.opacity = '0';
        
        for (let i = 0; i < count; i++) {
            await this.performSingleSpin();
            if (!isFree && this.balance < this.spinCost) break;
            
            if (this.isTurboMode && i < count - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        
        this.isSpinning = false;
        this.spinButton.disabled = false;
        this.updateSpinButton();
    }

    async performSingleSpin() {
        const spinDuration = this.isTurboMode ? 1000 : 7000;
        const spinPromises = this.reels.map(reel => this.spinReel(reel, spinDuration));
        const results = await Promise.all(spinPromises);
        
        this.sessionStats.totalSpins++;
        this.checkWin(results);
        
        if (!this.lastWin) {
            this.reels.forEach(reel => this.createReelContent(reel));
        }
    }

    calculateDiscount(spins) {
        const discounts = {
            5: 0.05,
            10: 0.10,
            20: 0.20
        };
        return discounts[spins] || 0;
    }

    checkWin(results) {
        const [first, second, third] = results;
        let winAmount = 0;
        let winType = '';
        
        // Проверяем на наличие символа с отрицательным значением
        const negativeSymbol = results.find(r => r.value < 0);
        if (negativeSymbol) {
            winAmount = negativeSymbol.value;
            winType = 'ПОТЕРЯ';
            this.updateBalance(winAmount);
            this.showWinEffects(winType, winAmount);
            this.lastWin = false;
            return;
        }
        
        // Проверка на выигрыш с учетом Wild символов
        if (this.isWinningCombination(results)) {
            winAmount = this.calculateWinAmount(results);
            winType = this.getWinType(winAmount);
            
            // Применяем множитель и начисляем выигрыш
            winAmount *= this.currentMultiplier;
            this.updateBalance(winAmount);
            
            // Обновляем статистику
            this.sessionStats.totalWins++;
            this.sessionStats.biggestWin = Math.max(this.sessionStats.biggestWin, winAmount);
            
            // Обновляем историю выигрышей
            this.updateWinHistory(results, winAmount);
            
            this.showWinEffects(winType, winAmount);
        }
        
        this.lastWin = winAmount > 0;
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
                <span>${new Date().toLocaleTimeString()}</span>
                <span>Выигрыш: ${amount}</span>
                <div class="spins-left">Осталось спинов: ${spinsLeft}</div>
            `;
            historyList.insertBefore(historyItem, historyList.firstChild);
            
            // Ограничиваем количество отображаемых записей
            if (historyList.children.length > 10) {
                historyList.removeChild(historyList.lastChild);
            }
        }
    }

    showWinEffects(type, amount) {
        if (type.includes('ДЖЕКПОТ')) {
            this.createJackpotEffect();
        }
        this.showWinMessage(type, amount);
        if (this.effects.particles) {
            this.createParticles();
        }
    }

    async spinReel(reel, duration) {
        return new Promise(resolve => {
            const container = reel.querySelector('.reel-container');
            const finalSymbol = this.getRandomSymbol();
            
            reel.classList.add('spinning');
            
            // Создаем новую последовательность символов
            const symbols = Array.from({ length: 10 }, () => this.getRandomSymbol());
            container.innerHTML = '';
            symbols.forEach(symbol => {
                const img = document.createElement('img');
                img.src = symbol.url;
                img.dataset.symbolId = symbol.id;
                container.appendChild(img);
            });
            
            // Добавляем финальный символ в центр
            const centerIndex = Math.floor(symbols.length / 2);
            const centerImg = container.children[centerIndex];
            if (centerImg) {
                centerImg.src = finalSymbol.url;
                centerImg.dataset.symbolId = finalSymbol.id;
            }
            
            // Начальная и конечная позиции для анимации
            const startPos = -40;
            const finalPos = -40; // Теперь всегда останавливаемся на -40%
            
            // Анимация вращения
            container.style.transform = `translateY(${startPos}%)`;
            
            if (this.isTurboMode) {
                container.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.5, 0.3, 1)';
            } else {
                container.style.transition = 'transform 3s cubic-bezier(0.2, 0.5, 0.3, 1)';
            }
            
            requestAnimationFrame(() => {
                container.style.transform = `translateY(${finalPos}%)`;
            });
            
            setTimeout(() => {
                reel.classList.remove('spinning');
                container.style.transition = '';
                resolve(finalSymbol);
            }, duration);
        });
    }

    showWinMessage(message, amount) {
        if (amount === 0) return;
        
        const isLoss = amount < 0;
        const displayAmount = Math.abs(amount);
        const displayMessage = isLoss ? `${message} -${displayAmount}` : `${message} +${displayAmount}`;
        
        if (this.isTurboMode) {
            // Создаем быстрое уведомление для турбо режима
            const turboMessage = document.createElement('div');
            turboMessage.className = 'turbo-win-message';
            turboMessage.textContent = displayMessage;
            if (isLoss) turboMessage.style.color = '#ff4444';
            document.body.appendChild(turboMessage);
            
            setTimeout(() => {
                turboMessage.remove();
            }, 1000);
        } else {
            this.winMessage.textContent = displayMessage;
            this.winMessage.style.color = isLoss ? '#ff4444' : '#FFD700';
            this.winMessage.style.opacity = '1';
            this.winMessage.style.animation = 'win-pulse 1.5s ease-in-out';
            
            setTimeout(() => {
                this.winMessage.style.opacity = '0';
                this.winMessage.style.animation = 'none';
            }, 1500);
        }
    }

    updateBalance(amount) {
        const balanceElement = document.getElementById('balance');
        const balanceContainer = document.querySelector('.balance-container');
        const oldBalance = this.balance;
        this.balance += amount;

        // Сначала удаляем старые классы анимации
        balanceElement.classList.remove('increase', 'decrease');
        balanceContainer.classList.remove('increase', 'decrease');

        // Принудительно вызываем reflow для сброса анимации
        void balanceElement.offsetWidth;
        void balanceContainer.offsetWidth;

        // Добавляем новые классы анимации
        if (amount > 0) {
            balanceElement.classList.add('increase');
            balanceContainer.classList.add('increase');
        } else if (amount < 0) {
            balanceElement.classList.add('decrease');
            balanceContainer.classList.add('decrease');
        }

        // Анимируем изменение числа
        const duration = 1000; // 1 секунда
        const start = oldBalance;
        const end = this.balance;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Используем функцию плавности для более естественной анимации
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (end - start) * easeProgress);
            
            balanceElement.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Удаляем классы анимации после завершения
                setTimeout(() => {
                    balanceElement.classList.remove('increase', 'decrease');
                    balanceContainer.classList.remove('increase', 'decrease');
                }, 1000);
            }
        };

        requestAnimationFrame(animate);
        
        // Обновляем состояние кнопки
        this.spinButton.disabled = this.balance < this.spinCost;
        
        // Обновляем текст кнопки спина
        const spinCount = document.getElementById('spinCount');
        if (spinCount) {
            const count = parseInt(spinCount.value);
            const totalCost = this.spinCost * count;
            this.spinButton.innerHTML = `КРУТИТЬ ${count} РАЗ <img src="https://i.postimg.cc/FFx7T4Bh/image.png" alt="${totalCost} монет" class="coin-icon">`;
        }
    }

    isWinningCombination(results) {
        const [first, second, third] = results;
        return (
            first.id === second.id && second.id === third.id || // три одинаковых символа
            (first.id === second.id || second.id === third.id || first.id === third.id) // два одинаковых символа
        );
    }

    calculateWinAmount(results) {
        const [first, second, third] = results;
        let winAmount = 0;

        if (first.id === second.id && second.id === third.id) {
            // Три одинаковых символа
            winAmount = first.value * 10; // Множитель для трех символов
            if (first.isWild && second.isWild && third.isWild) {
                winAmount = first.value * 50; // Джекпот для трех вайлдов
            }
        } else if (first.id === second.id || second.id === third.id || first.id === third.id) {
            // Два одинаковых символа
            winAmount = first.value * 5; // Множитель для двух символов
        }

        return winAmount;
    }

    getWinType(amount) {
        if (amount >= 1000) return 'МЕГА ДЖЕКПОТ!';
        if (amount >= 800) return 'СУПЕР ДЖЕКПОТ!';
        if (amount >= 600) return 'ДЖЕКПОТ!';
        if (amount >= 400) return 'КРУПНЫЙ ВЫИГРЫШ!';
        if (amount >= 200) return 'СРЕДНИЙ ВЫИГРЫШ!';
        if (amount >= 100) return 'МАЛЫЙ ВЫИГРЫШ!';
        if (amount >= 50) return 'МИНИ-ВЫИГРЫШ!';
        return 'ПОПРОБУЙТЕ ЕЩЕ РАЗ!';
    }

    toggleTurboMode() {
        this.isTurboMode = !this.isTurboMode;
        console.log(`Турбо режим: ${this.isTurboMode ? 'Включен' : 'Выключен'}`);
    }

    showSettings() {
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal) {
            this.updateSettings();
            settingsModal.style.display = 'block';
            setTimeout(() => {
                settingsModal.classList.add('show');
                settingsModal.classList.add('active');
                // Активируем первую вкладку по умолчанию
                this.switchTab('settingsTab');
            }, 10);
        }
    }

    showStats() {
        const statsModal = document.getElementById('statsModal');
        if (statsModal) {
            this.updateStats();
            statsModal.style.display = 'block';
            setTimeout(() => statsModal.classList.add('active'), 10);
        }
    }

    updateSettings() {
        // Обновляем значения в настройках
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) themeSelect.value = this.theme;

        const particlesEffect = document.getElementById('particlesEffect');
        if (particlesEffect) particlesEffect.checked = this.effects.particles;

        const glowEffect = document.getElementById('glowEffect');
        if (glowEffect) glowEffect.checked = this.effects.glow;

        const threeDEffect = document.getElementById('three-d-effect');
        if (threeDEffect) threeDEffect.checked = this.effects['three-d'];

        const speedInput = document.getElementById('animationSpeed');
        if (speedInput) {
            speedInput.value = this.animationSpeed;
            speedInput.addEventListener('input', (e) => {
                this.animationSpeed = parseFloat(e.target.value);
                this.updateAnimationSpeed();
                // Обновляем отображение текущего значения
                const speedLabel = speedInput.closest('.setting-item').querySelector('h3');
                if (speedLabel) {
                    speedLabel.setAttribute('data-value', `${e.target.value}x`);
                }
            });
        }
    }

    updateStats() {
        const totalSpins = document.getElementById('totalSpins');
        const totalWins = document.getElementById('totalWins');
        const biggestWin = document.getElementById('biggestWin');
        const winRate = document.getElementById('winRate');
        
        if (totalSpins) totalSpins.textContent = this.sessionStats.totalSpins;
        if (totalWins) totalWins.textContent = this.sessionStats.totalWins;
        if (biggestWin) biggestWin.textContent = this.sessionStats.biggestWin;
        if (winRate) {
            const rate = this.sessionStats.totalSpins > 0 
                ? ((this.sessionStats.totalWins / this.sessionStats.totalSpins) * 100).toFixed(1)
                : 0;
            winRate.textContent = rate + '%';
        }
    }

    initSettings() {
        this.settingsButton = document.getElementById('settingsButton');
        this.settingsModal = document.getElementById('settingsModal');
        this.tabButtons = document.querySelectorAll('.tab-button');
        this.tabPanes = document.querySelectorAll('.tab-pane');

        this.settingsButton.addEventListener('click', () => {
            this.showSettings();
        });

        this.tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });

        // Инициализируем первую вкладку как активную
        this.switchTab('settings');

        // Инициализация темы
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.value = this.theme;
            themeSelect.addEventListener('change', (e) => {
                this.theme = e.target.value;
                document.body.className = `theme-${this.theme}`;
            });
        }

        // Инициализация эффектов
        const effectsMap = {
            'particlesEffect': 'particles',
            'glowEffect': 'glow',
            'three-d-effect': 'three-d'
        };

        Object.entries(effectsMap).forEach(([inputId, effectName]) => {
            const input = document.getElementById(inputId);
            if (input) {
                input.checked = this.effects[effectName];
                input.addEventListener('change', (e) => {
                    this.toggleEffect(effectName);
                });
            }
        });

        // Инициализация скорости анимации
        const speedInput = document.getElementById('animationSpeed');
        if (speedInput) {
            speedInput.value = this.animationSpeed;
            speedInput.addEventListener('input', (e) => {
                this.animationSpeed = parseFloat(e.target.value);
                this.updateAnimationSpeed();
                // Обновляем отображение текущего значения
                const speedLabel = speedInput.closest('.setting-item').querySelector('h3');
                if (speedLabel) {
                    speedLabel.setAttribute('data-value', `${e.target.value}x`);
                }
            });
        }
    }

    switchTab(tabId) {
        console.log('Переключение на вкладку:', tabId);
        
        // Обновляем кнопки вкладок
        this.tabButtons.forEach(button => {
            const isActive = button.getAttribute('data-tab') === tabId;
            button.classList.toggle('active', isActive);
        });

        // Обновляем содержимое вкладок
        const tabPanes = document.querySelectorAll('.tab-pane');
        tabPanes.forEach(pane => {
            const isActive = pane.getAttribute('data-tab') === tabId;
            pane.classList.toggle('active', isActive);
            if (isActive) {
                pane.style.display = 'block';
                setTimeout(() => pane.style.opacity = '1', 10);
            } else {
                pane.style.opacity = '0';
                setTimeout(() => pane.style.display = 'none', 300);
            }
        });

        // Обновляем данные в активной вкладке
        if (tabId === 'statsTab') {
            this.updateStats();
        } else if (tabId === 'settingsTab') {
            this.updateSettings();
        }
    }

    initCloseButtons() {
        const modals = ['settingsModal', 'statsModal', 'combosModal'];
        
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (!modal) return;

            const closeBtn = modal.querySelector('.close-button');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    modal.classList.remove('active');
                    modal.classList.remove('show');
                    setTimeout(() => {
                        modal.style.display = 'none';
                    }, 300);
                });
            }

            window.addEventListener('click', (event) => {
                if (event.target === modal) {
                    modal.classList.remove('active');
                    modal.classList.remove('show');
                    setTimeout(() => {
                        modal.style.display = 'none';
                    }, 300);
                }
            });
        });
    }

    createJackpotEffect() {
        // Создаем эффект джекпота
        const particles = 30;
        for (let i = 0; i < particles; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.backgroundColor = `hsl(${Math.random() * 360}, 50%, 50%)`;
            document.body.appendChild(particle);
            
            setTimeout(() => particle.remove(), 3000);
        }
        
        // Добавляем класс для анимации джекпота
        this.reels.forEach(reel => {
            reel.classList.add('jackpot');
            setTimeout(() => reel.classList.remove('jackpot'), 3000);
        });
    }

    createParticles() {
        const colors = ['#FFD700', '#FFA500', '#FF4500', '#FF0000'];
        const particles = 20;
        
        for (let i = 0; i < particles; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            document.body.appendChild(particle);
            
            setTimeout(() => particle.remove(), 3000);
        }
    }

    toggleEffect(effectName) {
        this.effects[effectName] = !this.effects[effectName];
        
        switch(effectName) {
            case 'three-d':
                this.reels.forEach(reel => {
                    reel.classList.toggle('three-d-enabled', this.effects['three-d']);
                });
                break;
            case 'particles':
                document.body.classList.toggle('particles-enabled', this.effects.particles);
                break;
            case 'glow':
                document.body.classList.toggle('glow-enabled', this.effects.glow);
                break;
        }
    }

    updateAnimationSpeed() {
        const style = document.documentElement.style;
        style.setProperty('--animation-speed', `${1 / this.animationSpeed}s`);
    }

    // Добавляем новые методы для бонусной системы
    checkDailyBonus() {
        const today = new Date().toDateString();
        if (this.bonusSystem.lastDailyBonus !== today) {
            this.bonusSystem.lastDailyBonus = today;
            this.updateBalance(this.bonusSystem.dailyBonus);
            this.showBonusMessage('ЕЖЕДНЕВНЫЙ БОНУС', this.bonusSystem.dailyBonus);
        }
    }

    updateProgressiveJackpot() {
        // Увеличиваем джекпот на 1% от стоимости спина
        this.bonusSystem.progressiveJackpot += Math.floor(this.spinCost * 0.01);
        // Обновляем отображение джекпота
        const jackpotElement = document.getElementById('jackpotAmount');
        if (jackpotElement) {
            jackpotElement.textContent = this.bonusSystem.progressiveJackpot;
        }
    }

    addFreeSpins(count) {
        this.bonusSystem.freeSpins += count;
        this.showBonusMessage('БЕСПЛАТНЫЕ ВРАЩЕНИЯ', count);
        this.updateSpinButton();
    }

    updateSpinButton() {
        const spinCount = document.getElementById('spinCount');
        if (spinCount) {
            const count = parseInt(spinCount.value);
            const totalCost = this.bonusSystem.freeSpins > 0 ? 0 : this.spinCost * count;
            const buttonText = this.bonusSystem.freeSpins > 0 ? 
                `КРУТИТЬ (БЕСПЛАТНО ${this.bonusSystem.freeSpins})` : 
                `КРУТИТЬ ${count} РАЗ <img src="https://i.postimg.cc/FFx7T4Bh/image.png" alt="${totalCost} монет" class="coin-icon">`;
            this.spinButton.innerHTML = buttonText;
        }
    }

    showBonusMessage(type, value) {
        const bonusMessage = document.createElement('div');
        bonusMessage.className = 'bonus-message';
        bonusMessage.textContent = `${type}: +${value}`;
        document.body.appendChild(bonusMessage);
        
        setTimeout(() => {
            bonusMessage.remove();
        }, 2000);
    }

    checkAchievements(results, winAmount) {
        const achievements = this.bonusSystem.achievements;
        let achievementUnlocked = false;
        
        // Первое вращение
        if (!achievements.find(a => a.id === 'firstSpin').completed) {
            achievementUnlocked = true;
            this.unlockAchievement('firstSpin');
        }
        
        // Крупный выигрыш
        if (winAmount >= 1000 && !achievements.find(a => a.id === 'bigWin').completed) {
            achievementUnlocked = true;
            this.unlockAchievement('bigWin');
        }
        
        // Счастливая полоса
        const luckyStreak = achievements.find(a => a.id === 'luckyStreak');
        if (winAmount > 0) {
            luckyStreak.progress++;
            if (luckyStreak.progress >= 3 && !luckyStreak.completed) {
                achievementUnlocked = true;
                this.unlockAchievement('luckyStreak');
            }
        } else {
            luckyStreak.progress = 0;
        }
        
        // Хайроллер
        const highRoller = achievements.find(a => a.id === 'highRoller');
        highRoller.progress++;
        if (highRoller.progress >= 50 && !highRoller.completed) {
            achievementUnlocked = true;
            this.unlockAchievement('highRoller');
        }
        
        // Охотник за джекпотами
        if (results.every(r => r.isWild) && !achievements.find(a => a.id === 'jackpotHunter').completed) {
            achievementUnlocked = true;
            this.unlockAchievement('jackpotHunter');
        }

        // Сохраняем прогресс достижений
        this.saveAchievements();
        
        // Обновляем вкладку достижений, если она открыта
        if (document.querySelector('#achievementsTab.active')) {
            this.updateAchievementsTab();
        }

        return achievementUnlocked;
    }

    unlockAchievement(achievementId) {
        const achievement = this.bonusSystem.achievements.find(a => a.id === achievementId);
        if (achievement && !achievement.completed) {
            achievement.completed = true;
            
            // Создаем уведомление о достижении
            const achievementNotification = document.createElement('div');
            achievementNotification.className = 'achievement-notification';
            achievementNotification.innerHTML = `
                <div class="achievement-icon">${achievement.completed ? '🏆' : '🔒'}</div>
                <div class="achievement-info">
                    <div class="achievement-title">${achievement.title}</div>
                    <div class="achievement-description">${achievement.description}</div>
                </div>
            `;
            document.body.appendChild(achievementNotification);
            
            // Анимация появления и исчезновения
            setTimeout(() => achievementNotification.classList.add('show'), 100);
            setTimeout(() => {
                achievementNotification.classList.remove('show');
                setTimeout(() => achievementNotification.remove(), 300);
            }, 3000);
            
            // Обновляем вкладку с достижениями
            this.updateAchievementsTab();
            
            // Сохраняем прогресс
            this.saveAchievements();
            
            // Воспроизводим звук достижения, если включены звуки
            if (this.effects.sound) {
                // Здесь можно добавить звук
            }
        }
    }

    updateAchievementsTab() {
        const achievementsList = document.querySelector('.achievements-list');
        if (achievementsList) {
            achievementsList.innerHTML = '';
            this.bonusSystem.achievements.forEach(achievement => {
                const achievementElement = document.createElement('div');
                achievementElement.className = `achievement-item ${achievement.completed ? 'completed' : ''}`;
                
                let progressText = '';
                if (achievement.progress !== undefined) {
                    const maxProgress = achievement.id === 'highRoller' ? 50 : 3;
                    progressText = `<div class="achievement-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(achievement.progress / maxProgress) * 100}%"></div>
                        </div>
                        <div class="progress-text">${achievement.progress}/${maxProgress}</div>
                    </div>`;
                }
                
                achievementElement.innerHTML = `
                    <div class="achievement-icon">
                        ${achievement.completed ? '🏆' : '🔒'}
                    </div>
                    <div class="achievement-info">
                        <div class="achievement-title">${achievement.title}</div>
                        <div class="achievement-description">${achievement.description}</div>
                        ${progressText}
                    </div>
                `;
                achievementsList.appendChild(achievementElement);
            });
        }
    }

    saveAchievements() {
        try {
            localStorage.setItem('slotAchievements', JSON.stringify(this.bonusSystem.achievements));
        } catch (e) {
            console.error('Ошибка сохранения достижений:', e);
        }
    }

    loadAchievements() {
        try {
            const savedAchievements = localStorage.getItem('slotAchievements');
            if (savedAchievements) {
                const parsed = JSON.parse(savedAchievements);
                this.bonusSystem.achievements = this.bonusSystem.achievements.map(achievement => {
                    const saved = parsed.find(a => a.id === achievement.id);
                    return saved ? { ...achievement, ...saved } : achievement;
                });
            }
        } catch (e) {
            console.error('Ошибка загрузки достижений:', e);
        }
    }

    showTutorial() {
        const tutorialSteps = [
            {
                title: 'Добро пожаловать в Коала Удачи!',
                content: 'Это простой и увлекательный слот с милыми коалами. Давайте я покажу вам, как играть.'
            },
            {
                title: 'Как играть',
                content: 'Нажмите кнопку "КРУТИТЬ", чтобы запустить барабаны. Собирайте одинаковые символы в линию для выигрыша.'
            },
            {
                title: 'Комбинации',
                content: 'Нажмите кнопку "ВОЗМОЖНЫЕ ВЫИГРЫШИ" в правом верхнем углу, чтобы увидеть все выигрышные комбинации.'
            },
            {
                title: 'Настройки',
                content: 'Используйте кнопку настроек в левом верхнем углу для изменения темы, эффектов и скорости игры.'
            },
            {
                title: 'Достижения',
                content: 'Открывайте достижения, выполняя различные задания. Следите за своим прогрессом во вкладке "Достижения".'
            }
        ];

        const overlay = document.createElement('div');
        overlay.className = 'tutorial-overlay';
        overlay.innerHTML = `
            <div class="tutorial-content">
                <div class="tutorial-steps"></div>
                <div class="tutorial-navigation">
                    <button class="tutorial-button" id="prevStep" style="display: none;">НАЗАД</button>
                    <button class="tutorial-button" id="nextStep">ДАЛЕЕ</button>
                </div>
                <div class="tutorial-progress"></div>
            </div>
        `;
        document.body.appendChild(overlay);

        const stepsContainer = overlay.querySelector('.tutorial-steps');
        const progressContainer = overlay.querySelector('.tutorial-progress');
        
        // Создаем шаги
        tutorialSteps.forEach((step, index) => {
            const stepElement = document.createElement('div');
            stepElement.className = `tutorial-step ${index === 0 ? 'active' : ''}`;
            stepElement.innerHTML = `
                <h2>${step.title}</h2>
                <p>${step.content}</p>
            `;
            stepsContainer.appendChild(stepElement);
            
            // Создаем точки прогресса
            const dot = document.createElement('div');
            dot.className = `tutorial-dot ${index === 0 ? 'active' : ''}`;
            progressContainer.appendChild(dot);
        });

        let currentStep = 0;
        const prevButton = overlay.querySelector('#prevStep');
        const nextButton = overlay.querySelector('#nextStep');
        
        const updateButtons = () => {
            prevButton.style.display = currentStep === 0 ? 'none' : 'block';
            nextButton.textContent = currentStep === tutorialSteps.length - 1 ? 'НАЧАТЬ ИГРУ' : 'ДАЛЕЕ';
        };

        const showStep = (step) => {
            const steps = overlay.querySelectorAll('.tutorial-step');
            const dots = overlay.querySelectorAll('.tutorial-dot');
            
            steps.forEach((s, i) => {
                s.classList.toggle('active', i === step);
            });
            
            dots.forEach((d, i) => {
                d.classList.toggle('active', i === step);
            });
            
            currentStep = step;
            updateButtons();
        };

        prevButton.addEventListener('click', () => {
            if (currentStep > 0) {
                showStep(currentStep - 1);
            }
        });

        nextButton.addEventListener('click', () => {
            if (currentStep < tutorialSteps.length - 1) {
                showStep(currentStep + 1);
            } else {
                overlay.remove();
                localStorage.setItem('tutorialCompleted', 'true');
            }
        });

        // Показываем оверлей
        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });
    }
}

// Инициализация игры после полной загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен, инициализация слот-машины...');
    new SlotMachine();
}); 