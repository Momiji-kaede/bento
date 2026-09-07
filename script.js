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

// ▼ 結果モーダル
const resultModal = document.getElementById("resultModal");
const closeResultTop = document.getElementById("closeResultModal");
const closeResultBottom = document.getElementById("closeResultModalBottom");

if (closeResultTop) {
  closeResultTop.onclick = () => {
    resultModal.style.display = "none";
  };
}
if (closeResultBottom) {
  closeResultBottom.onclick = () => {
    resultModal.style.display = "none";
  };
}

// ▼ 画面クリックでモーダルを閉じる（NGと結果両方）
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

fillSelect("stapleSelect", staples);
fillSelect("mainSelect", mains);
fillSelect("sideSelect", sides);

// ▼ 提案ボタン（三食＋ポップアップ表示）
document.getElementById("generateBtn").addEventListener("click", () => {
  let staple = document.getElementById("stapleSelect").value;
  let main   = document.getElementById("mainSelect").value;
  let side   = document.getElementById("sideSelect").value;

  const ngWords = [...document.querySelectorAll(".ng-item input:checked")]
    .map(cb => cb.value);

  // NGチェック（選択済みがNGならエラー）
  if ([staple, main, side].some(v => ngWords.includes(v))) {
    alert("入れたくないものが含まれています。選び直してください。");
    return;
  }

  const meals = generateThreeMeals(staple, main, side, ngWords);

  const html = `
    <h4>朝食</h4>
    主食：${meals.breakfast.staple}<br>
    主菜：${meals.breakfast.main}<br>
    副菜：${meals.breakfast.side}<br><br>

    <h4>昼食</h4>
    主食：${meals.lunch.staple}<br>
    主菜：${meals.lunch.main}<br>
    副菜：${meals.lunch.side}<br><br>

    <h4>夕食</h4>
    主食：${meals.dinner.staple}<br>
    主菜：${meals.dinner.main}<br>
    副菜：${meals.dinner.side}<br>
  `;

  const resultPopupArea = document.getElementById("resultPopupArea");
  if (resultPopupArea) {
    resultPopupArea.innerHTML = html;
  }

  resultModal.style.display = "block";

  // とりあえず朝食だけ履歴に保存（必要なら三食保存に変えよう）
  saveHistory(meals.breakfast.staple, meals.breakfast.main, meals.breakfast.side);
});

// ▼ 履歴保存（3日分）
function saveHistory(staple, main, side) {
  const today = new Date().toLocaleDateString("ja-JP");

  let history = JSON.parse(localStorage.getItem("bentoHistory")) || [];

  history.unshift({
    date: today,
    staple,
    main,
    side
  });

  history = history.slice(0, 3);

  localStorage.setItem("bentoHistory", JSON.stringify(history));
}

// ▼ 履歴表示
document.getElementById("historyBtn").addEventListener("click", () => {
  const history = JSON.parse(localStorage.getItem("bentoHistory")) || [];
  const list = document.getElementById("historyList");

  list.innerHTML = history
    .map(
      h => `
      <div>
        <strong>${h.date}</strong><br>
        主食：${h.staple}<br>
        主菜：${h.main}<br>
        副菜：${h.side}<br><br>
      </div>
    `
    )
    .join("");

  document.getElementById("historyPopup").classList.remove("hidden");
});

// ▼ 履歴閉じる
document.getElementById("closeHistory").addEventListener("click", () => {
  document.getElementById("historyPopup").classList.add("hidden");
});
