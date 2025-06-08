/**
 * Pittsburgh Coffee Rankings: Beyond the Taste - Interactive Features
 * This script handles the dynamic sorting and interactivity of coffee shop cards
 * Features include:
 * - Multi-criteria sorting (price, variety, seating, hours)
 * - Overall score sorting
 * - Review recency sorting
 * - Animated card reordering
 * - Interactive hover effects
 * - Real-time sorting criteria display
 * Last updated: 2025
 */

// Initialize the sorting system when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Get main container and all restaurant articles
  const shopContainer = document.querySelector("main");
  const articles = Array.from(shopContainer.querySelectorAll(".shop"));

  // Initialize sorting controls UI
  const sortControls = document.querySelector(".sort-controls");
  sortControls.innerHTML = `
    <div class="sort-content-wrapper left-align">
      <fieldset id="sort-fieldset">
        <legend>Sort by criteria:</legend>
        <label><input type="checkbox" name="criteria" value="price" checked> Price</label>
        <label><input type="checkbox" name="criteria" value="variety" checked> Variety</label>
        <label><input type="checkbox" name="criteria" value="seating" checked> Seating</label>
        <label><input type="checkbox" name="criteria" value="hours" checked> Hours</label>
        <label><input type="checkbox" name="criteria" value="recency"> Most recently reviewed</label>
        <label><input type="checkbox" name="criteria" value="overall"> Overall</label>
      </fieldset>
      <button type="button" id="reset-sort">Reset</button>
      <p id="active-criteria" style="margin-top: 1rem; font-style: italic;"></p>
    </div>
  `;

  const activeCriteriaDisplay = document.getElementById("active-criteria");

  /**
   * Extracts the review date from a shop article and converts it to a timestamp
   * @param {HTMLElement} article - The shop article element
   * @returns {number} Unix timestamp of the review date
   */
  const getReviewDate = (article) => {
    const dateText = article.querySelector("p").textContent;
    const match = dateText.match(/([A-Za-z]+)\s+(\d{4})/);
    if (match) {
      const [_, month, year] = match;
      return new Date(`${month} 1, ${year}`).getTime();
    }
    return 0;
  };

  /**
   * Extracts the numeric score from a list item by counting coffee cup emojis
   * @param {HTMLElement} li - The list item element containing the score
   * @returns {number} The number of coffee cup emojis found
   */
  const getScore = (li) => li ? (li.textContent.match(/☕/g) || []).length : 0;

  /**
   * Extracts all category scores from a restaurant article
   * @param {HTMLElement} article - The restaurant article element
   * @returns {Object} An object containing scores for each category
   */
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

  /**
   * Extracts the overall score from a restaurant article
   * @param {HTMLElement} article - The restaurant article element
   * @returns {number} The overall score out of 20
   */
  const getOverallScore = (article) => {
    const scoreText = article.querySelector("h2 .score")?.textContent;
    const match = scoreText?.match(/(\d+)\/20/);
    return match ? parseInt(match[1], 10) : 0;
  };

  /**
   * Animates the reordering of restaurant cards with a fade and slide effect
   * @param {Array<HTMLElement>} sortedArticles - Array of sorted restaurant articles
   */
  const animateReorder = (sortedArticles) => {
    // Fade out all articles
    articles.forEach(article => {
      article.style.transition = "all 0.3s ease-out";
      article.style.opacity = "0";
      article.style.transform = "translateY(20px)";
    });

    // Reorder and fade in articles with staggered timing
    setTimeout(() => {
      sortedArticles.forEach((article, index) => {
        article.style.opacity = "0";
        article.style.transform = "translateY(20px)";
        shopContainer.appendChild(article);
        
        setTimeout(() => {
          article.style.opacity = "1";
          article.style.transform = "translateY(0)";
        }, index * 50);  // Stagger the animation of each card
      });
    }, 300);
  };

  /**
   * Updates the display showing currently active sorting criteria
   * @param {Array<string>} selected - Array of selected sorting criteria
   */
  const updateActiveCriteriaDisplay = (selected) => {
    if (selected.length === 0) {
      activeCriteriaDisplay.textContent = "Currently sorting by: none";
    } else {
      const displayNames = selected.map(name => name.charAt(0).toUpperCase() + name.slice(1));
      activeCriteriaDisplay.textContent = `Currently sorting by: ${displayNames.join(", ")}`;
    }
  };

  /**
   * Main sorting function that handles the sorting logic based on selected criteria
   * Calculates total scores and reorders articles accordingly
   */
  const sortArticles = () => {
    // Get currently selected sorting criteria
    const selected = Array.from(document.querySelectorAll("input[name='criteria']:checked"))
                        .map(input => input.value);

    updateActiveCriteriaDisplay(selected);

    // Sort articles based on combined scores of selected criteria
    const sorted = [...articles].sort((a, b) => {
      let aTotal = 0;
      let bTotal = 0;

      if (selected.includes("overall")) {
        aTotal += getOverallScore(a);
        bTotal += getOverallScore(b);
      }

      if (selected.includes("recency")) {
        const aDate = getReviewDate(a);
        const bDate = getReviewDate(b);
        // Weight recency more heavily to make it a primary sorting factor when selected
        aTotal += (aDate / 1000000000);
        bTotal += (bDate / 1000000000);
      }

      const aScores = getScores(a);
      const bScores = getScores(b);

      selected.forEach(criterion => {
        if (criterion !== "overall" && criterion !== "recency") {
          aTotal += aScores[criterion] || 0;
          bTotal += bScores[criterion] || 0;
        }
      });

      return bTotal - aTotal;  // Sort in descending order
    });

    animateReorder(sorted);
  };

  // Event Listeners
  const fieldset = document.getElementById("sort-fieldset");
  fieldset.addEventListener("change", sortArticles);

  // Reset button handler
  document.getElementById("reset-sort").addEventListener("click", () => {
    const checkboxes = document.querySelectorAll("input[name='criteria']");
    checkboxes.forEach(box => {
      box.checked = false;
    });
    sortArticles();
  });

  // Add hover effects to restaurant cards
  articles.forEach(article => {
    article.addEventListener("mouseenter", () => {
      article.style.transform = "translateY(-4px)";
      article.style.boxShadow = "0 12px 24px rgba(0, 0, 0, 0.1)";
    });

    article.addEventListener("mouseleave", () => {
      article.style.transform = "translateY(0)";
      article.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.06)";
    });
  });

  // Initial sort on page load
  sortArticles();
});