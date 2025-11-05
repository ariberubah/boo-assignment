
const MBTI = [
  "INFP",
  "INFJ",
  "ENFP",
  "ENFJ",
  "INTJ",
  "INTP",
  "ENTP",
  "ENTJ",
  "ISFP",
  "ISFJ",
  "ESFP",
  "ESFJ",
  "ISTP",
  "ISTJ",
  "ESTP",
  "ESTJ",
];
const ENNEAGRAM = [
  "1w2",
  "2w3",
  "3w2",
  "3w4",
  "4w3",
  "4w5",
  "5w4",
  "5w6",
  "6w5",
  "6w7",
  "7w6",
  "7w8",
  "8w7",
  "8w9",
  "9w8",
  "9w1",
];
const ZODIAC = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

let comments = [];
let activeFilter = "all";
let activeSort = "best";

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

document.addEventListener("DOMContentLoaded", () => {
  bindControls();
  renderComments();
});

function bindControls() {
  const openBtn = $("#open-comment-btn");
  const draft = $("#comment-draft");
  const close = $("#close-draft");
  const submit = $("#submit-comment");
  const title = $("#comment-title");
  const body = $("#comment-body");

  const filterButtons = $$(".filter-btn");
  const sortBest = $("#sort-best");
  const sortRecent = $("#sort-recent");


  if (submit) {
    submit.classList.add("submit-button");
    submit.setAttribute("aria-label", "Submit comment");
    submit.innerHTML = `
    <svg class="submit-svg" fill="currentColor" viewBox="0 0 24 24" width="40px" height="40px">
      <path d="M2,3v7.8L18,12L2,13.2V21l20-9L2,3z"></path>
    </svg>`;
  }


  $$(".vote-tag").forEach((tagEl) => {
    const system = tagEl.dataset.system;
    const dropdown = tagEl.querySelector(".tag-dropdown");
    dropdown.innerHTML = "";
    const list =
      system === "mbti" ? MBTI : system === "enneagram" ? ENNEAGRAM : ZODIAC;

    list.forEach((opt) => {
      const div = document.createElement("div");
      div.className = "option";
      if (system === "enneagram") {
        const [left, right] = opt.split("w");
        div.innerHTML = `<span class="enne-left">${left}</span>
                         <img class="wing-icon" src="/static/wing.png" alt="w">
                         <span class="enne-right">${right}</span>`;
      } else div.textContent = opt;

      div.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const btn = tagEl.querySelector(".tag-value");
        btn.dataset.value = opt;
        if (system === "enneagram") btn.innerHTML = div.innerHTML;
        else btn.textContent = opt;
        btn.classList.add("active");
        dropdown.classList.remove("open");
        checkSubmitEnabled();
      });
      dropdown.appendChild(div);
    });
  });


  if (openBtn) {
    openBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isHidden = draft.getAttribute("aria-hidden") === "true";
      draft.setAttribute("aria-hidden", isHidden ? "false" : "true");
      if (!isHidden) resetDraft();
    });
  }
  if (close)
    close.addEventListener("click", () =>
      draft.setAttribute("aria-hidden", "true")
    );


  $$(".tag-value").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const parent = btn.closest(".vote-tag");
      const dropdown = parent.querySelector(".tag-dropdown");
      $$(".tag-dropdown").forEach((d) => d.classList.remove("open"));
      dropdown.classList.toggle("open");
    });
  });
  document.addEventListener("click", () =>
    $$(".tag-dropdown").forEach((d) => d.classList.remove("open"))
  );


  if (title) title.addEventListener("input", checkSubmitEnabled);
  if (body) body.addEventListener("input", checkSubmitEnabled);

  if (submit) {
    submit.addEventListener("click", () => {
      if (!submit.classList.contains("enabled")) return;

      const mbti =
        $('.vote-tag[data-system="mbti"] .tag-value').dataset.value || "";
      const enneagram =
        $('.vote-tag[data-system="enneagram"] .tag-value').dataset.value || "";
      const zodiac =
        $('.vote-tag[data-system="zodiac"] .tag-value').dataset.value || "";

      const comment = {
        id: String(Date.now()),
        author: "Dian Ling",
        avatar: "https://i.pravatar.cc/40?img=12",
        title: $("#comment-title").value.trim(),
        body: $("#comment-body").value.trim(),
        votes: { mbti, enneagram, zodiac },
        likes: 0,
        liked: false,
        createdAt: Date.now(),
      };

      comments.unshift(comment);

    
      const draftBox = $("#comment-draft");
      draftBox.classList.add("closing");
      setTimeout(() => {
        draftBox.setAttribute("aria-hidden", "true");
        draftBox.classList.remove("closing");
      }, 300);

      resetDraft();
      renderComments(true);
    });
  }


  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter;
      renderComments(true);
    });
  });


  if (sortBest && sortRecent) {
    sortBest.addEventListener("click", () => {
      sortBest.classList.add("active");
      sortRecent.classList.remove("active");
      activeSort = "best";
      renderComments(true);
    });
    sortRecent.addEventListener("click", () => {
      sortRecent.classList.add("active");
      sortBest.classList.remove("active");
      activeSort = "recent";
      renderComments(true);
    });
  }
}

