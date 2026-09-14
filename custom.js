// AOS initialization

AOS.init({duration:1000 , once:true});

// menu toggle
function toggleMenu(){
    document.getElementById('menu').classList.toggle('active');
}

//counte animation

function animateCounter(id , target , speed ){
    let count = 0;
    const interval =  setInterval(() =>{
        if(count < target){
            count++ ;
            document.getElementById(id).innerText= count ;
        }else{
            clearInterval(interval);
        }
    } , speed)
}
animateCounter('courseCount' , 65 , 50);



document.addEventListener("DOMContentLoaded", () => {
  const SHEET_ENDPOINT = "/api/stats";

  // 1. Show a cached number INSTANTLY (no waiting for the network)
  const cachedCount = localStorage.getItem('cachedCourseStudents');
  const startingCount = cachedCount ? parseInt(cachedCount) : 10; // fallback if never cached before
  animateCounter('studentCount', startingCount, 50);

  // 2. Fetch the real number in the background and quietly correct it if needed
  fetch(SHEET_ENDPOINT)
    .then(res => res.json())
    .then(data => {
      if (data.error) return;

      const cards = document.querySelectorAll(".course-card");
      const counts = [data.courses, data.td, data.exams];

      cards.forEach((card, i) => {
        const studentEl = card.querySelector(".students i");
        if (studentEl && counts[i] !== undefined) {
          studentEl.textContent = `${counts[i]} Student`;
        }
      });

      // Only re-animate if the real number differs from what we just showed
      if (data.courses !== startingCount) {
        animateCounter('studentCount', data.courses, 50);
      }

      // Cache it for next visit, so next page load starts accurate instantly
      localStorage.setItem('cachedCourseStudents', data.courses);
    })
    .catch(() => {
      // Already showing a number from cache/fallback — nothing more to do
    });
});

// script.js — QEDmn header scroll behavior

// Toggle the "fixed" class on the header once the user scrolls past a threshold
const mainHeader = document.getElementById('mainHeader');
const scrollThreshold = 50; // pixels scrolled before header becomes fixed

function handleHeaderScroll() {
    if (window.scrollY > scrollThreshold) {
        mainHeader.classList.add('fixed');
    } else {
        mainHeader.classList.remove('fixed');
    }
}

window.addEventListener('scroll', handleHeaderScroll);

// Run once on load in case the page is already scrolled (e.g. refresh mid-page)
document.addEventListener('DOMContentLoaded', handleHeaderScroll);

// Mobile menu toggle — referenced in HTML via onclick="toggleMenu()"
function toggleMenu() {
    const menu = document.getElementById('menu');
    menu.classList.toggle('active');
}



// logi Vs Loggedin

