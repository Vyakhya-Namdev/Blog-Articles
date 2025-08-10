// Centralized functions used by both index.html (home) and add.html

// Escape text to prevent XSS in displayed comments
function sanitizeHTML(str) {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

// Render all articles with comments on index.html
function renderArticles() {
  const articles = JSON.parse(localStorage.getItem('articles') || '[]');
  const container = document.getElementById('articles');

  if (!container) return; // No container on add.html

  container.innerHTML = '';

  if (articles.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:#777;">No articles yet. Click “Add Article” to create one.</p>';
    return;
  }

  articles.forEach(article => {
    const articleElem = document.createElement('div');
    articleElem.className = 'article';
    articleElem.innerHTML = `
      <h3>${sanitizeHTML(article.title)} <span class="category-badge">${sanitizeHTML(article.category)}</span></h3>
      <img src="${sanitizeHTML(article.image)}" alt="${sanitizeHTML(article.title)}" />
      <p>${sanitizeHTML(article.content)}</p>
      <div class="article-controls">
        <button class="btn-delete" data-id="${article.id}" aria-label="Delete article titled ${sanitizeHTML(article.title)}">Delete</button>
      </div>
      <div class="comments">
        <h4>Comments:</h4>
        <ul id="comments-${article.id}">
          ${article.comments.map(c => `<li>${sanitizeHTML(c.text)}</li>`).join('')}
        </ul>
        <form class="comment-form" data-article-id="${article.id}">
          <input type="text" name="commentText" placeholder="Add comment" maxlength="200" required aria-label="Add comment for article ${sanitizeHTML(article.title)}" />
          <button type="submit">Comment</button>
          <span class="char-count" aria-live="polite" aria-atomic="true">0/200</span>
        </form>
      </div>
    `;
    container.appendChild(articleElem);
  });

  // Delete article button logic
  document.querySelectorAll('.btn-delete').forEach(button => {
    button.addEventListener('click', () => {
      const id = parseInt(button.getAttribute('data-id'), 10);
      if (confirm('Are you sure you want to delete this article?')) {
        deleteArticle(id);
      }
    });
  });

  // Toggle comments visibility
  document.querySelectorAll('.comments h4').forEach(header => {
    header.onclick = () => {
      const commentsDiv = header.parentElement;
      commentsDiv.classList.toggle('collapsed');
    };
  });

  // Comments form with live character count and submit
  document.querySelectorAll('.comment-form').forEach(form => {
    const commentInput = form.commentText;
    const charCount = form.querySelector('.char-count');

    commentInput.value = ''; // Reset input value
    charCount.textContent = '0/200';
    charCount.style.color = '#999';

    commentInput.addEventListener('input', () => {
      const len = commentInput.value.length;
      charCount.textContent = `${len}/200`;
      if (len > 200) {
        charCount.style.color = 'red';
        form.querySelector('button').disabled = true;
      } else {
        charCount.style.color = '#999';
        form.querySelector('button').disabled = false;
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const articleId = parseInt(form.getAttribute('data-article-id'), 10);
      const commentText = commentInput.value.trim();
      if (commentText.length > 0 && commentText.length <= 200) {
        addComment(articleId, commentText);
        form.reset();
        charCount.textContent = '0/200';
      }
    });
  });
}

// Add comment to article and save
function addComment(articleId, text) {
  const articles = JSON.parse(localStorage.getItem('articles') || '[]');
  const article = articles.find(a => a.id === articleId);
  if (!article) return;
  article.comments.push({ text });
  localStorage.setItem('articles', JSON.stringify(articles));
  renderArticles();
}

// Delete article and save
function deleteArticle(articleId) {
  let articles = JSON.parse(localStorage.getItem('articles') || '[]');
  articles = articles.filter(a => a.id !== articleId);
  localStorage.setItem('articles', JSON.stringify(articles));
  renderArticles();
}