function checkSubmitEnabled() {
  const submit = $("#submit-comment");
  if (!submit) return;
  const body = ($("#comment-body") && $("#comment-body").value.trim()) || "";
  const hasText = body.length > 0;

  if (hasText) {
    submit.classList.add("enabled");
    submit.removeAttribute("disabled");
    submit.setAttribute("aria-disabled", "false");
  } else {
    submit.classList.remove("enabled");
    submit.setAttribute("disabled", "true");
    submit.setAttribute("aria-disabled", "true");
  }
}

function resetDraft() {
  if ($("#comment-title")) $("#comment-title").value = "";
  if ($("#comment-body")) $("#comment-body").value = "";
  $$(".tag-value").forEach((btn) => {
    btn.dataset.value = "";
    btn.classList.remove("active");
    if (btn.dataset.system === "enneagram") btn.innerHTML = "Enneagram";
    else
      btn.textContent = btn.dataset.system
        ? btn.dataset.system.toUpperCase()
        : "";
  });
  checkSubmitEnabled();
}

function renderComments() {
  const listEl = $("#comments-list");
  if (!listEl) return;
  listEl.innerHTML = "";

  let filtered = comments.filter((c) =>
    activeFilter === "all" ? true : !!c.votes[activeFilter]
  );

  if (activeSort === "recent")
    filtered.sort((a, b) => b.createdAt - a.createdAt);
  else filtered.sort((a, b) => b.likes - a.likes);

  if (filtered.length === 0) {
    listEl.innerHTML = `<p style="text-align:center;color:#777;">No comments match your filter.</p>`;
    return;
  }

  filtered.forEach((c) => {
    const enneChip = c.votes.enneagram
      ? (() => {
          const [left, right] = c.votes.enneagram.split("w");
          return `<span class="chip active enne-chip">
              <span class="enne-left">${left}</span>
              <img class="wing-icon" src="/static/wing.png" alt="w">
              <span class="enne-right">${right}</span>
            </span>`;
        })()
      : "";

    const item = document.createElement("div");
    item.className = "comment-card fade-in";
    item.innerHTML = `
      <div class="comment-header">
        <img src="${c.avatar}" alt="${c.author}" class="comment-avatar">
        <div class="comment-meta">
          <strong>${c.author}</strong>
          <span class="comment-time">${timeAgo(c.createdAt)}</span>
        </div>
      </div>
      ${
        c.title ? `<div class="comment-title">${escapeHtml(c.title)}</div>` : ""
      }
      <div class="comment-chips">
        ${
          c.votes.mbti ? `<span class="chip active">${c.votes.mbti}</span>` : ""
        }
        ${enneChip}
        ${
          c.votes.zodiac
            ? `<span class="chip active chip-zodiac">${c.votes.zodiac}</span>`
            : ""
        }
      </div>
      <div class="comment-text">${escapeHtml(c.body)}</div>
    `;
    listEl.appendChild(item);
  });
}

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
