document.addEventListener("DOMContentLoaded", () => {
  const sortSelect = document.getElementById("sort-by");
  const shopContainer = document.querySelector("main");
  const articles = Array.from(shopContainer.querySelectorAll(".shop"));

  const getScore = (li) => li ? (li.textContent.match(/☕/g) || []).length : 0;

  const getScores = (article) => {
    const lis = article.querySelectorAll("li");
    const scores = {};
    lis.forEach(li => {
      if (li.textContent.includes("Price:")) scores.price = getScore(li);
      if (li.textContent.includes("Variety:")) scores.variety = getScore(li);
      if (li.textContent.includes("Seating:")) scores.seating = getScore(li);
      if (li.textContent.includes("Hours:")) scores.hours = getScore(li);
    });
    return scores;
  };

  sortSelect.addEventListener("change", () => {
    const value = sortSelect.value;
    if (value === "default") {
      location.reload();
      return;
    }

    const sorted = [...articles].sort((a, b) => {
      const aScore = getScores(a)[value];
      const bScore = getScores(b)[value];
      return bScore - aScore;
    });

    sorted.forEach(article => shopContainer.appendChild(article));
  });
});