function randomPick(list, ngWords) {
  const candidates = list.filter(
    item => item && !ngWords.includes(item)
  );
  if (candidates.length === 0) return ""; // 全部NGだった場合
  return candidates[Math.floor(Math.random() * candidates.length)];
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
  let staple = document.getElementById("stapleSelect").value;
  let main   = document.getElementById("mainSelect").value;
  let side   = document.getElementById("sideSelect").value;

  const ngWords = document.getElementById("ngInput").value
    .split(",")
    .map(w => w.trim())
    .filter(w => w);

  // NGチェック
  if ([staple, main, side].some(v => ngWords.includes(v))) {
    document.getElementById("resultArea").innerHTML =
      "入れたくないものが含まれています。選び直してください。";
    return;
  }

  // 0個 → 全部ランダム
  if (!staple && !main && !side) {
    staple = randomPick(staples, ngWords);
    main   = randomPick(mains, ngWords);
    side   = randomPick(sides, ngWords);
  }

  // 主食補完
  if (!staple) staple = randomPick(staples, ngWords);

  // 主菜補完（相性優先）
  if (!main) {
    if (combinations[staple]) {
      main = randomPick(Object.keys(combinations[staple]), ngWords);
    }
    if (!main) main = randomPick(mains, ngWords);
  }

  // ▼ ここが今回追加した部分
  // 全部選んでいる場合は「おすすめ副菜」を優先
  if (staple && main && side) {
    if (combinations[staple] && combinations[staple][main]) {
      const recommended = combinations[staple][main].filter(
        item => !ngWords.includes(item)
      );
      if (recommended.length > 0) {
        side = recommended[0];
      }
    }
  }

  // 副菜補完（相性優先）
  if (!side) {
    if (combinations[staple] && combinations[staple][main]) {
      side = randomPick(combinations[staple][main], ngWords);
    }
    if (!side) side = randomPick(sides, ngWords);
  }

  // 最終NGチェック
  if ([staple, main, side].some(v => ngWords.includes(v))) {
    document.getElementById("resultArea").innerHTML =
      "入れたくないものが含まれています。別の組み合わせを試してください。";
    return;
  }

  document.getElementById("resultArea").innerHTML = `
    主食：${staple}<br>
    主菜：${main}<br>
    副菜：${side}<br>
  `;

  saveHistory(staple, main, side);
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
