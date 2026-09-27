let userXP = 120;

const xpElement = document.getElementById("xpValue");
if (xpElement) {
  xpElement.innerText = userXP + " STARS ⭐";
}

document.querySelectorAll(".badge, .armory-slot").forEach(badge => {
  let requiredXP = badge.getAttribute("data-xp");

  if (requiredXP && userXP >= parseInt(requiredXP)) {
    badge.classList.remove("locked", "locked-gear");
    badge.classList.add("unlocked", "unlocked-gear");
  }
});