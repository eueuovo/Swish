document.addEventListener('DOMContentLoaded', () => {
    const pages = [ //페이지들 배열로 묶은 이유 : 순서를 알려주고 페이지 어디 쯤 있는지 숫자로 관리하기 위함
        document.querySelector('.first-page'), //시작 화면
        ...document.querySelectorAll('.question-page'), //질문지 (...으로 배열로 펼침 -> 전개 연산자)
        document.querySelector('.last-page') //결과 화면
    ].filter(Boolean); // 혹시 비어있는 요소가 있다면 제거

    let current = 0; // 현재 몇 번째 페이지인지 저장하는 곳
    const scores = {}; // 기숙사별 점수 담는 곳
    let selectedDormId = null; // 최종적으로 저장될 기숙사 ID

    pages.forEach(p => p.style.display = 'none'); // 모든 페이지 숨기기
    pages[current].style.display = 'block'; // 현재 번호(current) 보이게 하기

    // 데이터 매칭
    const dormMap = { "1": '슬리데린', "2": '후플푸프', "3": '그리핀도르', "4": '래번클로' };

    // 답변 클릭 시 (자동 계산)
    document.querySelectorAll('.question').forEach(q => {
        q.addEventListener('click', () => {
            const dormId = q.dataset.dormId; // 기숙사 번호 가져오기 (data-dorm-id)
            scores[dormId] = (scores[dormId] || 0) + 1; // 해당 기숙사 번호에 +1점

            nextPage();

            // 넘긴 페이지가 마지막 페이지면 결과 계산 실행
            if (pages[current].classList.contains('last-page')) {
                calculateResult();
            }
        });
    });

    // 첫번째, 마지막 페이지 다음 버튼 클릭 로직
    document.querySelectorAll('.next-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();

            // 마지막 페이지에서 '다음' 클릭 시 DB 저장 후 이동
            if (pages[current].classList.contains('last-page')) {
                saveAndGoMain();
            } else {
                // 마지막 페이지 아니면 걍 다음 페이지
                nextPage();
            }
        });
    });

    // 직접 선택(모달) 로직
    const reBtn = document.querySelector('.re');
    if (reBtn) {
        reBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // prompt나 커스텀 모달 사용 (여기서는 이해를 돕기 위해 prompt 예시)
            const choice = prompt("기숙사를 선택하세요: 1:그리핀도르, 2:슬리데린, 3:래번클로, 4:후플푸프");
            if (dormMap[choice]) {
                updateDormDisplay(choice);
            }
        });
    }

    // 다음 페이지로 가기
    function nextPage() {
        pages[current].style.display = 'none'; // 지금 페이지 숨김
        current++; // 지금 보이는 페이지에서 +1 페이지로 이동

        // 만약 현재 번호가 전체 페이지 수 보다 작다면 그 번호에 해당하는 페이지를 나타내라
        if (current < pages.length) {
            pages[current].style.display = 'block';
        }
    }

    // 결과 값 계산
    function calculateResult() {
        let maxScore = -1;
        for (const id in scores) {
            if (scores[id] > maxScore) {
                maxScore = scores[id]; // 더 높은 점수 발견 시 갱신
                selectedDormId = id; // 해당 기숙사 id 기억
            }
        }
        updateDormDisplay(selectedDormId); // 화면에 기숙사 이름 띄우기
    }

    // 마지막 화면에 기숙사 결과 띄우기
    function updateDormDisplay(id) {
        selectedDormId = id; // 선택된 ID 갱신
        const display = document.querySelector('.dorm');
        if (display && dormMap[id]) {
            display.innerText = dormMap[id] + "!!";
        }
    }

    function saveAndGoMain() {
        if (!selectedDormId) {
            alert("배정된 기숙사가 없습니다.");
            return;
        }

        fetch('/user/dorm', { // UserController @PostMapping("/dorm") 호출
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dormId: parseInt(selectedDormId) }) // JSON 형식으로 반환
        })
            .then(res => res.json())
            .then(data => {
                if (data.result === 'SUCCESS') {
                    location.href = '/main'; // 저장 성공 시 메인 페이지로 이동
                } else {
                    alert("저장 중 오류가 발생했습니다.");
                }
            })
            .catch(err => console.error(err));
    }
});