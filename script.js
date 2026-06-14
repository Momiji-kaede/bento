function randomPick(list, ngWords) {
  const filtered = list.filter(item => item && !ngWords.includes(item));
  return filtered[Math.floor(Math.random() * filtered.length)];
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

// ▼ 提案ボタン
document.getElementById("generateBtn").addEventListener("click", () => {
  const staple = document.getElementById("stapleSelect").value;
  const main = document.getElementById("mainSelect").value;
  const side = document.getElementById("sideSelect").value;

  const ngWords = document.getElementById("ngInput").value
    .split(",")
    .map(w => w.trim())
    .filter(w => w);

  let result = "";

  // 入れたくないものチェック
  if ([staple, main, side].some(item => ngWords.includes(item))) {
    document.getElementById("resultArea").innerHTML =
      "入れたくないものが含まれています。選び直してください。";
    return;
  }

  // 相性提案
  let suggestedSide = side;

  if (staple && main && combinations[staple] && combinations[staple][main]) {
    const candidates = combinations[staple][main].filter(
      s => !ngWords.includes(s)
    );
    if (candidates.length > 0) {
      suggestedSide = candidates[Math.floor(Math.random() * candidates.length)];
    }
  }

  result = `
    主食：${staple || "（未選択）"}<br>
    主菜：${main || "（未選択）"}<br>
    副菜：${suggestedSide || side || "（未選択）"}<br>
  `;

  document.getElementById("resultArea").innerHTML = result;

  saveHistory(staple, main, suggestedSide);
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
