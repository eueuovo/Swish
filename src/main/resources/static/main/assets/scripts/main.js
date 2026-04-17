// =====================
// 일일 지원금 수령
// =====================
function claimDailyReward() {
    fetch('/main/claim-reward', { method: 'POST' })
        .then(function(res) {
            return res.json();
        })
        .then(function(data) {
            if (data.success) {
                const galleonEl = document.querySelector('.nav .galleon .text');
                if (galleonEl) galleonEl.textContent = data.totalGalleon;
                showRewardModal(true, `✅ ${data.message}`, `💰 ${data.galleon} 갈레온 지급!`);
            } else {
                showRewardModal(false, data.message, null);
            }
        })
        .catch(function() {
            showRewardModal(false, '오류가 발생했어요. 다시 시도해주세요.', null);
        });
}

// =====================
// 모달 표시
// =====================
function showRewardModal(success, message, sub) {
    // 기존 모달 있으면 제거
    const existing = document.getElementById('rewardModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'rewardModal';
    modal.style.cssText = `
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.55);
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
        animation: fadeIn 0.2s ease;
    `;

    modal.innerHTML = `
        <div style="
            background: #fff;
            border-radius: 16px;
            padding: 36px 44px;
            text-align: center;
            min-width: 280px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.18);
            animation: slideUp 0.25s ease;
        ">
            <p style="font-size: 2rem; margin-bottom: 12px;">${success ? '🪄' : '😢'}</p>
            <p style="font-size: 1rem; color: #333; margin-bottom: ${sub ? '8px' : '24px'}; font-weight: 600;">${message}</p>
            ${sub ? `<p style="font-size: 0.95rem; color: #6c3fc5; margin-bottom: 24px; font-weight: 700;">${sub}</p>` : ''}
            <button id="rewardModalClose" style="
                background: #6c3fc5;
                color: #fff;
                border: none;
                border-radius: 8px;
                padding: 10px 28px;
                cursor: pointer;
                font-size: 0.95rem;
                font-weight: 600;
                transition: background 0.2s;
            ">확인</button>
        </div>
    `;

    document.body.appendChild(modal);

    // 확인 버튼 or 배경 클릭 시 닫기
    document.getElementById('rewardModalClose').addEventListener('click', closeRewardModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeRewardModal();
    });
}

function closeRewardModal() {
    const modal = document.getElementById('rewardModal');
    if (modal) modal.remove();
}

// =====================
// CSS 애니메이션 추가
// =====================
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
    }
    @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to   { transform: translateY(0);    opacity: 1; }
    }
`;
document.head.appendChild(style);

// =====================
// 이벤트 바인딩
// =====================
document.addEventListener('DOMContentLoaded', () => {
    const claimBtn = document.getElementById('claimRewardBtn');
    if (claimBtn) {
        claimBtn.addEventListener('click', claimDailyReward);
    }
});

function showToast(message, type) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');

    toast.classList.add('toast', type);
    toast.textContent = message;
    container.appendChild(toast);

    toast.addEventListener('animationend', () => toast.remove());
}

const enhanceBtn = document.querySelector('.enhance');

enhanceBtn.addEventListener('click', async () => {
    if (enhanceBtn.disabled) return;
    enhanceBtn.disabled = true;

    try {
        const res = await fetch('/main/enhance', { method: 'POST' });
        const data = await res.json();

        if (!data.success) {
            showToast(data.message, 'fail');
            return;
        }

        const messages = {
            SUCCESS: `✨ 강화 성공! +${data.newRank}강이 되었습니다!`,
            MAINTAIN: `😮 강화 유지. 현재 +${data.newRank}강입니다.`,
            DESTROY:  `💥 지팡이가 파괴되었습니다! 1강으로 초기화됩니다.`,
        };
        const types = {
            SUCCESS: 'success',
            MAINTAIN: 'maintain',
            DESTROY: 'fail',
        };

        showToast(messages[data.result], types[data.result]);

        // 갈레온
        const galleonEl = document.querySelector('.nav .galleon .text');
        if (galleonEl) galleonEl.textContent = data.remainGalleon;

        // 강화 수치
        document.querySelector('.wand-detail .level span').textContent = data.newRank;

        // 지팡이 이미지
        if (data.newWandImage) {
            document.querySelector('.wand-info .img').src = data.newWandImage;
        }

        // 파괴 시 지팡이 이름 교체
        if (data.result === 'DESTROY') {
            document.querySelector('.wand-detail h3').textContent = data.newWandName;
        }

        // 확률 업데이트
        if (data.newSuccess != null) {
            const percents = document.querySelectorAll('.prob .prob-item .percent');
            percents[0].textContent = data.newSuccess + '%';
            percents[1].textContent = data.newMaintain + '%';
            percents[2].textContent = data.newFail + '%';
        }

    } catch (e) {
        showToast('오류가 발생했어요. 다시 시도해주세요.', 'fail');
    } finally {
        enhanceBtn.disabled = false;
    }
});

//판매
const sellBtn = document.querySelector(".sell");

if (sellBtn) {
    sellBtn.addEventListener("click", () => {
        if (!confirm("지팡이를 판매하시겠어요?")) return;

        fetch("/main/sell", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    showToast(`판매 완료! +${data.sellPrice} 갈레온`);

                    // 갈레온 업데이트
                    const galleonEl = document.getElementById("galleon");
                    if (galleonEl) {
                        galleonEl.innerText = data.remainGalleon;
                    }

                    // 👉 그냥 새로고침 (지팡이 UI 깔끔하게 반영됨)
                    location.reload();
                } else {
                    showToast(data.message);
                }
            })
            .catch(err => {
                console.error(err);
                showToast("에러 발생");
            });
    });
}