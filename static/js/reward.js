// Example XP (later you can load from backend / localStorage)
let userXP = 120;

document.getElementById("xpValue").innerText = userXP + " XP";

document.querySelectorAll(".badge").forEach(badge => {
  let requiredXP = badge.getAttribute("data-xp");

  if (userXP >= requiredXP) {
    badge.classList.remove("locked");
    badge.classList.add("unlocked");
  }
});
