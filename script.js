// 副菜のおすすめ理由データ
const sideReasons = {
  "ほうれん草のおひたし": "さっぱりしていて主菜の味を引き立てる",
  "ブロッコリー": "彩りが良く、栄養バランスが整う",
  "ミニトマト": "酸味があって口直しにぴったり",
  "ポテトサラダ": "まろやかで食べ応えが増す",
  "きんぴらごぼう": "食物繊維が豊富でバランスが良い",
  "ひじき煮": "和食の定番で栄養価が高い",
  "卯の花": "優しい味で主菜を邪魔しない",
  "切り干し大根": "甘みがあって箸休めに最適",
  "きゅうりの浅漬け": "さっぱりしていて油物と相性が良い",
  "だし巻き卵": "甘めの味で全体がまとまる",
  "かぼちゃ煮": "甘みがあって満足感が増す",
  "いんげん胡麻和え": "香ばしい胡麻の風味がアクセントになる",
  "コールスロー": "さっぱりして揚げ物と相性抜群",
  "きゅうりの酢の物": "酸味が油っぽさをリセットしてくれる",
  "ほうれん草の胡麻和え": "香ばしくて栄養バランスが良い",
  "かにかまサラダ": "軽くて食べやすい",
  "マカロニサラダ": "ボリュームが出て満足感がある",
  "ひじき入り卵焼き": "甘めの味で全体がまとまる",
  "小松菜ナムル": "ごま油の風味が食欲をそそる",
  "もやしナムル": "軽くて主菜の邪魔をしない",
  "さつまいもの甘煮": "甘みがあってデザート感覚で楽しめる",
  "大学芋": "甘くて満足感がある",
  "たまごサラダ": "まろやかで食べやすい",
  "キャロットラペ": "酸味があってさっぱりする",
  "きのこのソテー": "旨味が強くて主菜とよく合う",
  "ほうれん草バター炒め": "コクがあって満足感が増す",
  "じゃがいもきんぴら": "甘辛くてご飯が進む"
};

// function randomPick(list, ngWords) {
//   const candidates = list.filter(
//     item => item && !ngWords.includes(item)
//   );
//   if (candidates.length === 0) return ""; // 全部NGだった場合
//   return candidates[Math.floor(Math.random() * candidates.length)];
// }
function randomPick(list, ngWords) {
  const filtered = list.filter(item => item && !ngWords.includes(item));
  if (filtered.length === 0) return "";
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

  // ▼ 副菜だけ選んだ場合 → 主菜 → 主食 の順で補完
  if (side && !staple && !main) {
    main = randomPick(mains, ngWords);
    staple = randomPick(staples, ngWords);
  }

  // 副菜補完（相性優先）
  if (!side) {
    if (combinations[staple] && combinations[staple][main]) {
      side = randomPick(combinations[staple][main], ngWords);
    }
    if (!side) side = randomPick(sides, ngWords);
  }

  let reason = "";
  if (combinations[staple] && combinations[staple][main]) {
    const recommendedList = combinations[staple][main];
    if (recommendedList.includes(side)) {
      reason = sideReasons[side] || "";
    }
  }
  
  // 最終NGチェック
  if ([staple, main, side].some(v => ngWords.includes(v))) {
    document.getElementById("resultArea").innerHTML =
      "入れたくないものが含まれています。別の組み合わせを試してください。";
    return;
  }

  // // ▼ 結果表示
  // document.getElementById("resultArea").innerHTML = `
  //   主食：${staple}<br>
  //   主菜：${main}<br>
  //   副菜：${side}<br>
  // `;

   // ▼ 結果表示（理由つき）
  document.getElementById("resultArea").innerHTML = `
    主食：${staple}<br>
    主菜：${main}<br>
    副菜：${side}<br>
    ${reason ? `<br><b>おすすめ理由：</b>${reason}` : ""}
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
