document.addEventListener("DOMContentLoaded", () => {
  const shopContainer = document.querySelector("main");
  const articles = Array.from(shopContainer.querySelectorAll(".shop"));

  const sortControls = document.querySelector(".sort-controls");
  sortControls.innerHTML = `
    <fieldset id="sort-fieldset">
      <legend>Sort by criteria:</legend>
      <label><input type="checkbox" name="criteria" value="price" checked> Price</label>
      <label><input type="checkbox" name="criteria" value="variety" checked> Variety</label>
      <label><input type="checkbox" name="criteria" value="seating" checked> Seating</label>
      <label><input type="checkbox" name="criteria" value="hours" checked> Hours</label>
      <label><input type="checkbox" name="criteria" value="overall"> Overall</label>
    </fieldset>
    <button type="button" id="reset-sort">Reset</button>
    <p id="active-criteria" style="margin-top: 1rem; font-style: italic;"></p>
  `;

  const activeCriteriaDisplay = document.getElementById("active-criteria");

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

  const getOverallScore = (article) => {
    const scoreText = article.querySelector("h2 .score")?.textContent;
    const match = scoreText?.match(/(\d+)\/20/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const animateReorder = (sortedArticles) => {
    articles.forEach(article => {
      article.style.transition = "opacity 0.3s";
      article.style.opacity = "0";
    });

    setTimeout(() => {
      sortedArticles.forEach(article => {
        shopContainer.appendChild(article);
        article.style.opacity = "1";
      });
    }, 300);
  };

  const updateActiveCriteriaDisplay = (selected) => {
    if (selected.length === 0) {
      activeCriteriaDisplay.textContent = "Currently sorting by: none";
    } else {
      const displayNames = selected.map(name => name.charAt(0).toUpperCase() + name.slice(1));
      activeCriteriaDisplay.textContent = `Currently sorting by: ${displayNames.join(", ")}`;
    }
  };

  const sortArticles = () => {
    const selected = Array.from(sortControls.querySelectorAll("input[name='criteria']:checked"))
                          .map(input => input.value);

    updateActiveCriteriaDisplay(selected);

    const sorted = [...articles].sort((a, b) => {
      let aTotal = 0;
      let bTotal = 0;

      if (selected.includes("overall")) {
        aTotal += getOverallScore(a);
        bTotal += getOverallScore(b);
      }

      const aScores = getScores(a);
      const bScores = getScores(b);

      selected.forEach(criterion => {
        if (criterion !== "overall") {
          aTotal += aScores[criterion] || 0;
          bTotal += bScores[criterion] || 0;
        }
      });

      return bTotal - aTotal;
    });

    animateReorder(sorted);
  };

  const fieldset = document.getElementById("sort-fieldset");
  fieldset.addEventListener("change", sortArticles);

  sortControls.querySelector("#reset-sort").addEventListener("click", () => {
    const checkboxes = sortControls.querySelectorAll("input[name='criteria']");
    checkboxes.forEach(box => {
      box.checked = box.value !== "overall";
    });
    sortArticles();
  });

  sortArticles(); // Initial sort and display
});