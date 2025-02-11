document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');
    const prizeCards = document.querySelectorAll('.prize-card');
    const winPopup = document.querySelector('.win-popup');
    const winAmount = document.querySelector('.win-amount');
    const overlay = document.querySelector('.overlay');
    
    let selectedCards = [];
    let canFlip = true;
    let checkInterval;
    
    window.testWin = function(amount = 5400) {
        showWinPopup(amount);
    };
    
    function shuffleCards() {
        const gameBoard = document.querySelector('.game-board');
        const cardsArray = Array.from(cards);
        
        cardsArray.sort(() => Math.random() - 0.5);
        
        cardsArray.forEach(card => {
            gameBoard.appendChild(card);
        });
    }
    
    function checkMatch() {
        const flippedCards = Array.from(document.querySelectorAll('.card.flipped:not(.matched)'));
        
        const cardsByType = {};
        flippedCards.forEach(card => {
            const type = card.dataset.type;
            if (!cardsByType[type]) {
                cardsByType[type] = [];
            }
            cardsByType[type].push(card);
        });

        for (const type in cardsByType) {
            if (cardsByType[type].length >= 3) {
                const prizeId = `prize${type}`;
                
                const prizeCard = document.getElementById(prizeId);
                const prizeValue = parseInt(prizeCard.dataset.prizeValue);
                prizeCard.classList.add('won');
                showWinPopup(prizeValue);

                return { 
                    matched: true, 
                    prizeType: type,
                    prizeId,
                    cards: cardsByType[type].slice(0, 3)
                };
            }
        }
        
        return { matched: false, needMore: true };
    }
    
    function activatePrize(prizeType, prizeId) {
        const prizeCard = document.getElementById(prizeId);
        if (!prizeCard) {
            return false;
        }
        
        const emptyBox = prizeCard.querySelector('.progress-box:not(.filled)');
        if (emptyBox) {
            emptyBox.classList.add('filled');
            
            const allBoxes = prizeCard.querySelectorAll('.progress-box');
            const filledBoxes = prizeCard.querySelectorAll('.progress-box.filled');
            
            if (filledBoxes.length === allBoxes.length) {
                prizeCard.classList.add('won');
                const prizeValue = parseInt(prizeCard.dataset.prizeValue);
                showWinPopup(prizeValue);
                return true;
            }
        }
        
        return false;
    }
    
    function showWinPopup(amount) {
        // Сразу показываем выигрыш
        winAmount.textContent = amount;
        winPopup.classList.add('show');
        overlay.classList.add('show');
        canFlip = false;
        
        // Изменяем текст кнопки
        const playAgainBtn = winPopup.querySelector('button');
        playAgainBtn.textContent = 'Начать заново';
        
        // Меняем обработчик кнопки
        playAgainBtn.onclick = () => {
            // Показываем экран рекламы
            const adScreen = document.createElement('div');
            adScreen.className = 'start-screen';
            adScreen.innerHTML = `
                <div class="start-content">
                    <h2>Новая игра</h2>
                    <p>Для начала новой игры посмотрите короткую рекламу</p>
                    <button class="watch-ad-btn">Смотреть рекламу</button>
                    <div class="ad-progress">
                        <div class="ad-progress-bar"></div>
                    </div>
                    <div class="ad-timer">5</div>
                    <button class="close-ad-btn" style="
                        margin-top: 20px;
                        background: transparent;
                        border: 1px solid #4CAF50;
                        padding: 10px 20px;
                        color: #4CAF50;
                        cursor: pointer;
                        border-radius: 20px;
                    ">В главное меню</button>
                </div>
            `;
            document.body.appendChild(adScreen);

            const closeBtn = adScreen.querySelector('.close-ad-btn');
            closeBtn.addEventListener('click', () => {
                adScreen.remove();
                winPopup.classList.remove('show');
                overlay.classList.remove('show');
                showMainMenu();
            });

            const adBtn = adScreen.querySelector('.watch-ad-btn');
            const adProgress = adScreen.querySelector('.ad-progress');
            const adProgressBar = adScreen.querySelector('.ad-progress-bar');
            const adTimer = adScreen.querySelector('.ad-timer');

            adBtn.addEventListener('click', () => {
                adBtn.style.display = 'none';
                closeBtn.style.display = 'none';
                adProgress.style.display = 'block';
                adTimer.style.display = 'block';

                const totalTime = 5;
                let timeLeft = totalTime;
                adTimer.textContent = timeLeft;

                const interval = setInterval(() => {
                    const elapsed = totalTime - timeLeft;
                    const progress = (elapsed / totalTime) * 100;
                    adProgressBar.style.width = `${progress}%`;

                    if (progress >= 100) {
                        clearInterval(interval);
                        adScreen.remove();
                        restartGame();
                    }
                }, 10);

                const timer = setInterval(() => {
                    timeLeft--;
                    adTimer.textContent = timeLeft;

                    if (timeLeft <= 0) {
                        clearInterval(timer);
                        clearInterval(interval);
                        adScreen.remove();
                        restartGame();
                    }
                }, 1000);
            });
        };
    }

    function showMainMenu() {
        const mainMenu = document.createElement('div');
        mainMenu.className = 'start-screen';
        mainMenu.innerHTML = `
            <div class="start-content">
                <h2>Главное меню</h2>
                <div class="prize-preview" style="
                    margin: 20px 0;
                    padding: 20px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 15px;
                ">
                    <h3 style="color: #4CAF50; margin-bottom: 15px;">Возможные призы:</h3>
                    <div style="display: flex; justify-content: space-around; margin-bottom: 20px;">
                        <div>
                            <img src="https://i.postimg.cc/nh2gXRj2/koala-button.png" style="width: 50px; height: 50px;">
                            <p>5400</p>
                        </div>
                        <div>
                            <img src="https://i.postimg.cc/mrrqCY7s/image-Photoroom.png" style="width: 50px; height: 50px;">
                            <p>3600</p>
                        </div>
                        <div>
                            <img src="https://i.postimg.cc/N0Pn4Kxr/ton.png" style="width: 50px; height: 50px;">
                            <p>2400</p>
                        </div>
                    </div>
                </div>
                <button class="watch-ad-btn">Играть</button>
            </div>
        `;
        document.body.appendChild(mainMenu);

        const playBtn = mainMenu.querySelector('.watch-ad-btn');
        playBtn.addEventListener('click', () => {
            mainMenu.remove();
            
            // Показываем экран рекламы
            const adScreen = document.createElement('div');
            adScreen.className = 'start-screen';
            adScreen.innerHTML = `
                <div class="start-content">
                    <h2>Новая игра</h2>
                    <p>Для начала игры посмотрите короткую рекламу</p>
                    <button class="watch-ad-btn">Смотреть рекламу</button>
                    <div class="ad-progress">
                        <div class="ad-progress-bar"></div>
                    </div>
                    <div class="ad-timer">5</div>
                </div>
            `;
            document.body.appendChild(adScreen);

            const adBtn = adScreen.querySelector('.watch-ad-btn');
            const adProgress = adScreen.querySelector('.ad-progress');
            const adProgressBar = adScreen.querySelector('.ad-progress-bar');
            const adTimer = adScreen.querySelector('.ad-timer');

            adBtn.addEventListener('click', () => {
                adBtn.style.display = 'none';
                adProgress.style.display = 'block';
                adTimer.style.display = 'block';

                const totalTime = 5;
                let timeLeft = totalTime;
                adTimer.textContent = timeLeft;

                const interval = setInterval(() => {
                    const elapsed = totalTime - timeLeft;
                    const progress = (elapsed / totalTime) * 100;
                    adProgressBar.style.width = `${progress}%`;

                    if (progress >= 100) {
                        clearInterval(interval);
                        adScreen.remove();
                        restartGame();
                    }
                }, 10);

                const timer = setInterval(() => {
                    timeLeft--;
                    adTimer.textContent = timeLeft;

                    if (timeLeft <= 0) {
                        clearInterval(timer);
                        clearInterval(interval);
                        adScreen.remove();
                        restartGame();
                    }
                }, 1000);
            });
        });
    }
    
    function startCheckInterval() {
        if (checkInterval) {
            clearInterval(checkInterval);
        }
        checkInterval = setInterval(() => {
            if (canFlip) {
                const matchResult = checkMatch();
                if (matchResult && matchResult.matched) {
                    matchResult.cards.forEach(card => {
                        card.classList.add('matched');
                    });
                    activatePrize(matchResult.prizeType, matchResult.prizeId);
                }
            }
        }, 1000);
    }

    function stopCheckInterval() {
        if (checkInterval) {
            clearInterval(checkInterval);
            checkInterval = null;
        }
    }

    function showTutorial() {
        if (!localStorage.getItem('tutorialShown')) {
            const tutorial = document.createElement('div');
            tutorial.className = 'tutorial';
            tutorial.innerHTML = `
                <div class="tutorial-content">
                    <h3>Как играть:</h3>
                    <p>1. Открывайте карточки, кликая по ним</p>
                    <p>2. Собирайте комбинации из 3 одинаковых цветов</p>
                    <p>3. Заполняйте прогресс призов</p>
                    <button class="tutorial-close">Понятно!</button>
                </div>
            `;
            document.body.appendChild(tutorial);
            
            tutorial.querySelector('.tutorial-close').addEventListener('click', () => {
                tutorial.remove();
                localStorage.setItem('tutorialShown', 'true');
            });
        }
    }

    function handleCardClick(card) {
        if (!canFlip) return;
        if (card.classList.contains('matched')) return;
        if (card.classList.contains('flipped')) return;
        
        card.classList.add('flipped');
        
        const type = card.dataset.type;
        const prizeId = `prize${type}`;
        const prizeCard = document.getElementById(prizeId);
        const emptyBox = prizeCard.querySelector('.progress-box:not(.filled)');
        if (emptyBox) {
            emptyBox.classList.add('filled');
        }
        
        const matchResult = checkMatch();
        if (matchResult.matched) {
            matchResult.cards.forEach(card => {
                card.classList.add('matched');
            });
            canFlip = false;
        }
    }
    
    window.restartGame = function() {
        stopCheckInterval();
        
        const allCards = document.querySelectorAll('.card');
        allCards.forEach(card => {
            card.classList.remove('flipped', 'matched');
        });
        
        prizeCards.forEach(prize => {
            prize.classList.remove('won');
            const progressBoxes = prize.querySelectorAll('.progress-box');
            progressBoxes.forEach(box => box.classList.remove('filled'));
        });
        
        selectedCards = [];
        canFlip = true;
        
        winPopup.classList.remove('show');
        overlay.classList.remove('show');
        
        shuffleCards();
        startCheckInterval();
    };
    
    cards.forEach(card => {
        card.addEventListener('click', () => handleCardClick(card));
    });
    
    shuffleCards();
    startCheckInterval();

    // Показываем туториал при первом запуске
    showTutorial();

    // Начальный экран и реклама
    const startScreen = document.querySelector('.start-screen');
    const watchAdBtn = document.querySelector('.watch-ad-btn');
    const adProgress = document.querySelector('.ad-progress');
    const adProgressBar = document.querySelector('.ad-progress-bar');
    const adTimer = document.querySelector('.ad-timer');
    const gameBoard = document.querySelector('.game-board');

    // Скрываем игровое поле при загрузке
    gameBoard.style.opacity = '0';
    gameBoard.style.pointerEvents = 'none';

    watchAdBtn.addEventListener('click', () => {
        // Скрываем кнопку и показываем прогресс
        watchAdBtn.style.display = 'none';
        adProgress.style.display = 'block';
        adTimer.style.display = 'block';
        
        const totalTime = 5; // Общее время в секундах
        let timeLeft = totalTime;
        adTimer.textContent = timeLeft;
        
        // Обновляем таймер и прогресс-бар каждые 10мс для плавности
        const interval = setInterval(() => {
            const elapsed = totalTime - timeLeft;
            const progress = (elapsed / totalTime) * 100;
            
            adProgressBar.style.width = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(interval);
                startGame();
            }
        }, 10);
        
        // Обновляем таймер каждую секунду
        const timer = setInterval(() => {
            timeLeft--;
            adTimer.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                clearInterval(interval);
                startGame();
            }
        }, 1000);
    });

    function startGame() {
        // Плавно скрываем начальный экран
        startScreen.classList.add('hidden');
        
        // Показываем игровое поле
        setTimeout(() => {
            gameBoard.style.opacity = '1';
            gameBoard.style.pointerEvents = 'auto';
            gameBoard.classList.add('visible');
            
            // Добавляем эффект появления карточек
            const cards = document.querySelectorAll('.card');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.transform = 'scale(1)';
                    card.style.opacity = '1';
                }, index * 50);
            });
        }, 500);
    }

    // Добавляем начальные стили для карточек
    document.querySelectorAll('.card').forEach(card => {
        card.style.transform = 'scale(0.8)';
        card.style.opacity = '0';
        card.style.transition = 'all 0.3s ease-out';
    });
}); 