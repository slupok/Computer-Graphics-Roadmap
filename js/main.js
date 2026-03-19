const modal = document.getElementById('subject-modal')
const modalBox = document.getElementById('modal-subject-box')
const showSubjectInfoButtons = document.getElementsByClassName('subject-info')
// const closeModalBtn = document.getElementById('close-modal-btn')

// ===== Бургер-меню =====
const menuToggle = document.getElementById('menu-toggle')
const navList = document.getElementById('nav-list')

if (menuToggle && navList) {
    menuToggle.addEventListener('click', (e) => {
        const isOpen = navList.classList.toggle('active')
        menuToggle.textContent = isOpen ? '✕' : '☰'
        menuToggle.setAttribute('aria-expanded', isOpen)
        menuToggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню')
        e.stopPropagation()
    })

    navList.addEventListener('click', (e) => {
        e.stopPropagation()
    })
}

for (let index = 0; index < showSubjectInfoButtons.length; index++) {
    const showBtn = showSubjectInfoButtons[index];
    showBtn.addEventListener('click', (e) => {
        var attribute = Number(showBtn.getAttribute("data-test"))
        generateSubjectInfo(document.getElementById("modal-subject-box"), subjectsArray.get(attribute))
        modal.showModal()
        isModalOpen = true
        e.stopPropagation()
    })
}

let isModalOpen = false

//showModalBtn.addEventListener('click', (e) => {
//})

function onCloseModal() {
  modal.close()
  isModalOpen = false
}

document.addEventListener('click', (e) => {
    if (isModalOpen && !modalBox.contains(e.target)) {
        modal.close()
    }
    if (navList && navList.classList.contains('active')) {
        navList.classList.remove('active')
        menuToggle.textContent = '☰'
        menuToggle.setAttribute('aria-expanded', false)
        menuToggle.setAttribute('aria-label', 'Открыть меню')
    }
})


function getObjectWithAttribute(attribute) {
  subjectsArray.get(attribute)
}