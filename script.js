document.getElementById('generate').addEventListener('click', () => {
  const calorie = document.getElementById('calorie').value || 600;
  const favorite = document.getElementById('favorite').value;

  const mains = ['鶏のからあげ', '焼き鮭', 'ハンバーグ', '生姜焼き'];
  const sides = ['卵焼き', 'ほうれん草のおひたし', 'ブロッコリー', 'ミニトマト'];

  const main = mains[Math.floor(Math.random() * mains.length)];
  const side1 = sides[Math.floor(Math.random() * sides.length)];
  const side2 = sides[Math.floor(Math.random() * sides.length)];

  let message = `
    目安カロリー: 約 ${calorie} kcal<br>
    メイン: ${main}<br>
    サブ: ${side1}・${side2}<br>
  `;

  if (favorite) {
    message += `好きな食材「${favorite}」も入れると良いかも`;
  }

  document.getElementById('bento-result').innerHTML = message;
});
