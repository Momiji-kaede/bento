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


// ▼ モーダル開閉
const modal = document.getElementById("ngModal");
document.getElementById("openNgModal").onclick = () => modal.style.display = "block";
document.getElementById("closeNgModal").onclick = () => modal.style.display = "none";
document.getElementById("closeNgModalBottom").onclick = () => modal.style.display = "none";

window.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
};


function randomPick(list, ngWords) {
  const candidates = list.filter(
    item => item && !ngWords.includes(item)
  );
  if (candidates.length === 0) return ""; // 全部NGだった場合
  return candidates[Math.floor(Math.random() * candidates.length)];
}
// function randomPick(list, ngWords) {
//   const filtered = list.filter(item => item && !ngWords.includes(item));
//   if (filtered.length === 0) return "";
//   return filtered[Math.floor(Math.random() * filtered.length)];
// }


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

  // const ngWords = document.getElementById("ngInput").value
  //   .split(",")
  //   .map(w => w.trim())
  //   .filter(w => w);

  // const ngWords = [...document.querySelectorAll("#ngList input:checked")]
  // .map(cb => cb.value);

  const ngWords = [...document.querySelectorAll(".ng-item input:checked")]
  .map(cb => cb.value);

  // ▼ NGチェック
  if ([staple, main, side].some(v => ngWords.includes(v))) {
    document.getElementById("resultArea").innerHTML =
      "入れたくないものが含まれています。選び直してください。";
    return;
  }

  // ▼ 0個選択 → 全部ランダム
  if (!staple && !main && !side) {
    staple = randomPick(staples, ngWords);

    if (combinations[staple]) {
      main = randomPick(Object.keys(combinations[staple]), ngWords);
    }
    if (!main) main = randomPick(mains, ngWords);

    if (combinations[staple] && combinations[staple][main]) {
      side = randomPick(combinations[staple][main], ngWords);
    }
    if (!side) side = randomPick(sides, ngWords);
  }

  // ▼ 副菜だけ選んだ → 主菜 → 主食 の順で補完
  if (side && !staple && !main) {
    main   = randomPick(mains, ngWords);
    staple = randomPick(staples, ngWords);
  }

  // ▼ 主食補完
  if (!staple) {
    staple = randomPick(staples, ngWords);
  }

  // ▼ 主菜補完（相性優先）
  if (!main) {
    if (combinations[staple]) {
      main = randomPick(Object.keys(combinations[staple]), ngWords);
    }
    if (!main) main = randomPick(mains, ngWords);
  }

  // ▼ 副菜補完（相性優先）
  if (!side) {
    if (combinations[staple] && combinations[staple][main]) {
      side = randomPick(combinations[staple][main], ngWords);
    }
    if (!side) side = randomPick(sides, ngWords);
  }

  // ▼ 最終NGチェック
  if ([staple, main, side].some(v => ngWords.includes(v))) {
    document.getElementById("resultArea").innerHTML =
      "入れたくないものが含まれています。別の組み合わせを試してください。";
    return;
  }

  // ▼ 結果表示（理由なし）
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
