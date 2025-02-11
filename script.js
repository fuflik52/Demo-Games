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
        winAmount.textContent = amount;
        winPopup.classList.add('show');
        overlay.classList.add('show');
        canFlip = false;
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
}); 