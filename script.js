// ▼ NGリスト生成
function renderNgList() {
  const ngStaple = document.getElementById("ngStaple");
  const ngMain   = document.getElementById("ngMain");
  const ngSide   = document.getElementById("ngSide");

  ngStaple.innerHTML = staples
    .filter(v => v)
    .map(item => `<label class="ng-item"><input type="checkbox" value="${item}">${item}</label>`)
    .join("");

  ngMain.innerHTML = mains
    .filter(v => v)
    .map(item => `<label class="ng-item"><input type="checkbox" value="${item}">${item}</label>`)
    .join("");

  ngSide.innerHTML = sides
    .filter(v => v)
    .map(item => `<label class="ng-item"><input type="checkbox" value="${item}">${item}</label>`)
    .join("");
}

renderNgList();

// ▼ NGモーダル開閉
const modal = document.getElementById("ngModal");
document.getElementById("openNgModal").onclick = () => modal.style.display = "block";
document.getElementById("closeNgModal").onclick = () => modal.style.display = "none";
document.getElementById("closeNgModalBottom").onclick = () => modal.style.display = "none";

window.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
};

// ▼ 結果モーダル閉じる
const resultModal = document.getElementById("resultModal");

document.getElementById("closeResultModal").onclick = () => {
  resultModal.style.display = "none";
};

document.getElementById("closeResultModalBottom").onclick = () => {
  resultModal.style.display = "none";
};

// ▼ 画面クリックで閉じる（NGと結果両方）
window.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
  if (e.target === resultModal) resultModal.style.display = "none";
};


// ▼ ランダムピック（NGを除外）
function randomPick(list, ngWords) {
  const candidates = list.filter(
    item => item && !ngWords.includes(item)
  );
  if (candidates.length === 0) return "";
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// ▼ 三食分の提案ロジック
function generateThreeMeals(staple, main, side, ngWords) {

  function makeOneMeal() {
    let s = staple || randomPick(staples, ngWords);
    let m = main   || randomPick(mains, ngWords);

    let sd = "";
    if (combinations[s] && combinations[s][m]) {
      sd = randomPick(combinations[s][m], ngWords);
    }
    if (!sd) sd = randomPick(sides, ngWords);

    return { staple: s, main: m, side: sd };
  }

  return {
    breakfast: makeOneMeal(),
    lunch:     makeOneMeal(),
    dinner:    makeOneMeal()
  };
}


// ▼ プルダウンにデータを入れる
function fillSelect(id, list) {
  const sel = document.getElementById(id);
  list.forEach(item => {
    const opt = document.createElement("option");
    opt.value = item;
    opt.textContent = item;
    sel.appendChild(opt);
  });
}

// 朝
fillSelect("stapleMorning", staples);
fillSelect("mainMorning", mains);
fillSelect("sideMorning", sides);

// 昼
fillSelect("stapleNoon", staples);
fillSelect("mainNoon", mains);
fillSelect("sideNoon", sides);

// 夜
fillSelect("stapleNight", staples);
fillSelect("mainNight", mains);
fillSelect("sideNight", sides);


document.getElementById("generateBtn").addEventListener("click", () => {
  // 朝
  let stapleMorning = document.getElementById("stapleMorning").value;
  let mainMorning   = document.getElementById("mainMorning").value;
  let sideMorning   = document.getElementById("sideMorning").value;

  // 昼
  let stapleNoon = document.getElementById("stapleNoon").value;
  let mainNoon   = document.getElementById("mainNoon").value;
  let sideNoon   = document.getElementById("sideNoon").value;

  // 夜
  let stapleNight = document.getElementById("stapleNight").value;
  let mainNight   = document.getElementById("mainNight").value;
  let sideNight   = document.getElementById("sideNight").value;

  const ngWords = [...document.querySelectorAll(".ng-item input:checked")]
    .map(cb => cb.value);

  // ▼ 朝食を生成
  const breakfast = generateThreeMeals(
    stapleMorning, mainMorning, sideMorning, ngWords
  ).breakfast;

  // ▼ 昼食を生成
  const lunch = generateThreeMeals(
    stapleNoon, mainNoon, sideNoon, ngWords
  ).breakfast; // breakfastを使う理由は後で説明するね

  // ▼ 夕食を生成
  const dinner = generateThreeMeals(
    stapleNight, mainNight, sideNight, ngWords
  ).breakfast;

  // ▼ ポップアップに表示するHTML
  const html = `
    <h4>朝食</h4>
    主食：${breakfast.staple}<br>
    主菜：${breakfast.main}<br>
    副菜：${breakfast.side}<br><br>

    <h4>昼食</h4>
    主食：${lunch.staple}<br>
    主菜：${lunch.main}<br>
    副菜：${lunch.side}<br><br>

    <h4>夕食</h4>
    主食：${dinner.staple}<br>
    主菜：${dinner.main}<br>
    副菜：${dinner.side}<br>
  `;

  document.getElementById("resultPopupArea").innerHTML = html;

  document.getElementById("resultModal").style.display = "block";

  // 履歴は朝だけ保存（必要なら三食保存に変更可能）
  saveHistory(breakfast, lunch, dinner);
});



// ▼ 履歴保存（三食分）
function saveHistory(breakfast, lunch, dinner) {
  const today = new Date().toLocaleDateString("ja-JP");

  let history = JSON.parse(localStorage.getItem("bentoHistory")) || [];

  history.unshift({
    date: today,
    breakfast,
    lunch,
    dinner
  });

  history = history.slice(0, 7); // 7日分だけ保存

  localStorage.setItem("bentoHistory", JSON.stringify(history));
}


// ▼ 履歴表示（折りたたみ式）
document.getElementById("historyBtn").addEventListener("click", () => {
  const history = JSON.parse(localStorage.getItem("bentoHistory")) || [];
  const list = document.getElementById("historyList");

  list.innerHTML = history
    .map(
      (h, index) => `
      <div class="history-day">
        <div class="history-header" data-index="${index}">
          <strong>${h.date}</strong> ▼
        </div>

        <div class="history-content hidden" id="historyContent${index}">
          <h4>朝食</h4>
          主食：${h.breakfast.staple}<br>
          主菜：${h.breakfast.main}<br>
          副菜：${h.breakfast.side}<br><br>

          <h4>昼食</h4>
          主食：${h.lunch.staple}<br>
          主菜：${h.lunch.main}<br>
          副菜：${h.lunch.side}<br><br>

          <h4>夕食</h4>
          主食：${h.dinner.staple}<br>
          主菜：${h.dinner.main}<br>
          副菜：${h.dinner.side}<br><br>
        </div>
      </div>
    `
    )
    .join("");

  document.getElementById("historyPopup").classList.remove("hidden");

  // ▼ 折りたたみ動作を追加
  document.querySelectorAll(".history-header").forEach(header => {
    header.addEventListener("click", () => {
      const index = header.dataset.index;
      const content = document.getElementById(`historyContent${index}`);
      content.classList.toggle("hidden");
    });
  });
});



// ▼ 履歴閉じる
document.getElementById("closeHistory").addEventListener("click", () => {
  document.getElementById("historyPopup").classList.add("hidden");
});
